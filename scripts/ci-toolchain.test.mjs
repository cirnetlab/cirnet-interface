import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

test('CI selects Node 26 before bootstrapping the allocator or installing packages',()=>{
  const workflow=readFileSync(new URL('../.github/workflows/frontend.yml',import.meta.url),'utf8')
  const steps=workflow.split(/^      - /m).slice(1)
  const node=steps.flatMap((step,index)=>step.startsWith('uses: actions/setup-node@')?[index]:[])
  const bootstrap=steps.findIndex(step=>step.includes('run: node scripts/bootstrap-contracts.mjs'))
  const install=steps.findIndex(step=>step.includes('run: npm ci'))
  assert.equal(node.length,1,'CI must explicitly select one Node toolchain')
  assert.ok(node[0]<bootstrap&&bootstrap<install,'select Node before allocator bootstrap and npm ci')
  assert.match(steps[node[0]],/^          node-version: ['"]26['"]\r?$/m)
})
