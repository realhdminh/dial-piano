import type { Plugin } from 'vite'

const UPSTREAM_BASE = 'https://middleearmedia.com/kalimba/assets/sounds/kalimba/'
const SAFE_FILENAME = /^[a-p]_kalimba_[a-z0-9]+\.wav$/i

/** Dev-only same-origin proxy for kalimba samples (mirrors functions/audio/kalimba). */
export function kalimbaDevProxy(): Plugin {
  return {
    name: 'kalimba-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/audio/kalimba/')) {
          next()
          return
        }

        const filename = url.slice('/audio/kalimba/'.length).split('?')[0] ?? ''
        if (!SAFE_FILENAME.test(filename)) {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        try {
          const upstream = await fetch(`${UPSTREAM_BASE}${filename}`)
          if (!upstream.ok) {
            res.statusCode = upstream.status
            res.end(`Upstream ${upstream.status}`)
            return
          }

          const body = Buffer.from(await upstream.arrayBuffer())
          res.statusCode = 200
          res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'audio/wav')
          res.setHeader('Cache-Control', 'public, max-age=31536000')
          res.end(body)
        } catch (error) {
          console.error('[kalimba-dev-proxy]', error)
          res.statusCode = 502
          res.end('Proxy failed')
        }
      })
    },
  }
}
