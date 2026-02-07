'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { PlanType, PLAN_LIMITS, canAccessProFeatures, canAccessTeamFeatures, BillingInterval } from '@/lib/stripe'

export interface Subscription {
  id: string
  userId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  plan: PlanType
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // PGRST116 = no rows found, 42P01 = table doesn't exist
      // Silently ignore expected errors and use default free plan

      if (data) {
        setSubscription({
          id: data.id,
          userId: data.user_id,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.stripe_subscription_id,
          plan: data.plan || 'free',
          status: data.status || 'inactive',
          currentPeriodEnd: data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end || false,
          createdAt: data.created_at,
        })
      } else {
        // Default to free plan if no subscription exists or table doesn't exist
        setSubscription({
          id: '',
          userId: user.id,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          plan: 'free',
          status: 'inactive',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          createdAt: new Date().toISOString(),
        })
      }
    } catch {
      // On error, default to free plan
      setSubscription({
        id: '',
        userId: user.id,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        plan: 'free',
        status: 'inactive',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  // Listen to realtime updates (only if table exists)
  useEffect(() => {
    if (!user) return

    // Try to subscribe to realtime changes, but don't fail if table doesn't exist
    try {
      const channel = supabase
        .channel('subscription-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchSubscription()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch {
      // Silently ignore if realtime subscription fails
    }
  }, [user, fetchSubscription])

  // Computed properties
  const plan = subscription?.plan || 'free'
  const status = subscription?.status || 'inactive'
  const isTrialing = status === 'trialing'
  const isActive = status === 'active' || status === 'trialing'
  const isPro = canAccessProFeatures(plan, status)
  const isTeam = canAccessTeamFeatures(plan, status)
  const limits = PLAN_LIMITS[plan]

  // Days left in trial
  const daysLeftInTrial = subscription?.currentPeriodEnd && isTrialing
    ? Math.max(0, Math.ceil(
        (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : 0

  // Checkout handler
  const startCheckout = async (selectedPlan: 'pro' | 'student' | 'team', billingInterval: BillingInterval = 'monthly') => {
    if (!user) return

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Session expirée. Reconnectez-vous.')
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: selectedPlan, interval: billingInterval }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Checkout failed')
      }
    } catch (err) {
      throw err
    }
  }

  // Portal handler
  const openPortal = async () => {
    if (!user || !subscription?.stripeCustomerId) return

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Session expirée. Reconnectez-vous.')
      }

      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Portal access failed')
      }
    } catch (err) {
      throw err
    }
  }

  return {
    subscription,
    loading,
    plan,
    status,
    isTrialing,
    isActive,
    isPro,
    isTeam,
    limits,
    daysLeftInTrial,
    startCheckout,
    openPortal,
    refreshSubscription: fetchSubscription,
  }
}
