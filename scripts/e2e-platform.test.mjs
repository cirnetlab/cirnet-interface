import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {createServer} from 'node:http'
import {writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'

test('the native platform server owns a free loopback port and never proxies the Remote API', async (t) => {
  const {startPlatformServer} = await import('./e2e-platform.mjs')
  const {getArtifactDirectory} = await import('./artifact-paths.mjs')
  const errors = t.mock.method(console, 'error')
  const root = getArtifactDirectory('platform-server-regression/source')
  await writeFile(join(root, 'fixture.html'), '<!doctype html><title>Platform fixture</title>')
  await writeFile(join(root, 'vite.config.mjs'), 'throw new Error("Product proxy config was loaded")')
  let upstreamCalls = 0
  const upstream = createServer((request, response) => { upstreamCalls++; response.end('Remote') })
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve))
  const previous = process.env.CIRNET_DEV_API_TARGET
  process.env.CIRNET_DEV_API_TARGET = `http://127.0.0.1:${upstream.address().port}`
  let first, second
  try {
    first = await startPlatformServer(root, getArtifactDirectory('platform-server-regression/cache-a'))
    second = await startPlatformServer(root, getArtifactDirectory('platform-server-regression/cache-b'))
    assert.match(first.origin, /^http:\/\/127\.0\.0\.1:[1-9]\d*$/)
    assert.notEqual(first.origin, second.origin)
    assert.match(await (await fetch(first.origin + '/fixture.html')).text(), /Platform fixture/)
    for (const path of ['/api/auth/session', '/ws/events', '/missing.html']) {
      assert.equal((await fetch(first.origin + path)).status, 404)
    }
    assert.equal(upstreamCalls, 0)
    assert.equal(errors.mock.callCount(), 0, 'Vite must not attempt to bind a separate WebSocket listener')
  } finally {
    if (previous === undefined) delete process.env.CIRNET_DEV_API_TARGET
    else process.env.CIRNET_DEV_API_TARGET = previous
    await Promise.all([first?.server.close(), second?.server.close(), new Promise(resolve => upstream.close(resolve))])
  }
})

test('the native platform launcher rejects config and last-run file overrides before allocating', () => {
  const launcher = fileURLToPath(new URL('./e2e.mjs', import.meta.url))
  const environment = {...process.env, CIRNET_ARTIFACTS_SESSION: 'invalid-session-for-config-guard',
    NETCIRCUIT_ARTIFACTS_SESSION: 'invalid-session-for-config-guard'}
  for (const args of [['--config', 'playwright.config.ts'], ['--config=playwright.config.ts'],
    ['-c', 'playwright.config.ts'], ['-cplaywright.config.ts'], ['-xcplaywright.config.ts'],
    ['-xxcplaywright.config.ts'], ['--last-failed-file', 'outside.json'], ['--last-failed-file=outside.json']]) {
    const result = spawnSync(process.execPath, [launcher, 'test-platform', ...args], {env: environment, encoding: 'utf8'})
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /The native platform suite owns its Playwright config/, args.join(' '))
  }
})

test('the packaged browser lane rejects a non-package origin before copying a browser', () => {
  const launcher = fileURLToPath(new URL('./e2e.mjs', import.meta.url))
  const environment = {
    ...process.env,
    CIRNET_E2E_API_TARGET: 'http://127.0.0.1:8000',
    CIRNET_ARTIFACTS_SESSION: 'invalid-session-for-packaged-origin-guard',
    NETCIRCUIT_ARTIFACTS_SESSION: 'invalid-session-for-packaged-origin-guard',
  }
  const result = spawnSync(process.execPath, [launcher, 'test-packaged'], {env: environment, encoding: 'utf8'})
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Packaged browser tests require http:\/\/127\.0\.0\.1:14173/)
})

