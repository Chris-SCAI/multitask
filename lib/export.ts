import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Task, Workspace, Subtask, PRIORITY_CONFIG, TASK_TYPE_CONFIG } from './types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface ExportOptions {
  includeCompleted: boolean
  includeSubtasks: boolean
  workspaceId: string | null // null = tous les workspaces
}

// Helpers
function getWorkspaceName(workspaceId: string, workspaces: Workspace[]): string {
  return workspaces.find(w => w.id === workspaceId)?.name || 'Sans workspace'
}

function formatDate(date: Date | undefined): string {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr })
}

function formatPriority(priority: string): string {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.label || priority
}

function formatTaskType(type: string): string {
  return TASK_TYPE_CONFIG[type as keyof typeof TASK_TYPE_CONFIG]?.label || type
}

function formatStatus(completed: boolean): string {
  return completed ? 'Terminée' : 'En cours'
}

function getExportFilename(extension: string): string {
  const date = format(new Date(), 'yyyy-MM-dd')
  return `multitasks-export-${date}.${extension}`
}

// Filter tasks based on options
function filterTasks(tasks: Task[], options: ExportOptions): Task[] {
  let filtered = tasks.filter(t => !t.parentId) // Exclude subtasks from main list

  if (!options.includeCompleted) {
    filtered = filtered.filter(t => !t.completed)
  }

  if (options.workspaceId) {
    filtered = filtered.filter(t => t.workspaceId === options.workspaceId)
  }

  return filtered
}

// Get subtasks for a task
function getSubtasksForTask(taskId: string, subtasks: Subtask[]): Subtask[] {
  return subtasks.filter(s => s.parentId === taskId).sort((a, b) => a.order - b.order)
}

// ============================================
// CSV EXPORT
// ============================================

export function exportToCSV(
  tasks: Task[],
  subtasks: Subtask[],
  workspaces: Workspace[],
  options: ExportOptions
): void {
  const filtered = filterTasks(tasks, options)

  // CSV Headers
  const headers = [
    'Workspace',
    'Titre',
    'Description',
    'Type',
    'Priorité',
    'Étoiles',
    'Deadline',
    'Rappel',
    'Statut',
    'Créée le',
    'Terminée le'
  ]

  if (options.includeSubtasks) {
    headers.push('Sous-tâches')
  }

  // CSV Rows
  const rows: string[][] = []

  for (const task of filtered) {
    const row = [
      getWorkspaceName(task.workspaceId, workspaces),
      task.title,
      task.description || '',
      formatTaskType(task.taskType),
      formatPriority(task.priority),
      task.stars ? '⭐'.repeat(task.stars) : '-',
      formatDate(task.deadline),
      formatDate(task.reminderDate),
      formatStatus(task.completed),
      formatDate(task.createdAt),
      task.completedAt ? formatDate(task.completedAt) : '-'
    ]

    if (options.includeSubtasks) {
      const taskSubtasks = getSubtasksForTask(task.id, subtasks)
      const subtaskText = taskSubtasks
        .map(s => `${s.completed ? '✓' : '○'} ${s.title}`)
        .join(' | ')
      row.push(subtaskText || '-')
    }

    rows.push(row)
  }

  // Build CSV content
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n')

  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  // Trigger download
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = getExportFilename('csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// ============================================
// PDF EXPORT
// ============================================

export function exportToPDF(
  tasks: Task[],
  subtasks: Subtask[],
  workspaces: Workspace[],
  options: ExportOptions
): void {
  const filtered = filterTasks(tasks, options)

  // Create PDF
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(124, 58, 237) // Violet
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Draw sparkle ✨ (jsPDF doesn't support emojis)
  const sparkleX = 14
  const sparkleY = 14
  const sparkleSize = 6
  doc.setFillColor(251, 191, 36) // Amber-400

  // Main 4-point star
  doc.triangle(
    sparkleX, sparkleY - sparkleSize,
    sparkleX - sparkleSize * 0.3, sparkleY,
    sparkleX + sparkleSize * 0.3, sparkleY,
    'F'
  )
  doc.triangle(
    sparkleX, sparkleY + sparkleSize,
    sparkleX - sparkleSize * 0.3, sparkleY,
    sparkleX + sparkleSize * 0.3, sparkleY,
    'F'
  )
  doc.triangle(
    sparkleX - sparkleSize, sparkleY,
    sparkleX, sparkleY - sparkleSize * 0.3,
    sparkleX, sparkleY + sparkleSize * 0.3,
    'F'
  )
  doc.triangle(
    sparkleX + sparkleSize, sparkleY,
    sparkleX, sparkleY - sparkleSize * 0.3,
    sparkleX, sparkleY + sparkleSize * 0.3,
    'F'
  )

  // Small sparkle dots
  doc.circle(sparkleX - sparkleSize * 0.6, sparkleY - sparkleSize * 0.5, 0.8, 'F')
  doc.circle(sparkleX + sparkleSize * 0.5, sparkleY + sparkleSize * 0.6, 0.8, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('MultiTasks', 24, 18) // Décalé pour laisser place au sparkle

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Export des tâches', 14, 27)

  doc.setFontSize(10)
  doc.text(`Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, pageWidth - 14, 27, { align: 'right' })

  // Stats summary
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  const completedCount = filtered.filter(t => t.completed).length
  const pendingCount = filtered.length - completedCount
  doc.text(`Total: ${filtered.length} tâches | En cours: ${pendingCount} | Terminées: ${completedCount}`, 14, 45)

  let yPos = 55

  // Group tasks by workspace
  const groupedByWorkspace = new Map<string, Task[]>()

  for (const task of filtered) {
    const wsId = task.workspaceId
    if (!groupedByWorkspace.has(wsId)) {
      groupedByWorkspace.set(wsId, [])
    }
    groupedByWorkspace.get(wsId)!.push(task)
  }

  // Render each workspace group
  groupedByWorkspace.forEach((wsTasks, wsId) => {
    const workspace = workspaces.find(w => w.id === wsId)
    const wsName = workspace?.name || 'Sans workspace'

    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    // Workspace header (sans emoji - jsPDF ne les supporte pas)
    doc.setFillColor(241, 245, 249) // Slate-100
    doc.rect(10, yPos - 5, pageWidth - 20, 10, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(71, 85, 105) // Slate-600
    doc.text(wsName, 14, yPos + 2)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${wsTasks.length} tâche(s)`, pageWidth - 14, yPos + 2, { align: 'right' })

    yPos += 12

    // Table for this workspace
    const tableData = wsTasks.map(task => {
      const row = [
        task.title.length > 40 ? task.title.substring(0, 40) + '...' : task.title,
        formatPriority(task.priority),
        formatDate(task.deadline),
        formatStatus(task.completed)
      ]
      return row
    })

    autoTable(doc, {
      startY: yPos,
      head: [['Titre', 'Priorité', 'Deadline', 'Statut']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        // Footer on each page
        const pageCount = doc.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber} / ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      }
    })

    // @ts-ignore - autoTable adds lastAutoTable to doc
    yPos = doc.lastAutoTable.finalY + 15
  })

  // If including subtasks, add a section
  if (options.includeSubtasks) {
    const tasksWithSubtasks = filtered.filter(t => {
      const taskSubs = getSubtasksForTask(t.id, subtasks)
      return taskSubs.length > 0
    })

    if (tasksWithSubtasks.length > 0) {
      if (yPos > 220) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(71, 85, 105)
      doc.text('Détail des sous-tâches', 14, yPos)
      yPos += 10

      for (const task of tasksWithSubtasks) {
        const taskSubs = getSubtasksForTask(task.id, subtasks)

        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(51, 65, 85)
        doc.text(`• ${task.title}`, 14, yPos)
        yPos += 6

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        for (const sub of taskSubs) {
          const icon = sub.completed ? '[x]' : '[ ]'
          doc.text(`   ${icon} ${sub.title}`, 18, yPos)
          yPos += 5
        }
        yPos += 3
      }
    }
  }

  // Save PDF
  doc.save(getExportFilename('pdf'))
}
