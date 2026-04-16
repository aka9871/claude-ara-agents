/**
 * ARA Cloudflare Worker
 *
 * Deploy this as a Cloudflare Worker to intercept ALL requests to your domain
 * before they reach your origin server. Works with any tech stack.
 *
 * Setup:
 *   1. Go to Cloudflare Dashboard → Workers → Create Worker
 *   2. Paste this code
 *   3. Set route: yourdomain.com/*
 *   4. Deploy
 *
 * What it does:
 *   - Detects AI agent User-Agents at the edge (zero latency overhead)
 *   - Serves /.well-known/ara/digest.md to AI crawlers
 *   - Adds ARA discovery headers to every response
 *   - Logs AI bot visits (optional — see KV storage section)
 */

// ── Known AI agent User-Agent strings ─────────────────────────────────────────
const AI_BOTS = [
  'gptbot',
  'chatgpt-user',
  'oai-searchbot',
  'claudebot',
  'anthropic-ai',
  'perplexitybot',
  'youbot',
  'google-extended',
  'gemini',
  'bytespider',
  'facebookbot',
  'applebot',
  'cohere-ai',
  'ai2bot',
]

// ── ARA headers added to every response ───────────────────────────────────────
const ARA_HEADERS = {
  'Link': '</.well-known/ara/manifest.json>; rel="ara-manifest", </.well-known/ara/digest.md>; rel="ara-digest"',
  'X-ARA-Manifest': '/.well-known/ara/manifest.json',
  'X-ARA-Version': '1.0',
}

function isAIBot(userAgent) {
  const ua = (userAgent || '').toLowerCase()
  return AI_BOTS.some(bot => ua.includes(bot))
}

function isARAPath(pathname) {
  return pathname.startsWith('/.well-known/ara')
}

async function handleRequest(request) {
  const url = new URL(request.url)
  const ua = request.headers.get('User-Agent') || ''

  // Pass through ARA paths without modification
  if (isARAPath(url.pathname)) {
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)
    Object.entries(ARA_HEADERS).forEach(([k, v]) => newResponse.headers.set(k, v))
    return newResponse
  }

  // AI agent detected — redirect to ARA digest
  if (isAIBot(ua)) {
    const digestUrl = new URL('/.well-known/ara/digest.md', request.url)

    // Optional: log AI bot visit to KV storage for analytics
    // await ARA_ANALYTICS.put(`visit:${Date.now()}`, JSON.stringify({
    //   bot: ua,
    //   path: url.pathname,
    //   timestamp: new Date().toISOString()
    // }), { expirationTtl: 86400 * 30 })

    return Response.redirect(digestUrl.href, 302)
  }

  // Normal request — fetch from origin and add ARA headers
  const response = await fetch(request)
  const newResponse = new Response(response.body, response)
  Object.entries(ARA_HEADERS).forEach(([k, v]) => newResponse.headers.set(k, v))

  return newResponse
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
