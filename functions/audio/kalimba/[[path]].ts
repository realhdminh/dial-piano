/** Edge proxy: same-origin kalimba samples, no Referer to upstream, no static storage. */
import type { PagesFunction } from '@cloudflare/workers-types'

const UPSTREAM_BASE = 'https://middleearmedia.com/kalimba/assets/sounds/kalimba/'

const SAFE_FILENAME = /^[a-p]_kalimba_[a-z0-9]+\.wav$/i

export const onRequest: PagesFunction = async ({ params }) => {
  const raw = params.path
  const filename = Array.isArray(raw) ? raw.join('/') : raw
  if (!filename || !SAFE_FILENAME.test(filename)) {
    return new Response('Not found', { status: 404 })
  }

  const upstream = await fetch(`${UPSTREAM_BASE}${filename}`, {
    headers: { Accept: 'audio/*,*/*' },
    cf: { cacheTtl: 31536000, cacheEverything: true },
  })

  if (!upstream.ok) {
    return new Response('Upstream unavailable', { status: upstream.status })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'audio/wav',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
