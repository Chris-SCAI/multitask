'use client'

import { useState } from 'react'
import { Clock, Loader2, TrendingUp, Lightbulb } from 'lucide-react'
import { Task } from '../../lib/types'
import { predictDuration, DurationPrediction } from '../../lib/ai-features'
import { isLLMConfigured } from '../../lib/llm-providers'

interface DurationPredictorProps {
  task: Task
  subtasks?: string[]
  onApply?: (minutes: number) => void
}

const CONFIDENCE_CONFIG = {
  high: { label: 'Haute', color: 'text-emerald-300', bg: 'bg-green-500/20' },
  medium: { label: 'Moyenne', color: 'text-amber-300', bg: 'bg-amber-500/20' },
  low: { label: 'Faible', color: 'text-rose-300', bg: 'bg-red-500/20' },
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h${mins}`
}

export function DurationPredictor({ task, subtasks = [], onApply }: DurationPredictorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<DurationPrediction | null>(null)

  const handlePredict = async () => {
    if (!isLLMConfigured()) {
      setError('IA non configurée')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await predictDuration(task, subtasks)
      setPrediction(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }

  if (!prediction) {
    return (
      <button
        onClick={handlePredict}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-100 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Estimation...</span>
          </>
        ) : (
          <>
            <Clock size={16} className="text-cyan-300" />
            <span>Estimer la durée</span>
          </>
        )}
      </button>
    )
  }

  const confidenceConfig = CONFIDENCE_CONFIG[prediction.confidence]

  return (
    <div className="p-4 bg-slate-800/70 rounded-xl border border-cyan-500/20 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-cyan-300" />
          <span className="font-medium text-white">Estimation de durée</span>
        </div>
        <button
          onClick={handlePredict}
          className="text-xs text-slate-100 hover:text-slate-100"
        >
          Recalculer
        </button>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold text-cyan-300">
          {formatDuration(prediction.estimatedMinutes)}
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${confidenceConfig.bg} ${confidenceConfig.color}`}>
          Confiance {confidenceConfig.label.toLowerCase()}
        </div>
      </div>

      {/* Breakdown */}
      {prediction.breakdown && (
        <p className="text-sm text-white">{prediction.breakdown}</p>
      )}

      {/* Tips */}
      {prediction.tips.length > 0 && (
        <div className="space-y-1">
          {prediction.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Lightbulb size={14} className="text-amber-300 mt-0.5 flex-shrink-0" />
              <span className="text-slate-100">{tip}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-300">{error}</p>
      )}
    </div>
  )
}
