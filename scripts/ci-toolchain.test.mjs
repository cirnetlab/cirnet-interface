import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const workflow = readFileSync(new URL('../.github/workflows/native-interface.yml', import.meta.url), 'utf8')
const steps = workflow.split(/^      - /m).slice(1)

test('Interface CI selects the pinned Node toolchain before preparing either SDK path', () => {
  const nodeSteps = steps.filter(step => step.startsWith('uses: actions/setup-node@'))
  assert.equal(nodeSteps.length, 1)
  assert.match(nodeSteps[0], /^          node-version: 26\.12\.1\s*$/m)
  const names = [
    'Build verified inputs from pinned sources',
    'Verify inputs from the reviewed Remote candidate',
    'Bootstrap the selected Interface inputs',
    'Verify Interface and build static output',
    'Verify Chromium platform behavior',
  ]
  let previous = steps.indexOf(nodeSteps[0])
  for (const name of names) {
    const index = steps.findIndex(step => step.split(/\r?\n/, 1)[0] === `name: ${name}`)
    assert.ok(index > previous, `Unexpected CI step order for "${name}"`)
    previous = index
  }
})

test('Interface CI builds and verifies with locked Node dependencies', () => {
  assert.doesNotMatch(workflow, /setup-python|build_release\.py/)
  const build = steps.find(step => step.startsWith('name: Verify Interface and build static output'))
  assert.ok(build)
  assert.match(build, /npm\.cmd ci --ignore-scripts/)
  assert.match(build, /npm\.cmd test -- --all-script-tests/)
  assert.match(build, /npm\.cmd run build/)
  const chromium = steps.find(step => step.startsWith('name: Verify Chromium platform behavior'))
  assert.ok(chromium)
  assert.match(chromium, /node node_modules\/@playwright\/test\/cli\.js install chromium/)
})
