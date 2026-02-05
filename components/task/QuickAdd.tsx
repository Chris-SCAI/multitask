'use client'

import { useState } from 'react'
import { Plus, Zap } from 'lucide-react'
import { Workspace } from '../../lib/types'
import { cn } from '../../lib/utils'

interface QuickAddProps {
  workspaces: Workspace[]
  selectedWorkspace?: string
  onQuickAdd: (title: string, workspaceId: string) => void
  onOpenFullForm: () => void
}

export function QuickAdd({ workspaces, selectedWorkspace, onQuickAdd, onOpenFullForm }: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [workspaceId, setWorkspaceId] = useState(selectedWorkspace || workspaces[0]?.id)

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !workspaceId) return
    
    onQuickAdd(title.trim(), workspaceId)
    setTitle('')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-full flex items-center justify-center gap-3 p-4 rounded-xl',
          'border-2 border-dashed border-slate-600',
          'text-slate-100 hover:text-indigo-300 hover:border-indigo-500/50',
          'transition-all duration-300 group'
        )}
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-medium">Nouvelle tâche</span>
      </button>
    )
  }

  return (
    <div className="glass-card p-4 animate-fadeIn">
      <form onSubmit={handleQuickSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la tâche..."
          className="w-full bg-transparent text-lg font-medium text-slate-100 placeholder:text-slate-600 focus:outline-none"
          autoFocus
        />
        
        {/* Workspace selector */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {workspaces.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWorkspaceId(w.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                workspaceId === w.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              )}
              style={{
                backgroundColor: workspaceId === w.id ? `${w.color}20` : 'transparent',
                color: w.color,
                boxShadow: workspaceId === w.id ? `0 0 0 1px ${w.color}` : 'none',
              }}
            >
              {w.icon} {w.name}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onOpenFullForm}
            className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-300 transition-colors"
          >
            <Zap size={16} />
            Formulaire complet
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setTitle('')
              }}
              className="px-4 py-2 text-sm text-white hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg',
                'bg-indigo-500 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'hover:bg-indigo-400 transition-colors'
              )}
            >
              Ajouter
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
