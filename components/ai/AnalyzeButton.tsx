'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Clock, Users, AlertTriangle, ArrowUp, Lightbulb, ChevronDown, ChevronUp, X, Loader2, Download, Copy, Check, History, Filter, Lock } from 'lucide-react'
import { Task, Workspace, TaskType, TASK_TYPE_CONFIG } from '../../lib/types'
import { analyzeAndOptimizeTasks, AnalysisResult, AnalysisPeriod } from '../../lib/ai-features'
import { isLLMConfigured } from '../../lib/llm-providers'
import { useFeatureAccess } from '../../hooks/useFeatureAccess'
import { UpgradeModal } from '../ui/UpgradeModal'

interface AnalyzeButtonProps {
  tasks: Task[]
  workspaces: Workspace[]
  onApplyPriorityChange?: (taskId: string, priority: 'low' | 'medium' | 'high', stars?: number) => void
}

const PERIOD_OPTIONS: { value: AnalysisPeriod; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'all', label: 'Tout' },
]

const WORKLOAD_CONFIG = {
  light: { label: 'Léger', color: 'text-emerald-300', bg: 'bg-emerald-500/30' },
  balanced: { label: 'Équilibré', color: 'text-sky-300', bg: 'bg-sky-500/30' },
  heavy: { label: 'Chargé', color: 'text-amber-300', bg: 'bg-amber-500/30' },
  overloaded: { label: 'Surchargé', color: 'text-rose-300', bg: 'bg-rose-500/30' },
}

const OPTIMIZATION_ICONS: Record<string, string> = {
  delegate: '👥',
  batch: '📦',
  eliminate: '🗑️',
  reschedule: '📅',
  split: '✂️',
  automate: '🤖',
}

const CONFLICT_ICONS: Record<string, string> = {
  overload: '⚠️',
  deadline_clash: '💥',
  unrealistic: '🎯',
  dependency: '🔗',
}

interface AnalysisHistoryItem {
  id: string
  date: Date
  period: AnalysisPeriod
  result: AnalysisResult
  filters: { workspaceIds: string[]; taskTypes: TaskType[] }
}

const HISTORY_KEY = 'multitask_analysis_history'

function loadHistory(): AnalysisHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return parsed.map((item: any) => ({
      ...item,
      date: new Date(item.date),
      result: { ...item.result, analyzedAt: new Date(item.result.analyzedAt) }
    }))
  } catch {
    return []
  }
}

function saveHistory(history: AnalysisHistoryItem[]) {
  if (typeof window === 'undefined') return
  // Keep only last 10 analyses
  const toSave = history.slice(-10)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(toSave))
}

export function AnalyzeButton({ tasks, workspaces, onApplyPriorityChange }: AnalyzeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<AnalysisPeriod>('week')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'insights']))
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([])
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<TaskType[]>([])

  // History
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Export
  const [copied, setCopied] = useState(false)

  // Feature access
  const featureAccess = useFeatureAccess()
  const aiEnabled = featureAccess.canUseAI()

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const toggleWorkspace = (id: string) => {
    setSelectedWorkspaces(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  const toggleTaskType = (type: TaskType) => {
    setSelectedTaskTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const getFilteredTasks = () => {
    let filtered = tasks
    if (selectedWorkspaces.length > 0) {
      filtered = filtered.filter(t => selectedWorkspaces.includes(t.workspaceId))
    }
    if (selectedTaskTypes.length > 0) {
      filtered = filtered.filter(t => selectedTaskTypes.includes(t.taskType))
    }
    return filtered
  }

  const handleAnalyze = async () => {
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
    setResult(null)
    setShowHistory(false)

    try {
      const filteredTasks = getFilteredTasks()
      const analysisResult = await analyzeAndOptimizeTasks(filteredTasks, workspaces, selectedPeriod)
      setResult(analysisResult)
      setExpandedSections(new Set(['summary', 'insights', 'conflicts']))
      
      // Save to history
      const historyItem: AnalysisHistoryItem = {
        id: crypto.randomUUID(),
        date: new Date(),
        period: selectedPeriod,
        result: analysisResult,
        filters: { workspaceIds: selectedWorkspaces, taskTypes: selectedTaskTypes }
      }
      const newHistory = [...history, historyItem]
      setHistory(newHistory)
      saveHistory(newHistory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyPriority = (taskId: string, priority: 'low' | 'medium' | 'high', stars?: number) => {
    if (onApplyPriorityChange) {
      onApplyPriorityChange(taskId, priority, stars)
    }
  }

  const handleLoadHistory = (item: AnalysisHistoryItem) => {
    setResult(item.result)
    setSelectedPeriod(item.period)
    setSelectedWorkspaces(item.filters.workspaceIds)
    setSelectedTaskTypes(item.filters.taskTypes)
    setShowHistory(false)
    setExpandedSections(new Set(['summary', 'insights', 'conflicts']))
  }

  const handleExportJson = () => {
    if (!result) return
    const dataStr = JSON.stringify(result, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analyse-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyText = async () => {
    if (!result) return
    
    const text = `📊 ANALYSE DES TÂCHES - ${new Date().toLocaleDateString('fr-FR')}

📈 RÉSUMÉ
• Tâches: ${result.summary.totalTasks}
• En retard: ${result.summary.overdueTasks}
• Prioritaires: ${result.summary.highPriorityTasks}
• Charge: ${WORKLOAD_CONFIG[result.summary.workloadAssessment].label}

💡 CONSEILS IA
${result.aiInsights}

${result.conflicts.length > 0 ? `⚠️ CONFLITS (${result.conflicts.length})
${result.conflicts.map(c => `• ${c.description}`).join('\n')}` : ''}

${result.optimizations.length > 0 ? `✨ OPTIMISATIONS
${result.optimizations.map(o => `• ${o.description}`).join('\n')}` : ''}`

    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeFiltersCount = selectedWorkspaces.length + selectedTaskTypes.length

  return (
    <>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature="ai" />
      <button
        onClick={() => aiEnabled ? setIsOpen(true) : setShowUpgradeModal(true)}
        className={`flex items-center gap-2 px-4 py-2 ${
          aiEnabled
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 hover:shadow-purple-500/40'
            : 'bg-slate-700 hover:bg-slate-600 shadow-slate-900/30'
        } text-white rounded-xl font-medium transition-all shadow-lg`}
      >
        {aiEnabled ? <Sparkles size={18} /> : <Lock size={18} />}
        <span>{aiEnabled ? 'Analyser & Optimiser' : 'Analyser'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-600 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                  <Sparkles size={24} className="text-violet-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Analyse & Optimisation IA</h2>
                  <p className="text-sm text-white">Optimise ta productivité</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* History button */}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-purple-500/20 text-violet-300' : 'hover:bg-slate-800 text-white'}`}
                  title="Historique"
                >
                  <History size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* History panel */}
            {showHistory && (
              <div className="p-4 border-b border-slate-600 bg-slate-800/70">
                <h3 className="text-sm font-medium text-white mb-3">Analyses précédentes</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-white">Aucun historique</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {history.slice().reverse().map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleLoadHistory(item)}
                        className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white">
                            {item.date.toLocaleDateString('fr-FR')} {item.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs text-white">{PERIOD_OPTIONS.find(p => p.value === item.period)?.label}</span>
                        </div>
                        <p className="text-xs text-white mt-1">
                          {item.result.summary.totalTasks} tâches • Score: {WORKLOAD_CONFIG[item.result.summary.workloadAssessment].label}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Filters & Period */}
            <div className="p-4 border-b border-slate-600 space-y-3">
              {/* Period selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-white">Période :</span>
                <div className="flex gap-2">
                  {PERIOD_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedPeriod(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedPeriod === opt.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter toggle */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 text-sm ${showFilters ? 'text-violet-300' : 'text-white'} hover:text-white`}
                >
                  <Filter size={16} />
                  <span>Filtres</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-violet-300 rounded-full text-xs">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Analyse...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Lancer l'analyse</span>
                    </>
                  )}
                </button>
              </div>

              {/* Filters panel */}
              {showFilters && (
                <div className="p-3 bg-slate-800/70 rounded-lg space-y-3">
                  {/* Workspaces */}
                  <div>
                    <p className="text-xs text-white mb-2">Workspaces</p>
                    <div className="flex flex-wrap gap-2">
                      {workspaces.map(ws => (
                        <button
                          key={ws.id}
                          onClick={() => toggleWorkspace(ws.id)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            selectedWorkspaces.includes(ws.id)
                              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                              : 'bg-slate-700 text-white hover:bg-slate-600'
                          }`}
                        >
                          {ws.icon} {ws.name}
                        </button>
                      ))}
                      {selectedWorkspaces.length > 0 && (
                        <button
                          onClick={() => setSelectedWorkspaces([])}
                          className="px-2 py-1 text-xs text-white hover:text-white"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Task types */}
                  <div>
                    <p className="text-xs text-white mb-2">Types de tâches</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(TASK_TYPE_CONFIG) as TaskType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => toggleTaskType(type)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            selectedTaskTypes.includes(type)
                              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                              : 'bg-slate-700 text-white hover:bg-slate-600'
                          }`}
                        >
                          {TASK_TYPE_CONFIG[type].icon} {TASK_TYPE_CONFIG[type].label}
                        </button>
                      ))}
                      {selectedTaskTypes.length > 0 && (
                        <button
                          onClick={() => setSelectedTaskTypes([])}
                          className="px-2 py-1 text-xs text-white hover:text-white"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-rose-300">
                  {error}
                </div>
              )}

              {!result && !isLoading && !error && (
                <div className="text-center py-12 text-white">
                  <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Sélectionne une période et lance l'analyse</p>
                  <p className="text-sm mt-2">L'IA va examiner tes tâches et proposer des optimisations</p>
                </div>
              )}

              {result && (
                <>
                  {/* Export buttons */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCopyText}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                      {copied ? 'Copié !' : 'Copier'}
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      <Download size={14} />
                      JSON
                    </button>
                  </div>

                  {/* Summary */}
                  <Section
                    title="Résumé"
                    icon={<Clock size={18} />}
                    expanded={expandedSections.has('summary')}
                    onToggle={() => toggleSection('summary')}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Tâches" value={result.summary.totalTasks} />
                      <StatCard label="En retard" value={result.summary.overdueTasks} highlight={result.summary.overdueTasks > 0 ? 'red' : undefined} />
                      <StatCard label="Prioritaires" value={result.summary.highPriorityTasks} />
                      <StatCard label="Heures estimées" value={`${result.summary.estimatedHours}h`} />
                    </div>
                    <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${WORKLOAD_CONFIG[result.summary.workloadAssessment].bg}`}>
                      <span className={`text-sm font-medium ${WORKLOAD_CONFIG[result.summary.workloadAssessment].color}`}>
                        Charge : {WORKLOAD_CONFIG[result.summary.workloadAssessment].label}
                      </span>
                    </div>
                  </Section>

                  {/* AI Insights */}
                  <Section
                    title="Conseils IA"
                    icon={<Lightbulb size={18} />}
                    expanded={expandedSections.has('insights')}
                    onToggle={() => toggleSection('insights')}
                    accent="purple"
                  >
                    <p className="text-white leading-relaxed">{result.aiInsights}</p>
                  </Section>

                  {/* Conflicts */}
                  {result.conflicts.length > 0 && (
                    <Section
                      title={`Conflits détectés (${result.conflicts.length})`}
                      icon={<AlertTriangle size={18} />}
                      expanded={expandedSections.has('conflicts')}
                      onToggle={() => toggleSection('conflicts')}
                      accent="red"
                    >
                      <div className="space-y-3">
                        {result.conflicts.map((conflict, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border ${
                              conflict.severity === 'high'
                                ? 'bg-red-500/10 border-red-500/30'
                                : conflict.severity === 'medium'
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-slate-800 border-slate-600'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span>{CONFLICT_ICONS[conflict.type] || '⚠️'}</span>
                              <div>
                                <p className="text-white font-medium">{conflict.description}</p>
                                <p className="text-sm text-white mt-1">💡 {conflict.suggestion}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Time Blocking */}
                  {result.timeBlocking.length > 0 && (
                    <Section
                      title={`Planning suggéré (${result.timeBlocking.length})`}
                      icon={<Clock size={18} />}
                      expanded={expandedSections.has('timeBlocking')}
                      onToggle={() => toggleSection('timeBlocking')}
                    >
                      <div className="space-y-2">
                        {result.timeBlocking.map((block, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-center min-w-[80px]">
                              <span className="text-indigo-300 font-mono font-bold">{block.suggestedStart}</span>
                              <span className="text-white mx-1">→</span>
                              <span className="text-indigo-300 font-mono font-bold">{block.suggestedEnd}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{block.taskTitle}</p>
                              <p className="text-sm text-white">{block.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Task Groups */}
                  {result.taskGroups.length > 0 && (
                    <Section
                      title={`Regroupements suggérés (${result.taskGroups.length})`}
                      icon={<Users size={18} />}
                      expanded={expandedSections.has('taskGroups')}
                      onToggle={() => toggleSection('taskGroups')}
                    >
                      <div className="space-y-3">
                        {result.taskGroups.map((group, i) => (
                          <div key={i} className="p-3 bg-slate-800 rounded-lg">
                            <p className="text-white font-medium">{group.name}</p>
                            <p className="text-sm text-white mt-1">{group.reason}</p>
                            <p className="text-xs text-white mt-2">{group.taskIds.length} tâche{group.taskIds.length > 1 ? 's' : ''}</p>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Priority Changes */}
                  {result.priorityChanges.length > 0 && (
                    <Section
                      title={`Changements de priorité (${result.priorityChanges.length})`}
                      icon={<ArrowUp size={18} />}
                      expanded={expandedSections.has('priorityChanges')}
                      onToggle={() => toggleSection('priorityChanges')}
                      accent="amber"
                    >
                      <div className="space-y-3">
                        {result.priorityChanges.map((change, i) => (
                          <div key={i} className="p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-white font-medium">{change.taskTitle}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                  <span className="text-white">{change.currentPriority}</span>
                                  <span className="text-white">→</span>
                                  <span className="text-indigo-300 font-medium">{change.suggestedPriority}</span>
                                  {change.suggestedStars > 0 && <span className="text-amber-300">{'⭐'.repeat(change.suggestedStars)}</span>}
                                </div>
                                <p className="text-sm text-white mt-1">{change.reason}</p>
                              </div>
                              {onApplyPriorityChange && (
                                <button
                                  onClick={() => handleApplyPriority(change.taskId, change.suggestedPriority as 'low' | 'medium' | 'high', change.suggestedStars)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
                                >
                                  Appliquer
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Optimizations */}
                  {result.optimizations.length > 0 && (
                    <Section
                      title={`Optimisations suggérées (${result.optimizations.length})`}
                      icon={<Sparkles size={18} />}
                      expanded={expandedSections.has('optimizations')}
                      onToggle={() => toggleSection('optimizations')}
                      accent="green"
                    >
                      <div className="space-y-3">
                        {result.optimizations.map((opt, i) => (
                          <div key={i} className="p-3 bg-slate-800 rounded-lg flex items-start gap-3">
                            <span className="text-2xl">{OPTIMIZATION_ICONS[opt.type] || '✨'}</span>
                            <div>
                              <p className="text-white">{opt.description}</p>
                              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                                opt.impact === 'high' ? 'bg-green-500/20 text-emerald-300' : opt.impact === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-white'
                              }`}>
                                Impact {opt.impact === 'high' ? 'élevé' : opt.impact === 'medium' ? 'moyen' : 'faible'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Section({ title, icon, expanded, onToggle, accent, children }: { title: string; icon: React.ReactNode; expanded: boolean; onToggle: () => void; accent?: 'purple' | 'red' | 'amber' | 'green'; children: React.ReactNode }) {
  const accentColors = { purple: 'border-violet-400/40', red: 'border-rose-400/40', amber: 'border-amber-400/40', green: 'border-emerald-400/40' }
  return (
    <div className={`bg-slate-800/70 rounded-xl border-2 ${accent ? accentColors[accent] : 'border-slate-600'}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <span className="text-white">{icon}</span>
          <span className="font-semibold text-white">{title}</span>
        </div>
        {expanded ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-white" />}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: 'red' | 'green' }) {
  return (
    <div className="bg-slate-700/80 rounded-lg p-3 text-center border border-slate-600">
      <p className={`text-2xl font-bold ${highlight === 'red' ? 'text-rose-300' : highlight === 'green' ? 'text-emerald-300' : 'text-white'}`}>{value}</p>
      <p className="text-xs text-white mt-1 font-medium">{label}</p>
    </div>
  )
}
