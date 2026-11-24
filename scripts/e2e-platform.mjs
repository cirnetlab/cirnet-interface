import {once} from 'node:events'
import {createServer} from 'node:http'
import {createServer as createViteServer} from 'vite'

/** Serve only the browser fixtures and their real Interface modules. */
export async function startPlatformServer(root, cacheDir) {
  const vite = await createViteServer({
    root, cacheDir, configFile: false, envDir: false, appType: 'mpa',
    server: {middlewareMode: true, hmr: false, ws: false, fs: {allow: [root]}},
  })
  const http = createServer(vite.middlewares)
  const close = async () => {
    try {
      if (http.listening) await new Promise((resolve, reject) => http.close(error => error ? reject(error) : resolve()))
    } finally {
      await vite.close()
    }
  }
  try {
    // Vite's own listen method interprets port zero as its default port.
    const listening = once(http, 'listening')
    http.listen(0, '127.0.0.1')
    await listening
    const address = http.address()
    if (!address || typeof address === 'string' || address.address !== '127.0.0.1' || !address.port) {
      throw new Error('The browser platform fixture must listen on an owned loopback port.')
    }
    return {server: {close}, origin: `http://127.0.0.1:${address.port}`}
  } catch (error) {
    await close()
    throw error
  }
}
