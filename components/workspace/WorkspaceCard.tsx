'use client'

import { Workspace } from '../../lib/types'
import { cn } from '../../lib/utils'
import { ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'

interface WorkspaceCardProps {
  workspace: Workspace
  taskCount: number
  completedCount: number
  overdueCount: number
  isSelected?: boolean
  onClick: () => void
}

export function WorkspaceCard({
  workspace,
  taskCount,
  completedCount,
  overdueCount,
  isSelected,
  onClick,
}: WorkspaceCardProps) {
  const pendingCount = taskCount - completedCount
  const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0
  const isAllDone = pendingCount === 0 && taskCount > 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full p-5 rounded-2xl text-left transition-all duration-300',
        'bg-gradient-to-br from-slate-800/80 to-slate-800/40',
        'border border-slate-600/50',
        'hover:border-slate-600 hover:shadow-xl hover:shadow-slate-900/50',
        'hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]',
        isSelected && 'ring-2 ring-offset-2 ring-offset-slate-900',
        overdueCount > 0 && !isSelected && 'border-red-500/30'
      )}
      style={{
        borderColor: isSelected ? workspace.color : undefined,
        boxShadow: isSelected ? `0 0 30px ${workspace.color}20` : undefined,
        ['--ring-color' as any]: workspace.color,
      }}
    >
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${workspace.color}10 0%, transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Icon with glow */}
          <div
            className="relative w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${workspace.color}20` }}
          >
            {workspace.icon}
            {/* Subtle glow */}
            <div 
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: `0 0 20px ${workspace.color}40` }}
            />
          </div>
          
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-white transition-colors">
              {workspace.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {isAllDone ? (
                <span className="flex items-center gap-1.5 text-sm text-emerald-300">
                  <CheckCircle2 size={14} />
                  Tout est fait ! 🎉
                </span>
              ) : (
                <>
                  <span className="text-sm text-white">
                    {pendingCount} tâche{pendingCount !== 1 ? 's' : ''} en cours
                  </span>
                  {overdueCount > 0 && (
                    <span className="flex items-center gap-1 text-sm text-rose-300">
                      <AlertCircle size={12} />
                      {overdueCount} en retard
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="p-2 rounded-xl bg-slate-700/30 group-hover:bg-slate-700/50 transition-all duration-300">
          <ChevronRight
            size={18}
            className="text-slate-100 group-hover:text-white group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>

      {/* Progress bar */}
      {taskCount > 0 && (
        <div className="relative mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-100">{completedCount} terminées</span>
            <span 
              className="font-semibold"
              style={{ color: progress === 100 ? '#22c55e' : workspace.color }}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: progress === 100 ? '#22c55e' : workspace.color,
                boxShadow: `0 0 12px ${progress === 100 ? '#22c55e' : workspace.color}60`,
              }}
            />
          </div>
        </div>
      )}
    </button>
  )
}
