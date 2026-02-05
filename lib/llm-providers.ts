// LLM Providers - Multi-provider AI integration

export type LLMProvider = 'openai' | 'anthropic' | 'mistral' | 'openrouter' | 'google'

export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  model?: string
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  provider: LLMProvider
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// Default models per provider
export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-5-20250929',
  mistral: 'mistral-small-latest',
  openrouter: 'openai/gpt-4o-mini',
  google: 'gemini-2.0-flash',
}

// Provider display info
export const PROVIDER_INFO: Record<LLMProvider, { name: string; icon: string; placeholder: string }> = {
  openai: {
    name: 'OpenAI',
    icon: '🤖',
    placeholder: 'sk-...',
  },
  anthropic: {
    name: 'Anthropic',
    icon: '🧠',
    placeholder: 'sk-ant-...',
  },
  mistral: {
    name: 'Mistral',
    icon: '🌬️',
    placeholder: 'your-api-key',
  },
  openrouter: {
    name: 'OpenRouter',
    icon: '🔀',
    placeholder: 'sk-or-...',
  },
  google: {
    name: 'Google Gemini',
    icon: '✨',
    placeholder: 'AIza...',
  },
}

// Storage keys
const STORAGE_KEY = 'multitask_llm_config'

// Get stored LLM config
export function getLLMConfig(): LLMConfig | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

// Save LLM config
export function saveLLMConfig(config: LLMConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// Clear LLM config
export function clearLLMConfig(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// Check if LLM is configured
export function isLLMConfigured(): boolean {
  const config = getLLMConfig()
  return config !== null && config.apiKey.length > 0
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
        const delay = baseDelay * Math.pow(2, attempt) // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Parse LLM JSON response with cleanup
export function parseLLMJson<T>(content: string): T {
  // Remove markdown code blocks
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

  // Extract JSON between first { and last }
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }

  // Try direct parse
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Fallback: fix trailing commas
    const fixedCommas = cleaned
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
    return JSON.parse(fixedCommas) as T
  }
}

// Call LLM API via server proxy
export async function callLLM(
  messages: LLMMessage[],
  config?: LLMConfig
): Promise<LLMResponse> {
  const llmConfig = config || getLLMConfig()
  if (!llmConfig) {
    throw new Error('LLM not configured. Please add your API key in settings.')
  }

  const { provider, apiKey, model } = llmConfig
  const selectedModel = model || DEFAULT_MODELS[provider]

  return withRetry(async () => {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        apiKey,
        model: selectedModel,
        messages,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `API error: ${response.status}`)
    }

    return response.json()
  })
}
