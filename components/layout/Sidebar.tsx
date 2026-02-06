'use client'

import { Workspace, ViewMode } from '../../lib/types'
import { cn } from '../../lib/utils'
import { 
  LayoutDashboard, 
  Calendar, 
  Layers, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { UserMenu } from '../auth/UserMenu'

interface SidebarProps {
  workspaces: Workspace[]
  currentView: ViewMode
  selectedWorkspace: string | null
  onViewChange: (view: ViewMode) => void
  onWorkspaceSelect: (id: string) => void
  onSettingsOpen: () => void
}

export function Sidebar({
  workspaces,
  currentView,
  selectedWorkspace,
  onViewChange,
  onWorkspaceSelect,
  onSettingsOpen,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { id: 'cockpit' as ViewMode, icon: LayoutDashboard, label: 'Cockpit' },
    { id: 'calendar' as ViewMode, icon: Calendar, label: 'Calendrier' },
    { id: 'priority' as ViewMode, icon: Layers, label: 'Priorités' },
  ]

  return (
    <aside 
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-50 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn(
        'p-6 border-b border-slate-800',
        isCollapsed && 'p-4'
      )}>
        <h1 className={cn(
          'font-extrabold flex items-center transition-all',
          isCollapsed ? 'text-xl justify-center' : 'text-2xl gap-1'
        )}>
          <span className="text-indigo-400">✦</span>
          {!isCollapsed && <span className="bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent">MultiTasks</span>}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
              currentView === id && !selectedWorkspace
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-white hover:text-white hover:bg-slate-800/70',
              isCollapsed && 'justify-center px-3'
            )}
          >
            <Icon size={20} />
            {!isCollapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Workspaces */}
      <div className="flex-1 overflow-y-auto p-4 border-t border-slate-800">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider mb-3 px-2">
            Espaces
          </h3>
        )}
        <div className="space-y-1">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => onWorkspaceSelect(workspace.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                selectedWorkspace === workspace.id
                  ? 'bg-slate-800 text-white'
                  : 'text-white hover:text-white hover:bg-slate-800/70',
                isCollapsed && 'justify-center'
              )}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${workspace.color}20` }}
              >
                {workspace.icon}
              </div>
              {!isCollapsed && (
                <span className="truncate text-sm font-medium">{workspace.name}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {/* User Menu */}
        {!isCollapsed && <UserMenu />}
        
        <button
          onClick={onSettingsOpen}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:text-white hover:bg-slate-800/70 transition-all duration-200',
            isCollapsed && 'justify-center px-3'
          )}
        >
          <Settings size={20} />
          {!isCollapsed && <span className="font-medium">Paramètres</span>}
        </button>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-100 hover:text-slate-100 transition-all duration-200',
            isCollapsed && 'justify-center px-3'
          )}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span className="text-sm">Réduire</span>}
        </button>
      </div>
    </aside>
  )
}
