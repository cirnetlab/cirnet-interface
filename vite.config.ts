import './scripts/utilities/environment.mjs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { devProxyDiagnostics } from './scripts/utilities/dev-proxy-diagnostics'
const apiTarget=process.env.CIRNET_DEV_API_TARGET || 'http://127.0.0.1:8000'

export default defineConfig(async ({ command }) => {
  // Candidate builds stage Interface inside their owned session and keep the packaging layout.
  const external = command === 'build' && process.env.CIRNET_LOCAL_STORAGE_ROOT !== undefined && existsSync('.git')
  const outDir = external ? (await import('./scripts/utilities/artifact-paths.mjs')).getArtifactDirectory('dist') : undefined
  return {
  plugins: [vue(), devProxyDiagnostics()],
  // Windows linked worktrees can allow normal reads while native realpath fails.
  // Keep module resolution in this checkout's declared path on that platform.
  resolve: { preserveSymlinks: process.platform === 'win32' },
  build: { outDir, ...(outDir && { emptyOutDir: true }), rollupOptions: { input: {
    main:fileURLToPath(new URL('./index.html',import.meta.url)),
    oscilloscope:fileURLToPath(new URL('./oscilloscope-preview.html',import.meta.url)),
    generator:fileURLToPath(new URL('./function-generator-preview.html',import.meta.url))
  } } },
  server: {
    watch: { ignored:['**/.test-build/**','**/.runtime/**'] },
    proxy: {
      '/api': apiTarget,
      '/ws': { target: apiTarget.replace(/^http/, 'ws'), ws: true }
    }
  }
  }
})
