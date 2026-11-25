import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync,mkdtempSync} from 'node:fs'
import {resolve} from 'node:path'
import {spawnSync} from 'node:child_process'
import {build} from 'esbuild'
import {getArtifactDirectory,cleanupArtifactSession} from '@cirnet/artifact-paths'
import {verifyBytes,archiveEntry,root,lock,cachedSelection} from './contracts-artifacts.mjs'
import {readContractsResource} from './contracts-resources.mjs'

test('the product profile selects the current native generation and no release download',()=>{
  assert.equal(lock.contractsVersion,'0.3.0-dev.1')
  assert.equal(lock.native_crate.filename,'cirnet-contracts-native-0.3.0-dev.1.crate')
  assert.deepEqual(Object.keys(cachedSelection()).sort(),['dev_npm','native_crate','npm','remote_openapi'])
  for(const entry of [lock.native_crate,lock.npm,lock.dev_npm])assert.equal(entry.url,undefined)
})
test('resource consumers reject unapproved member names and altered release bytes',()=>{
  assert.throws(()=>readContractsResource('../contracts/private-schema'),/Unknown released/)
  assert.throws(()=>verifyBytes(Buffer.from('altered'),cachedSelection().native_crate.sha256),/SHA256/)
  assert.throws(()=>verifyBytes(Buffer.from('altered'),'not-a-digest'),/SHA256/)
})
test('bundled resource readers have no bootstrap CLI side effects',async()=>{
  const outfile=resolve(root,'.test-build/contracts/resources-only.mjs')
  await build({stdin:{contents:"import {readContractsResource} from './scripts/contracts/contracts-resources.mjs';readContractsResource('physical-hc08-led');console.log('RESOURCE_ONLY')",resolveDir:root,loader:'js'},outfile,bundle:true,platform:'node',format:'esm',packages:'external'})
  const result=spawnSync(process.execPath,[outfile,'--resource-only-probe'],{encoding:'utf8',cwd:root,windowsHide:true})
  assert.equal(result.status,0,result.stderr+result.stdout)
  assert.equal(result.stdout.trim(),'RESOURCE_ONLY')
  assert.equal(result.stderr,'')
})
test('a release failure publishes ownership and supports cleanup before npm installation',()=>{
  const fixture=mkdtempSync(resolve(getArtifactDirectory('bootstrap-failure-regression'),'case-'))
  mkdirSync(resolve(fixture,'scripts'));mkdirSync(resolve(fixture,'integration'))
  for(const path of ['scripts/bootstrap-contracts.mjs','scripts/contracts/contracts-artifacts.mjs','scripts/utilities/environment.mjs']){
    const target=resolve(fixture,path)
    mkdirSync(resolve(target,'..'),{recursive:true})
    writeFileSync(target,readFileSync(resolve(root,path)))
  }
  writeFileSync(resolve(fixture,'integration/contracts-artifacts.json'),JSON.stringify(lock))
  const manifestPath=resolve(fixture,'manifest.json'),githubEnv=resolve(fixture,'github-env')
  writeFileSync(manifestPath,JSON.stringify({dev_npm:{path:resolve(root,'.artifacts',lock.dev_npm.filename),sha256:cachedSelection().dev_npm.sha256},npm:{path:resolve(fixture,'missing.tgz')}}))
  const sessions=resolve(fixture,'sessions'),environment={...process.env,CIRNET_ARTIFACTS_DIR:sessions}
  delete environment.CIRNET_ARTIFACTS_SESSION
  delete environment.NETCIRCUIT_ARTIFACTS_SESSION
  try{
    const failed=spawnSync(process.execPath,[resolve(fixture,'scripts/bootstrap-contracts.mjs'),'--manifest',manifestPath,'--github-env',githubEnv],{env:environment,encoding:'utf8',windowsHide:true})
    assert.equal(failed.status,1,failed.stdout+failed.stderr)
    assert.match(failed.stderr,/Manifest npm differs/)
    assert.equal(existsSync(githubEnv),true,'ownership must be published before a later artifact fails')
    const published=Object.fromEntries(readFileSync(githubEnv,'utf8').trim().split(/\r?\n/).map(line=>{const split=line.indexOf('=');return [line.slice(0,split),line.slice(split+1)]}))
    assert.equal(published.TMPDIR,published.TMP,'Linux child temporary output must use the owned runtime too')
    const child=spawnSync(process.execPath,['-e',"const fs=require('node:fs'),os=require('node:os'),path=require('node:path');console.log(fs.mkdtempSync(path.join(os.tmpdir(),'bootstrap-child-')))"],{env:{...environment,...published},encoding:'utf8',windowsHide:true})
    assert.equal(child.status,0,child.stderr)
    assert.equal(child.stdout.trim().startsWith(published.TMPDIR),true)
    assert.equal(existsSync(resolve(fixture,'node_modules')),false)
    const cleanup=spawnSync(process.execPath,[resolve(root,'scripts/contracts/cleanup-contracts.mjs')],{env:{...environment,...published},encoding:'utf8',windowsHide:true})
    assert.equal(cleanup.status,0,cleanup.stdout+cleanup.stderr)
    assert.equal(existsSync(published.CIRNET_ARTIFACTS_SESSION),false)
  }finally{
    if(existsSync(sessions))for(const name of readdirSync(sessions))if(/^(?:cirnet|netcircuit)-/.test(name))cleanupArtifactSession(resolve(sessions,name))
  }
})
test('the canonical NCAP layout and E2E graph come from the exact pinned resource release',()=>{
  assert.equal(readContractsResource('physical-hc08-led').schema_version,'1.1')
  assert.equal(readContractsResource('capture-layout').prefix.magic_hex,'4e434150')
  assert.equal(Object.keys(readContractsResource('logic-pinouts')).length,37)
})
test('the SDK tarball carries public resources and excludes private contract descendants',()=>{
  const bytes=verifyBytes(readFileSync(resolve(root,'.artifacts',lock.npm.filename)),cachedSelection().npm.sha256)
  const metadata=JSON.parse(archiveEntry(bytes,'package/package.json'))
  assert.equal(metadata.version,lock.contractsVersion)
  const schema=JSON.parse(archiveEntry(bytes,'package/dist/schemas/transport.json'))
  for(const name of ['InstrumentationExecutionPlan','StationCapabilities','FpgaControlScaffold'])assert.doesNotMatch(JSON.stringify(schema,(key,value)=>['description','$comment'].includes(key)?undefined:value),new RegExp(`(?<![A-Za-z0-9_])${name}(?![A-Za-z0-9_])`))
})
