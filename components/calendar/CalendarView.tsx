'use client'

import { useMemo, useState } from 'react'
import { Task, Workspace } from '../../lib/types'
import { TaskCard } from '../task/TaskCard'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CalendarViewProps {
  tasks: Task[]
  workspaces: Workspace[]
  onToggleTask: (id: string) => void
  onClickTask: (task: Task) => void
}

export function CalendarView({ tasks, workspaces, onToggleTask, onClickTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Date[] = []
    let day = calendarStart
    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [calendarStart, calendarEnd])

  // Tasks grouped by date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.filter(t => !t.parentId && t.deadline).forEach(task => {
      const dateKey = format(new Date(task.deadline!), 'yyyy-MM-dd')
      const existing = map.get(dateKey) || []
      map.set(dateKey, [...existing, task])
    })
    return map
  }, [tasks])

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return tasksByDate.get(dateKey) || []
  }, [selectedDate, tasksByDate])

  const getWorkspace = (id: string) => workspaces.find(w => w.id === id)

  const getDayIndicator = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayTasks = tasksByDate.get(dateKey) || []
    if (dayTasks.length === 0) return null
    
    const hasOverdue = dayTasks.some(t => !t.completed && new Date(t.deadline!) < new Date())
    const hasUrgent = dayTasks.some(t => t.priority === 'high' && !t.completed)
    
    if (hasOverdue) return 'bg-red-500'
    if (hasUrgent) return 'bg-yellow-500'
    return 'bg-indigo-500'
  }

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg text-white hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-100 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg text-white hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="glass-card p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-100 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => {
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            const indicator = getDayIndicator(day)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-200',
                  isCurrentMonth ? 'text-white' : 'text-slate-600',
                  isSelected && 'bg-indigo-500/30 ring-2 ring-indigo-500',
                  isToday && !isSelected && 'bg-slate-800',
                  !isSelected && 'hover:bg-slate-800/70'
                )}
              >
                <span className={cn(
                  'text-sm font-medium',
                  isSelected && 'text-indigo-300'
                )}>
                  {format(day, 'd')}
                </span>
                {indicator && (
                  <div className={cn('w-1.5 h-1.5 rounded-full mt-1', indicator)} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected date tasks */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4">
            {isSameDay(selectedDate, new Date())
              ? "Aujourd'hui"
              : format(selectedDate, 'EEEE d MMMM', { locale: fr })}
          </h3>
          
          {selectedDateTasks.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-slate-100">Aucune tâche ce jour</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateTasks.map(task => (
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
        </div>
      )}
    </div>
  )
}
