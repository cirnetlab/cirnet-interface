import './scripts/utilities/environment.mjs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { lstatSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { devProxyDiagnostics } from './scripts/utilities/dev-proxy-diagnostics'
const apiTarget=process.env.CIRNET_DEV_API_TARGET || 'http://127.0.0.1:8000'

export default defineConfig(async ({ command, isPreview }) => {
  // Candidate builds stage Interface inside their owned session and keep the packaging layout.
  const external = (command === 'build' || isPreview) && process.env.CIRNET_LOCAL_STORAGE_ROOT !== undefined && existsSync('.git')
  let outDir: string | undefined
  if (external) {
    if (process.argv.some(arg => /^--outDir(?:=|$)/.test(arg))) {
      throw new Error('Use the owned Interface artifact session for build and preview output.')
    }
    const artifacts = await import('./scripts/utilities/artifact-paths.mjs')
    outDir = isPreview ? artifacts.getExistingArtifactDirectory('dist') : artifacts.getArtifactDirectory('dist')
    if (isPreview && !lstatSync(join(outDir!, 'index.html'), { throwIfNoEntry: false })?.isFile()) {
      throw new Error('The selected artifact session has no completed Interface build. Build in that session before previewing.')
    }
  }
  return {
  plugins: [vue(), devProxyDiagnostics(), ...(outDir ? [{
    name: 'cirnet-owned-dist',
    configResolved(config: import('vite').ResolvedConfig) {
      if (resolve(config.root, config.build.outDir) !== outDir) {
        throw new Error('The resolved Vite output differs from the owned Interface artifact directory.')
      }
    },
  }] : [])],
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
