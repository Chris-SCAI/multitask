// AI Features - Smart task management

import { callLLM, isLLMConfigured, LLMMessage } from './llm-providers'
import { Task } from './types'

export interface EisenhowerResult {
  quadrant: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important'
  reasoning: string
  suggestedPriority: 'high' | 'medium' | 'low'
  suggestedStars: 1 | 2 | 3
}

export interface TaskSuggestion {
  subtasks?: string[]
  improvedTitle?: string
  estimatedMinutes?: number
  tags?: string[]
}

// Eisenhower Matrix Classification
export async function classifyEisenhower(task: Task): Promise<EisenhowerResult> {
  if (!isLLMConfigured()) {
    throw new Error('IA non configurée. Ajoutez votre clé API dans les paramètres.')
  }

  const prompt = `Tu es un expert en productivité et gestion du temps. Analyse cette tâche selon la matrice d'Eisenhower.

TÂCHE:
- Titre: ${task.title}
${task.description ? `- Description: ${task.description}` : ''}
${task.deadline ? `- Échéance: ${new Date(task.deadline).toLocaleDateString('fr-FR')}` : '- Pas d\'échéance'}
- Priorité actuelle: ${task.priority}

Réponds en JSON avec ce format exact:
{
  "quadrant": "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important",
  "reasoning": "explication courte en français",
  "suggestedPriority": "high" | "medium" | "low",
  "suggestedStars": 1 | 2 | 3
}

Critères:
- URGENT = échéance proche (<3 jours) ou conséquences immédiates si non fait
- IMPORTANT = impact significatif sur objectifs long terme, carrière, santé, relations

Quadrants:
- urgent-important (Q1): Faire immédiatement → high, 3 étoiles
- not-urgent-important (Q2): Planifier → medium, 2 étoiles  
- urgent-not-important (Q3): Déléguer si possible → medium, 1 étoile
- not-urgent-not-important (Q4): Éliminer ou reporter → low, 0 étoiles

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`

  const response = await callLLM([
    { role: 'user', content: prompt }
  ])

  try {
    // Extract JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error parsing Eisenhower response:', error)
    throw new Error('Erreur lors de l\'analyse de la tâche')
  }
}

// Get task suggestions (subtasks, improved title, etc.)
export async function getTaskSuggestions(task: Task): Promise<TaskSuggestion> {
  if (!isLLMConfigured()) {
    throw new Error('IA non configurée. Ajoutez votre clé API dans les paramètres.')
  }

  const prompt = `Tu es un assistant de productivité. Analyse cette tâche et suggère des améliorations.

TÂCHE:
- Titre: ${task.title}
${task.description ? `- Description: ${task.description}` : ''}

Réponds en JSON avec ce format:
{
  "subtasks": ["sous-tâche 1", "sous-tâche 2", ...] (3-5 étapes concrètes pour accomplir la tâche),
  "improvedTitle": "titre amélioré si le titre actuel est vague" (ou null si le titre est déjà clair),
  "estimatedMinutes": nombre (estimation du temps total en minutes),
  "tags": ["tag1", "tag2"] (2-3 tags pertinents pour catégoriser)
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`

  const response = await callLLM([
    { role: 'user', content: prompt }
  ])

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error parsing suggestions response:', error)
    throw new Error('Erreur lors de la génération des suggestions')
  }
}

// Analyze multiple tasks and suggest focus
export async function suggestFocus(tasks: Task[]): Promise<string> {
  if (!isLLMConfigured()) {
    throw new Error('IA non configurée. Ajoutez votre clé API dans les paramètres.')
  }

  const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 10) // Limit to 10 tasks
  
  if (incompleteTasks.length === 0) {
    return "Bravo ! Tu as terminé toutes tes tâches. 🎉"
  }

  const taskList = incompleteTasks.map((t, i) => {
    let info = `${i + 1}. "${t.title}"`
    if (t.deadline) info += ` (échéance: ${new Date(t.deadline).toLocaleDateString('fr-FR')})`
    if (t.priority === 'high') info += ' [URGENT]'
    if (t.stars && t.stars >= 2) info += ` [${'⭐'.repeat(t.stars)}]`
    return info
  }).join('\n')

  const prompt = `Tu es un coach de productivité bienveillant. Voici les tâches en cours:

${taskList}

En 2-3 phrases max, donne un conseil personnalisé et motivant sur quelle tâche attaquer en premier et pourquoi. Sois direct et concret. Utilise le tutoiement.`

  const response = await callLLM([
    { role: 'user', content: prompt }
  ])

  return response.content.trim()
}

// Batch classify multiple tasks
export async function batchClassifyEisenhower(tasks: Task[]): Promise<Map<string, EisenhowerResult>> {
  const results = new Map<string, EisenhowerResult>()
  
  // Process in parallel with limit
  const batchSize = 3
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize)
    const promises = batch.map(async (task) => {
      try {
        const result = await classifyEisenhower(task)
        results.set(task.id, result)
      } catch (error) {
        console.error(`Error classifying task ${task.id}:`, error)
      }
    })
    await Promise.all(promises)
  }
  
  return results
}

// ============================================
// TASK ANALYSIS & OPTIMIZATION
// ============================================

export type AnalysisPeriod = 'today' | 'week' | 'month' | 'all'

export interface TimeBlock {
  taskId: string
  taskTitle: string
  suggestedStart: string // "09:00"
  suggestedEnd: string   // "10:30"
  reason: string
}

export interface TaskGroup {
  name: string
  taskIds: string[]
  reason: string
  suggestedOrder: string[]
}

export interface Conflict {
  type: 'overload' | 'deadline_clash' | 'unrealistic' | 'dependency'
  severity: 'low' | 'medium' | 'high'
  description: string
  affectedTaskIds: string[]
  suggestion: string
}

export interface PriorityChange {
  taskId: string
  taskTitle: string
  currentPriority: string
  suggestedPriority: string
  currentStars: number | undefined
  suggestedStars: number
  reason: string
}

export interface OptimizationSuggestion {
  type: 'delegate' | 'batch' | 'eliminate' | 'reschedule' | 'split' | 'automate'
  description: string
  affectedTaskIds: string[]
  impact: 'low' | 'medium' | 'high'
}

export interface AnalysisResult {
  period: AnalysisPeriod
  analyzedAt: Date
  summary: {
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    highPriorityTasks: number
    estimatedHours: number
    workloadAssessment: 'light' | 'balanced' | 'heavy' | 'overloaded'
  }
  timeBlocking: TimeBlock[]
  taskGroups: TaskGroup[]
  conflicts: Conflict[]
  priorityChanges: PriorityChange[]
  optimizations: OptimizationSuggestion[]
  aiInsights: string
}

export interface Workspace {
  id: string
  name: string
}

// Main analysis function
export async function analyzeAndOptimizeTasks(
  tasks: Task[],
  workspaces: Workspace[],
  period: AnalysisPeriod = 'week'
): Promise<AnalysisResult> {
  if (!isLLMConfigured()) {
    throw new Error('IA non configurée. Ajoutez votre clé API dans les paramètres.')
  }

  const now = new Date()
  const filteredTasks = filterTasksByPeriod(tasks, period)
  const incompleteTasks = filteredTasks.filter(t => !t.completed && !t.parentId)

  if (incompleteTasks.length === 0) {
    return {
      period,
      analyzedAt: now,
      summary: {
        totalTasks: 0,
        completedTasks: filteredTasks.filter(t => t.completed).length,
        overdueTasks: 0,
        highPriorityTasks: 0,
        estimatedHours: 0,
        workloadAssessment: 'light',
      },
      timeBlocking: [],
      taskGroups: [],
      conflicts: [],
      priorityChanges: [],
      optimizations: [],
      aiInsights: "Aucune tâche à analyser pour cette période. Bravo, tu es à jour ! 🎉",
    }
  }

  // Build task context for AI
  const workspaceMap = new Map(workspaces.map(w => [w.id, w.name]))
  const taskContext = incompleteTasks.map((t, i) => {
    const ws = workspaceMap.get(t.workspaceId) || 'Inconnu'
    const deadline = t.deadline ? new Date(t.deadline).toLocaleDateString('fr-FR') : 'Pas de deadline'
    const stars = t.stars ? '⭐'.repeat(t.stars) : ''
    return `${i + 1}. [${ws}] "${t.title}" | Type: ${t.taskType} | Priorité: ${t.priority} ${stars} | Deadline: ${deadline}`
  }).join('\n')

  const prompt = `Tu es un expert en productivité et gestion du temps. Analyse ces tâches et propose des optimisations concrètes.

DATE ACTUELLE: ${now.toLocaleDateString('fr-FR')} (${now.toLocaleDateString('fr-FR', { weekday: 'long' })})
PÉRIODE D'ANALYSE: ${getPeriodLabel(period)}

TÂCHES À ANALYSER (${incompleteTasks.length}):
${taskContext}

Réponds en JSON avec ce format exact:
{
  "summary": {
    "estimatedHours": <nombre total d'heures estimées>,
    "workloadAssessment": "light" | "balanced" | "heavy" | "overloaded"
  },
  "timeBlocking": [
    {
      "taskIndex": <numéro de la tâche>,
      "suggestedStart": "HH:MM",
      "suggestedEnd": "HH:MM", 
      "reason": "pourquoi ce créneau"
    }
  ],
  "taskGroups": [
    {
      "name": "nom du groupe",
      "taskIndices": [<indices des tâches>],
      "reason": "pourquoi regrouper",
      "suggestedOrder": [<indices dans l'ordre optimal>]
    }
  ],
  "conflicts": [
    {
      "type": "overload" | "deadline_clash" | "unrealistic" | "dependency",
      "severity": "low" | "medium" | "high",
      "description": "description du conflit",
      "taskIndices": [<indices concernés>],
      "suggestion": "comment résoudre"
    }
  ],
  "priorityChanges": [
    {
      "taskIndex": <numéro>,
      "currentPriority": "low|medium|high",
      "suggestedPriority": "low|medium|high",
      "suggestedStars": 0|1|2|3,
      "reason": "pourquoi ce changement"
    }
  ],
  "optimizations": [
    {
      "type": "delegate" | "batch" | "eliminate" | "reschedule" | "split" | "automate",
      "description": "action concrète à prendre",
      "taskIndices": [<indices concernés>],
      "impact": "low" | "medium" | "high"
    }
  ],
  "aiInsights": "2-3 phrases de conseil personnalisé et motivant"
}

RÈGLES:
- timeBlocking: propose un planning réaliste (8h-19h, pauses incluses)
- taskGroups: regroupe par contexte similaire (même workspace, même type, même énergie requise)
- conflicts: détecte surcharge, deadlines irréalistes, tâches qui s'entrechoquent
- priorityChanges: suggère uniquement si vraiment justifié
- optimizations: propose des actions concrètes (déléguer, automatiser, découper, reporter)
- aiInsights: sois direct, concret et bienveillant

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`

  const response = await callLLM([{ role: 'user', content: prompt }])

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    const aiResult = JSON.parse(jsonMatch[0])

    // Map indices back to task IDs
    const indexToTask = (idx: number) => incompleteTasks[idx - 1]

    return {
      period,
      analyzedAt: now,
      summary: {
        totalTasks: incompleteTasks.length,
        completedTasks: filteredTasks.filter(t => t.completed).length,
        overdueTasks: incompleteTasks.filter(t => t.deadline && new Date(t.deadline) < now).length,
        highPriorityTasks: incompleteTasks.filter(t => t.priority === 'high').length,
        estimatedHours: aiResult.summary?.estimatedHours || 0,
        workloadAssessment: aiResult.summary?.workloadAssessment || 'balanced',
      },
      timeBlocking: (aiResult.timeBlocking || []).map((tb: any) => {
        const task = indexToTask(tb.taskIndex)
        return task ? {
          taskId: task.id,
          taskTitle: task.title,
          suggestedStart: tb.suggestedStart,
          suggestedEnd: tb.suggestedEnd,
          reason: tb.reason,
        } : null
      }).filter(Boolean),
      taskGroups: (aiResult.taskGroups || []).map((g: any) => ({
        name: g.name,
        taskIds: (g.taskIndices || []).map((i: number) => indexToTask(i)?.id).filter(Boolean),
        reason: g.reason,
        suggestedOrder: (g.suggestedOrder || []).map((i: number) => indexToTask(i)?.id).filter(Boolean),
      })),
      conflicts: (aiResult.conflicts || []).map((c: any) => ({
        type: c.type,
        severity: c.severity,
        description: c.description,
        affectedTaskIds: (c.taskIndices || []).map((i: number) => indexToTask(i)?.id).filter(Boolean),
        suggestion: c.suggestion,
      })),
      priorityChanges: (aiResult.priorityChanges || []).map((pc: any) => {
        const task = indexToTask(pc.taskIndex)
        return task ? {
          taskId: task.id,
          taskTitle: task.title,
          currentPriority: pc.currentPriority,
          suggestedPriority: pc.suggestedPriority,
          currentStars: task.stars,
          suggestedStars: pc.suggestedStars,
          reason: pc.reason,
        } : null
      }).filter(Boolean),
      optimizations: (aiResult.optimizations || []).map((o: any) => ({
        type: o.type,
        description: o.description,
        affectedTaskIds: (o.taskIndices || []).map((i: number) => indexToTask(i)?.id).filter(Boolean),
        impact: o.impact,
      })),
      aiInsights: aiResult.aiInsights || "Analyse terminée.",
    }
  } catch (error) {
    console.error('Error parsing analysis response:', error)
    throw new Error('Erreur lors de l\'analyse des tâches')
  }
}

function filterTasksByPeriod(tasks: Task[], period: AnalysisPeriod): Task[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case 'today':
      return tasks.filter(t => {
        if (!t.deadline) return false
        const deadline = new Date(t.deadline)
        return deadline >= startOfToday && deadline < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
      })
    case 'week':
      const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000)
      return tasks.filter(t => {
        if (!t.deadline) return true // Include tasks without deadline
        const deadline = new Date(t.deadline)
        return deadline < endOfWeek
      })
    case 'month':
      const endOfMonth = new Date(startOfToday.getTime() + 30 * 24 * 60 * 60 * 1000)
      return tasks.filter(t => {
        if (!t.deadline) return true
        const deadline = new Date(t.deadline)
        return deadline < endOfMonth
      })
    case 'all':
    default:
      return tasks
  }
}

function getPeriodLabel(period: AnalysisPeriod): string {
  switch (period) {
    case 'today': return "Aujourd'hui"
    case 'week': return 'Les 7 prochains jours'
    case 'month': return 'Les 30 prochains jours'
    case 'all': return 'Toutes les tâches'
  }
}

// ============================================
// WEEKLY REPORT
// ============================================

export interface WeeklyStats {
  tasksCompleted: number
  tasksCreated: number
  tasksOverdue: number
  completionRate: number
  mostProductiveDay: string
  topWorkspace: string
  averageCompletionTime: number // en jours
}

export interface WeeklyReportResult {
  period: { start: Date; end: Date }
  stats: WeeklyStats
  accomplishments: string[]
  areasToImprove: string[]
  weeklyScore: number // 0-100
  motivation: string
  nextWeekTip: string
}

export async function generateWeeklyReport(
  tasks: Task[],
  workspaces: Workspace[]
): Promise<WeeklyReportResult> {
  if (!isLLMConfigured()) {
    throw new Error('IA non configurée. Ajoutez votre clé API dans les paramètres.')
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const workspaceMap = new Map(workspaces.map(w => [w.id, w.name]))

  // Tâches complétées cette semaine
  const completedThisWeek = tasks.filter(t => {
    if (!t.completed || !t.completedAt) return false
    const completedDate = new Date(t.completedAt)
    return completedDate >= weekAgo && completedDate <= now
  })

  // Tâches créées cette semaine
  const createdThisWeek = tasks.filter(t => {
    const createdDate = new Date(t.createdAt)
    return createdDate >= weekAgo && createdDate <= now
  })

  // Tâches en retard
  const overdueTasks = tasks.filter(t => {
    if (t.completed || !t.deadline) return false
    return new Date(t.deadline) < now
  })

  // Stats par workspace
  const workspaceStats = new Map<string, number>()
  completedThisWeek.forEach(t => {
    const wsName = workspaceMap.get(t.workspaceId) || 'Inconnu'
    workspaceStats.set(wsName, (workspaceStats.get(wsName) || 0) + 1)
  })
  const topWorkspace = Array.from(workspaceStats.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Aucun'

  // Stats par jour
  const dayStats = new Map<string, number>()
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  completedThisWeek.forEach(t => {
    if (!t.completedAt) return
    const dayName = dayNames[new Date(t.completedAt).getDay()]
    dayStats.set(dayName, (dayStats.get(dayName) || 0) + 1)
  })
  const mostProductiveDay = Array.from(dayStats.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Aucun'

  // Calcul du taux de complétion
  const completionRate = createdThisWeek.length > 0 
    ? Math.round((completedThisWeek.length / createdThisWeek.length) * 100)
    : 0

  const stats: WeeklyStats = {
    tasksCompleted: completedThisWeek.length,
    tasksCreated: createdThisWeek.length,
    tasksOverdue: overdueTasks.length,
    completionRate,
    mostProductiveDay,
    topWorkspace,
    averageCompletionTime: 0,
  }

  // Contexte pour l'IA
  const completedList = completedThisWeek.slice(0, 10).map(t => {
    const ws = workspaceMap.get(t.workspaceId) || 'Inconnu'
    return `- [${ws}] ${t.title}`
  }).join('\n')

  const overdueList = overdueTasks.slice(0, 5).map(t => {
    const ws = workspaceMap.get(t.workspaceId) || 'Inconnu'
    return `- [${ws}] ${t.title}`
  }).join('\n')

  const prompt = `Tu es un coach productivité. Génère un rapport hebdomadaire motivant.

STATISTIQUES DE LA SEMAINE:
- Tâches complétées: ${stats.tasksCompleted}
- Tâches créées: ${stats.tasksCreated}
- Taux de complétion: ${stats.completionRate}%
- En retard: ${stats.tasksOverdue}
- Jour le plus productif: ${stats.mostProductiveDay}
- Workspace favori: ${stats.topWorkspace}

TÂCHES COMPLÉTÉES (top 10):
${completedList || 'Aucune'}

TÂCHES EN RETARD:
${overdueList || 'Aucune'}

Réponds en JSON avec ce format:
{
  "weeklyScore": <score de 0 à 100 basé sur la performance>,
  "accomplishments": ["accomplissement 1", "accomplissement 2", "accomplissement 3"],
  "areasToImprove": ["point d'amélioration 1", "point d'amélioration 2"],
  "motivation": "message motivant personnalisé (2 phrases)",
  "nextWeekTip": "conseil actionnable pour la semaine prochaine"
}

RÈGLES:
- weeklyScore: 80+ excellent, 60-80 bien, 40-60 moyen, <40 à améliorer
- accomplishments: 2-3 points positifs concrets
- areasToImprove: 1-2 points constructifs (pas de jugement)
- Sois encourageant et concret

Réponds UNIQUEMENT avec le JSON.`

  const response = await callLLM([{ role: 'user', content: prompt }])

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    const aiResult = JSON.parse(jsonMatch[0])

    return {
      period: { start: weekAgo, end: now },
      stats,
      accomplishments: aiResult.accomplishments || [],
      areasToImprove: aiResult.areasToImprove || [],
      weeklyScore: aiResult.weeklyScore || 50,
      motivation: aiResult.motivation || 'Continue comme ça !',
      nextWeekTip: aiResult.nextWeekTip || 'Planifie ta semaine le dimanche soir.',
    }
  } catch (error) {
    console.error('Error parsing weekly report response:', error)
    throw new Error('Erreur lors de la génération du rapport')
  }
}

// ============================================
// TASK ASSISTANT - Conversational AI
// ============================================

export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export async function askTaskAssistant(
  question: string,
  tasks: Task[],
  workspaces: Workspace[],
  conversationHistory: AssistantMessage[] = []
): Promise<string> {
  if (!isLLMConfigured()) {
    throw new Error('IA non configurée. Ajoutez votre clé API dans les paramètres.')
  }

  const now = new Date()
  const workspaceMap = new Map(workspaces.map(w => [w.id, w.name]))
  
  const incompleteTasks = tasks.filter(t => !t.completed && !t.parentId)
  const completedToday = tasks.filter(t => {
    if (!t.completed || !t.completedAt) return false
    const completedDate = new Date(t.completedAt)
    return completedDate.toDateString() === now.toDateString()
  })

  const overdueTasks = incompleteTasks.filter(t => t.deadline && new Date(t.deadline) < now)
  const todayTasks = incompleteTasks.filter(t => {
    if (!t.deadline) return false
    return new Date(t.deadline).toDateString() === now.toDateString()
  })

  const taskSummary = incompleteTasks.slice(0, 10).map((t, i) => {
    const ws = workspaceMap.get(t.workspaceId) || 'Inconnu'
    const deadline = t.deadline ? new Date(t.deadline).toLocaleDateString('fr-FR') : 'Sans deadline'
    const stars = t.stars ? '⭐'.repeat(t.stars) : ''
    return `${i + 1}. [${ws}] "${t.title}" - ${t.priority} ${stars} - ${deadline}`
  }).join('\n')

  const contextPrompt = `Tu es un assistant productivité bienveillant et efficace. Tu aides l'utilisateur à gérer ses tâches.

CONTEXTE ACTUEL (${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}):
- Tâches en cours: ${incompleteTasks.length}
- En retard: ${overdueTasks.length}
- À faire aujourd'hui: ${todayTasks.length}
- Terminées aujourd'hui: ${completedToday.length}
- Workspaces: ${workspaces.map(w => w.name).join(', ')}

TOP 10 TÂCHES EN COURS:
${taskSummary || 'Aucune tâche'}

RÈGLES:
- Réponds de façon concise (2-4 phrases max)
- Sois direct et actionnable
- Utilise le tutoiement
- Si on te demande de créer/modifier des tâches, explique comment le faire dans l'app
- Tu peux donner des conseils de productivité
- Si la question n'est pas liée aux tâches, réponds poliment que tu es spécialisé dans la gestion de tâches`

  const messages: LLMMessage[] = [
    { role: 'system', content: contextPrompt },
  ]

  // Add conversation history (last 6 messages max)
  const recentHistory = conversationHistory.slice(-6)
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })
  }

  messages.push({ role: 'user', content: question })

  const response = await callLLM(messages)
  return response.content.trim()
}

// ============================================
// DURATION PREDICTION
// ============================================

export interface DurationPrediction {
  estimatedMinutes: number
  confidence: 'low' | 'medium' | 'high'
  breakdown: string
  tips: string[]
}

export async function predictDuration(task: Task, subtasks: string[] = []): Promise<DurationPrediction> {
  if (!isLLMConfigured()) {
    throw new Error('IA non configurée. Ajoutez votre clé API dans les paramètres.')
  }

  const subtaskContext = subtasks.length > 0
    ? `\nSOUS-TÂCHES:\n${subtasks.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    : ''

  const prompt = `Tu es un expert en estimation de temps et productivité. Estime la durée de cette tâche.

TÂCHE:
- Titre: ${task.title}
${task.description ? `- Description: ${task.description}` : ''}
- Type: ${task.taskType}
- Priorité: ${task.priority}
${subtaskContext}

Réponds en JSON avec ce format exact:
{
  "estimatedMinutes": <durée totale en minutes>,
  "confidence": "low" | "medium" | "high",
  "breakdown": "explication courte de l'estimation",
  "tips": ["conseil 1 pour gagner du temps", "conseil 2"]
}

RÈGLES D'ESTIMATION:
- reunion/rdv: inclure préparation (15min) + durée estimée + compte-rendu si nécessaire
- livrable: selon complexité (simple 30-60min, moyen 1-3h, complexe 3h+)
- admin: généralement 15-45min
- Ajoute 20% de marge pour les imprévus
- confidence: high si tâche bien définie, low si vague
- 2 tips max pour optimiser le temps

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`

  const response = await callLLM([{ role: 'user', content: prompt }])

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    const aiResult = JSON.parse(jsonMatch[0])

    return {
      estimatedMinutes: aiResult.estimatedMinutes || 30,
      confidence: aiResult.confidence || 'medium',
      breakdown: aiResult.breakdown || '',
      tips: aiResult.tips || [],
    }
  } catch (error) {
    console.error('Error parsing duration prediction response:', error)
    throw new Error('Erreur lors de l\'estimation')
  }
}

// ============================================
// SUBTASK GENERATION
// ============================================

export interface GeneratedSubtask {
  title: string
  estimatedMinutes: number
  order: number
}

export interface SubtaskGenerationResult {
  subtasks: GeneratedSubtask[]
  totalEstimatedMinutes: number
  tip: string
}

export async function generateSubtasks(
  task: Task,
  existingSubtasks: string[] = []
): Promise<SubtaskGenerationResult> {
  if (!isLLMConfigured()) {
    throw new Error('IA non configurée. Ajoutez votre clé API dans les paramètres.')
  }

  const existingContext = existingSubtasks.length > 0
    ? `\nSOUS-TÂCHES EXISTANTES:\n${existingSubtasks.map((s, i) => `- ${s}`).join('\n')}`
    : ''

  const prompt = `Tu es un expert en gestion de projet. Décompose cette tâche en sous-tâches concrètes et actionnables.

TÂCHE:
- Titre: ${task.title}
${task.description ? `- Description: ${task.description}` : ''}
- Type: ${task.taskType}
${task.deadline ? `- Deadline: ${new Date(task.deadline).toLocaleDateString('fr-FR')}` : ''}
${existingContext}

Réponds en JSON avec ce format exact:
{
  "subtasks": [
    {
      "title": "titre court et actionnable (verbe à l'infinitif)",
      "estimatedMinutes": <durée en minutes>
    }
  ],
  "tip": "conseil pour bien exécuter cette tâche (1 phrase)"
}

RÈGLES:
- Génère 3 à 6 sous-tâches selon la complexité
- Chaque sous-tâche doit être concrète et réalisable en une session
- Commence par un verbe d'action (Rédiger, Envoyer, Préparer, Vérifier, etc.)
- Ordonne logiquement (ce qui doit être fait en premier en haut)
- Si des sous-tâches existent déjà, complète sans dupliquer
- Estime le temps de façon réaliste

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`

  const response = await callLLM([{ role: 'user', content: prompt }])

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    const aiResult = JSON.parse(jsonMatch[0])

    const subtasks: GeneratedSubtask[] = (aiResult.subtasks || []).map((st: any, index: number) => ({
      title: st.title,
      estimatedMinutes: st.estimatedMinutes || 15,
      order: index,
    }))

    return {
      subtasks,
      totalEstimatedMinutes: subtasks.reduce((sum, st) => sum + st.estimatedMinutes, 0),
      tip: aiResult.tip || '',
    }
  } catch (error) {
    console.error('Error parsing subtask generation response:', error)
    throw new Error('Erreur lors de la génération des sous-tâches')
  }
}

// ============================================
// DAILY FOCUS - Top 3 tasks for today
// ============================================

export interface FocusTask {
  taskId: string
  taskTitle: string
  workspaceName: string
  reason: string
  estimatedMinutes: number
  energyLevel: 'high' | 'medium' | 'low'
  bestTimeSlot: string
}

export interface DailyFocusResult {
  date: Date
  greeting: string
  focusTasks: FocusTask[]
  bonusTip: string
  totalEstimatedMinutes: number
}

export async function getDailyFocus(
  tasks: Task[],
  workspaces: Workspace[]
): Promise<DailyFocusResult> {
  if (!isLLMConfigured()) {
    throw new Error('IA non configurée. Ajoutez votre clé API dans les paramètres.')
  }

  const now = new Date()
  const hour = now.getHours()
  const incompleteTasks = tasks.filter(t => !t.completed && !t.parentId)

  if (incompleteTasks.length === 0) {
    return {
      date: now,
      greeting: "Bravo ! Tu n'as aucune tâche en attente. Profite de ta journée ! 🎉",
      focusTasks: [],
      bonusTip: "C'est le moment idéal pour planifier tes prochains objectifs.",
      totalEstimatedMinutes: 0,
    }
  }

  const workspaceMap = new Map(workspaces.map(w => [w.id, w.name]))
  const taskContext = incompleteTasks.slice(0, 15).map((t, i) => {
    const ws = workspaceMap.get(t.workspaceId) || 'Inconnu'
    const deadline = t.deadline ? new Date(t.deadline).toLocaleDateString('fr-FR') : 'Pas de deadline'
    const stars = t.stars ? '⭐'.repeat(t.stars) : ''
    const isOverdue = t.deadline && new Date(t.deadline) < now
    return `${i + 1}. [${ws}] "${t.title}" | Type: ${t.taskType} | Priorité: ${t.priority} ${stars} | Deadline: ${deadline}${isOverdue ? ' ⚠️ EN RETARD' : ''}`
  }).join('\n')

  const timeContext = hour < 12 ? 'matin' : hour < 17 ? 'après-midi' : 'soir'

  const prompt = `Tu es un coach de productivité expert. Sélectionne les 3 tâches les plus importantes à accomplir aujourd'hui.

DATE/HEURE: ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} (${timeContext})

TÂCHES DISPONIBLES (${incompleteTasks.length} total, top 15 affichées):
${taskContext}

Réponds en JSON avec ce format exact:
{
  "greeting": "message d'accueil personnalisé et motivant (1 phrase, tutoiement)",
  "focusTasks": [
    {
      "taskIndex": <numéro de la tâche>,
      "reason": "pourquoi cette tâche maintenant (1 phrase)",
      "estimatedMinutes": <durée estimée en minutes>,
      "energyLevel": "high" | "medium" | "low",
      "bestTimeSlot": "créneau suggéré (ex: '09:00-10:30')"
    }
  ],
  "bonusTip": "conseil bonus pour la journée (1 phrase)"
}

RÈGLES:
- Sélectionne EXACTEMENT 3 tâches (ou moins si pas assez de tâches)
- Priorise: tâches en retard > deadline aujourd'hui > haute priorité/étoiles > impact important
- energyLevel: high = concentration intense, medium = travail standard, low = tâches légères
- bestTimeSlot: adapte au moment de la journée (${timeContext})
- Sois concret, motivant et bienveillant

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`

  const response = await callLLM([{ role: 'user', content: prompt }])

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    const aiResult = JSON.parse(jsonMatch[0])

    const focusTasks: FocusTask[] = (aiResult.focusTasks || []).map((ft: any) => {
      const task = incompleteTasks[ft.taskIndex - 1]
      if (!task) return null
      return {
        taskId: task.id,
        taskTitle: task.title,
        workspaceName: workspaceMap.get(task.workspaceId) || 'Inconnu',
        reason: ft.reason,
        estimatedMinutes: ft.estimatedMinutes || 30,
        energyLevel: ft.energyLevel || 'medium',
        bestTimeSlot: ft.bestTimeSlot || '',
      }
    }).filter(Boolean)

    return {
      date: now,
      greeting: aiResult.greeting || "C'est parti pour une journée productive !",
      focusTasks,
      bonusTip: aiResult.bonusTip || "Une tâche à la fois, tu vas y arriver !",
      totalEstimatedMinutes: focusTasks.reduce((sum: number, t: FocusTask) => sum + t.estimatedMinutes, 0),
    }
  } catch (error) {
    console.error('Error parsing daily focus response:', error)
    throw new Error('Erreur lors de la génération du focus')
  }
}
