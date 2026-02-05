// LLM Providers - SaaS Mode (Server-managed API keys)
// Les clés API sont gérées côté serveur via OpenRouter

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// Modèles disponibles via OpenRouter (groupés par catégorie)
export const AVAILABLE_MODELS = {
  recommended: [
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Rapide et économique', icon: '⚡' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Excellent pour les tâches complexes', icon: '🧠' },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', description: 'Gratuit, rapide', icon: '✨' },
  ],
  openai: [
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Rapide et économique', icon: '⚡' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Plus puissant', icon: '🚀' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Haute performance', icon: '💪' },
  ],
  anthropic: [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Équilibré', icon: '🧠' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Le plus puissant', icon: '👑' },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Ultra rapide', icon: '🐇' },
  ],
  google: [
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', description: 'Gratuit', icon: '✨' },
    { id: 'google/gemini-pro', name: 'Gemini Pro', description: 'Équilibré', icon: '💎' },
  ],
  mistral: [
    { id: 'mistralai/mistral-small', name: 'Mistral Small', description: 'Rapide', icon: '🌬️' },
    { id: 'mistralai/mistral-medium', name: 'Mistral Medium', description: 'Équilibré', icon: '🌪️' },
    { id: 'mistralai/mistral-large', name: 'Mistral Large', description: 'Puissant', icon: '🌊' },
  ],
  deepseek: [
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', description: 'Économique', icon: '🐋' },
    { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', description: 'Spécialisé code', icon: '💻' },
  ],
  free: [
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', description: 'Google, gratuit', icon: '✨' },
    { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B', description: 'Meta, gratuit', icon: '🦙' },
  ],
}

// Modèle par défaut
export const DEFAULT_MODEL = 'openai/gpt-4o-mini'

// Storage key pour le modèle choisi
const STORAGE_KEY = 'multitask_ai_model'

// Get stored model preference
export function getSelectedModel(): string {
  if (typeof window === 'undefined') return DEFAULT_MODEL
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODEL
}

// Save model preference
export function saveSelectedModel(model: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, model)
}

// Check if AI is available (always true in SaaS mode, server manages keys)
export function isLLMConfigured(): boolean {
  return true
}

// For backward compatibility
export function getLLMConfig() {
  return {
    model: getSelectedModel(),
  }
}

// Retry wrapper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on client errors (4xx)
      if (lastError.message.includes('400') ||
          lastError.message.includes('401') ||
          lastError.message.includes('403')) {
        throw lastError
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Parse LLM JSON response with cleanup
export function parseLLMJson<T>(content: string): T {
  let cleaned = content.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  cleaned = cleaned.trim()

  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }

  try {
    return JSON.parse(cleaned) as T
  } catch {
    const fixedCommas = cleaned
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
    return JSON.parse(fixedCommas) as T
  }
}

// Call LLM API via server proxy (SaaS mode - no API key needed)
export async function callLLM(
  messages: LLMMessage[],
  modelOverride?: string
): Promise<LLMResponse> {
  const model = modelOverride || getSelectedModel()

  return withRetry(async () => {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Erreur API: ${response.status}`)
    }

    return response.json()
  })
}

// Helper to get model info
export function getModelInfo(modelId: string) {
  for (const category of Object.values(AVAILABLE_MODELS)) {
    const model = category.find(m => m.id === modelId)
    if (model) return model
  }
  return { id: modelId, name: modelId, description: '', icon: '🤖' }
}
