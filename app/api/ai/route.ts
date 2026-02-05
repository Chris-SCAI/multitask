import { NextRequest, NextResponse } from 'next/server'

// Types
type LLMProvider = 'openai' | 'anthropic' | 'mistral' | 'openrouter' | 'google' | 'deepseek'

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface RequestBody {
  provider: LLMProvider
  apiKey: string
  model: string
  messages: LLMMessage[]
}

// Rate limiting in memory (simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 30 // requests
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT) {
    return false
  }

  entry.count++
  return true
}

// Validate request body
function validateRequest(body: unknown): body is RequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>

  const validProviders: LLMProvider[] = ['openai', 'anthropic', 'mistral', 'openrouter', 'google', 'deepseek']
  if (!validProviders.includes(b.provider as LLMProvider)) return false
  if (typeof b.apiKey !== 'string' || b.apiKey.length === 0) return false
  if (typeof b.model !== 'string' || b.model.length === 0) return false
  if (!Array.isArray(b.messages) || b.messages.length === 0) return false

  return true
}

// OpenAI API call
async function callOpenAI(messages: LLMMessage[], apiKey: string, model: string) {
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
    provider: 'openai' as const,
    model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  }
}

// Anthropic API call (server-side, no dangerous header)
async function callAnthropic(messages: LLMMessage[], apiKey: string, model: string) {
  const systemMessage = messages.find(m => m.role === 'system')
  const otherMessages = messages.filter(m => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
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
    provider: 'anthropic' as const,
    model,
    usage: data.usage ? {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    } : undefined,
  }
}

// Mistral API call
async function callMistral(messages: LLMMessage[], apiKey: string, model: string) {
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
    provider: 'mistral' as const,
    model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  }
}

// OpenRouter API call
async function callOpenRouter(messages: LLMMessage[], apiKey: string, model: string, referer: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': referer,
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
    provider: 'openrouter' as const,
    model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  }
}

// Google Gemini API call
async function callGoogle(messages: LLMMessage[], apiKey: string, model: string) {
  // Convert messages to Gemini format
  const systemMessage = messages.find(m => m.role === 'system')
  const otherMessages = messages.filter(m => m.role !== 'system')

  const contents = otherMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  }

  // Add system instruction if present
  if (systemMessage) {
    requestBody.systemInstruction = {
      parts: [{ text: systemMessage.content }],
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Google API error: ${response.status}`)
  }

  const data = await response.json()

  // Handle safety blocks or empty responses
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Google API returned no candidates (content may have been blocked)')
  }

  const candidate = data.candidates[0]
  if (!candidate.content?.parts?.[0]?.text) {
    throw new Error('Google API returned empty content')
  }

  return {
    content: candidate.content.parts[0].text,
    provider: 'google' as const,
    model,
    usage: data.usageMetadata ? {
      promptTokens: data.usageMetadata.promptTokenCount,
      completionTokens: data.usageMetadata.candidatesTokenCount,
      totalTokens: data.usageMetadata.totalTokenCount,
    } : undefined,
  }
}

// DeepSeek API call (OpenAI-compatible)
async function callDeepSeek(messages: LLMMessage[], apiKey: string, model: string) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
    throw new Error(error.error?.message || `DeepSeek API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    provider: 'deepseek' as const,
    model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  }
}

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown'

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: provider, apiKey, model, messages' },
        { status: 400 }
      )
    }

    const { provider, apiKey, model, messages } = body
    const referer = request.headers.get('referer') || request.headers.get('origin') || ''

    let result
    switch (provider) {
      case 'openai':
        result = await callOpenAI(messages, apiKey, model)
        break
      case 'anthropic':
        result = await callAnthropic(messages, apiKey, model)
        break
      case 'mistral':
        result = await callMistral(messages, apiKey, model)
        break
      case 'openrouter':
        result = await callOpenRouter(messages, apiKey, model, referer)
        break
      case 'google':
        result = await callGoogle(messages, apiKey, model)
        break
      case 'deepseek':
        result = await callDeepSeek(messages, apiKey, model)
        break
      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('LLM API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 502 }
    )
  }
}
