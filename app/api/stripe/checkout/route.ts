import { NextRequest, NextResponse } from 'next/server'
import { getStripe, STRIPE_PRICES } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Lazy-initialized Supabase admin client
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdminInstance
}

// Verify Supabase auth token
async function verifyAuth(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token)

  if (error || !user) {
    return null
  }

  return { userId: user.id, email: user.email || '' }
}

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    // Check for at least one pro price configured (monthly or yearly)
    const hasProPrice = process.env.STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO_YEARLY
    if (!hasProPrice) {
      return NextResponse.json(
        { error: 'Stripe prices not configured' },
        { status: 500 }
      )
    }

    // Verify authentication
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { plan, interval = 'monthly' } = await request.json()
    const { userId, email } = auth

    // Validate plan
    if (!['pro', 'student', 'team'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Validate interval
    if (!['monthly', 'yearly'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid billing interval' },
        { status: 400 }
      )
    }

    // Determine price ID based on plan and interval
    let priceId: string
    if (plan === 'pro') {
      if (interval === 'yearly' && process.env.STRIPE_PRICE_PRO_YEARLY) {
        priceId = process.env.STRIPE_PRICE_PRO_YEARLY
      } else {
        // Monthly or fallback to legacy
        priceId = process.env.STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_PRO!
      }
    } else if (plan === 'student') {
      // Student plan is yearly only
      priceId = STRIPE_PRICES.student_yearly
    } else {
      priceId = STRIPE_PRICES.team
    }

    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single() as { data: { stripe_customer_id: string | null } | null, error: { code?: string, message?: string } | null }

    let customerId = existingSubscription?.stripe_customer_id ?? null

    const stripe = getStripe()

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      })
      customerId = customer.id

      // Create subscription record
      await (getSupabaseAdmin().from('subscriptions') as any).upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        plan: 'free',
        status: 'inactive',
      }, {
        onConflict: 'user_id'
      })
    }

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://multitasks.fr'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // 14 days trial for Pro and Student plans
      subscription_data: (plan === 'pro' || plan === 'student') ? {
        trial_period_days: 14,
      } : undefined,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      metadata: {
        user_id: userId,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
