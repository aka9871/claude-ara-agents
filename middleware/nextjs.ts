/**
 * ARA Middleware for Next.js
 *
 * Place this file at the root of your Next.js project: middleware.ts
 *
 * What it does:
 *   1. Detects known AI agent User-Agents (GPTBot, ClaudeBot, PerplexityBot, etc.)
 *   2. Redirects AI crawlers to /.well-known/ara/digest.md (300 tokens vs 50k of HTML)
 *   3. Adds ARA discovery headers to every HTTP response so agents can find the manifest
 *
 * Result: AI agents spend 10-20x fewer tokens understanding your site,
 * and find your ARA manifest without needing prior knowledge of the standard.
 */

import { NextRequest, NextResponse } from 'next/server'

// ── Known AI agent User-Agent strings ─────────────────────────────────────────
// Source: https://ara-standard.org/known-bots
const AI_BOTS: string[] = [
  'GPTBot',          // OpenAI — ChatGPT web browsing, GPT-4 retrieval
  'ChatGPT-User',    // OpenAI — ChatGPT browsing plugin
  'OAI-SearchBot',   // OpenAI — SearchGPT
  'ClaudeBot',       // Anthropic — Claude web search
  'anthropic-ai',    // Anthropic — general crawler
  'PerplexityBot',   // Perplexity AI
  'YouBot',          // You.com
  'Google-Extended', // Google — Gemini / AI Overviews training
  'Gemini',          // Google Gemini
  'Bytespider',      // ByteDance / TikTok
  'FacebookBot',     // Meta AI
  'Applebot',        // Apple AI features
  'cohere-ai',       // Cohere
  'AI2Bot',          // Allen Institute for AI
]

/**
 * Checks whether the incoming request comes from a known AI agent.
 */
function isAIAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  return AI_BOTS.some(bot => ua.includes(bot.toLowerCase()))
}

/**
 * Checks whether the path is already an ARA file (avoid redirect loops).
 */
function isARAPath(pathname: string): boolean {
  return pathname.startsWith('/.well-known/ara')
}

export function middleware(request: NextRequest): NextResponse {
  const ua = request.headers.get('user-agent') ?? ''
  const { pathname } = request.nextUrl

  // Don't redirect if already on an ARA path
  if (isARAPath(pathname)) {
    return NextResponse.next()
  }

  // AI agent detected — serve the ARA digest directly
  // The digest.md is a ~300-token LLM-optimized summary.
  // Instead of parsing 50k tokens of HTML, the agent reads one compact file.
  if (isAIAgent(ua)) {
    const digestUrl = new URL('/.well-known/ara/digest.md', request.url)
    return NextResponse.redirect(digestUrl, {
      status: 302,
      headers: {
        'X-ARA-Redirect': 'ai-agent-detected',
        'X-ARA-Manifest': '/.well-known/ara/manifest.json',
      },
    })
  }

  // All other requests — add ARA discovery headers
  // These headers let any agent discover the ARA manifest without prior knowledge.
  const response = NextResponse.next()
  response.headers.set(
    'Link',
    '</.well-known/ara/manifest.json>; rel="ara-manifest", </.well-known/ara/digest.md>; rel="ara-digest"'
  )
  response.headers.set('X-ARA-Manifest', '/.well-known/ara/manifest.json')
  response.headers.set('X-ARA-Version', '1.0')

  return response
}

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
