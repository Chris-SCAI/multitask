import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDeadline(date: Date): string {
  if (isToday(date)) return "Aujourd'hui"
  if (isTomorrow(date)) return 'Demain'
  if (isThisWeek(date)) return format(date, 'EEEE', { locale: fr })
  return format(date, 'd MMM', { locale: fr })
}

export function isOverdue(date: Date): boolean {
  return isPast(date) && !isToday(date)
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function groupTasksByDate(tasks: { deadline?: Date }[]): Map<string, typeof tasks> {
  const groups = new Map<string, typeof tasks>()
  
  tasks.forEach(task => {
    if (!task.deadline) {
      const key = 'no-date'
      const existing = groups.get(key) || []
      groups.set(key, [...existing, task])
      return
    }
    
    const key = format(task.deadline, 'yyyy-MM-dd')
    const existing = groups.get(key) || []
    groups.set(key, [...existing, task])
  })
  
  return groups
}
