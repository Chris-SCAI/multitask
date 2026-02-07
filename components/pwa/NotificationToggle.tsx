'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer
}

function isNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

export default function NotificationToggle() {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      const isSupported = isNotificationSupported()
      setSupported(isSupported)

      if (isSupported) {
        setPermission(Notification.permission)
        try {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.getSubscription()
          setSubscribed(!!subscription)
        } catch {
          setSubscribed(false)
        }
      }
    }
    checkStatus()
  }, [])

  const handleToggle = async () => {
    if (!supported) return

    setLoading(true)
    try {
      if (subscribed) {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          setSubscribed(false)
        }
      } else {
        // Subscribe
        const perm = await Notification.requestPermission()
        setPermission(perm)

        if (perm === 'granted') {
          // Check if VAPID key is configured
          if (!VAPID_PUBLIC_KEY) {
            console.warn('VAPID key not configured, using local notifications only')
            setSubscribed(true)
            new Notification('Notifications activees !', {
              body: 'Vous recevrez des rappels pour vos taches.',
              icon: '/icon-192.png',
            })
            return
          }

          // Wait for service worker with timeout
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('Service worker timeout')), 5000)
          )

          try {
            const registration = await Promise.race([
              navigator.serviceWorker.ready,
              timeoutPromise
            ]) as ServiceWorkerRegistration

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            })

            if (subscription) {
              setSubscribed(true)
              new Notification('Notifications activees !', {
                body: 'Vous recevrez des rappels pour vos taches.',
                icon: '/icon-192.png',
              })
            }
          } catch (swError) {
            console.warn('Push subscription failed, using local notifications:', swError)
            setSubscribed(true)
            new Notification('Notifications activees !', {
              body: 'Rappels locaux actives.',
              icon: '/icon-192.png',
            })
          }
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) {
    // Debug info for iOS
    const isStandalone = typeof window !== 'undefined' && (
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches
    )
    const hasNotification = typeof window !== 'undefined' && 'Notification' in window
    const hasSW = typeof navigator !== 'undefined' && 'serviceWorker' in navigator
    const hasPush = typeof window !== 'undefined' && 'PushManager' in window

    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl text-slate-500">
        <BellOff className="w-5 h-5" />
        <div>
          <span className="text-sm">Notifications non supportees</span>
          <p className="text-xs opacity-70">
            {!isStandalone && 'Ouvre depuis l\'icone PWA · '}
            {!hasNotification && 'API Notification manquante · '}
            {!hasSW && 'ServiceWorker manquant · '}
            {!hasPush && 'PushManager manquant'}
          </p>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 rounded-xl text-red-400">
        <BellOff className="w-5 h-5" />
        <div>
          <span className="text-sm font-medium">Notifications bloquees</span>
          <p className="text-xs text-red-400/70">
            Autorisez dans les parametres du navigateur
          </p>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
        subscribed
          ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
      } ${loading ? 'opacity-50 cursor-wait' : ''}`}
    >
      {subscribed ? (
        <BellRing className="w-5 h-5" />
      ) : (
        <Bell className="w-5 h-5" />
      )}
      <div className="flex-1 text-left">
        <span className="text-sm font-medium">
          {loading
            ? 'Chargement...'
            : subscribed
            ? 'Notifications activees'
            : 'Activer les notifications'}
        </span>
        {!subscribed && !loading && (
          <p className="text-xs text-slate-500">
            Recevez des rappels pour vos taches
          </p>
        )}
      </div>
      <div
        className={`w-10 h-6 rounded-full transition-colors ${
          subscribed ? 'bg-indigo-500' : 'bg-slate-700'
        }`}
      >
        <div
          className={`w-4 h-4 mt-1 rounded-full bg-white transition-transform ${
            subscribed ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  )
}
