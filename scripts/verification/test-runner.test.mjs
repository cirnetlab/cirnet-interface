import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const runner = fileURLToPath(new URL('../test.mjs', import.meta.url))

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'cirnet-interface-test-runner-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const [relativePath, label] of Object.entries(files)) {
    const file = join(root, relativePath)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `import { test } from 'node:test'\ntest(${JSON.stringify(label)}, () => {})\n`)
  }
  return {
    root,
    run(...args) {
      const env = { ...process.env }
      delete env.NODE_TEST_CONTEXT
      delete env.CIRNET_INTERFACE_TEST_OUTPUT
      const result = spawnSync(process.execPath, [runner, ...args], { cwd: root, env, encoding: 'utf8' })
      return { status: result.status, output: result.stdout + result.stderr }
    },
  }
}

const unitFiles = {
  'tests/alpha/shared.test.ts': 'alpha fixture',
  'tests/beta/shared.test.ts': 'beta fixture',
  'tests/alpha/unique.test.ts': 'unique fixture',
}

test('discovers nested unit tests and preserves colliding bundle paths', t => {
  const { root, run } = fixture(t, unitFiles)
  const result = run()
  assert.equal(result.status, 0, result.output)
  assert.match(result.output, /alpha fixture/)
  assert.match(result.output, /beta fixture/)
  assert.ok(existsSync(join(root, '.test-build/alpha/shared.test.mjs')))
  assert.ok(existsSync(join(root, '.test-build/beta/shared.test.mjs')))
})

test('selects unit tests by path or unique legacy filename', t => {
  const { run } = fixture(t, unitFiles)
  const result = run('tests\\alpha\\shared.test.ts', 'unique.test.ts')
  assert.equal(result.status, 0, result.output)
  assert.match(result.output, /alpha fixture/)
  assert.match(result.output, /unique fixture/)
  assert.doesNotMatch(result.output, /beta fixture/)
})

test('rejects ambiguous basenames and unmatched selectors', t => {
  const { run } = fixture(t, unitFiles)
  const ambiguous = run('shared.test.ts')
  assert.equal(ambiguous.status, 1, ambiguous.output)
  assert.match(ambiguous.output, /Ambiguous test selector/)
  assert.match(ambiguous.output, /tests\/alpha\/shared\.test\.ts/)
  assert.match(ambiguous.output, /tests\/beta\/shared\.test\.ts/)

  const missing = run('alpha/shared.test.ts', 'missing.test.ts')
  assert.equal(missing.status, 1, missing.output)
  assert.match(missing.output, /No matching test.*missing\.test\.ts/)
  assert.doesNotMatch(missing.output, /alpha fixture/)
})

test('discovers nested script tests and supports a script-only selection', t => {
  const { run } = fixture(t, {
    'tests/example.test.ts': 'unit fixture',
    'scripts/alpha/example.test.mjs': 'alpha script fixture',
    'scripts/beta/example.test.mjs': 'beta script fixture',
  })
  const all = run('--all-script-tests')
  assert.equal(all.status, 0, all.output)
  assert.match(all.output, /alpha script fixture/)
  assert.match(all.output, /beta script fixture/)
  assert.match(all.output, /unit fixture/)

  const selected = run('scripts/beta/example.test.mjs')
  assert.equal(selected.status, 0, selected.output)
  assert.match(selected.output, /beta script fixture/)
  assert.doesNotMatch(selected.output, /alpha script fixture|unit fixture/)
})

test('keeps the default Contracts checks when selecting a product unit test', t => {
  const { root, run } = fixture(t, {
    'tests/alpha/example.test.ts': 'product unit fixture',
    'scripts/contracts/contracts-consumer.test.mjs': 'contracts consumer fixture',
    'scripts/contracts/contracts-bootstrap.test.mjs': 'contracts bootstrap fixture',
    'scripts/verification/extra.test.mjs': 'optional script fixture',
  })
  mkdirSync(join(root, 'src/contracts'), { recursive: true })
  mkdirSync(join(root, 'tests/helpers'), { recursive: true })
  writeFileSync(join(root, 'src/contracts/structural.ts'), '')
  writeFileSync(join(root, 'tests/helpers/contractProfiles.ts'), '')

  const result = run('alpha/example.test.ts')
  assert.equal(result.status, 0, result.output)
  assert.match(result.output, /contracts consumer fixture/)
  assert.match(result.output, /contracts bootstrap fixture/)
  assert.match(result.output, /product unit fixture/)
  assert.doesNotMatch(result.output, /optional script fixture/)
})
