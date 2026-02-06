'use client'

import { useAuth } from './useAuth'
import { useSubscription } from './useSubscription'

// Plan limits configuration
export const PLAN_LIMITS = {
  demo: {
    maxWorkspaces: 1,
    maxTasks: 5,
    aiEnabled: false,
    cloudSync: false,
    name: 'Démo',
  },
  free: {
    maxWorkspaces: 3,
    maxTasks: 50,
    aiEnabled: false,
    cloudSync: true,
    name: 'Gratuit',
  },
  pro: {
    maxWorkspaces: Infinity,
    maxTasks: Infinity,
    aiEnabled: true,
    cloudSync: true,
    name: 'Pro',
  },
  team: {
    maxWorkspaces: Infinity,
    maxTasks: Infinity,
    aiEnabled: true,
    cloudSync: true,
    teamFeatures: true,
    name: 'Team',
  },
}

export type PlanKey = keyof typeof PLAN_LIMITS

export interface FeatureAccess {
  // Current plan info
  planKey: PlanKey
  planName: string
  isDemo: boolean
  isFree: boolean
  isPro: boolean
  isTeam: boolean

  // Limits
  maxWorkspaces: number
  maxTasks: number
  aiEnabled: boolean
  cloudSync: boolean

  // Check functions
  canCreateWorkspace: (currentCount: number) => boolean
  canCreateTask: (currentCount: number) => boolean
  canUseAI: () => boolean

  // Remaining counts
  remainingWorkspaces: (currentCount: number) => number
  remainingTasks: (currentCount: number) => number

  // Upgrade needed
  needsUpgradeForWorkspace: (currentCount: number) => boolean
  needsUpgradeForTask: (currentCount: number) => boolean
  needsUpgradeForAI: () => boolean
}

export function useFeatureAccess(
  workspaceCount: number = 0,
  taskCount: number = 0
): FeatureAccess {
  const { user } = useAuth()
  const { plan, isActive } = useSubscription()

  // Determine effective plan
  let planKey: PlanKey = 'demo'

  if (user) {
    if (isActive && (plan === 'pro' || plan === 'team')) {
      planKey = plan
    } else {
      planKey = 'free'
    }
  }

  const limits = PLAN_LIMITS[planKey]

  // Check functions
  const canCreateWorkspace = (currentCount: number) => currentCount < limits.maxWorkspaces
  const canCreateTask = (currentCount: number) => currentCount < limits.maxTasks
  const canUseAI = () => limits.aiEnabled

  // Remaining counts
  const remainingWorkspaces = (currentCount: number) =>
    Math.max(0, limits.maxWorkspaces - currentCount)
  const remainingTasks = (currentCount: number) =>
    Math.max(0, limits.maxTasks - currentCount)

  // Needs upgrade checks
  const needsUpgradeForWorkspace = (currentCount: number) =>
    currentCount >= limits.maxWorkspaces
  const needsUpgradeForTask = (currentCount: number) =>
    currentCount >= limits.maxTasks
  const needsUpgradeForAI = () => !limits.aiEnabled

  return {
    planKey,
    planName: limits.name,
    isDemo: planKey === 'demo',
    isFree: planKey === 'free',
    isPro: planKey === 'pro',
    isTeam: planKey === 'team',

    maxWorkspaces: limits.maxWorkspaces,
    maxTasks: limits.maxTasks,
    aiEnabled: limits.aiEnabled,
    cloudSync: limits.cloudSync,

    canCreateWorkspace,
    canCreateTask,
    canUseAI,

    remainingWorkspaces,
    remainingTasks,

    needsUpgradeForWorkspace,
    needsUpgradeForTask,
    needsUpgradeForAI,
  }
}
