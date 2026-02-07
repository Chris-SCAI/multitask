'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-slate-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Vous êtes hors ligne
        </h1>

        <p className="text-slate-400 mb-8">
          Pas de connexion Internet détectée. Vos tâches sont sauvegardées localement
          et seront synchronisées dès que vous serez reconnecté.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>

          <a
            href="/dashboard"
            className="block w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
          >
            Accéder au dashboard (mode hors ligne)
          </a>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          MultiTasks fonctionne hors ligne grâce au stockage local.
          <br />
          Vos données sont en sécurité.
        </p>
      </div>
    </div>
  )
}
