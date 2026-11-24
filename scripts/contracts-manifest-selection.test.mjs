import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {execFileSync, spawnSync} from 'node:child_process'
import {copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'
import {checkedManifestFile} from './contracts-artifacts.mjs'

const product = resolve(fileURLToPath(new URL('..', import.meta.url)))
const allocator = await import('./artifact-paths.mjs')

test('an explicit artifact manifest cannot be bypassed by a matching cached file', () => {
  const fixture = mkdtempSync(resolve(allocator.getArtifactDirectory('manifest-selection-regression'), 'case-'))
  for (const name of ['scripts', 'integration', '.artifacts']) mkdirSync(resolve(fixture, name))
  for (const name of ['bootstrap-contracts.mjs', 'contracts-artifacts.mjs', 'environment.mjs']) {
    copyFileSync(resolve(product, 'scripts', name), resolve(fixture, 'scripts', name))
  }
  const bytes = Buffer.from('a cached artifact, not a valid package')
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  writeFileSync(resolve(fixture, '.artifacts', 'dev.tgz'), bytes)
  writeFileSync(resolve(fixture, 'integration/contracts-artifacts.json'), JSON.stringify({
    dev_npm: {filename: 'dev.tgz', sha256},
  }))
  const manifest = resolve(fixture, 'manifest.json')
  const run = selected => {
    writeFileSync(manifest, JSON.stringify({dev_npm: selected}))
    return spawnSync(process.execPath, [resolve(fixture, 'scripts/bootstrap-contracts.mjs'), '--manifest', manifest], {
      encoding: 'utf8', windowsHide: true,
    })
  }

  const wrongDigest = run({path: resolve(fixture, 'missing.tgz'), sha256: '0'.repeat(64)})
  assert.equal(wrongDigest.status, 1, wrongDigest.stdout + wrongDigest.stderr)
  assert.match(wrongDigest.stderr, /Manifest dev_npm differs/)

  const missingFile = run({path: resolve(fixture, 'missing.tgz'), sha256})
  assert.equal(missingFile.status, 1, missingFile.stdout + missingFile.stderr)
  assert.match(missingFile.stderr, /ENOENT/)

  const relativeFile = run({path: 'dev.tgz', sha256})
  assert.equal(relativeFile.status, 1, relativeFile.stdout + relativeFile.stderr)
  assert.match(relativeFile.stderr, /absolute artifact paths/)

  const directory = run({path: fixture, sha256})
  assert.equal(directory.status, 1, directory.stdout + directory.stderr)
  assert.match(directory.stderr, /regular files/)

  const aliased = resolve(fixture, '.artifacts')
  assert.throws(() => checkedManifestFile(resolve(aliased, 'dev.tgz'), path =>
    path === aliased ? {isSymbolicLink: () => true} : lstatSync(path)), /symlink|alias/i)
})

test('manifest selection verifies SDK and resource entries even with valid cached packages', () => {
  const fixture = mkdtempSync(resolve(allocator.getArtifactDirectory('manifest-selection-regression'), 'case-'))
  for (const name of ['scripts', 'integration', '.artifacts']) mkdirSync(resolve(fixture, name))
  for (const name of ['bootstrap-contracts.mjs', 'contracts-artifacts.mjs', 'environment.mjs']) {
    copyFileSync(resolve(product, 'scripts', name), resolve(fixture, 'scripts', name))
  }
  const canonical = resolve(product, 'node_modules/@cirnet/artifact-paths/cirnet_artifact_paths/artifact-paths.mjs')
  const nodeBytes = readFileSync(canonical)
  const hash = bytes => createHash('sha256').update(bytes).digest('hex')

  const archive = (name, metadata, includeAllocator = false) => {
    const staging = resolve(fixture, name, 'package')
    mkdirSync(staging, {recursive: true})
    writeFileSync(resolve(staging, 'package.json'), JSON.stringify(metadata))
    if (includeAllocator) {
      mkdirSync(resolve(staging, 'cirnet_artifact_paths'))
      writeFileSync(resolve(staging, 'cirnet_artifact_paths/artifact-paths.mjs'), nodeBytes)
    }
    const path = resolve(fixture, `${name}.tgz`)
    execFileSync('tar', ['-czf', path, '-C', resolve(fixture, name), 'package'], {windowsHide: true})
    return {path, sha256: hash(readFileSync(path))}
  }
  const dev = archive('dev', {name: '@cirnet/artifact-paths', version: '0.3.0-dev.1'}, true)
  const sdk = archive('sdk', {name: '@cirnet/contracts', version: '0.3.0-dev.1'})
  const resourceName = 'cirnet-contracts-native-0.3.0-dev.1'
  const crateRoot = resolve(fixture,'resources',resourceName)
  mkdirSync(crateRoot,{recursive:true})
  writeFileSync(resolve(crateRoot,'Cargo.toml'),'[package]\nname = "cirnet-contracts-native"\n')
  const cratePath = resolve(fixture,'resources.crate')
  execFileSync('tar',['-czf',cratePath,'-C',dirname(crateRoot),resourceName],{windowsHide:true})
  const resources = {path:cratePath,sha256:hash(readFileSync(cratePath))}
  const openapiPath = resolve(fixture,'openapi.json')
  writeFileSync(openapiPath, JSON.stringify({openapi:'3.1.0',paths:{}}))
  const openapi = {path:openapiPath,sha256:hash(readFileSync(openapiPath))}
  const entries = {dev_npm: dev, npm: sdk, native_crate: resources, remote_openapi: openapi}
  const lock = {
    contractsVersion: '0.3.0-dev.1', status: 'TEST_FIXTURE',
    dev_npm: {name: '@cirnet/artifact-paths', version: '0.3.0-dev.1', filename: 'dev.tgz', sha256: dev.sha256, nodeSha256: hash(nodeBytes)},
    npm: {name: '@cirnet/contracts', version: '0.3.0-dev.1', filename: 'sdk.tgz', sha256: sdk.sha256},
    native_crate: {name:'cirnet-contracts-native',version:'0.3.0-dev.1',filename:'resources.crate',sha256:resources.sha256},
    remote_openapi: {filename:'openapi.json',sha256:openapi.sha256},
  }
  writeFileSync(resolve(fixture, 'integration/contracts-artifacts.json'), JSON.stringify(lock))
  for (const [key, value] of Object.entries(entries)) copyFileSync(value.path, resolve(fixture, '.artifacts', lock[key].filename))
  const manifest = resolve(fixture, 'manifest.json')
  const run = selected => {
    writeFileSync(manifest, JSON.stringify(selected))
    return spawnSync(process.execPath, [resolve(fixture, 'scripts/bootstrap-contracts.mjs'), '--manifest', manifest], {
      encoding: 'utf8', windowsHide: true,
    })
  }
  const valid = run(entries)
  assert.equal(valid.status, 0, valid.stdout + valid.stderr)

  for (const key of ['npm', 'native_crate', 'remote_openapi']) {
    const wrong = run({...entries, [key]: {...entries[key], sha256: '0'.repeat(64)}})
    assert.equal(wrong.status, 1, wrong.stdout + wrong.stderr)
    assert.match(wrong.stderr, new RegExp(`Manifest ${key} differs`))
  }
  const missing = run({...entries, npm: {...sdk, path: resolve(fixture, 'missing-sdk.tgz')}})
  assert.equal(missing.status, 1, missing.stdout + missing.stderr)
  assert.match(missing.stderr, /ENOENT/)

  const corrupt = resolve(fixture, 'corrupt-resources.tgz')
  writeFileSync(corrupt, 'not the selected resource archive')
  const wrongBytes = run({...entries, native_crate: {...resources, path: corrupt}})
  assert.equal(wrongBytes.status, 1, wrongBytes.stdout + wrongBytes.stderr)
  assert.match(wrongBytes.stderr, /SHA256/)
})
