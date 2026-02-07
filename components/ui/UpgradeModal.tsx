'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { AuthModal } from '@/components/auth/AuthModal'
import { Sparkles, Zap, Lock, ArrowRight, FileDown } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: 'workspace' | 'task' | 'ai' | 'export'
  currentLimit?: number
}

const FEATURE_INFO = {
  workspace: {
    icon: Zap,
    title: 'Limite d\'activités atteinte',
    demoMessage: 'Le mode démo est limité à 1 activité.',
    freeMessage: 'Le plan gratuit est limité à 3 activités.',
    upgradeMessage: 'Passe à Pro pour des activités illimitées !',
  },
  task: {
    icon: Lock,
    title: 'Limite de tâches atteinte',
    demoMessage: 'Le mode démo est limité à 5 tâches.',
    freeMessage: 'Le plan gratuit est limité à 60 tâches.',
    upgradeMessage: 'Passe à Pro pour des tâches illimitées !',
  },
  ai: {
    icon: Sparkles,
    title: 'Limite IA atteinte',
    demoMessage: 'L\'assistant IA n\'est pas disponible en mode démo.',
    freeMessage: 'Tu as atteint ta limite de 10 priorisations IA/semaine.',
    upgradeMessage: 'Passe à Pro pour l\'IA illimitée !',
  },
  export: {
    icon: FileDown,
    title: 'Export PDF/CSV',
    demoMessage: 'L\'export n\'est pas disponible en mode démo.',
    freeMessage: 'L\'export PDF/CSV est réservé aux abonnés Pro.',
    upgradeMessage: 'Passe à Pro pour exporter tes tâches !',
  },
}

export function UpgradeModal({ isOpen, onClose, feature, currentLimit }: UpgradeModalProps) {
  const { user } = useAuth()
  const { startCheckout } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const info = FEATURE_INFO[feature]
  const Icon = info.icon
  const isDemo = !user

  const handleUpgrade = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setLoading(true)
    try {
      await startCheckout('pro')
    } catch {
      alert('Erreur lors du checkout. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // After login, try checkout
    handleUpgrade()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={info.title} size="sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-indigo-400" />
          </div>

          <p className="text-slate-300 mb-2">
            {isDemo ? info.demoMessage : info.freeMessage}
          </p>

          {currentLimit !== undefined && (
            <p className="text-sm text-slate-500 mb-4">
              Limite actuelle : {currentLimit}
            </p>
          )}

          <p className="text-white font-medium mb-6">
            {info.upgradeMessage}
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {loading ? (
                'Chargement...'
              ) : isDemo ? (
                <>
                  Créer un compte gratuit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Passer à Pro - 9,90€/mois
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <Button variant="ghost" onClick={onClose} className="w-full">
              Plus tard
            </Button>
          </div>

          {!isDemo && (
            <p className="text-xs text-slate-500 mt-4">
              14 jours d'essai gratuit inclus
            </p>
          )}
        </div>
      </Modal>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}
