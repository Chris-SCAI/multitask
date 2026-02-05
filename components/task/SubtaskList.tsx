'use client'

import { useState } from 'react'
import { Subtask, Task } from '../../lib/types'
import { cn } from '../../lib/utils'
import { Check, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { generateSubtasks } from '../../lib/ai-features'
import { isLLMConfigured } from '../../lib/llm-providers'

interface SubtaskListProps {
  subtasks: Subtask[]
  task?: Task
  onToggle: (id: string) => void
  onCreate: (title: string) => void
  onDelete: (id: string) => void
}

export function SubtaskList({ subtasks, task, onToggle, onCreate, onDelete }: SubtaskListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    onCreate(newTitle.trim())
    setNewTitle('')
    setIsAdding(false)
  }

  const handleGenerate = async () => {
    if (!task || !isLLMConfigured()) {
      setGenerationError('IA non configurée. Ajoutez votre clé API dans les paramètres.')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const existingTitles = subtasks.map(s => s.title)
      const result = await generateSubtasks(task, existingTitles)
      
      // Add each generated subtask
      for (const st of result.subtasks) {
        onCreate(st.title)
      }
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Erreur de génération')
    } finally {
      setIsGenerating(false)
    }
  }

  const completedCount = subtasks.filter(s => s.completed).length
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">
          Sous-tâches ({completedCount}/{subtasks.length})
        </span>
        {subtasks.length > 0 && (
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 group',
              'hover:bg-slate-800/70 transition-colors'
            )}
          >
            <button
              onClick={() => onToggle(subtask.id)}
              className={cn(
                'flex-shrink-0 w-5 h-5 rounded-md border-2',
                'flex items-center justify-center transition-all duration-200',
                subtask.completed
                  ? 'border-green-500 bg-green-500'
                  : 'border-slate-600 hover:border-indigo-500'
              )}
            >
              {subtask.completed && <Check size={12} className="text-white" />}
            </button>
            
            <span
              className={cn(
                'flex-1 text-sm',
                subtask.completed ? 'text-slate-100 line-through' : 'text-slate-100'
              )}
            >
              {subtask.title}
            </span>

            <button
              onClick={() => onDelete(subtask.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-100 hover:text-rose-300 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Error message */}
      {generationError && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-rose-300 text-xs">
          {generationError}
        </div>
      )}

      {/* Add subtask */}
      {isAdding ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nouvelle sous-tâche..."
            className="flex-1 px-3 py-2 text-sm bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder:text-slate-100 focus:outline-none focus:border-indigo-500/50"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-3 py-2 text-sm bg-indigo-500 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-400 transition-colors"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false)
              setNewTitle('')
            }}
            className="px-3 py-2 text-sm text-white hover:text-white transition-colors"
          >
            Annuler
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm text-slate-100 hover:text-indigo-300 transition-colors"
          >
            <Plus size={16} />
            Ajouter
          </button>
          
          {task && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 text-sm text-slate-100 hover:text-violet-300 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Générer avec l'IA
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
