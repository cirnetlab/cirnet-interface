import { build } from 'esbuild'
import { readdir, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { posix, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { realpathSync } from 'node:fs'

async function discoverTests(directory, suffix) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) files.push(...await discoverTests(path, suffix))
    else if (entry.isFile() && entry.name.endsWith(suffix)) files.push(path)
  }
  return files
}

function selectTests(files, selectors) {
  const selected = new Set()
  for (const selector of selectors) {
    const path = posix.normalize(selector.replaceAll('\\', '/'))
    const matches = files.filter(file => file === path || file.slice(file.indexOf('/') + 1) === path
      || (!path.includes('/') && posix.basename(file) === path))
    if (matches.length === 0) throw new Error(`No matching test for ${JSON.stringify(selector)}.`)
    if (matches.length > 1) throw new Error(`Ambiguous test selector ${JSON.stringify(selector)}. Use one of: ${matches.join(', ')}.`)
    selected.add(matches[0])
  }
  return selected
}

function runTests(args) {
  const result = spawnSync(process.execPath, ['--test', ...args], { stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const arguments_ = process.argv.slice(2)
const allScriptTests = arguments_.includes('--all-script-tests')
const selectors = arguments_.filter(argument => argument !== '--all-script-tests')
const unitFiles = existsSync('tests') ? (await discoverTests('tests', '.test.ts')).sort() : []
const scriptFiles = (allScriptTests || selectors.length) && existsSync('scripts')
  ? (await discoverTests('scripts', '.test.mjs')).sort()
  : []
const selected = selectTests([...unitFiles, ...scriptFiles], selectors)
const files = selectors.length ? unitFiles.filter(file => selected.has(file)) : unitFiles
const selectedScripts = scriptFiles.filter(file => selected.has(file))
const localProject = realpathSync(process.cwd()) === realpathSync(fileURLToPath(new URL('..', import.meta.url)))
const productContracts = existsSync(resolve('src/contracts/structural.ts'))
const contractProfiles = resolve('tests/helpers/contractProfiles.ts')
const defaultScripts = productContracts && (!selectors.length || files.length)
  ? ['scripts/contracts/contracts-consumer.test.mjs', 'scripts/contracts/contracts-bootstrap.test.mjs']
  : []
const scripts = allScriptTests ? scriptFiles : [...new Set([...defaultScripts, ...selectedScripts])]

if (!files.length && !scripts.length) throw new Error('No matching tests.')
if (files.length && productContracts && !existsSync(contractProfiles)) {
  throw new Error('Product tests require the offline contract profile preparation helper.')
}
const output = localProject
  ? (await import('./utilities/artifact-paths.mjs')).getArtifactDirectory('interface-tests')
  : resolve('.test-build')
if (localProject) {
  process.env.CIRNET_INTERFACE_TEST_OUTPUT = output
  const scratch = resolve(output, 'tmp')
  await mkdir(scratch, { recursive: true })
  Object.assign(process.env, { TEMP: scratch, TMP: scratch, TMPDIR: scratch })
  const preload = new URL('./verification/test-module-resolution.mjs', import.meta.url)
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--import=' + preload.href].filter(Boolean).join(' ')
}
if (scripts.length) runTests(scripts)
if (!files.length) process.exit(0)

// The generic batching harness also runs isolated fixture projects. Only the
// real product has synchronous validators that need a prepared test workflow.
const workflowPlugins=productContracts?[{name:'unit-contract-workflow',setup(builder){
  builder.onLoad({filter:/\.test\.ts$/},async args=>({contents:`import ${JSON.stringify(contractProfiles.replaceAll('\\','/'))}\n${await readFile(args.path,'utf8')}`,loader:'ts'}))
}}]:[]
// Inline source maps repeat the large geometry/catalog modules in each bundle.
// Bound both compilation and runtime workers independently of the host CPU count.
const buildBatchSize = 8
const testConcurrency = 2
await mkdir(output, { recursive: true })
for (let offset = 0; offset < files.length; offset += buildBatchSize) {
  const batch = files.slice(offset, offset + buildBatchSize)
  console.log(JSON.stringify({ phase: 'build-tests', files: batch.length, completed: offset, total: files.length }))
  await build({
    entryPoints: batch,
    outbase: 'tests',
    outdir: output,
    outExtension: { '.js': '.mjs' },
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    plugins:workflowPlugins,
    sourcemap: 'inline',
  })
}
console.log(JSON.stringify({ phase: 'run-tests', files: files.length, concurrency: testConcurrency }))
const bundles = files.map(file => resolve(output, file.slice('tests/'.length, -'.ts'.length) + '.mjs'))
runTests([`--test-concurrency=${testConcurrency}`, ...bundles])
