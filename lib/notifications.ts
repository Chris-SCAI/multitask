// Système de notifications push

// Jouer un son de notification (triple bip x 3)
export function playNotificationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    const playBeep = (time: number, frequency: number) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, time)
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2)
      
      oscillator.start(time)
      oscillator.stop(time + 0.2)
    }
    
    const playTripleBip = (startTime: number) => {
      playBeep(startTime, 880)        // La5
      playBeep(startTime + 0.12, 1100) // Do#6
      playBeep(startTime + 0.24, 1320) // Mi6
    }
    
    const now = audioContext.currentTime
    // Triple bip x 3 avec pause entre chaque
    playTripleBip(now)
    playTripleBip(now + 0.6)
    playTripleBip(now + 1.2)
    
  } catch (error) {
    console.log('[Notifications] Could not play sound:', error)
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Ce navigateur ne supporte pas les notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export function sendNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    // Jouer le son d'alerte
    playNotificationSound()
    
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    // Auto-close après 10 secondes
    setTimeout(() => notification.close(), 10000)
  }
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}
