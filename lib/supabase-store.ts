// Store Supabase - Sync cloud
import { supabase } from './supabase'
import { Task, Workspace, Subtask } from './types'

// ============================================
// WORKSPACES
// ============================================

export async function getWorkspacesFromDB(): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching workspaces:', error)
    return []
  }

  return data.map(w => ({
    id: w.id,
    name: w.name,
    icon: w.icon,
    color: w.color,
    slug: w.slug,
    userId: w.user_id,
    createdAt: new Date(w.created_at),
  }))
}

export async function createWorkspaceInDB(workspace: Omit<Workspace, 'id' | 'userId' | 'createdAt'>): Promise<Workspace | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      user_id: user.id,
      name: workspace.name,
      icon: workspace.icon,
      color: workspace.color,
      slug: workspace.slug,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating workspace:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    slug: data.slug,
    userId: data.user_id,
    createdAt: new Date(data.created_at),
  }
}

export async function updateWorkspaceInDB(id: string, updates: Partial<Workspace>): Promise<boolean> {
  const { error } = await supabase
    .from('workspaces')
    .update({
      name: updates.name,
      icon: updates.icon,
      color: updates.color,
      slug: updates.slug,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating workspace:', error)
    return false
  }
  return true
}

export async function deleteWorkspaceFromDB(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting workspace:', error)
    return false
  }
  return true
}

// ============================================
// TASKS
// ============================================

export async function getTasksFromDB(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data.map(t => ({
    id: t.id,
    workspaceId: t.workspace_id,
    parentId: t.parent_id,
    title: t.title,
    description: t.description,
    taskType: t.task_type,
    priority: t.priority,
    stars: t.stars,
    deadline: t.deadline ? new Date(t.deadline) : undefined,
    reminderDate: t.reminder_date ? new Date(t.reminder_date) : undefined,
    recurrence: t.recurrence,
    completed: t.completed,
    completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
    createdAt: new Date(t.created_at),
    updatedAt: new Date(t.updated_at),
  }))
}

export async function createTaskInDB(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      workspace_id: task.workspaceId,
      parent_id: task.parentId,
      title: task.title,
      description: task.description,
      task_type: task.taskType,
      priority: task.priority,
      stars: task.stars,
      deadline: task.deadline?.toISOString(),
      reminder_date: task.reminderDate?.toISOString(),
      recurrence: task.recurrence,
      completed: task.completed,
      completed_at: task.completedAt?.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    return null
  }

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    parentId: data.parent_id,
    title: data.title,
    description: data.description,
    taskType: data.task_type,
    priority: data.priority,
    stars: data.stars,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    reminderDate: data.reminder_date ? new Date(data.reminder_date) : undefined,
    recurrence: data.recurrence,
    completed: data.completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function updateTaskInDB(id: string, updates: Partial<Task>): Promise<boolean> {
  const updateData: any = {}
  
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.taskType !== undefined) updateData.task_type = updates.taskType
  if (updates.priority !== undefined) updateData.priority = updates.priority
  if (updates.stars !== undefined) updateData.stars = updates.stars
  if (updates.deadline !== undefined) updateData.deadline = updates.deadline?.toISOString() || null
  if (updates.reminderDate !== undefined) updateData.reminder_date = updates.reminderDate?.toISOString() || null
  if (updates.recurrence !== undefined) updateData.recurrence = updates.recurrence
  if (updates.completed !== undefined) updateData.completed = updates.completed
  if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString() || null

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating task:', error)
    return false
  }
  return true
}

export async function deleteTaskFromDB(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting task:', error)
    return false
  }
  return true
}

export async function toggleTaskCompleteInDB(id: string): Promise<Task | null> {
  // First get current state
  const { data: current } = await supabase
    .from('tasks')
    .select('completed')
    .eq('id', id)
    .single()

  if (!current) return null

  const newCompleted = !current.completed
  const { data, error } = await supabase
    .from('tasks')
    .update({
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error toggling task:', error)
    return null
  }

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    parentId: data.parent_id,
    title: data.title,
    description: data.description,
    taskType: data.task_type,
    priority: data.priority,
    stars: data.stars,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    reminderDate: data.reminder_date ? new Date(data.reminder_date) : undefined,
    recurrence: data.recurrence,
    completed: data.completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

// ============================================
// SUBTASKS
// ============================================

export async function getSubtasksFromDB(): Promise<Subtask[]> {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching subtasks:', error)
    return []
  }

  return data.map(s => ({
    id: s.id,
    parentId: s.task_id,
    title: s.title,
    completed: s.completed,
    order: s.order,
  }))
}

export async function createSubtaskInDB(taskId: string, title: string): Promise<Subtask | null> {
  // Get current max order
  const { data: existing } = await supabase
    .from('subtasks')
    .select('order')
    .eq('task_id', taskId)
    .order('order', { ascending: false })
    .limit(1)

  const newOrder = existing && existing.length > 0 ? existing[0].order + 1 : 0

  const { data, error } = await supabase
    .from('subtasks')
    .insert({
      task_id: taskId,
      title,
      order: newOrder,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating subtask:', error)
    return null
  }

  return {
    id: data.id,
    parentId: data.task_id,
    title: data.title,
    completed: data.completed,
    order: data.order,
  }
}

export async function toggleSubtaskCompleteInDB(id: string): Promise<Subtask | null> {
  const { data: current } = await supabase
    .from('subtasks')
    .select('completed')
    .eq('id', id)
    .single()

  if (!current) return null

  const { data, error } = await supabase
    .from('subtasks')
    .update({ completed: !current.completed })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error toggling subtask:', error)
    return null
  }

  return {
    id: data.id,
    parentId: data.task_id,
    title: data.title,
    completed: data.completed,
    order: data.order,
  }
}

export async function deleteSubtaskFromDB(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting subtask:', error)
    return false
  }
  return true
}

// ============================================
// DEFAULT WORKSPACES (for new users)
// ============================================

export async function createDefaultWorkspaces(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const defaults = [
    { name: 'Cabinet', icon: '🏢', color: '#ef4444', slug: 'cabinet' },
    { name: 'Enseignement', icon: '🎓', color: '#22c55e', slug: 'enseignement' },
    { name: 'Formation IA', icon: '🤖', color: '#eab308', slug: 'formation-ia' },
    { name: 'Architecture IA', icon: '🏗️', color: '#f97316', slug: 'architecture-ia' },
    { name: 'Perso', icon: '🏠', color: '#8b5cf6', slug: 'perso' },
    { name: 'Sport', icon: '💪', color: '#06b6d4', slug: 'sport' },
  ]

  for (let i = 0; i < defaults.length; i++) {
    await supabase.from('workspaces').insert({
      user_id: user.id,
      ...defaults[i],
      order: i,
    })
  }
}
