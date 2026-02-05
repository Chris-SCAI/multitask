import { NextRequest, NextResponse } from 'next/server'

// Server-side API key (SaaS mode)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

// Types
interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface RequestBody {
  model: string
  messages: LLMMessage[]
  // Optional: for BYOK (Bring Your Own Key) mode
  apiKey?: string
  provider?: string
}

// Rate limiting in memory
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 50 // requests per minute (increased for SaaS)
const RATE_WINDOW = 60 * 1000

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

  if (typeof b.model !== 'string' || b.model.length === 0) return false
  if (!Array.isArray(b.messages) || b.messages.length === 0) return false

  return true
}

// OpenRouter API call (main provider for SaaS)
async function callOpenRouter(
  messages: LLMMessage[],
  apiKey: string,
  model: string,
  referer: string
) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': referer || 'https://multitasks.fr',
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
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
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
      { error: 'Trop de requêtes. Réessaie dans une minute.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Requête invalide. Requis: model, messages' },
        { status: 400 }
      )
    }

    const { model, messages, apiKey: userApiKey } = body
    const referer = request.headers.get('referer') || request.headers.get('origin') || ''

    // Determine which API key to use
    // Priority: user's key (BYOK) > server key
    const apiKey = userApiKey || OPENROUTER_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service IA non configuré. Contacte le support.' },
        { status: 503 }
      )
    }

    // Call OpenRouter (supports all models via unified API)
    const result = await callOpenRouter(messages, apiKey, model, referer)

    return NextResponse.json(result)

  } catch (error) {
    console.error('LLM API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 502 }
    )
  }
}
