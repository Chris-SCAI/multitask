// VAPID public key (safe to expose in client)
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

// Convert VAPID key to ArrayBuffer for subscription
export function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer
}

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported')
  }
  return await Notification.requestPermission()
}

// Subscribe to push notifications
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isNotificationSupported()) return null

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') return null

  const registration = await navigator.serviceWorker.ready

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }

  localStorage.setItem('pushSubscription', JSON.stringify(subscription))
  return subscription
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isNotificationSupported()) return false

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    await subscription.unsubscribe()
    localStorage.removeItem('pushSubscription')
    return true
  }
  return false
}

// Check if user is subscribed
export async function isSubscribed(): Promise<boolean> {
  if (!isNotificationSupported()) return false
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  return !!subscription
}

// Send a local notification
export function sendLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!isNotificationSupported()) return
  if (Notification.permission !== 'granted') return

  new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    ...options,
  })
}

// Alias for backward compatibility
export const sendNotification = sendLocalNotification

// Schedule a notification for a task deadline
export function scheduleTaskReminder(
  taskTitle: string,
  deadline: Date,
  minutesBefore: number = 30
): void {
  const reminderTime = new Date(deadline.getTime() - minutesBefore * 60 * 1000)
  const now = new Date()

  if (reminderTime <= now) return

  const delay = reminderTime.getTime() - now.getTime()

  setTimeout(() => {
    sendLocalNotification(`Rappel: ${taskTitle}`, {
      body: `Cette tache est due dans ${minutesBefore} minutes`,
      tag: `task-${taskTitle}`,
      requireInteraction: true,
    })
  }, delay)
}
