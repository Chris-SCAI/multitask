'use client'

import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type Mode = 'signin' | 'signup' | 'reset'

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { signIn, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(email, password)
        onSuccess?.()
        onClose()
      } else if (mode === 'signup') {
        await signUp(email, password)
        setSuccess('Compte créé ! Vérifie tes emails pour confirmer.')
      } else if (mode === 'reset') {
        await resetPassword(email)
        setSuccess('Email de réinitialisation envoyé !')
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError(null)
    setSuccess(null)
  }

  const switchMode = (newMode: Mode) => {
    resetForm()
    setMode(newMode)
  }

  const titles = {
    signin: 'Connexion',
    signup: 'Créer un compte',
    reset: 'Mot de passe oublié',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[mode]}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error/Success messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/15 text-rose-300 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/15 text-emerald-300 text-sm">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* Name field (signup only) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <User size={14} className="inline mr-1" />
              Prénom
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton prénom"
            />
          </div>
        )}

        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <Mail size={14} className="inline mr-1" />
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            required
          />
        </div>

        {/* Password field (not for reset) */}
        {mode !== 'reset' && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Lock size={14} className="inline mr-1" />
              Mot de passe
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        )}

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Chargement...' : mode === 'signin' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : 'Envoyer le lien'}
        </Button>

        {/* Mode switchers */}
        <div className="text-center text-sm text-white space-y-2">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-indigo-300 hover:text-indigo-300 transition-colors"
              >
                Mot de passe oublié ?
              </button>
              <p>
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-indigo-300 hover:text-indigo-300 transition-colors"
                >
                  Créer un compte
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>
              Déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-indigo-300 hover:text-indigo-300 transition-colors"
              >
                Se connecter
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="text-indigo-300 hover:text-indigo-300 transition-colors"
            >
              Retour à la connexion
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
