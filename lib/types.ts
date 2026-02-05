export function generateId(): string {
  return crypto.randomUUID()
}

export type Priority = 'low' | 'medium' | 'high'
export type TaskType = 'reunion' | 'rdv' | 'livrable' | 'admin' | 'autre'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'
export type ViewMode = 'cockpit' | 'calendar' | 'workspace' | 'priority'

export interface Workspace {
  id: string
  name: string
  icon: string
  color: string
  slug: string
  userId: string
  createdAt: Date
}

export interface Task {
  id: string
  workspaceId: string
  projectId?: string
  parentId?: string // Pour les sous-tâches
  title: string
  description?: string
  taskType: TaskType
  priority: Priority
  stars?: 1 | 2 | 3 // Priorité étoiles pour "À la une"
  deadline?: Date
  reminderDate?: Date
  recurrence: RecurrenceType
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Subtask {
  id: string
  parentId: string
  title: string
  completed: boolean
  order: number
}

export interface TaskWithSubtasks extends Task {
  subtasks: Subtask[]
}

export interface WorkspaceWithStats extends Workspace {
  taskCount: number
  completedCount: number
  overdueCount: number
}

// Workspaces par défaut
export const DEFAULT_WORKSPACES: Omit<Workspace, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Cabinet', icon: '🏢', color: '#ef4444', slug: 'cabinet' },
  { name: 'Enseignement', icon: '🎓', color: '#22c55e', slug: 'enseignement' },
  { name: 'S&C AI Training', icon: '🤖', color: '#eab308', slug: 'sc-ai-training' },
  { name: 'Architecture IA', icon: '🏗️', color: '#f97316', slug: 'architecture-ia' },
  { name: 'Perso', icon: '🏠', color: '#8b5cf6', slug: 'perso' },
  { name: 'Sport', icon: '💪', color: '#06b6d4', slug: 'sport' },
]

export const PRIORITY_CONFIG = {
  high: { label: 'Urgente', icon: '🔥', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  medium: { label: 'Importante', icon: '⚡', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.15)' },
  low: { label: 'Normale', icon: '🌱', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' },
} as const

export const TASK_TYPE_CONFIG = {
  reunion: { label: 'Réunion', icon: '👥', color: '#3b82f6' },
  rdv: { label: 'Rdv', icon: '📅', color: '#06b6d4' },
  livrable: { label: 'Livrable', icon: '📦', color: '#8b5cf6' },
  admin: { label: 'Admin', icon: '📋', color: '#f97316' },
  autre: { label: 'Autre', icon: '📌', color: '#94a3b8' },
} as const

export const RECURRENCE_CONFIG = {
  none: { label: 'Aucune', icon: '' },
  daily: { label: 'Quotidien', icon: '🔄' },
  weekly: { label: 'Hebdomadaire', icon: '📅' },
  monthly: { label: 'Mensuel', icon: '🗓️' },
} as const
