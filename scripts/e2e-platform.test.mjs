import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {createServer} from 'node:http'
import {readFileSync} from 'node:fs'
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

test('Interface CI runs the separate native browser suite through the pinned launcher', () => {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const workflow = readFileSync(new URL('../.github/workflows/frontend.yml', import.meta.url), 'utf8')
  assert.equal(packageJson.scripts['test:e2e:platform'], 'node scripts/e2e.mjs test-platform')
  const [product, platform] = workflow.split(/^  platform:\r?$/m)
  assert.ok(platform, 'Run the native gate in a separate job')
  assert.doesNotMatch(product, /npm run test:e2e:platform/)
  assert.doesNotMatch(platform, /secrets\./)
  const bootstrap = platform.indexOf('node scripts/bootstrap-contracts.mjs')
  const dependencies = platform.indexOf('*interface-locked-install')
  const chromium = platform.indexOf('npm run test:e2e:install -- --with-deps')
  const run = platform.indexOf('npm run test:e2e:platform -- --forbid-only')
  const report = platform.indexOf('uses: actions/upload-artifact@v4')
  assert.ok(bootstrap > platform.indexOf('*interface-node') && platform.includes('*interface-node'))
  assert.ok(bootstrap < dependencies && dependencies < chromium && chromium < run)
  assert.ok(run < report && report < platform.indexOf('*interface-cleanup'))
  assert.match(platform, /if: failure\(\) && steps\.native-platform\.outcome == 'failure'/)
})
