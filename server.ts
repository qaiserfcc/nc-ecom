import { createServer } from 'http'
import { parse } from 'url'
import { AsyncLocalStorage } from 'node:async_hooks'
import { initSocketServer } from './lib/socket-server'
import { initDatabaseListener } from './lib/db-listener'

;(globalThis as any).AsyncLocalStorage ??= AsyncLocalStorage

async function main() {
  const next = (await import('next')).default

  const dev = process.env.NODE_ENV !== 'production'
  const hostname = 'localhost'
  const port = parseInt(process.env.PORT || '3000', 10)

  const app = next({ dev, hostname, port })
  const handle = app.getRequestHandler()

  await app.prepare()

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO server
  initSocketServer(server)

  // Initialize database notification listener
  initDatabaseListener().catch(console.error)

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Socket.IO ready on ws://${hostname}:${port}/api/socket`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
