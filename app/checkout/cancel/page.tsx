'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
          {/* Cancel Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-slate-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Paiement annule
          </h1>

          <p className="text-slate-400 mb-6">
            Pas de souci ! Tu peux continuer a utiliser MultiTask gratuitement
            ou reessayer plus tard.
          </p>

          {/* Options */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour au dashboard
            </Link>

            <Link
              href="/#pricing"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all"
            >
              Revoir les offres
            </Link>
          </div>

          {/* Help */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-slate-500 text-sm mb-3">
              Une question ? Un probleme ?
            </p>
            <a
              href="mailto:support@multitasks.fr"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Contacter le support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
