// LLM Providers - Multi-provider AI integration

export type LLMProvider = 'openai' | 'anthropic' | 'mistral' | 'openrouter'

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
  anthropic: 'claude-3-haiku-20240307',
  mistral: 'mistral-small-latest',
  openrouter: 'openai/gpt-4o-mini',
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

// Call LLM API
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

  switch (provider) {
    case 'openai':
      return callOpenAI(messages, apiKey, selectedModel)
    case 'anthropic':
      return callAnthropic(messages, apiKey, selectedModel)
    case 'mistral':
      return callMistral(messages, apiKey, selectedModel)
    case 'openrouter':
      return callOpenRouter(messages, apiKey, selectedModel)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

// OpenAI API
async function callOpenAI(
  messages: LLMMessage[],
  apiKey: string,
  model: string
): Promise<LLMResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    provider: 'openai',
    model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  }
}

// Anthropic API
async function callAnthropic(
  messages: LLMMessage[],
  apiKey: string,
  model: string
): Promise<LLMResponse> {
  // Extract system message if present
  const systemMessage = messages.find(m => m.role === 'system')
  const otherMessages = messages.filter(m => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemMessage?.content,
      messages: otherMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    content: data.content[0].text,
    provider: 'anthropic',
    model,
    usage: data.usage ? {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    } : undefined,
  }
}

// Mistral API
async function callMistral(
  messages: LLMMessage[],
  apiKey: string,
  model: string
): Promise<LLMResponse> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Mistral API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    provider: 'mistral',
    model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  }
}

// OpenRouter API
async function callOpenRouter(
  messages: LLMMessage[],
  apiKey: string,
  model: string
): Promise<LLMResponse> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'MultiTask Pro',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    provider: 'openrouter',
    model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  }
}
