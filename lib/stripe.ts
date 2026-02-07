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
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  student_yearly: process.env.STRIPE_PRICE_STUDENT_YEARLY!,
  // Legacy support
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_PRO!,
  team: process.env.STRIPE_PRICE_TEAM!,
}

// Billing intervals
export type BillingInterval = 'monthly' | 'yearly'

// Price display info
export const PRICE_INFO = {
  pro: {
    monthly: {
      amount: 9.90,
      display: '9,90€',
      period: '/mois',
    },
    yearly: {
      amount: 79,
      display: '79€',
      period: '/an',
      monthlyEquivalent: '6,58€',
      savings: '34%',
      badge: '2 mois offerts',
    },
  },
  student: {
    yearly: {
      amount: 49,
      display: '49€',
      period: '/an',
      monthlyEquivalent: '4,08€',
      badge: 'Tarif étudiant',
    },
  },
}

// Plan types
export type PlanType = 'free' | 'pro' | 'student' | 'team'

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
  if (priceId === STRIPE_PRICES.pro_monthly) return 'pro'
  if (priceId === STRIPE_PRICES.pro_yearly) return 'pro'
  if (priceId === STRIPE_PRICES.pro) return 'pro'
  if (priceId === STRIPE_PRICES.student_yearly) return 'student'
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

// Check if user can access pro features (student has same features as pro)
export function canAccessProFeatures(plan: PlanType, status: string): boolean {
  return (plan === 'pro' || plan === 'student' || plan === 'team') &&
         (status === 'active' || status === 'trialing')
}

// Check if user can access team features
export function canAccessTeamFeatures(plan: PlanType, status: string): boolean {
  return plan === 'team' && (status === 'active' || status === 'trialing')
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    maxWorkspaces: 3,        // "Activités" dans l'UI
    maxTasks: 60,
    aiEnabled: true,          // IA activée mais limitée
    aiRequestsPerWeek: 10,    // 10 priorisations IA/semaine
    maxRemindersPerDay: 1,    // 1 rappel/jour
    cloudSync: false,
  },
  pro: {
    maxWorkspaces: Infinity,
    maxTasks: Infinity,
    aiEnabled: true,
    aiRequestsPerWeek: Infinity,
    maxRemindersPerDay: Infinity,
    cloudSync: true,
  },
  student: {
    maxWorkspaces: Infinity,
    maxTasks: Infinity,
    aiEnabled: true,
    aiRequestsPerWeek: Infinity,
    maxRemindersPerDay: Infinity,
    cloudSync: true,
  },
  team: {
    maxWorkspaces: Infinity,
    maxTasks: Infinity,
    aiEnabled: true,
    aiRequestsPerWeek: Infinity,
    maxRemindersPerDay: Infinity,
    cloudSync: true,
    teamFeatures: true,
  },
}
