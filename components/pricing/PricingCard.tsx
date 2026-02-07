'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import type { BillingInterval } from '@/lib/stripe'

interface PricingCardProps {
  name: string
  description: string
  price: string
  period: string
  features: string[]
  plan: 'free' | 'pro' | 'student' | 'team'
  featured?: boolean
  ctaText: string
  // New props for billing toggle
  billingInterval?: BillingInterval
  yearlyPrice?: string
  yearlyPeriod?: string
  monthlyEquivalent?: string
  savings?: string
}

export function PricingCard({
  name,
  description,
  price,
  period,
  features,
  plan,
  featured = false,
  ctaText,
  billingInterval = 'monthly',
  yearlyPrice,
  yearlyPeriod,
  monthlyEquivalent,
  savings,
}: PricingCardProps) {
  const { user } = useAuth()
  const { startCheckout, plan: currentPlan, isActive } = useSubscription()
  const [loading, setLoading] = useState(false)

  const isCurrentPlan = currentPlan === plan && isActive
  const isYearly = billingInterval === 'yearly'
  const displayPrice = isYearly && yearlyPrice ? yearlyPrice : price
  const displayPeriod = isYearly && yearlyPeriod ? yearlyPeriod : period

  const handleClick = async () => {
    // Free plan or already on this plan - go to dashboard
    if (plan === 'free' || isCurrentPlan) {
      window.location.href = '/dashboard'
      return
    }

    // Not logged in - save intent and go to dashboard to login
    if (!user) {
      // Store the plan intent for after login
      const checkoutPlan = isYearly ? `${plan}_yearly` : plan
      sessionStorage.setItem('checkout_plan', checkoutPlan)
      window.location.href = '/dashboard?checkout=' + checkoutPlan
      return
    }

    // Start checkout with billing interval
    setLoading(true)
    try {
      await startCheckout(plan, billingInterval)
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Erreur lors du checkout. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const baseClasses = featured
    ? 'relative p-8 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-2 border-indigo-500/50 hover:border-indigo-400 transition-all duration-300 transform scale-105 shadow-2xl shadow-indigo-500/20'
    : 'relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300'

  const buttonClasses = featured
    ? 'block w-full py-3 px-4 text-center bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50'
    : 'block w-full py-3 px-4 text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50'

  const checkColor = featured ? 'text-indigo-400' : 'text-green-400'

  return (
    <div className={baseClasses}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg">
            Populaire
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-extrabold text-white">{displayPrice}</span>
        <span className="text-slate-400">{displayPeriod}</span>
        {isYearly && monthlyEquivalent && (
          <div className="mt-2 text-sm">
            <span className="text-slate-400">soit {monthlyEquivalent}/mois</span>
            {savings && (
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                -{savings}
              </span>
            )}
          </div>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-300">
            <Check className={`w-5 h-5 ${checkColor} flex-shrink-0`} />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        disabled={loading || isCurrentPlan}
        className={buttonClasses}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement...
          </span>
        ) : isCurrentPlan ? (
          'Plan actuel'
        ) : (
          ctaText
        )}
      </button>
    </div>
  )
}
