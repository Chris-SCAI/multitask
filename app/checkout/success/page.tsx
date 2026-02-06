'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/dashboard'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Bienvenue dans la team Pro !
          </h1>

          <p className="text-slate-400 mb-6">
            Ton abonnement est maintenant actif. Profite de toutes les fonctionnalites premium !
          </p>

          {/* Features unlocked */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Debloques :</span>
            </div>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                IA Eisenhower pour prioriser tes taches
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Estimation de duree automatique
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Synchronisation cloud illimitee
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Espaces de travail illimites
              </li>
            </ul>
          </div>

          {/* Redirect notice */}
          <p className="text-slate-500 text-sm mb-4">
            Redirection dans {countdown} secondes...
          </p>

          {/* CTA Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            Acceder au dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
