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
  console.log('[Checkout] Starting checkout request')

  try {
    // Check environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Checkout] STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    if (!process.env.STRIPE_PRICE_PRO || !process.env.STRIPE_PRICE_TEAM) {
      console.error('[Checkout] STRIPE_PRICE_PRO or STRIPE_PRICE_TEAM not configured')
      return NextResponse.json(
        { error: 'Stripe prices not configured' },
        { status: 500 }
      )
    }

    // Verify authentication
    const auth = await verifyAuth(request)
    if (!auth) {
      console.error('[Checkout] Unauthorized request')
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { plan } = await request.json()
    const { userId, email } = auth
    console.log('[Checkout] Authenticated user:', { userId, email, plan })

    // Validate plan
    if (!['pro', 'team'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const priceId = plan === 'pro' ? STRIPE_PRICES.pro : STRIPE_PRICES.team
    console.log('[Checkout] Using price ID:', priceId)

    // Check if user already has a Stripe customer ID
    console.log('[Checkout] Checking for existing subscription...')
    const { data: existingSubscription, error: subError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single() as { data: { stripe_customer_id: string | null } | null, error: { code?: string, message?: string } | null }

    if (subError && subError.code !== 'PGRST116') {
      console.error('[Checkout] Supabase error:', subError)
    }

    let customerId = existingSubscription?.stripe_customer_id ?? null
    console.log('[Checkout] Existing customer ID:', customerId)

    const stripe = getStripe()
    console.log('[Checkout] Stripe client initialized')

    // Create customer if doesn't exist
    if (!customerId) {
      console.log('[Checkout] Creating new Stripe customer...')
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      })
      customerId = customer.id
      console.log('[Checkout] Created customer:', customerId)

      // Create subscription record
      console.log('[Checkout] Creating subscription record...')
      const { error: upsertError } = await (getSupabaseAdmin().from('subscriptions') as any).upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        plan: 'free',
        status: 'inactive',
      }, {
        onConflict: 'user_id'
      })

      if (upsertError) {
        console.error('[Checkout] Upsert error:', upsertError)
      }
    }

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://multitasks.fr'
    console.log('[Checkout] Creating checkout session with app URL:', appUrl)

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
      // 14 days trial for Pro plan only
      subscription_data: plan === 'pro' ? {
        trial_period_days: 14,
      } : undefined,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      metadata: {
        user_id: userId,
        plan,
      },
    })

    console.log('[Checkout] Session created:', session.id, 'URL:', session.url)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
