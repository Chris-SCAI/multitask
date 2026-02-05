'use client'

import { useState } from 'react'
import { Target, Clock, Zap, Battery, BatteryLow, Loader2, RefreshCw, Lightbulb } from 'lucide-react'
import { Task, Workspace } from '../../lib/types'
import { getDailyFocus, DailyFocusResult, FocusTask } from '../../lib/ai-features'
import { isLLMConfigured } from '../../lib/llm-providers'

interface DailyFocusProps {
  tasks: Task[]
  workspaces: Workspace[]
  onClickTask?: (taskId: string) => void
}

const ENERGY_CONFIG = {
  high: { icon: Zap, label: 'Haute énergie', color: 'text-rose-300', bg: 'bg-red-500/20' },
  medium: { icon: Battery, label: 'Énergie moyenne', color: 'text-amber-300', bg: 'bg-amber-500/20' },
  low: { icon: BatteryLow, label: 'Basse énergie', color: 'text-emerald-300', bg: 'bg-green-500/20' },
}

export function DailyFocus({ tasks, workspaces, onClickTask }: DailyFocusProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DailyFocusResult | null>(null)

  const handleGetFocus = async () => {
    if (!isLLMConfigured()) {
      setError('IA non configurée. Ajoutez votre clé API dans les paramètres.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const focusResult = await getDailyFocus(tasks, workspaces)
      setResult(focusResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  // Not loaded yet - show button
  if (!result && !isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
              <Target size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Focus du jour</h3>
              <p className="text-sm text-white">Tes 3 priorités pour aujourd'hui</p>
            </div>
          </div>
          <button
            onClick={handleGetFocus}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/25"
          >
            <Target size={18} />
            <span>Générer</span>
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-rose-300 text-sm">
            {error}
          </div>
        )}
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 size={24} className="animate-spin text-emerald-400" />
          <span className="text-white">Analyse de tes tâches...</span>
        </div>
      </div>
    )
  }

  // Show results
  return (
    <div className="glass-card p-6 border-emerald-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
            <Target size={24} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">Focus du jour</h3>
            <p className="text-sm text-white">
              {result?.totalEstimatedMinutes ? `~${Math.round(result.totalEstimatedMinutes / 60 * 10) / 10}h estimées` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleGetFocus}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          title="Rafraîchir"
        >
          <RefreshCw size={18} className="text-white" />
        </button>
      </div>

      {/* Greeting */}
      {result?.greeting && (
        <p className="text-emerald-400 font-medium mb-4">{result.greeting}</p>
      )}

      {/* Focus Tasks */}
      {result?.focusTasks && result.focusTasks.length > 0 ? (
        <div className="space-y-3">
          {result.focusTasks.map((task, index) => (
            <FocusTaskCard
              key={task.taskId}
              task={task}
              index={index + 1}
              onClick={() => onClickTask?.(task.taskId)}
            />
          ))}
        </div>
      ) : (
        <p className="text-white text-center py-4">Aucune tâche à prioriser</p>
      )}

      {/* Bonus Tip */}
      {result?.bonusTip && (
        <div className="mt-4 p-3 bg-slate-800/70 rounded-lg flex items-start gap-2">
          <Lightbulb size={18} className="text-amber-300 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-100">{result.bonusTip}</p>
        </div>
      )}
    </div>
  )
}

function FocusTaskCard({
  task,
  index,
  onClick,
}: {
  task: FocusTask
  index: number
  onClick?: () => void
}) {
  const energyConfig = ENERGY_CONFIG[task.energyLevel]
  const EnergyIcon = energyConfig.icon

  return (
    <div
      onClick={onClick}
      className="p-4 bg-slate-800/70 rounded-xl border border-slate-600 hover:border-emerald-500/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {/* Number badge */}
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-emerald-400 font-bold">{index}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title & Workspace */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-slate-100 group-hover:text-emerald-400 transition-colors">
                {task.taskTitle}
              </h4>
              <p className="text-xs text-slate-100">{task.workspaceName}</p>
            </div>
          </div>

          {/* Reason */}
          <p className="text-sm text-white mt-1">{task.reason}</p>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            {/* Time slot */}
            {task.bestTimeSlot && (
              <div className="flex items-center gap-1 text-white">
                <Clock size={14} />
                <span>{task.bestTimeSlot}</span>
              </div>
            )}

            {/* Duration */}
            <div className="flex items-center gap-1 text-white">
              <span>{task.estimatedMinutes} min</span>
            </div>

            {/* Energy */}
            <div className={`flex items-center gap-1 ${energyConfig.color}`}>
              <EnergyIcon size={14} />
              <span>{energyConfig.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
