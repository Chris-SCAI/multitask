'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
  variant?: 'default' | 'success' | 'calm'
}

const variants = {
  default: {
    bg: 'from-slate-800/50 to-slate-800/30',
    iconBg: 'bg-slate-700/50',
    titleColor: 'text-slate-100',
    descColor: 'text-slate-100',
  },
  success: {
    bg: 'from-green-500/10 to-emerald-500/5',
    iconBg: 'bg-green-500/20',
    titleColor: 'text-emerald-300',
    descColor: 'text-green-500/70',
  },
  calm: {
    bg: 'from-indigo-500/10 to-purple-500/5',
    iconBg: 'bg-indigo-500/20',
    titleColor: 'text-indigo-300',
    descColor: 'text-indigo-500/70',
  },
}

export function EmptyState({ 
  icon = '📭', 
  title, 
  description, 
  action,
  variant = 'default' 
}: EmptyStateProps) {
  const styles = variants[variant]

  return (
    <div className={`glass-card p-8 text-center bg-gradient-to-br ${styles.bg}`}>
      <div className={`w-16 h-16 rounded-2xl ${styles.iconBg} flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce`}>
        {icon}
      </div>
      <h3 className={`text-lg font-semibold ${styles.titleColor} mb-1`}>
        {title}
      </h3>
      {description && (
        <p className={`text-sm ${styles.descColor}`}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

// Preset empty states
export function EmptyTasksState() {
  return (
    <EmptyState
      icon="✨"
      title="Tout est fait !"
      description="Profite de ce moment de calme"
      variant="success"
    />
  )
}

export function EmptyUrgentState() {
  return (
    <EmptyState
      icon="🌴"
      title="Aucune urgence"
      description="Respire, tout va bien"
      variant="calm"
    />
  )
}

export function EmptyWorkspaceState() {
  return (
    <EmptyState
      icon="🎯"
      title="Aucune tâche"
      description="Ajoute ta première tâche pour commencer"
    />
  )
}

export function EmptyCalendarState() {
  return (
    <EmptyState
      icon="📅"
      title="Journée libre"
      description="Rien de prévu pour ce jour"
      variant="calm"
    />
  )
}

export function EmptySearchState() {
  return (
    <EmptyState
      icon="🔍"
      title="Aucun résultat"
      description="Essaie avec d'autres termes"
    />
  )
}
