'use client'

import { useState, useEffect } from 'react'
import { Workspace } from '../../lib/types'
import {
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getTaskTypes,
  addTaskType,
  updateTaskType,
  deleteTaskType,
  getPriorities,
  updatePriority,
  getUserName,
  setUserName,
  getTasks,
  getSubtasks,
  CustomTaskType,
  CustomPriority
} from '../../lib/store'
import { Task, Subtask } from '../../lib/types'
import { ExportPanel } from '../export/ExportPanel'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Trash2, Edit3, Check, X, Briefcase, Tag, AlertTriangle, User, Bot, Sparkles, CreditCard, Crown, Loader2, Download } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { useAuth } from '../../hooks/useAuth'
import { AuthModal } from '../auth/AuthModal'
import { formatSubscriptionStatus } from '../../lib/stripe'
import {
  getSelectedModel,
  saveSelectedModel,
  AVAILABLE_MODELS,
  DEFAULT_MODEL,
  getModelInfo
} from '../../lib/llm-providers'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  workspaces: Workspace[]
  onWorkspacesChange: () => void
}

const EMOJI_OPTIONS = ['🏢', '🎓', '🤖', '🏗️', '🏠', '💪', '💼', '🎨', '🎯', '📊', '🚀', '💡', '🔧', '📱', '🌍', '👥', '📅', '📦', '📋', '📌', '🔥', '⚡', '🌱']
const COLOR_OPTIONS = ['#ef4444', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#06b6d4', '#3b82f6', '#ec4899', '#14b8a6', '#6366f1', '#94a3b8']

type TabType = 'profile' | 'subscription' | 'ai' | 'workspaces' | 'types' | 'priorities' | 'export'
type ModelCategory = keyof typeof AVAILABLE_MODELS

export function SettingsModal({ isOpen, onClose, workspaces, onWorkspacesChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const { user } = useAuth()
  const { plan, status, isTrialing, daysLeftInTrial, isPro, openPortal, startCheckout } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ name: '', icon: '📁', color: '#6366f1' })

  const [taskTypes, setTaskTypes] = useState<CustomTaskType[]>([])
  const [priorities, setPriorities] = useState<CustomPriority[]>([])
  const [userName, setUserNameState] = useState('')
  const [userNameSaved, setUserNameSaved] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [subtasks, setSubtasks] = useState<Subtask[]>([])

  // AI Model selection
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [modelCategory, setModelCategory] = useState<ModelCategory>('recommended')
  const [modelSaved, setModelSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTaskTypes(getTaskTypes())
      setPriorities(getPriorities())
      setUserNameState(getUserName())
      setUserNameSaved(false)
      setTasks(getTasks())
      setSubtasks(getSubtasks())

      // Load selected model
      const model = getSelectedModel()
      setSelectedModel(model)
      setModelSaved(false)
    }
  }, [isOpen])

  const handleSaveUserName = () => {
    setUserName(userName)
    window.dispatchEvent(new Event('usernameChanged'))
    setUserNameSaved(true)
    setTimeout(() => setUserNameSaved(false), 2000)
  }

  const handleSaveModel = () => {
    saveSelectedModel(selectedModel)
    setModelSaved(true)
    setTimeout(() => setModelSaved(false), 2000)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({ name: '', icon: '📁', color: '#6366f1' })
  }

  // Workspace handlers
  const handleAddWorkspace = () => {
    if (!formData.name.trim()) return
    createWorkspace({
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
    })
    cancelEdit()
    onWorkspacesChange()
  }

  const handleUpdateWorkspace = (id: string) => {
    if (!formData.name.trim()) return
    updateWorkspace(id, {
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
    })
    cancelEdit()
    onWorkspacesChange()
  }

  const handleDeleteWorkspace = (id: string) => {
    if (confirm('Supprimer ce workspace et toutes ses tâches ?')) {
      deleteWorkspace(id)
      onWorkspacesChange()
    }
  }

  // Task Type handlers
  const handleAddTaskType = () => {
    if (!formData.name.trim()) return
    addTaskType({
      label: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
    })
    setTaskTypes(getTaskTypes())
    cancelEdit()
  }

  const handleUpdateTaskType = (id: string) => {
    if (!formData.name.trim()) return
    updateTaskType(id, {
      label: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
    })
    setTaskTypes(getTaskTypes())
    cancelEdit()
  }

  const handleDeleteTaskType = (id: string) => {
    if (confirm('Supprimer ce type ?')) {
      deleteTaskType(id)
      setTaskTypes(getTaskTypes())
    }
  }

  // Priority handlers
  const handleUpdatePriority = (id: string) => {
    if (!formData.name.trim()) return
    const bgColor = `${formData.color}26`
    updatePriority(id, {
      label: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      bgColor,
    })
    setPriorities(getPriorities())
    cancelEdit()
  }

  const startEdit = (item: { id: string; icon: string; color: string } & { name?: string; label?: string }) => {
    setEditingId(item.id)
    setFormData({
      name: item.name || item.label || '',
      icon: item.icon,
      color: item.color
    })
    setIsAdding(false)
  }

  const renderForm = (onSave: () => void) => (
    <div className="space-y-3">
      <Input
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        placeholder="Nom"
        autoFocus
      />
      <div>
        <label className="block text-xs text-slate-100 mb-2">Icône</label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => setFormData({ ...formData, icon: emoji })}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                formData.icon === emoji ? 'bg-indigo-500/30 ring-2 ring-indigo-500' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-100 mb-2">Couleur</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-7 h-7 rounded-full transition-all ${
                formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={cancelEdit}>
          <X size={16} />
        </Button>
        <Button size="sm" onClick={onSave}>
          <Check size={16} />
        </Button>
      </div>
    </div>
  )

  const renderItem = (
    item: { id: string; icon: string; color: string; name?: string; label?: string },
    onEdit: () => void,
    onDelete: () => void,
    canDelete: boolean = true
  ) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${item.color}20` }}
        >
          {item.icon}
        </div>
        <span className="font-medium text-white">{item.name || item.label}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-2 text-white hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Edit3 size={16} />
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-white hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )

  const categoryLabels: Record<ModelCategory, string> = {
    recommended: '⭐ Recommandés',
    openai: '🤖 OpenAI',
    anthropic: '🧠 Anthropic',
    google: '✨ Google',
    mistral: '🌬️ Mistral',
    deepseek: '🐋 DeepSeek',
    free: '🆓 Gratuits',
  }

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Paramètres" size="lg">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('profile'); cancelEdit() }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white hover:text-white'
            }`}
          >
            <User size={16} /> Profil
          </button>
          <button
            onClick={() => { setActiveTab('subscription'); cancelEdit() }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'subscription' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white hover:text-white'
            }`}
          >
            <CreditCard size={16} /> Abonnement
          </button>
          <button
            onClick={() => { setActiveTab('ai'); cancelEdit() }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'ai' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white hover:text-white'
            }`}
          >
            <Bot size={16} /> IA
          </button>
          <button
            onClick={() => { setActiveTab('workspaces'); cancelEdit() }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'workspaces' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white hover:text-white'
            }`}
          >
            <Briefcase size={16} /> Workspaces
          </button>
          <button
            onClick={() => { setActiveTab('types'); cancelEdit() }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'types' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white hover:text-white'
            }`}
          >
            <Tag size={16} /> Types
          </button>
          <button
            onClick={() => { setActiveTab('priorities'); cancelEdit() }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'priorities' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white hover:text-white'
            }`}
          >
            <AlertTriangle size={16} /> Priorités
          </button>
          <button
            onClick={() => { setActiveTab('export'); cancelEdit() }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'export' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white hover:text-white'
            }`}
          >
            <Download size={16} /> Export
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Mon profil</h3>
            <div className="glass-card p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Prénom
                </label>
                <div className="flex gap-2">
                  <Input
                    value={userName}
                    onChange={e => setUserNameState(e.target.value)}
                    placeholder="Entre ton prénom"
                    onKeyDown={e => e.key === 'Enter' && handleSaveUserName()}
                  />
                  <Button
                    onClick={handleSaveUserName}
                    className={userNameSaved ? '!bg-green-600 !border-green-600' : ''}
                  >
                    <Check size={16} className="mr-1" /> {userNameSaved ? 'Enregistré !' : 'OK'}
                  </Button>
                </div>
                <p className="text-xs text-slate-100 mt-2">
                  Ton prénom sera affiché dans le cockpit pour te saluer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Mon abonnement</h3>
            <div className="glass-card p-4 space-y-4">
              {/* Current Plan */}
              <div className={`p-4 rounded-xl border ${
                isPro
                  ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {isPro ? (
                      <Crown className="text-yellow-400" size={24} />
                    ) : (
                      <CreditCard className="text-slate-400" size={24} />
                    )}
                    <div>
                      <h4 className="font-semibold text-white capitalize">
                        Plan {plan}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {formatSubscriptionStatus(status)}
                        {isTrialing && daysLeftInTrial > 0 && (
                          <span className="ml-2 text-indigo-400">
                            ({daysLeftInTrial} jours restants)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {plan === 'pro' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full">
                      PRO
                    </span>
                  )}
                  {plan === 'team' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                      TEAM
                    </span>
                  )}
                </div>

                {/* Features based on plan */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className={`flex items-center gap-2 text-sm ${isPro ? 'text-green-400' : 'text-slate-500'}`}>
                    <Check size={14} /> IA Eisenhower
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isPro ? 'text-green-400' : 'text-slate-500'}`}>
                    <Check size={14} /> Sync cloud
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isPro ? 'text-green-400' : 'text-slate-500'}`}>
                    <Check size={14} /> Espaces illimites
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isPro ? 'text-green-400' : 'text-slate-500'}`}>
                    <Check size={14} /> Support prioritaire
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {plan === 'free' ? (
                  <>
                    <Button
                      onClick={async () => {
                        if (!user) {
                          setShowAuthModal(true)
                          return
                        }
                        setCheckoutLoading(true)
                        try {
                          await startCheckout('pro')
                        } catch (error) {
                          console.error('Checkout error:', error)
                          alert('Erreur lors du checkout. Veuillez réessayer.')
                        } finally {
                          setCheckoutLoading(false)
                        }
                      }}
                      disabled={checkoutLoading}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" /> Chargement...
                        </>
                      ) : (
                        <>
                          <Crown size={16} className="mr-2" /> {user ? 'Passer à Pro - 9,90€/mois' : 'Créer un compte gratuit'}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-slate-400 text-center">
                      14 jours d'essai gratuit, sans engagement
                    </p>
                  </>
                ) : (
                  <Button
                    onClick={async () => {
                      setPortalLoading(true)
                      try {
                        await openPortal()
                      } finally {
                        setPortalLoading(false)
                      }
                    }}
                    disabled={portalLoading}
                    variant="secondary"
                    className="w-full"
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" /> Chargement...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} className="mr-2" /> Gerer mon abonnement
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Tab - Simplified for SaaS */}
        {activeTab === 'ai' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Assistant IA</h3>
            <div className="glass-card p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Sparkles className="text-indigo-400" size={20} />
                <p className="text-sm text-white">
                  L'IA est incluse dans ton abonnement. Choisis le modèle qui te convient le mieux.
                </p>
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Catégorie
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(AVAILABLE_MODELS) as ModelCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setModelCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        modelCategory === cat
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500'
                          : 'bg-slate-800 text-white border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {categoryLabels[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Modèle
                </label>
                <div className="space-y-2">
                  {AVAILABLE_MODELS[modelCategory].map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selectedModel === model.id
                          ? 'border-indigo-500 bg-indigo-500/20'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      }`}
                    >
                      <span className="text-xl">{model.icon}</span>
                      <div className="flex-1">
                        <p className={`font-medium ${selectedModel === model.id ? 'text-indigo-300' : 'text-white'}`}>
                          {model.name}
                        </p>
                        <p className="text-xs text-slate-400">{model.description}</p>
                      </div>
                      {selectedModel === model.id && (
                        <Check size={18} className="text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current selection & Save */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-slate-400">
                  Actuel : <span className="text-white">{getModelInfo(selectedModel).name}</span>
                </div>
                <Button
                  onClick={handleSaveModel}
                  className={modelSaved ? '!bg-green-600 !border-green-600' : ''}
                >
                  <Check size={16} className="mr-1" /> {modelSaved ? 'Enregistré !' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Workspaces Tab */}
        {activeTab === 'workspaces' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Espaces de travail</h3>
              {!isAdding && !editingId && (
                <Button size="sm" onClick={() => setIsAdding(true)}>
                  <Plus size={16} className="mr-1" /> Ajouter
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {workspaces.map(workspace => (
                <div key={workspace.id} className="glass-card p-3">
                  {editingId === workspace.id ? (
                    renderForm(() => handleUpdateWorkspace(workspace.id))
                  ) : (
                    renderItem(
                      { ...workspace, name: workspace.name },
                      () => startEdit({ ...workspace, name: workspace.name }),
                      () => handleDeleteWorkspace(workspace.id)
                    )
                  )}
                </div>
              ))}
              {isAdding && (
                <div className="glass-card p-3 border-2 border-dashed border-indigo-500/50">
                  {renderForm(handleAddWorkspace)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Types Tab */}
        {activeTab === 'types' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Types de tâches</h3>
              {!isAdding && !editingId && (
                <Button size="sm" onClick={() => setIsAdding(true)}>
                  <Plus size={16} className="mr-1" /> Ajouter
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {taskTypes.map(type => (
                <div key={type.id} className="glass-card p-3">
                  {editingId === type.id ? (
                    renderForm(() => handleUpdateTaskType(type.id))
                  ) : (
                    renderItem(
                      type,
                      () => startEdit(type),
                      () => handleDeleteTaskType(type.id)
                    )
                  )}
                </div>
              ))}
              {isAdding && (
                <div className="glass-card p-3 border-2 border-dashed border-indigo-500/50">
                  {renderForm(handleAddTaskType)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Priorities Tab */}
        {activeTab === 'priorities' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Priorités</h3>
            </div>
            <p className="text-sm text-slate-100 mb-4">Les 3 niveaux de priorité (pas de suppression)</p>
            <div className="space-y-3">
              {priorities.map(priority => (
                <div key={priority.id} className="glass-card p-3">
                  {editingId === priority.id ? (
                    renderForm(() => handleUpdatePriority(priority.id))
                  ) : (
                    renderItem(
                      priority,
                      () => startEdit(priority),
                      () => {},
                      false
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Exporter mes tâches</h3>
            <ExportPanel
              tasks={tasks}
              subtasks={subtasks}
              workspaces={workspaces}
            />
          </div>
        )}
      </div>
    </Modal>

    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      onSuccess={async () => {
        setShowAuthModal(false)
        // Après connexion, lancer le checkout
        setCheckoutLoading(true)
        try {
          await startCheckout('pro')
        } catch (error) {
          console.error('Checkout error:', error)
          alert('Erreur lors du checkout. Veuillez réessayer.')
        } finally {
          setCheckoutLoading(false)
        }
      }}
    />
    </>
  )
}
