'use client'

import { useState } from 'react'
import { Task } from '../../lib/types'
import { classifyEisenhower, EisenhowerResult } from '../../lib/ai-features'
import { isLLMConfigured } from '../../lib/llm-providers'
import { Button } from '../ui/Button'
import { Brain, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface EisenhowerButtonProps {
  task: Task
  onApply?: (result: EisenhowerResult) => void
}

const QUADRANT_INFO = {
  'urgent-important': {
    label: 'Q1 : Faire maintenant',
    color: 'text-rose-300',
    bgColor: 'bg-red-500/15',
    emoji: '🔥',
    description: 'Urgent ET important — à traiter immédiatement',
  },
  'not-urgent-important': {
    label: 'Q2 : Planifier',
    color: 'text-emerald-300',
    bgColor: 'bg-green-500/15',
    emoji: '🎯',
    description: 'Important mais pas urgent — à programmer',
  },
  'urgent-not-important': {
    label: 'Q3 : Déléguer',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/15',
    emoji: '👋',
    description: 'Urgent mais pas important — déléguer si possible',
  },
  'not-urgent-not-important': {
    label: 'Q4 : Éliminer',
    color: 'text-white',
    bgColor: 'bg-slate-500/15',
    emoji: '🗑️',
    description: 'Ni urgent ni important — à supprimer ou reporter',
  },
}

export function EisenhowerButton({ task, onApply }: EisenhowerButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EisenhowerResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  const isConfigured = isLLMConfigured()

  const handleAnalyze = async () => {
    if (!isConfigured) {
      setError('Configure ton API IA dans Paramètres > IA')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setApplied(false)

    try {
      const analysis = await classifyEisenhower(task)
      setResult(analysis)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (result && onApply) {
      onApply(result)
      setApplied(true)
    }
  }

  if (!isConfigured) {
    return (
      <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-600">
        <div className="flex items-center gap-2 text-white text-sm">
          <Brain size={16} />
          <span>Configure ton API pour l'analyse IA</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Analysis button */}
      {!result && (
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          variant="secondary"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Brain size={16} className="mr-2" />
              Analyser (Eisenhower)
            </>
          )}
        </Button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 text-rose-300 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-xl ${QUADRANT_INFO[result.quadrant].bgColor} space-y-3`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{QUADRANT_INFO[result.quadrant].emoji}</span>
            <div>
              <p className={`font-semibold ${QUADRANT_INFO[result.quadrant].color}`}>
                {QUADRANT_INFO[result.quadrant].label}
              </p>
              <p className="text-xs text-white">
                {QUADRANT_INFO[result.quadrant].description}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-slate-100">
            {result.reasoning}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-white">
            <span>Priorité suggérée: <strong className="text-white">{result.suggestedPriority}</strong></span>
            <span>Étoiles: <strong className="text-amber-300">{'⭐'.repeat(result.suggestedStars)}</strong></span>
          </div>

          {onApply && (
            <Button
              onClick={handleApply}
              disabled={applied}
              size="sm"
              className={applied ? '!bg-green-600 !border-green-600' : ''}
            >
              {applied ? (
                <>
                  <CheckCircle2 size={14} className="mr-1" />
                  Appliqué !
                </>
              ) : (
                'Appliquer les suggestions'
              )}
            </Button>
          )}
        </div>
      )}

      {/* New analysis */}
      {result && (
        <button
          onClick={() => {
            setResult(null)
            setApplied(false)
          }}
          className="text-xs text-slate-100 hover:text-slate-100 transition-colors"
        >
          Refaire l'analyse
        </button>
      )}
    </div>
  )
}
