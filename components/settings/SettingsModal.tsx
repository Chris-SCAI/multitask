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
  CustomTaskType,
  CustomPriority
} from '../../lib/store'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Trash2, Edit3, Check, X, Briefcase, Tag, AlertTriangle, User, Bot, Key, Eye, EyeOff } from 'lucide-react'
import { 
  getLLMConfig, 
  saveLLMConfig, 
  clearLLMConfig, 
  LLMProvider, 
  LLMConfig,
  PROVIDER_INFO,
  DEFAULT_MODELS 
} from '../../lib/llm-providers'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  workspaces: Workspace[]
  onWorkspacesChange: () => void
}

const EMOJI_OPTIONS = ['🏢', '🎓', '🤖', '🏗️', '🏠', '💪', '💼', '🎨', '🎯', '📊', '🚀', '💡', '🔧', '📱', '🌍', '👥', '📅', '📦', '📋', '📌', '🔥', '⚡', '🌱']
const COLOR_OPTIONS = ['#ef4444', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#06b6d4', '#3b82f6', '#ec4899', '#14b8a6', '#6366f1', '#94a3b8']

type TabType = 'profile' | 'ai' | 'workspaces' | 'types' | 'priorities'

export function SettingsModal({ isOpen, onClose, workspaces, onWorkspacesChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ name: '', icon: '📁', color: '#6366f1' })
  
  const [taskTypes, setTaskTypes] = useState<CustomTaskType[]>([])
  const [priorities, setPriorities] = useState<CustomPriority[]>([])
  const [userName, setUserNameState] = useState('')
  const [userNameSaved, setUserNameSaved] = useState(false)
  
  // LLM Config
  const [llmProvider, setLlmProvider] = useState<LLMProvider>('openai')
  const [llmApiKey, setLlmApiKey] = useState('')
  const [llmModel, setLlmModel] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [llmSaved, setLlmSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTaskTypes(getTaskTypes())
      setPriorities(getPriorities())
      setUserNameState(getUserName())
      setUserNameSaved(false)
      
      // Load LLM config
      const llmConfig = getLLMConfig()
      if (llmConfig) {
        setLlmProvider(llmConfig.provider)
        setLlmApiKey(llmConfig.apiKey)
        setLlmModel(llmConfig.model || '')
      } else {
        setLlmProvider('openai')
        setLlmApiKey('')
        setLlmModel('')
      }
      setLlmSaved(false)
    }
  }, [isOpen])
  
  const handleSaveUserName = () => {
    setUserName(userName)
    // Dispatch event pour que le Cockpit se mette à jour
    window.dispatchEvent(new Event('usernameChanged'))
    // Feedback visuel
    setUserNameSaved(true)
    setTimeout(() => setUserNameSaved(false), 2000)
  }

  const handleSaveLLM = () => {
    if (llmApiKey.trim()) {
      saveLLMConfig({
        provider: llmProvider,
        apiKey: llmApiKey.trim(),
        model: llmModel.trim() || undefined,
      })
    } else {
      clearLLMConfig()
    }
    setLlmSaved(true)
    setTimeout(() => setLlmSaved(false), 2000)
  }

  const handleClearLLM = () => {
    clearLLMConfig()
    setLlmApiKey('')
    setLlmModel('')
    setLlmSaved(true)
    setTimeout(() => setLlmSaved(false), 2000)
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
    const bgColor = `${formData.color}26` // 15% opacity
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

  return (
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

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Configuration IA</h3>
            <div className="glass-card p-4 space-y-4">
              <p className="text-sm text-white">
                Configure ton API pour activer les fonctionnalités IA (Eisenhower, suggestions, etc.).
                Ta clé API reste stockée localement sur ton appareil.
              </p>
              
              {/* Provider selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Fournisseur
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PROVIDER_INFO) as LLMProvider[]).map(provider => (
                    <button
                      key={provider}
                      onClick={() => {
                        setLlmProvider(provider)
                        setLlmModel('')
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                        llmProvider === provider
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                          : 'border-slate-600 text-white hover:border-slate-600'
                      }`}
                    >
                      <span className="text-lg">{PROVIDER_INFO[provider].icon}</span>
                      <span className="font-medium">{PROVIDER_INFO[provider].name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <Key size={14} className="inline mr-1" />
                  Clé API {PROVIDER_INFO[llmProvider].name}
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={llmApiKey}
                    onChange={e => setLlmApiKey(e.target.value)}
                    placeholder={PROVIDER_INFO[llmProvider].placeholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-100 hover:text-slate-100"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Model (optional) */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Modèle (optionnel)
                </label>
                <Input
                  value={llmModel}
                  onChange={e => setLlmModel(e.target.value)}
                  placeholder={`Par défaut: ${DEFAULT_MODELS[llmProvider]}`}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleSaveLLM}
                  className={llmSaved ? '!bg-green-600 !border-green-600' : ''}
                >
                  <Check size={16} className="mr-1" /> {llmSaved ? 'Enregistré !' : 'Sauvegarder'}
                </Button>
                {llmApiKey && (
                  <Button variant="ghost" onClick={handleClearLLM}>
                    <Trash2 size={16} className="mr-1" /> Supprimer
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-slate-100">
                💡 Obtiens ta clé API sur le site du fournisseur. OpenRouter permet d'utiliser plusieurs modèles avec une seule clé.
              </p>
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
                      false // Can't delete priorities
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
