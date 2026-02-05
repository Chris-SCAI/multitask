'use client'

import { useState, useEffect } from 'react'
import { Task, Workspace, Priority, TaskType, RecurrenceType, RECURRENCE_CONFIG } from '../../lib/types'
import { getTaskTypes, getPriorities, CustomTaskType, CustomPriority } from '../../lib/store'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { cn } from '../../lib/utils'
import { Calendar, Clock, RefreshCw, Tag, FileText, Star } from 'lucide-react'

interface TaskFormProps {
  workspaces: Workspace[]
  initialTask?: Partial<Task>
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function TaskForm({ workspaces, initialTask, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '')
  const [description, setDescription] = useState(initialTask?.description || '')
  const [workspaceId, setWorkspaceId] = useState(initialTask?.workspaceId || workspaces[0]?.id || '')
  const [taskType, setTaskType] = useState<string>(initialTask?.taskType || 'autre')
  const [priority, setPriority] = useState<string>(initialTask?.priority || 'medium')
  const [taskTypes, setTaskTypes] = useState<CustomTaskType[]>([])
  const [priorities, setPriorities] = useState<CustomPriority[]>([])
  const [deadline, setDeadline] = useState(() => {
    if (!initialTask?.deadline) return ''
    const d = new Date(initialTask.deadline)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [reminderDate, setReminderDate] = useState(() => {
    if (!initialTask?.reminderDate) return ''
    const d = new Date(initialTask.reminderDate)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  })
  const [recurrence, setRecurrence] = useState<RecurrenceType>(initialTask?.recurrence || 'none')
  const [stars, setStars] = useState<0 | 1 | 2 | 3>(initialTask?.stars || 0)

  useEffect(() => {
    setTaskTypes(getTaskTypes())
    setPriorities(getPriorities())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !workspaceId) return

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      workspaceId,
      taskType: taskType as TaskType,
      priority: priority as Priority,
      stars: stars > 0 ? stars as 1 | 2 | 3 : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      reminderDate: reminderDate ? new Date(reminderDate) : undefined,
      recurrence,
      completed: initialTask?.completed || false,
      completedAt: initialTask?.completedAt,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Titre *
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Qu'est-ce que tu dois faire ?"
          autoFocus
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          <FileText size={14} className="inline mr-1" />
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Détails supplémentaires..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-600 text-slate-100 placeholder:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 resize-none"
        />
      </div>

      {/* Workspace */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Espace de travail
        </label>
        <div className="flex flex-wrap gap-2">
          {workspaces.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWorkspaceId(w.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                'border',
                workspaceId === w.id
                  ? 'border-current'
                  : 'border-slate-600 opacity-50 hover:opacity-100'
              )}
              style={{
                backgroundColor: workspaceId === w.id ? `${w.color}20` : 'transparent',
                color: w.color,
                borderColor: workspaceId === w.id ? w.color : undefined,
              }}
            >
              {w.icon} {w.name}
            </button>
          ))}
        </div>
      </div>

      {/* Type de tâche */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          <Tag size={14} className="inline mr-1" />
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          {taskTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setTaskType(type.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                'border',
                taskType === type.id
                  ? 'border-current'
                  : 'border-slate-600 text-white hover:text-white'
              )}
              style={{
                backgroundColor: taskType === type.id ? `${type.color}20` : 'transparent',
                color: taskType === type.id ? type.color : undefined,
                borderColor: taskType === type.id ? type.color : undefined,
              }}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priorité */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Priorité
        </label>
        <div className="flex gap-2">
          {priorities.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPriority(p.id)}
              className={cn(
                'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                'border flex items-center justify-center gap-2',
                priority === p.id
                  ? 'border-current'
                  : 'border-slate-600 text-white hover:text-white'
              )}
              style={{
                backgroundColor: priority === p.id ? p.bgColor : 'transparent',
                color: priority === p.id ? p.color : undefined,
                borderColor: priority === p.id ? p.color : undefined,
              }}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Étoiles - À la une */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          <Star size={14} className="inline mr-1" />
          À la une
        </label>
        <div className="flex gap-2 items-center">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(stars === n ? 0 : n as 1 | 2 | 3)}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-slate-700/50"
            >
              <Star
                size={24}
                className={cn(
                  'transition-all duration-200',
                  n <= stars
                    ? 'fill-amber-400 text-amber-300'
                    : 'text-slate-600 hover:text-white'
                )}
              />
            </button>
          ))}
          {stars > 0 && (
            <span className="text-sm text-amber-300 ml-2">
              {stars === 3 ? 'Top priorité' : stars === 2 ? 'Important' : 'À suivre'}
            </span>
          )}
        </div>
      </div>

      {/* Date et Rappel */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <Calendar size={14} className="inline mr-1" />
            Échéance
          </label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <Clock size={14} className="inline mr-1" />
            Rappel
          </label>
          <Input
            type="datetime-local"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
          />
        </div>
      </div>

      {/* Récurrence */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          <RefreshCw size={14} className="inline mr-1" />
          Récurrence
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(RECURRENCE_CONFIG) as RecurrenceType[]).map((r) => {
            const config = RECURRENCE_CONFIG[r]
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRecurrence(r)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  'border',
                  recurrence === r
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                    : 'border-slate-600 text-white hover:text-white'
                )}
              >
                {config.icon} {config.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          {initialTask?.id ? 'Modifier' : 'Créer la tâche'}
        </Button>
      </div>
    </form>
  )
}
