import Stripe from 'stripe'

// Lazy-initialized Stripe client (server-side only)
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  }
  return stripeInstance
}

// For backward compatibility
export const stripe = {
  get customers() { return getStripe().customers },
  get checkout() { return getStripe().checkout },
  get billingPortal() { return getStripe().billingPortal },
  get webhooks() { return getStripe().webhooks },
}

// Price IDs from environment
export const STRIPE_PRICES = {
  pro: process.env.STRIPE_PRICE_PRO!,
  team: process.env.STRIPE_PRICE_TEAM!,
}

// Plan types
export type PlanType = 'free' | 'pro' | 'team'

export interface SubscriptionData {
  id: string
  userId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  plan: PlanType
  status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
}

// Helper to get plan from price ID
export function getPlanFromPriceId(priceId: string): PlanType {
  if (priceId === STRIPE_PRICES.pro) return 'pro'
  if (priceId === STRIPE_PRICES.team) return 'team'
  return 'free'
}

// Helper to format subscription status
export function formatSubscriptionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Actif',
    inactive: 'Inactif',
    trialing: 'Essai gratuit',
    past_due: 'Paiement en retard',
    canceled: 'Annulé',
    unpaid: 'Impayé',
  }
  return statusMap[status] || status
}

// Check if user can access pro features
export function canAccessProFeatures(plan: PlanType, status: string): boolean {
  return (plan === 'pro' || plan === 'team') &&
         (status === 'active' || status === 'trialing')
}

// Check if user can access team features
export function canAccessTeamFeatures(plan: PlanType, status: string): boolean {
  return plan === 'team' && (status === 'active' || status === 'trialing')
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    maxWorkspaces: 3,
    maxTasks: 50,
    aiEnabled: false,
    cloudSync: false,
  },
  pro: {
    maxWorkspaces: Infinity,
    maxTasks: Infinity,
    aiEnabled: true,
    cloudSync: true,
  },
  team: {
    maxWorkspaces: Infinity,
    maxTasks: Infinity,
    aiEnabled: true,
    cloudSync: true,
    teamFeatures: true,
  },
}
