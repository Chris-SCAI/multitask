'use client'

import { useState } from 'react'
import { BarChart3, Trophy, AlertTriangle, TrendingUp, Calendar, Loader2, X, RefreshCw, Lightbulb, CheckCircle2, Lock } from 'lucide-react'
import { Task, Workspace } from '../../lib/types'
import { generateWeeklyReport, WeeklyReportResult } from '../../lib/ai-features'
import { isLLMConfigured } from '../../lib/llm-providers'
import { useFeatureAccess } from '../../hooks/useFeatureAccess'
import { UpgradeModal } from '../ui/UpgradeModal'

interface WeeklyReportProps {
  tasks: Task[]
  workspaces: Workspace[]
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-300'
  if (score >= 60) return 'text-sky-300'
  if (score >= 40) return 'text-amber-300'
  return 'text-rose-300'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent !'
  if (score >= 60) return 'Bien joué'
  if (score >= 40) return 'Peut mieux faire'
  return 'Semaine difficile'
}

export function WeeklyReport({ tasks, workspaces }: WeeklyReportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<WeeklyReportResult | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const featureAccess = useFeatureAccess()
  const aiEnabled = featureAccess.canUseAI()

  const handleGenerate = async () => {
    if (!aiEnabled) {
      setShowUpgradeModal(true)
      return
    }
    if (!isLLMConfigured()) {
      setError('IA non configurée. Ajoutez votre clé API dans les paramètres.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await generateWeeklyReport(tasks, workspaces)
      setReport(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature="ai" />
      <button
        onClick={() => {
          if (!aiEnabled) {
            setShowUpgradeModal(true)
            return
          }
          setIsOpen(true)
          if (!report) handleGenerate()
        }}
        className={`flex items-center gap-2 px-4 py-2 ${
          aiEnabled
            ? 'bg-slate-800 hover:bg-slate-700'
            : 'bg-slate-700 hover:bg-slate-600'
        } text-slate-100 rounded-xl font-medium transition-all border border-slate-600`}
      >
        {aiEnabled ? <BarChart3 size={18} className="text-sky-300" /> : <Lock size={18} className="text-violet-400" />}
        <span>{aiEnabled ? 'Rapport hebdo' : 'Pro'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-600 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <BarChart3 size={24} className="text-sky-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Rapport Hebdomadaire</h2>
                  {report && (
                    <p className="text-sm text-white">
                      {report.period.start.toLocaleDateString('fr-FR')} - {report.period.end.toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw size={18} className={`text-white ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading && !report && (
                <div className="flex items-center justify-center gap-3 py-12">
                  <Loader2 size={24} className="animate-spin text-sky-300" />
                  <span className="text-white">Génération du rapport...</span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-rose-300">
                  {error}
                </div>
              )}

              {report && (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="text-center py-4">
                    <div className={`text-6xl font-bold ${getScoreColor(report.weeklyScore)}`}>
                      {report.weeklyScore}
                    </div>
                    <p className={`text-lg font-medium mt-2 ${getScoreColor(report.weeklyScore)}`}>
                      {getScoreLabel(report.weeklyScore)}
                    </p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      icon={<CheckCircle2 size={18} className="text-emerald-300" />}
                      label="Complétées"
                      value={report.stats.tasksCompleted}
                    />
                    <StatCard
                      icon={<Calendar size={18} className="text-sky-300" />}
                      label="Créées"
                      value={report.stats.tasksCreated}
                    />
                    <StatCard
                      icon={<TrendingUp size={18} className="text-violet-300" />}
                      label="Taux"
                      value={`${report.stats.completionRate}%`}
                    />
                    <StatCard
                      icon={<AlertTriangle size={18} className="text-rose-300" />}
                      label="En retard"
                      value={report.stats.tasksOverdue}
                      highlight={report.stats.tasksOverdue > 0}
                    />
                  </div>

                  {/* Best day & workspace */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/70 rounded-xl">
                      <p className="text-xs text-slate-100 uppercase tracking-wide">Jour le plus productif</p>
                      <p className="text-lg font-bold text-white mt-1">{report.stats.mostProductiveDay}</p>
                    </div>
                    <div className="p-4 bg-slate-800/70 rounded-xl">
                      <p className="text-xs text-slate-100 uppercase tracking-wide">Workspace favori</p>
                      <p className="text-lg font-bold text-white mt-1">{report.stats.topWorkspace}</p>
                    </div>
                  </div>

                  {/* Accomplishments */}
                  {report.accomplishments.length > 0 && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy size={18} className="text-emerald-300" />
                        <h3 className="font-medium text-emerald-300">Accomplissements</h3>
                      </div>
                      <ul className="space-y-2">
                        {report.accomplishments.map((a, i) => (
                          <li key={i} className="text-sm text-slate-100 flex items-start gap-2">
                            <span className="text-emerald-300">✓</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas to improve */}
                  {report.areasToImprove.length > 0 && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={18} className="text-amber-300" />
                        <h3 className="font-medium text-amber-300">Axes d'amélioration</h3>
                      </div>
                      <ul className="space-y-2">
                        {report.areasToImprove.map((a, i) => (
                          <li key={i} className="text-sm text-slate-100 flex items-start gap-2">
                            <span className="text-amber-300">→</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Motivation */}
                  <div className="p-4 bg-slate-800/70 rounded-xl">
                    <p className="text-slate-100 italic">"{report.motivation}"</p>
                  </div>

                  {/* Next week tip */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Lightbulb size={18} className="text-sky-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-sky-300 uppercase tracking-wide mb-1">Conseil pour la semaine prochaine</p>
                        <p className="text-sm text-slate-100">{report.nextWeekTip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className={`p-4 rounded-xl ${highlight ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-800/70'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-100 uppercase">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-rose-300' : 'text-slate-100'}`}>
        {value}
      </p>
    </div>
  )
}
