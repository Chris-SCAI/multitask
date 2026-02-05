'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Task } from '../lib/types'
import { sendNotification } from '../lib/notifications'

interface UseRemindersOptions {
  tasks: Task[]
  enabled: boolean
}

export function useReminders({ tasks, enabled }: UseRemindersOptions) {
  const notifiedTasksRef = useRef<Set<string>>(new Set())
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  // Garder trace des reminderDate pour détecter les changements
  const lastReminderDatesRef = useRef<Map<string, string>>(new Map())

  // Nettoyer tous les timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current.clear()
  }, [])

  // Programmer un rappel précis pour une tâche
  const scheduleReminder = useCallback((task: Task) => {
    if (!task.reminderDate || task.completed || notifiedTasksRef.current.has(task.id)) {
      return
    }

    const reminderTime = new Date(task.reminderDate).getTime()
    const now = Date.now()
    const delayMs = reminderTime - now

    // Si déjà passé (dans les 2 dernières minutes), notifier immédiatement
    if (delayMs < 0 && delayMs > -120000) {
      console.log(`[Reminders] 🔔 Immediate notification for "${task.title}" (missed by ${Math.abs(delayMs)}ms)`)
      sendNotification(`⏰ Rappel : ${task.title}`, {
        body: task.description || 'Il est temps de s\'en occuper !',
        tag: `reminder-${task.id}`,
        requireInteraction: true,
      })
      notifiedTasksRef.current.add(task.id)
      return
    }

    // Si dans le futur, programmer le timeout précis
    if (delayMs > 0) {
      // Annuler l'ancien timeout si existant
      const existingTimeout = timeoutsRef.current.get(task.id)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      console.log(`[Reminders] ⏱️ Scheduling "${task.title}" in ${Math.round(delayMs/1000)}s (exact time)`)
      
      const timeout = setTimeout(() => {
        console.log(`[Reminders] 🔔 Exact notification for "${task.title}"`)
        sendNotification(`⏰ Rappel : ${task.title}`, {
          body: task.description || 'Il est temps de s\'en occuper !',
          tag: `reminder-${task.id}`,
          requireInteraction: true,
        })
        notifiedTasksRef.current.add(task.id)
        timeoutsRef.current.delete(task.id)
      }, delayMs)

      timeoutsRef.current.set(task.id, timeout)
    }
  }, [])

  // Programmer tous les rappels
  useEffect(() => {
    if (!enabled) {
      clearAllTimeouts()
      return
    }

    console.log(`[Reminders] Scheduling ${tasks.length} tasks...`)
    
    // Programmer chaque tâche avec rappel
    tasks.forEach(task => {
      const currentReminderDate = task.reminderDate ? new Date(task.reminderDate).toISOString() : ''
      const lastReminderDate = lastReminderDatesRef.current.get(task.id) || ''
      
      // Si la date de rappel a changé, réinitialiser le statut de notification
      if (currentReminderDate !== lastReminderDate) {
        console.log(`[Reminders] Date changed for "${task.title}", resetting notification status`)
        notifiedTasksRef.current.delete(task.id)
        // Annuler l'ancien timeout
        const existingTimeout = timeoutsRef.current.get(task.id)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
          timeoutsRef.current.delete(task.id)
        }
      }
      
      // Mettre à jour la date mémorisée
      lastReminderDatesRef.current.set(task.id, currentReminderDate)
      
      // Programmer le rappel
      scheduleReminder(task)
    })

    // Cleanup: supprimer les timeouts pour les tâches qui n'existent plus
    const taskIds = new Set(tasks.map(t => t.id))
    timeoutsRef.current.forEach((timeout, taskId) => {
      if (!taskIds.has(taskId)) {
        clearTimeout(timeout)
        timeoutsRef.current.delete(taskId)
      }
    })
    lastReminderDatesRef.current.forEach((_, taskId) => {
      if (!taskIds.has(taskId)) {
        lastReminderDatesRef.current.delete(taskId)
      }
    })

    return () => {
      clearAllTimeouts()
    }
  }, [tasks, enabled, scheduleReminder, clearAllTimeouts])

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      clearAllTimeouts()
    }
  }, [clearAllTimeouts])
}
