'use client'

import { useMemo, useState, useEffect } from 'react'
import { Task, Workspace, Subtask, PRIORITY_CONFIG } from '../../lib/types'
import { getUserName } from '../../lib/store'
import { TaskCard } from '../task/TaskCard'
import { format, isToday, isTomorrow, addDays, startOfDay, getHours } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Star, AlertTriangle, Calendar } from 'lucide-react'
import { EmptyUrgentState } from '../ui/EmptyState'
import { AnalyzeButton } from '../ai/AnalyzeButton'
import { DailyFocus } from '../ai/DailyFocus'
import { WeeklyReport } from '../ai/WeeklyReport'

function getGreeting(name: string): string {
  const hour = getHours(new Date())
  if (hour >= 5 && hour < 12) return `Bonjour ${name} ! Prêt à conquérir la journée ? 💪`
  if (hour >= 12 && hour < 18) return `Bon après-midi ${name} ! On continue sur ta lancée 🚀`
  if (hour >= 18 && hour < 22) return `Bonsoir ${name} ! Dernière ligne droite 🎯`
  return `Bonne nuit ${name} ! Repose-toi bien 🌙`
}

interface CockpitProps {
  tasks: Task[]
  workspaces: Workspace[]
  subtaskInfo?: Record<string, { total: number; completed: number }>
  allSubtasks?: Subtask[]
  onToggleTask: (id: string) => void
  onToggleSubtask?: (id: string) => void
  onClickTask: (task: Task) => void
  onUpdateTask?: (id: string, updates: Partial<Task>) => void
}

export function Cockpit({ tasks, workspaces, subtaskInfo = {}, allSubtasks = [], onToggleTask, onToggleSubtask, onClickTask, onUpdateTask }: CockpitProps) {
  const today = startOfDay(new Date())
  const [userName, setUserNameState] = useState('')
  
  useEffect(() => {
    setUserNameState(getUserName())
    
    const handleUserNameChange = () => {
      setUserNameState(getUserName())
    }
    
    window.addEventListener('usernameChanged', handleUserNameChange)
    return () => window.removeEventListener('usernameChanged', handleUserNameChange)
  }, [])
  
  // Tâches en retard
  const overdueTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.completed || t.parentId) return false
      if (!t.deadline) return false
      return startOfDay(new Date(t.deadline)) < today
    })
  }, [tasks, today])

  // Tâches "À la une" - triées par étoiles décroissantes
  const starredTasks = useMemo(() => {
    return tasks
      .filter(t => !t.completed && !t.parentId && t.stars && t.stars > 0)
      .sort((a, b) => {
        // Tri par étoiles décroissantes
        const starsA = a.stars || 0
        const starsB = b.stars || 0
        if (starsB !== starsA) return starsB - starsA
        // À étoiles égales, tri par deadline
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        }
        if (a.deadline) return -1
        if (b.deadline) return 1
        return 0
      })
      .slice(0, 6)
  }, [tasks])

  // Tâches de la semaine groupées par jour
  const weekTasks = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i)
      const dayTasks = tasks.filter(t => {
        if (t.completed || t.parentId || !t.deadline) return false
        return startOfDay(new Date(t.deadline)).getTime() === date.getTime()
      })
      days.push({ date, tasks: dayTasks })
    }
    return days
  }, [tasks, today])

  const getWorkspace = (id: string) => workspaces.find(w => w.id === id)
  const totalPending = tasks.filter(t => !t.completed && !t.parentId).length
  const totalCompleted = tasks.filter(t => t.completed && !t.parentId).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-4">
        <p className="text-sm font-bold text-indigo-300 tracking-widest uppercase mb-2">
          Cockpit
        </p>
        <h1 className="text-3xl font-bold text-slate-100 capitalize">
          {format(today, 'EEEE d MMMM yyyy', { locale: fr })}
        </h1>
        {userName && (
          <p className="text-lg text-indigo-300 mt-2 font-medium">
            {getGreeting(userName)}
          </p>
        )}
        <p className={`text-slate-100 ${userName ? 'mt-1' : 'mt-2'}`}>
          {totalPending} tâches en cours • {totalCompleted} terminées
        </p>
        
        {/* AI Buttons */}
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          <AnalyzeButton
            tasks={tasks}
            workspaces={workspaces}
            onApplyPriorityChange={onUpdateTask ? (taskId, priority, stars) => {
              onUpdateTask(taskId, { priority, stars: stars as 1 | 2 | 3 | undefined })
            } : undefined}
          />
          <WeeklyReport tasks={tasks} workspaces={workspaces} />
        </div>
      </div>

      {/* Daily Focus */}
      <DailyFocus
        tasks={tasks}
        workspaces={workspaces}
        onClickTask={(taskId) => {
          const task = tasks.find(t => t.id === taskId)
          if (task) onClickTask(task)
        }}
      />

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div className="glass-card p-4 border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-3 text-rose-300">
            <AlertTriangle size={20} />
            <span className="font-semibold">
              {overdueTasks.length} tâche{overdueTasks.length > 1 ? 's' : ''} en retard !
            </span>
          </div>
        </div>
      )}

      {/* À la une */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Star size={20} className="text-amber-300" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">À la une</h2>
          <span className="text-sm text-slate-100">({starredTasks.length})</span>
        </div>
        
        {starredTasks.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-white">Aucune tâche étoilée</p>
            <p className="text-sm text-slate-100 mt-1">Ajoute des ⭐ à tes tâches importantes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {starredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                workspace={getWorkspace(task.workspaceId)}
                showWorkspace
                subtaskInfo={subtaskInfo[task.id]}
                subtasks={allSubtasks.filter(s => s.parentId === task.id)}
                onToggle={onToggleTask}
                onToggleSubtask={onToggleSubtask}
                onClick={onClickTask}
              />
            ))}
          </div>
        )}
      </section>

      {/* Aperçu semaine */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Calendar size={20} className="text-violet-300" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Cette semaine</h2>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekTasks.map(({ date, tasks: dayTasks }) => {
            const isCurrentDay = isToday(date)
            const isTomorrowDay = isTomorrow(date)
            return (
              <div
                key={date.toISOString()}
                className={`p-3 text-center bg-slate-800/70 border-2 rounded-xl ${
                  isCurrentDay ? 'border-indigo-500' : 'border-slate-600'
                }`}
              >
                <p className="text-xs text-slate-100 capitalize">
                  {isCurrentDay ? "Auj." : isTomorrowDay ? "Dem." : format(date, 'EEE', { locale: fr })}
                </p>
                <p className="text-lg font-bold text-white mt-1">
                  {format(date, 'd')}
                </p>
                <p className={`text-sm mt-1 ${dayTasks.length > 0 ? 'text-indigo-300' : 'text-slate-600'}`}>
                  {dayTasks.length || '—'}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
