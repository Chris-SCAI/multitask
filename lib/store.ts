// Store local avec localStorage
import { Task, Workspace, Subtask, DEFAULT_WORKSPACES, generateId } from './types'

const STORAGE_KEYS = {
  workspaces: 'multitask_workspaces',
  tasks: 'multitask_tasks',
  subtasks: 'multitask_subtasks',
  taskTypes: 'multitask_task_types',
  priorities: 'multitask_priorities',
  initialized: 'multitask_initialized',
  userName: 'multitask_user_name',
}

// Types personnalisables
export interface CustomTaskType {
  id: string
  label: string
  icon: string
  color: string
}

export interface CustomPriority {
  id: string
  label: string
  icon: string
  color: string
  bgColor: string
  order: number
}

const DEFAULT_TASK_TYPES: CustomTaskType[] = [
  { id: 'reunion', label: 'Réunion', icon: '👥', color: '#3b82f6' },
  { id: 'rdv', label: 'Rdv', icon: '📅', color: '#06b6d4' },
  { id: 'livrable', label: 'Livrable', icon: '📦', color: '#8b5cf6' },
  { id: 'admin', label: 'Admin', icon: '📋', color: '#f97316' },
  { id: 'autre', label: 'Autre', icon: '📌', color: '#94a3b8' },
]

const DEFAULT_PRIORITIES: CustomPriority[] = [
  { id: 'high', label: 'Urgente', icon: '🔥', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', order: 0 },
  { id: 'medium', label: 'Importante', icon: '⚡', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.15)', order: 1 },
  { id: 'low', label: 'Normale', icon: '🌱', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)', order: 2 },
]

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  const stored = localStorage.getItem(key)
  if (!stored) return defaultValue
  try {
    return JSON.parse(stored)
  } catch {
    return defaultValue
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// Initialisation
export function initializeStore(): Workspace[] {
  const initialized = getFromStorage(STORAGE_KEYS.initialized, false)
  if (initialized) {
    return getFromStorage<Workspace[]>(STORAGE_KEYS.workspaces, [])
  }
  
  const workspaces: Workspace[] = DEFAULT_WORKSPACES.map(w => ({
    ...w,
    id: generateId(),
    userId: 'local',
    createdAt: new Date(),
  }))
  
  setToStorage(STORAGE_KEYS.workspaces, workspaces)
  setToStorage(STORAGE_KEYS.initialized, true)
  
  return workspaces
}

// Workspaces
export function getWorkspaces(): Workspace[] {
  return getFromStorage<Workspace[]>(STORAGE_KEYS.workspaces, [])
}

export function createWorkspace(workspace: Omit<Workspace, 'id' | 'userId' | 'createdAt'>): Workspace {
  const workspaces = getWorkspaces()
  const newWorkspace: Workspace = {
    ...workspace,
    id: generateId(),
    userId: 'local',
    createdAt: new Date(),
  }
  setToStorage(STORAGE_KEYS.workspaces, [...workspaces, newWorkspace])
  return newWorkspace
}

export function updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | null {
  const workspaces = getWorkspaces()
  const index = workspaces.findIndex(w => w.id === id)
  if (index === -1) return null
  
  workspaces[index] = { ...workspaces[index], ...updates }
  setToStorage(STORAGE_KEYS.workspaces, workspaces)
  return workspaces[index]
}

export function deleteWorkspace(id: string): boolean {
  const workspaces = getWorkspaces()
  const filtered = workspaces.filter(w => w.id !== id)
  if (filtered.length === workspaces.length) return false
  setToStorage(STORAGE_KEYS.workspaces, filtered)
  // Supprimer aussi les tâches associées
  const tasks = getTasks()
  const filteredTasks = tasks.filter(t => t.workspaceId !== id)
  setToStorage(STORAGE_KEYS.tasks, filteredTasks)
  return true
}

// Task Types
export function getTaskTypes(): CustomTaskType[] {
  const stored = getFromStorage<CustomTaskType[] | null>(STORAGE_KEYS.taskTypes, null)
  return stored || DEFAULT_TASK_TYPES
}

export function saveTaskTypes(types: CustomTaskType[]): void {
  setToStorage(STORAGE_KEYS.taskTypes, types)
}

export function addTaskType(type: Omit<CustomTaskType, 'id'>): CustomTaskType {
  const types = getTaskTypes()
  const newType: CustomTaskType = { ...type, id: generateId() }
  setToStorage(STORAGE_KEYS.taskTypes, [...types, newType])
  return newType
}

export function updateTaskType(id: string, updates: Partial<CustomTaskType>): CustomTaskType | null {
  const types = getTaskTypes()
  const index = types.findIndex(t => t.id === id)
  if (index === -1) return null
  types[index] = { ...types[index], ...updates }
  setToStorage(STORAGE_KEYS.taskTypes, types)
  return types[index]
}

export function deleteTaskType(id: string): boolean {
  const types = getTaskTypes()
  const filtered = types.filter(t => t.id !== id)
  if (filtered.length === types.length) return false
  setToStorage(STORAGE_KEYS.taskTypes, filtered)
  return true
}

// Priorities
export function getPriorities(): CustomPriority[] {
  const stored = getFromStorage<CustomPriority[] | null>(STORAGE_KEYS.priorities, null)
  return stored || DEFAULT_PRIORITIES
}

export function savePriorities(priorities: CustomPriority[]): void {
  setToStorage(STORAGE_KEYS.priorities, priorities)
}

export function updatePriority(id: string, updates: Partial<CustomPriority>): CustomPriority | null {
  const priorities = getPriorities()
  const index = priorities.findIndex(p => p.id === id)
  if (index === -1) return null
  priorities[index] = { ...priorities[index], ...updates }
  setToStorage(STORAGE_KEYS.priorities, priorities)
  return priorities[index]
}

// Tasks
export function getTasks(): Task[] {
  const tasks = getFromStorage<Task[]>(STORAGE_KEYS.tasks, [])
  return tasks.map(t => ({
    ...t,
    // Valeurs par défaut pour compatibilité V1
    taskType: t.taskType || 'autre',
    priority: t.priority || 'medium',
    recurrence: t.recurrence || 'none',
    deadline: t.deadline ? new Date(t.deadline) : undefined,
    reminderDate: t.reminderDate ? new Date(t.reminderDate) : undefined,
    completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  }))
}

export function getTasksByWorkspace(workspaceId: string): Task[] {
  return getTasks().filter(t => t.workspaceId === workspaceId && !t.parentId)
}

export function getTasksForToday(): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return getTasks().filter(t => {
    if (t.completed || t.parentId) return false
    if (!t.deadline) return false
    const deadline = new Date(t.deadline)
    deadline.setHours(0, 0, 0, 0)
    return deadline.getTime() === today.getTime()
  })
}

export function getTasksForWeek(): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  
  return getTasks().filter(t => {
    if (t.completed || t.parentId) return false
    if (!t.deadline) return false
    const deadline = new Date(t.deadline)
    return deadline >= today && deadline < weekEnd
  })
}

export function getOverdueTasks(): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return getTasks().filter(t => {
    if (t.completed || t.parentId) return false
    if (!t.deadline) return false
    const deadline = new Date(t.deadline)
    deadline.setHours(0, 0, 0, 0)
    return deadline < today
  })
}

export function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const tasks = getTasks()
  const now = new Date()
  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  setToStorage(STORAGE_KEYS.tasks, [...tasks, newTask])
  return newTask
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks()
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return null
  
  const updated: Task = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date(),
  }
  tasks[index] = updated
  setToStorage(STORAGE_KEYS.tasks, tasks)
  return updated
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks()
  const subtasks = getSubtasks()
  const filtered = tasks.filter(t => t.id !== id && t.parentId !== id)
  const filteredSubtasks = subtasks.filter(s => s.parentId !== id)
  if (filtered.length === tasks.length) return false
  setToStorage(STORAGE_KEYS.tasks, filtered)
  setToStorage(STORAGE_KEYS.subtasks, filteredSubtasks)
  return true
}

export function toggleTaskComplete(id: string): Task | null {
  const tasks = getTasks()
  const task = tasks.find(t => t.id === id)
  if (!task) return null
  
  return updateTask(id, {
    completed: !task.completed,
    completedAt: !task.completed ? new Date() : undefined,
  })
}

// Subtasks
export function getSubtasks(): Subtask[] {
  return getFromStorage<Subtask[]>(STORAGE_KEYS.subtasks, [])
}

export function getSubtasksByTask(taskId: string): Subtask[] {
  return getSubtasks()
    .filter(s => s.parentId === taskId)
    .sort((a, b) => a.order - b.order)
}

export function createSubtask(parentId: string, title: string): Subtask {
  const subtasks = getSubtasks()
  const parentSubtasks = subtasks.filter(s => s.parentId === parentId)
  const newSubtask: Subtask = {
    id: generateId(),
    parentId,
    title,
    completed: false,
    order: parentSubtasks.length,
  }
  setToStorage(STORAGE_KEYS.subtasks, [...subtasks, newSubtask])
  return newSubtask
}

export function toggleSubtaskComplete(id: string): Subtask | null {
  const subtasks = getSubtasks()
  const index = subtasks.findIndex(s => s.id === id)
  if (index === -1) return null
  
  subtasks[index] = {
    ...subtasks[index],
    completed: !subtasks[index].completed,
  }
  setToStorage(STORAGE_KEYS.subtasks, subtasks)
  return subtasks[index]
}

export function deleteSubtask(id: string): boolean {
  const subtasks = getSubtasks()
  const filtered = subtasks.filter(s => s.id !== id)
  if (filtered.length === subtasks.length) return false
  setToStorage(STORAGE_KEYS.subtasks, filtered)
  return true
}

// Calendar helpers
export function getTasksByDate(date: Date): Task[] {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  
  return getTasks().filter(t => {
    if (t.parentId) return false
    if (!t.deadline) return false
    const deadline = new Date(t.deadline)
    deadline.setHours(0, 0, 0, 0)
    return deadline.getTime() === targetDate.getTime()
  })
}

export function getTasksGroupedByDate(): Map<string, Task[]> {
  const tasks = getTasks().filter(t => !t.parentId && t.deadline)
  const grouped = new Map<string, Task[]>()
  
  tasks.forEach(task => {
    if (!task.deadline) return
    const dateKey = new Date(task.deadline).toISOString().split('T')[0]
    const existing = grouped.get(dateKey) || []
    grouped.set(dateKey, [...existing, task])
  })
  
  return grouped
}

// User name
export function getUserName(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(STORAGE_KEYS.userName) || ''
}

export function setUserName(name: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.userName, name)
}
