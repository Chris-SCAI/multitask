'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task, Workspace, Subtask } from '../lib/types'
import { useAuth } from './useAuth'

// Local store (existing)
import {
  initializeStore as initLocalStore,
  getWorkspaces as getLocalWorkspaces,
  getTasks as getLocalTasks,
  getSubtasks as getLocalSubtasks,
  createTask as createLocalTask,
  updateTask as updateLocalTask,
  deleteTask as deleteLocalTask,
  toggleTaskComplete as toggleLocalTaskComplete,
  createWorkspace as createLocalWorkspace,
  updateWorkspace as updateLocalWorkspace,
  deleteWorkspace as deleteLocalWorkspace,
  createSubtask as createLocalSubtask,
  toggleSubtaskComplete as toggleLocalSubtaskComplete,
  deleteSubtask as deleteLocalSubtask,
} from '../lib/store'

// Supabase store
import {
  getWorkspacesFromDB,
  getTasksFromDB,
  getSubtasksFromDB,
  createTaskInDB,
  updateTaskInDB,
  deleteTaskFromDB,
  toggleTaskCompleteInDB,
  createWorkspaceInDB,
  updateWorkspaceInDB,
  deleteWorkspaceFromDB,
  createSubtaskInDB,
  toggleSubtaskCompleteInDB,
  deleteSubtaskFromDB,
  createDefaultWorkspaces,
} from '../lib/supabase-store'

export function useStore() {
  const { user, loading: authLoading } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)

  const isCloud = !!user // Use cloud if logged in

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (isCloud) {
        console.log('[Store] Loading from Supabase...')
        const [ws, ts, ss] = await Promise.all([
          getWorkspacesFromDB(),
          getTasksFromDB(),
          getSubtasksFromDB(),
        ])
        
        // If no workspaces, create defaults
        if (ws.length === 0) {
          console.log('[Store] Creating default workspaces...')
          await createDefaultWorkspaces()
          const newWs = await getWorkspacesFromDB()
          setWorkspaces(newWs)
        } else {
          setWorkspaces(ws)
        }
        setTasks(ts)
        setSubtasks(ss)
        setIsOnline(true)
      } else {
        console.log('[Store] Loading from localStorage...')
        const ws = initLocalStore()
        setWorkspaces(ws)
        setTasks(getLocalTasks())
        setSubtasks(getLocalSubtasks())
      }
    } catch (error) {
      console.error('[Store] Error loading data:', error)
      // Fallback to local
      if (isCloud) {
        console.log('[Store] Falling back to localStorage...')
        setIsOnline(false)
        const ws = initLocalStore()
        setWorkspaces(ws)
        setTasks(getLocalTasks())
        setSubtasks(getLocalSubtasks())
      }
    } finally {
      setLoading(false)
    }
  }, [isCloud])

  useEffect(() => {
    if (!authLoading) {
      loadData()
    }
  }, [authLoading, loadData])

  // Refresh functions
  const refreshWorkspaces = useCallback(async () => {
    if (isCloud && isOnline) {
      setWorkspaces(await getWorkspacesFromDB())
    } else {
      setWorkspaces(getLocalWorkspaces())
    }
  }, [isCloud, isOnline])

  const refreshTasks = useCallback(async () => {
    if (isCloud && isOnline) {
      setTasks(await getTasksFromDB())
    } else {
      setTasks(getLocalTasks())
    }
  }, [isCloud, isOnline])

  const refreshSubtasks = useCallback(async () => {
    if (isCloud && isOnline) {
      setSubtasks(await getSubtasksFromDB())
    } else {
      setSubtasks(getLocalSubtasks())
    }
  }, [isCloud, isOnline])

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshWorkspaces(), refreshTasks(), refreshSubtasks()])
  }, [refreshWorkspaces, refreshTasks, refreshSubtasks])

  // CRUD Operations - Workspaces
  const createWorkspace = useCallback(async (data: Omit<Workspace, 'id' | 'userId' | 'createdAt'>) => {
    if (isCloud && isOnline) {
      const ws = await createWorkspaceInDB(data)
      if (ws) await refreshWorkspaces()
      return ws
    } else {
      createLocalWorkspace(data)
      await refreshWorkspaces()
      return null
    }
  }, [isCloud, isOnline, refreshWorkspaces])

  const updateWorkspace = useCallback(async (id: string, data: Partial<Workspace>) => {
    if (isCloud && isOnline) {
      await updateWorkspaceInDB(id, data)
    } else {
      updateLocalWorkspace(id, data)
    }
    await refreshWorkspaces()
  }, [isCloud, isOnline, refreshWorkspaces])

  const deleteWorkspace = useCallback(async (id: string) => {
    if (isCloud && isOnline) {
      await deleteWorkspaceFromDB(id)
    } else {
      deleteLocalWorkspace(id)
    }
    await refreshWorkspaces()
    await refreshTasks()
  }, [isCloud, isOnline, refreshWorkspaces, refreshTasks])

  // CRUD Operations - Tasks
  const createTask = useCallback(async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isCloud && isOnline) {
      const task = await createTaskInDB(data)
      if (task) await refreshTasks()
      return task
    } else {
      createLocalTask(data)
      await refreshTasks()
      return null
    }
  }, [isCloud, isOnline, refreshTasks])

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    if (isCloud && isOnline) {
      await updateTaskInDB(id, data)
    } else {
      updateLocalTask(id, data)
    }
    await refreshTasks()
  }, [isCloud, isOnline, refreshTasks])

  const deleteTask = useCallback(async (id: string) => {
    if (isCloud && isOnline) {
      await deleteTaskFromDB(id)
    } else {
      deleteLocalTask(id)
    }
    await refreshTasks()
    await refreshSubtasks()
  }, [isCloud, isOnline, refreshTasks, refreshSubtasks])

  const toggleTaskComplete = useCallback(async (id: string) => {
    if (isCloud && isOnline) {
      await toggleTaskCompleteInDB(id)
    } else {
      toggleLocalTaskComplete(id)
    }
    await refreshTasks()
  }, [isCloud, isOnline, refreshTasks])

  // CRUD Operations - Subtasks
  const createSubtask = useCallback(async (taskId: string, title: string) => {
    if (isCloud && isOnline) {
      await createSubtaskInDB(taskId, title)
    } else {
      createLocalSubtask(taskId, title)
    }
    await refreshSubtasks()
  }, [isCloud, isOnline, refreshSubtasks])

  const toggleSubtaskComplete = useCallback(async (id: string) => {
    if (isCloud && isOnline) {
      await toggleSubtaskCompleteInDB(id)
    } else {
      toggleLocalSubtaskComplete(id)
    }
    await refreshSubtasks()
  }, [isCloud, isOnline, refreshSubtasks])

  const deleteSubtask = useCallback(async (id: string) => {
    if (isCloud && isOnline) {
      await deleteSubtaskFromDB(id)
    } else {
      deleteLocalSubtask(id)
    }
    await refreshSubtasks()
  }, [isCloud, isOnline, refreshSubtasks])

  return {
    // State
    workspaces,
    tasks,
    subtasks,
    loading: loading || authLoading,
    isCloud,
    isOnline,
    
    // Refresh
    refreshAll,
    refreshWorkspaces,
    refreshTasks,
    refreshSubtasks,
    
    // Workspaces
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    
    // Tasks
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    
    // Subtasks
    createSubtask,
    toggleSubtaskComplete,
    deleteSubtask,
  }
}
