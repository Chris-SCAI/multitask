'use client'

import { useState } from 'react'
import { FileSpreadsheet, FileText, Download, Lock, CheckCircle2, Loader2 } from 'lucide-react'
import { Task, Workspace, Subtask } from '../../lib/types'
import { exportToCSV, exportToPDF, ExportOptions } from '../../lib/export'
import { useFeatureAccess } from '../../hooks/useFeatureAccess'
import { Button } from '../ui/Button'
import { UpgradeModal } from '../ui/UpgradeModal'

interface ExportPanelProps {
  tasks: Task[]
  subtasks: Subtask[]
  workspaces: Workspace[]
}

export function ExportPanel({ tasks, subtasks, workspaces }: ExportPanelProps) {
  const [includeCompleted, setIncludeCompleted] = useState(true)
  const [includeSubtasks, setIncludeSubtasks] = useState(true)
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const featureAccess = useFeatureAccess()
  const isPro = featureAccess.isPro || featureAccess.isTeam

  const options: ExportOptions = {
    includeCompleted,
    includeSubtasks,
    workspaceId: selectedWorkspace
  }

  // Count tasks that will be exported
  const getExportCount = () => {
    let filtered = tasks.filter(t => !t.parentId)
    if (!includeCompleted) {
      filtered = filtered.filter(t => !t.completed)
    }
    if (selectedWorkspace) {
      filtered = filtered.filter(t => t.workspaceId === selectedWorkspace)
    }
    return filtered.length
  }

  const handleExportCSV = async () => {
    if (!isPro) {
      setShowUpgradeModal(true)
      return
    }

    setExporting('csv')
    setError(null)
    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300))
      exportToCSV(tasks, subtasks, workspaces, options)
      setSuccess('CSV exporté avec succès !')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Erreur lors de l\'export CSV')
      setTimeout(() => setError(null), 5000)
    } finally {
      setExporting(null)
    }
  }

  const handleExportPDF = async () => {
    if (!isPro) {
      setShowUpgradeModal(true)
      return
    }

    setExporting('pdf')
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      exportToPDF(tasks, subtasks, workspaces, options)
      setSuccess('PDF exporté avec succès !')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Erreur lors de l\'export PDF')
      setTimeout(() => setError(null), 5000)
    } finally {
      setExporting(null)
    }
  }

  // Non-Pro view
  if (!isPro) {
    return (
      <>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="export"
        />
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 text-center">
            <Lock size={48} className="mx-auto mb-4 text-violet-400" />
            <h3 className="text-lg font-bold text-white mb-2">Export PDF/CSV</h3>
            <p className="text-slate-400 mb-4">
              Exportez vos tâches en PDF ou CSV pour les partager ou les archiver.
            </p>
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <Lock size={16} className="mr-2" />
              Passer à Pro pour débloquer
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          <span>{error}</span>
        </div>
      )}

      {/* Options */}
      <div className="glass-card p-4 space-y-4">
        <h4 className="font-medium text-white">Options d'export</h4>

        {/* Workspace filter */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Workspace</label>
          <select
            value={selectedWorkspace || ''}
            onChange={(e) => setSelectedWorkspace(e.target.value || null)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Tous les workspaces</option>
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>
                {ws.icon} {ws.name}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={includeCompleted}
              onChange={(e) => setIncludeCompleted(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
            />
            <span className="text-slate-300 group-hover:text-white transition-colors">
              Inclure les tâches terminées
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={includeSubtasks}
              onChange={(e) => setIncludeSubtasks(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
            />
            <span className="text-slate-300 group-hover:text-white transition-colors">
              Inclure les sous-tâches
            </span>
          </label>
        </div>

        {/* Preview count */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            <span className="text-white font-medium">{getExportCount()}</span> tâche(s) seront exportées
          </p>
        </div>
      </div>

      {/* Export buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleExportCSV}
          disabled={exporting !== null || getExportCount() === 0}
          className="flex flex-col items-center gap-3 p-6 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-green-500/50 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {exporting === 'csv' ? (
            <Loader2 size={32} className="text-green-400 animate-spin" />
          ) : (
            <FileSpreadsheet size={32} className="text-green-400 group-hover:scale-110 transition-transform" />
          )}
          <div className="text-center">
            <p className="font-medium text-white">Export CSV</p>
            <p className="text-xs text-slate-400">Compatible Excel</p>
          </div>
        </button>

        <button
          onClick={handleExportPDF}
          disabled={exporting !== null || getExportCount() === 0}
          className="flex flex-col items-center gap-3 p-6 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {exporting === 'pdf' ? (
            <Loader2 size={32} className="text-red-400 animate-spin" />
          ) : (
            <FileText size={32} className="text-red-400 group-hover:scale-110 transition-transform" />
          )}
          <div className="text-center">
            <p className="font-medium text-white">Export PDF</p>
            <p className="text-xs text-slate-400">Formaté & imprimable</p>
          </div>
        </button>
      </div>

      {/* Info */}
      <p className="text-xs text-slate-500 text-center">
        Les fichiers seront téléchargés directement sur votre appareil
      </p>
    </div>
  )
}
