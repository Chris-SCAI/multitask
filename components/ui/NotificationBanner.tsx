'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { getNotificationPermission, requestNotificationPermission } from '../../lib/notifications'
import { cn } from '../../lib/utils'

interface NotificationBannerProps {
  onPermissionChange?: (granted: boolean) => void
}

export function NotificationBanner({ onPermissionChange }: NotificationBannerProps) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported' | 'loading'>('loading')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setPermission(getNotificationPermission())
    // Vérifier si déjà dismissé
    const wasDismissed = localStorage.getItem('notif_banner_dismissed')
    if (wasDismissed) setDismissed(true)
  }, [])

  const handleEnable = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    onPermissionChange?.(result === 'granted')
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('notif_banner_dismissed', 'true')
  }

  // Ne rien afficher si permission accordée, refusée, non supporté, ou dismissé
  if (permission === 'loading' || permission === 'granted' || permission === 'unsupported' || dismissed) {
    return null
  }

  if (permission === 'denied') {
    return (
      <div className="glass-card p-4 mb-6 border-yellow-500/30 bg-yellow-500/5">
        <div className="flex items-center gap-3">
          <BellOff size={20} className="text-yellow-500" />
          <div className="flex-1">
            <p className="text-sm text-yellow-400">
              Notifications bloquées. Active-les dans les paramètres de ton navigateur pour recevoir les rappels.
            </p>
          </div>
          <button onClick={handleDismiss} className="text-slate-100 hover:text-slate-100">
            <X size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-4 mb-6 border-indigo-500/30 bg-indigo-500/5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/20">
          <Bell size={20} className="text-indigo-300" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-100">
            Active les notifications pour recevoir tes rappels de tâches.
          </p>
        </div>
        <button
          onClick={handleEnable}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition-colors"
        >
          Activer
        </button>
        <button onClick={handleDismiss} className="text-slate-100 hover:text-slate-100">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
