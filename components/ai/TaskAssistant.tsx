'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Loader2, Bot, User } from 'lucide-react'
import { Task, Workspace } from '../../lib/types'
import { askTaskAssistant, AssistantMessage } from '../../lib/ai-features'
import { isLLMConfigured } from '../../lib/llm-providers'

interface TaskAssistantProps {
  tasks: Task[]
  workspaces: Workspace[]
}

const SUGGESTIONS = [
  "Quelle tâche dois-je faire en premier ?",
  "Comment mieux organiser ma journée ?",
  "Résume mes tâches en retard",
  "Des conseils pour être plus productif ?",
]

export function TaskAssistant({ tasks, workspaces }: TaskAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (question?: string) => {
    const q = question || input.trim()
    if (!q) return

    if (!isLLMConfigured()) {
      setError('IA non configurée. Ajoutez votre clé API dans les paramètres.')
      return
    }

    const userMessage: AssistantMessage = {
      role: 'user',
      content: q,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await askTaskAssistant(q, tasks, workspaces, messages)
      
      const assistantMessage: AssistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-full shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-600 bg-gradient-to-r from-violet-600/20 to-purple-600/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <Bot size={20} className="text-violet-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Assistant Tâches</h3>
                <p className="text-xs text-white">Pose-moi tes questions</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 min-h-48">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <p className="text-white text-sm mb-4">Comment puis-je t'aider ?</p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="block w-full text-left px-3 py-2 text-sm bg-slate-800/70 hover:bg-slate-800 rounded-lg text-slate-100 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-violet-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-md'
                      : 'bg-slate-800 text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Bot size={16} className="text-violet-400" />
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded-2xl rounded-bl-md">
                  <Loader2 size={16} className="animate-spin text-violet-400" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-300 text-center">{error}</p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-600">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pose ta question..."
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder:text-slate-100 focus:outline-none focus:border-violet-500/50 text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white rounded-xl transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
