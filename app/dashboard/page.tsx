'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Task, Workspace, Subtask, ViewMode } from '../../lib/types'
import { useStore } from '../../hooks/useStore'
import { getSubtasksByTask } from '../../lib/store'
import { Cockpit } from '../../components/dashboard/Cockpit'
import { PriorityView } from '../../components/dashboard/PriorityView'
import { CalendarView } from '../../components/calendar/CalendarView'
import { WorkspaceCard } from '../../components/workspace/WorkspaceCard'
import { TaskCard } from '../../components/task/TaskCard'
import { TaskForm } from '../../components/task/TaskForm'
import { QuickAdd } from '../../components/task/QuickAdd'
import { SubtaskList } from '../../components/task/SubtaskList'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { NotificationBanner } from '../../components/ui/NotificationBanner'
import { SettingsModal } from '../../components/settings/SettingsModal'
import { EmptyTasksState } from '../../components/ui/EmptyState'
import { Sidebar } from '../../components/layout/Sidebar'
import { EisenhowerButton } from '../../components/ai/EisenhowerButton'
import { DurationPredictor } from '../../components/ai/DurationPredictor'
import { TaskAssistant } from '../../components/ai/TaskAssistant'
import { useReminders } from '../../hooks/useReminders'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Settings,
  ArrowLeft,
  Trash2,
  Edit3,
  Cloud,
  CloudOff,
} from 'lucide-react'
import { cn } from '../../lib/utils'

// Checkout handler component (needs Suspense for useSearchParams)
function CheckoutHandler() {
  const { user } = useAuth()
  const { startCheckout } = useSubscription()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkoutPlan = searchParams.get('checkout') || sessionStorage.getItem('checkout_plan')

    if (user && checkoutPlan && (checkoutPlan === 'pro' || checkoutPlan === 'team')) {
      // Clear the stored intent
      sessionStorage.removeItem('checkout_plan')
      // Clear URL param
      window.history.replaceState({}, '', '/dashboard')

      // Start checkout after a small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        startCheckout(checkoutPlan as 'pro' | 'team').catch((err) => {
          console.error('Checkout error:', err)
          alert('Erreur lors du checkout. Veuillez réessayer.')
        })
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [user, searchParams, startCheckout])

  return null
}

export default function Home() {
  // Use the unified store (local or cloud based on auth)
  const {
    workspaces,
    tasks,
    subtasks: allSubtasks,
    loading,
    isCloud,
    isOnline,
    refreshAll,
    refreshWorkspaces,
    refreshTasks,
    refreshSubtasks,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    createSubtask,
    toggleSubtaskComplete,
    deleteSubtask,
  } = useStore()

  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [currentView, setCurrentView] = useState<ViewMode>('cockpit')
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [taskSubtasks, setTaskSubtasks] = useState<Subtask[]>([])

  // Subtask info par tâche (total + completed)
  const subtaskInfo = useMemo(() => {
    const info: Record<string, { total: number; completed: number }> = {}
    allSubtasks.forEach(s => {
      if (!info[s.parentId]) {
        info[s.parentId] = { total: 0, completed: 0 }
      }
      info[s.parentId].total++
      if (s.completed) info[s.parentId].completed++
    })
    return info
  }, [allSubtasks])

  // Notifications & Reminders
  useReminders({
    tasks,
    enabled: notificationsEnabled && !loading,
  })

  // Check notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true)
    }
  }, [])

  // Task handlers
  const handleCreateTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createTask(taskData)
    setIsTaskFormOpen(false)
  }, [createTask])

  const handleQuickAddTask = useCallback(async (title: string, workspaceId: string) => {
    await createTask({
      title,
      workspaceId,
      taskType: 'autre',
      priority: 'medium',
      recurrence: 'none',
      completed: false,
    })
  }, [createTask])

  const handleToggleTask = useCallback(async (id: string) => {
    await toggleTaskComplete(id)
  }, [toggleTaskComplete])

  const handleDeleteTask = useCallback(async (id: string) => {
    await deleteTask(id)
    setSelectedTask(null)
    setIsTaskDetailOpen(false)
  }, [deleteTask])

  const handleUpdateTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedTask) return
    await updateTask(selectedTask.id, taskData)
    setIsTaskFormOpen(false)
    setSelectedTask(null)
  }, [selectedTask, updateTask])

  const handleEditTask = useCallback(() => {
    setIsTaskDetailOpen(false)
    setIsTaskFormOpen(true)
  }, [])

  const handleClickTask = useCallback((task: Task) => {
    setSelectedTask(task)
    // Get subtasks for this task from allSubtasks
    setTaskSubtasks(allSubtasks.filter(s => s.parentId === task.id))
    setIsTaskDetailOpen(true)
  }, [allSubtasks])

  const handleSelectWorkspace = useCallback((id: string) => {
    setSelectedWorkspace(id)
    setCurrentView('workspace')
  }, [])

  // Subtask handlers
  const handleCreateSubtask = useCallback(async (title: string) => {
    if (!selectedTask) return
    await createSubtask(selectedTask.id, title)
    // Refresh local view
    setTaskSubtasks(allSubtasks.filter(s => s.parentId === selectedTask.id))
  }, [selectedTask, createSubtask, allSubtasks])

  const handleToggleSubtask = useCallback(async (id: string) => {
    await toggleSubtaskComplete(id)
    if (selectedTask) {
      setTaskSubtasks(allSubtasks.filter(s => s.parentId === selectedTask.id))
    }
  }, [selectedTask, toggleSubtaskComplete, allSubtasks])

  const handleDeleteSubtask = useCallback(async (id: string) => {
    await deleteSubtask(id)
    if (selectedTask) {
      setTaskSubtasks(allSubtasks.filter(s => s.parentId === selectedTask.id))
    }
  }, [selectedTask, deleteSubtask, allSubtasks])

  // Settings workspace handlers (for SettingsModal compatibility)
  const handleWorkspacesChange = useCallback(async () => {
    await refreshWorkspaces()
  }, [refreshWorkspaces])

  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspace)
  const workspaceTasks = selectedWorkspace
    ? tasks.filter(t => t.workspaceId === selectedWorkspace && !t.parentId)
    : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-100 mt-4">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Checkout handler for redirect after login */}
      <Suspense fallback={null}>
        <CheckoutHandler />
      </Suspense>

      {/* Sync status indicator */}
      {isCloud && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          isOnline 
            ? "bg-green-500/20 text-emerald-300 border border-green-500/30" 
            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
        )}>
          {isOnline ? <Cloud size={14} /> : <CloudOff size={14} />}
          {isOnline ? "Sync" : "Hors ligne"}
        </div>
      )}

      {/* Sidebar - Desktop only */}
      <Sidebar
        workspaces={workspaces}
        currentView={currentView}
        selectedWorkspace={selectedWorkspace}
        onViewChange={(view) => {
          setCurrentView(view)
          setSelectedWorkspace(null)
        }}
        onWorkspaceSelect={(id) => {
          setSelectedWorkspace(id)
          setCurrentView('workspace')
        }}
        onSettingsOpen={() => setIsSettingsOpen(true)}
      />

      {/* Main content wrapper */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header - Mobile only */}
        <header className="lg:hidden sticky top-0 z-40 backdrop-blur-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/80 border-b border-slate-600/50 shadow-lg shadow-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
              ✨ MultiTasks
            </h1>
            <nav className="flex items-center gap-1 p-1.5 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-600/50">
              <button
                onClick={() => {
                  setCurrentView('cockpit')
                  setSelectedWorkspace(null)
                }}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                  currentView === 'cockpit'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-white hover:text-white hover:bg-slate-700/50'
                )}
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Cockpit</span>
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                  currentView === 'calendar'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-white hover:text-white hover:bg-slate-700/50'
                )}
              >
                <Calendar size={18} />
                <span className="hidden sm:inline">Calendrier</span>
              </button>
              <button
                onClick={() => setCurrentView('priority')}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                  currentView === 'priority'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-white hover:text-white hover:bg-slate-700/50'
                )}
              >
                <Layers size={18} />
                <span className="hidden sm:inline">Priorités</span>
              </button>
            </nav>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl text-white hover:text-white hover:bg-slate-700/50 hover:rotate-90 transition-all duration-300"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Notification Banner */}
        <NotificationBanner
          onPermissionChange={(granted) => setNotificationsEnabled(granted)}
        />

        {currentView === 'cockpit' && !selectedWorkspace && (
          <div className="space-y-8">
            <Cockpit
              tasks={tasks}
              workspaces={workspaces}
              subtaskInfo={subtaskInfo}
              allSubtasks={allSubtasks}
              onToggleTask={handleToggleTask}
              onToggleSubtask={handleToggleSubtask}
              onClickTask={handleClickTask}
              onUpdateTask={updateTask}
            />

            {/* Workspaces */}
            <section className="animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-100 mb-4">
                Espaces de travail
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 stagger-children">
                {workspaces.map(workspace => {
                  const wTasks = tasks.filter(t => t.workspaceId === workspace.id && !t.parentId)
                  const overdue = wTasks.filter(t => {
                    if (t.completed || !t.deadline) return false
                    return new Date(t.deadline) < new Date()
                  }).length
                  return (
                    <WorkspaceCard
                      key={workspace.id}
                      workspace={workspace}
                      taskCount={wTasks.length}
                      completedCount={wTasks.filter(t => t.completed).length}
                      overdueCount={overdue}
                      onClick={() => handleSelectWorkspace(workspace.id)}
                    />
                  )
                })}
              </div>
            </section>

            {/* Quick Add */}
            <QuickAdd
              workspaces={workspaces}
              onQuickAdd={handleQuickAddTask}
              onOpenFullForm={() => setIsTaskFormOpen(true)}
            />
          </div>
        )}

        {currentView === 'calendar' && (
          <CalendarView
            tasks={tasks}
            workspaces={workspaces}
            onToggleTask={handleToggleTask}
            onClickTask={handleClickTask}
          />
        )}

        {currentView === 'priority' && (
          <PriorityView
            tasks={tasks}
            workspaces={workspaces}
            onToggleTask={handleToggleTask}
            onClickTask={handleClickTask}
          />
        )}

        {currentView === 'workspace' && currentWorkspace && (
          <div className="space-y-6">
            {/* Workspace header */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setCurrentView('cockpit')
                  setSelectedWorkspace(null)
                }}
                className="p-2 rounded-lg text-white hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${currentWorkspace.color}20` }}
              >
                {currentWorkspace.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">
                  {currentWorkspace.name}
                </h1>
                <p className="text-sm text-slate-100">
                  {workspaceTasks.filter(t => !t.completed).length} tâches en cours
                </p>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {workspaceTasks.filter(t => !t.completed).length === 0 ? (
                <EmptyTasksState />
              ) : (
                workspaceTasks.filter(t => !t.completed).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    subtaskInfo={subtaskInfo[task.id]}
                    subtasks={allSubtasks.filter(s => s.parentId === task.id)}
                    onToggle={handleToggleTask}
                    onToggleSubtask={handleToggleSubtask}
                    onClick={handleClickTask}
                  />
                ))
              )}
            </div>

            {/* Completed */}
            {workspaceTasks.filter(t => t.completed).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-100 mb-3">
                  Terminées ({workspaceTasks.filter(t => t.completed).length})
                </h3>
                <div className="space-y-2">
                  {workspaceTasks.filter(t => t.completed).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      subtaskInfo={subtaskInfo[task.id]}
                      subtasks={allSubtasks.filter(s => s.parentId === task.id)}
                      onToggle={handleToggleTask}
                      onToggleSubtask={handleToggleSubtask}
                      onClick={handleClickTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add */}
            <QuickAdd
              workspaces={workspaces}
              selectedWorkspace={selectedWorkspace || undefined}
              onQuickAdd={handleQuickAddTask}
              onOpenFullForm={() => setIsTaskFormOpen(true)}
            />
          </div>
        )}
      </main>
      </div>{/* End of lg:ml-64 wrapper */}

      {/* Task Form Modal */}
      <Modal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false)
          setSelectedTask(null)
        }}
        title={selectedTask ? "Modifier la tâche" : "Nouvelle tâche"}
        size="lg"
      >
        <TaskForm
          workspaces={workspaces}
          initialTask={selectedTask || (selectedWorkspace ? { workspaceId: selectedWorkspace } : undefined)}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setIsTaskFormOpen(false)
            setSelectedTask(null)
          }}
        />
      </Modal>

      {/* Task Detail Modal */}
      <Modal
        isOpen={isTaskDetailOpen}
        onClose={() => {
          setIsTaskDetailOpen(false)
          setSelectedTask(null)
        }}
        title={selectedTask?.title}
        size="md"
      >
        {selectedTask && (
          <div className="space-y-6">
            {/* Description */}
            {selectedTask.description && (
              <p className="text-white">{selectedTask.description}</p>
            )}

            {/* Subtasks */}
            <SubtaskList
              subtasks={taskSubtasks}
              task={selectedTask}
              onToggle={handleToggleSubtask}
              onCreate={handleCreateSubtask}
              onDelete={handleDeleteSubtask}
            />

            {/* AI Analysis */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-sm font-medium text-white mb-3">🤖 Analyse IA</h4>
              <div className="space-y-3">
                <EisenhowerButton
                  task={selectedTask}
                  onApply={async (result) => {
                    await updateTask(selectedTask.id, {
                      priority: result.suggestedPriority,
                      stars: result.suggestedStars,
                    })
                  }}
                />
                <DurationPredictor
                  task={selectedTask}
                  subtasks={taskSubtasks.map(s => s.title)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-800">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteTask(selectedTask.id)}
              >
                <Trash2 size={16} className="mr-2" />
                Supprimer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditTask}
              >
                <Edit3 size={16} className="mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        workspaces={workspaces}
        onWorkspacesChange={handleWorkspacesChange}
      />

      {/* Task Assistant - Floating chat */}
      <TaskAssistant tasks={tasks} workspaces={workspaces} />
    </div>
  )
}
