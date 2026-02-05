'use client'

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { AuthModal } from './AuthModal'
import { LogIn, LogOut, User, Cloud, CloudOff } from 'lucide-react'

export function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  if (loading) {
    return (
      <div className="p-3 text-slate-100 text-sm">
        Chargement...
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 w-full p-3 text-sm text-white hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors"
        >
          <LogIn size={18} />
          <span>Se connecter</span>
          <span title="Mode local"><CloudOff size={14} className="ml-auto text-slate-600" /></span>
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 w-full p-3 text-sm text-slate-100 hover:bg-slate-800/70 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <User size={16} className="text-indigo-300" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium truncate">{user.email}</p>
          <p className="text-xs text-slate-100">Plan Free</p>
        </div>
        <span title="Sync activée"><Cloud size={14} className="text-emerald-300" /></span>
      </button>

      {showMenu && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden">
          <button
            onClick={async () => {
              await signOut()
              setShowMenu(false)
            }}
            className="flex items-center gap-2 w-full p-3 text-sm text-white hover:text-rose-300 hover:bg-slate-700/50 transition-colors"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}
