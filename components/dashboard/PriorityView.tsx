'use client'

import { useMemo } from 'react'
import { Task, Workspace, PRIORITY_CONFIG } from '../../lib/types'
import { TaskCard } from '../task/TaskCard'
import { startOfDay } from 'date-fns'
import { Flame, Zap, Leaf } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'

interface PriorityViewProps {
  tasks: Task[]
  workspaces: Workspace[]
  onToggleTask: (id: string) => void
  onClickTask: (task: Task) => void
}

export function PriorityView({ tasks, workspaces, onToggleTask, onClickTask }: PriorityViewProps) {
  const today = startOfDay(new Date())

  const activeTasks = useMemo(() => {
    return tasks.filter(t => !t.completed && !t.parentId)
  }, [tasks])

  const urgentTasks = useMemo(() => {
    return activeTasks
      .filter(t => t.priority === 'high')
      .sort((a, b) => {
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        }
        if (a.deadline) return -1
        if (b.deadline) return 1
        return 0
      })
  }, [activeTasks])

  const importantTasks = useMemo(() => {
    return activeTasks
      .filter(t => t.priority === 'medium')
      .sort((a, b) => {
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        }
        if (a.deadline) return -1
        if (b.deadline) return 1
        return 0
      })
  }, [activeTasks])

  const normalTasks = useMemo(() => {
    return activeTasks
      .filter(t => t.priority === 'low')
      .sort((a, b) => {
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        }
        if (a.deadline) return -1
        if (b.deadline) return 1
        return 0
      })
  }, [activeTasks])

  const getWorkspace = (id: string) => workspaces.find(w => w.id === id)

  const sections = [
    {
      title: 'Urgent',
      tasks: urgentTasks,
      icon: Flame,
      iconColor: 'text-rose-300',
      bgColor: 'bg-red-500/20',
      emptyText: 'Aucune tâche urgente',
      emptyEmoji: '✨',
    },
    {
      title: 'Important',
      tasks: importantTasks,
      icon: Zap,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      emptyText: 'Aucune tâche importante',
      emptyEmoji: '👍',
    },
    {
      title: 'Normal',
      tasks: normalTasks,
      icon: Leaf,
      iconColor: 'text-emerald-300',
      bgColor: 'bg-green-500/20',
      emptyText: 'Aucune tâche normale',
      emptyEmoji: '📭',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-4">
        <p className="text-sm font-medium text-indigo-300 tracking-widest uppercase mb-2">
          MultiTasks — Priorités
        </p>
        <h1 className="text-3xl font-bold text-slate-100">
          Vue par priorité
        </h1>
        <p className="text-slate-100 mt-2">
          {activeTasks.length} tâche{activeTasks.length > 1 ? 's' : ''} en cours
        </p>
      </div>

      {/* Priority sections */}
      {sections.map(({ title, tasks: sectionTasks, icon: Icon, iconColor, bgColor, emptyText, emptyEmoji }) => (
        <section key={title}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${bgColor}`}>
              <Icon size={20} className={iconColor} />
            </div>
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
            <span className="text-sm text-slate-100">({sectionTasks.length})</span>
          </div>

          {sectionTasks.length === 0 ? (
            <EmptyState
              icon={emptyEmoji}
              title={emptyText}
              variant={title === 'Urgent' ? 'calm' : title === 'Normal' ? 'success' : 'default'}
            />
          ) : (
            <div className="space-y-3">
              {sectionTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  workspace={getWorkspace(task.workspaceId)}
                  showWorkspace
                  onToggle={onToggleTask}
                  onClick={onClickTask}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
