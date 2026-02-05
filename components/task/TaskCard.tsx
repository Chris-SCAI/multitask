'use client'

import { useState, useMemo } from 'react'
import { Task, Workspace, Subtask } from '../../lib/types'
import { getTaskTypes, getPriorities } from '../../lib/store'
import { cn, formatDeadline, isOverdue } from '../../lib/utils'
import { Check, Calendar, ChevronRight, ChevronDown, Clock, Sparkles, Star, Plus, ListTodo } from 'lucide-react'

interface TaskCardProps {
  task: Task
  workspace?: Workspace
  showWorkspace?: boolean
  subtaskInfo?: { total: number; completed: number }
  subtasks?: Subtask[]
  onToggle: (id: string) => void
  onToggleSubtask?: (id: string) => void
  onClick?: (task: Task) => void
}

export function TaskCard({
  task,
  workspace,
  showWorkspace = false,
  subtaskInfo,
  subtasks = [],
  onToggle,
  onToggleSubtask,
  onClick,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const taskTypes = useMemo(() => getTaskTypes(), [])
  const priorities = useMemo(() => getPriorities(), [])
  
  const typeConfig = taskTypes.find(t => t.id === task.taskType) || { icon: '📌', label: 'Autre', color: '#94a3b8' }
  const priorityConfig = priorities.find(p => p.id === task.priority) || { icon: '⚡', label: 'Normale', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.15)' }
  const overdue = task.deadline && isOverdue(new Date(task.deadline))
  const isUrgent = task.priority === 'high'

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300',
        'bg-gradient-to-br from-slate-800/80 to-slate-800/40',
        'border border-slate-600/50',
        'hover:border-slate-600 hover:shadow-xl hover:shadow-slate-900/50',
        'hover:-translate-y-1',
        task.completed && 'opacity-60',
        isUrgent && !task.completed && 'border-red-500/30 hover:border-red-500/50'
      )}
      onClick={() => onClick?.(task)}
    >
      {/* Urgent glow effect */}
      {isUrgent && !task.completed && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox with animation */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(task.id)
            }}
            className={cn(
              'flex-shrink-0 w-7 h-7 rounded-xl border-2 mt-0.5',
              'flex items-center justify-center transition-all duration-300',
              'hover:scale-110',
              task.completed
                ? 'border-green-500 bg-green-500 shadow-lg shadow-green-500/30'
                : 'border-slate-600 hover:border-indigo-400 hover:bg-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20'
            )}
          >
            {task.completed && <Check size={14} className="text-white" strokeWidth={3} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {showWorkspace && workspace && (
                <span
                  className="text-xl transform group-hover:scale-110 transition-transform"
                  title={workspace.name}
                >
                  {workspace.icon}
                </span>
              )}
              <span
                className={cn(
                  'font-semibold text-white text-base',
                  task.completed && 'line-through text-white'
                )}
              >
                {task.title}
              </span>
              {isUrgent && !task.completed && (
                <Sparkles size={14} className="text-rose-300 animate-pulse" />
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* Type badge */}
              <span
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-transform hover:scale-105"
                style={{
                  backgroundColor: `${typeConfig.color}15`,
                  color: typeConfig.color,
                }}
              >
                {typeConfig.icon} {typeConfig.label}
              </span>

              {/* Priority badge */}
              <span
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-transform hover:scale-105"
                style={{
                  backgroundColor: priorityConfig.bgColor,
                  color: priorityConfig.color,
                }}
              >
                {priorityConfig.icon} {priorityConfig.label}
              </span>

              {/* Stars badge */}
              {task.stars && task.stars > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 transition-transform hover:scale-105">
                  {Array.from({ length: task.stars }).map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400" />
                  ))}
                </span>
              )}

              {/* Deadline */}
              {task.deadline && (
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg',
                    overdue 
                      ? 'bg-red-500/15 text-rose-300' 
                      : 'bg-slate-700/50 text-white'
                  )}
                >
                  <Calendar size={12} />
                  {formatDeadline(new Date(task.deadline))}
                </span>
              )}

              {/* Reminder indicator */}
              {task.reminderDate && (
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300">
                  <Clock size={12} />
                  Rappel
                </span>
              )}

              {/* Subtasks indicator */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (subtasks.length > 0) {
                    setIsExpanded(!isExpanded)
                  } else {
                    onClick?.(task)
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-purple-500/15 text-violet-300 transition-transform hover:scale-105"
              >
                {subtaskInfo && subtaskInfo.total > 0 ? (
                  <>
                    {isExpanded ? <ChevronDown size={12} /> : <ListTodo size={12} />}
                    <span>{subtaskInfo.completed}/{subtaskInfo.total}</span>
                    <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-1">
                      <div
                        className="h-full bg-purple-400 rounded-full transition-all duration-300"
                        style={{ width: `${(subtaskInfo.completed / subtaskInfo.total) * 100}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Plus size={12} />
                    Sous-tâche
                  </>
                )}
              </button>
            </div>

            {/* Description preview */}
            {task.description && (
              <p className="mt-3 text-sm text-white line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Expanded subtasks */}
            {isExpanded && subtasks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-600/50 space-y-2">
                {subtasks.map(subtask => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onToggleSubtask?.(subtask.id)}
                      className={cn(
                        'flex-shrink-0 w-4 h-4 rounded border',
                        'flex items-center justify-center transition-all',
                        subtask.completed
                          ? 'border-green-500 bg-green-500'
                          : 'border-slate-600 hover:border-purple-400'
                      )}
                    >
                      {subtask.completed && <Check size={10} className="text-white" />}
                    </button>
                    <span
                      className={cn(
                        'text-sm',
                        subtask.completed ? 'text-slate-100 line-through' : 'text-slate-100'
                      )}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Arrow with animation */}
          <div className="flex-shrink-0 p-2 rounded-xl bg-slate-700/30 group-hover:bg-indigo-500/20 transition-all duration-300">
            <ChevronRight
              size={18}
              className="text-slate-100 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
