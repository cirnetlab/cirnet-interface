import {synchronizeEnvironment} from '../utilities/environment.mjs'
/** Bootstrap immutable DEV tooling before creating any diagnostic output. */
import {readFileSync,writeFileSync,mkdirSync,existsSync,appendFileSync,realpathSync,lstatSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {resolve,dirname,relative,isAbsolute,parse,sep} from 'node:path'
import {fileURLToPath} from 'node:url'

export const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
export const lock=JSON.parse(readFileSync(resolve(root,'integration/contracts-artifacts.json'),'utf8'))
export const digest=bytes=>createHash('sha256').update(bytes).digest('hex')
export function verifyBytes(bytes,expected){
  if(!/^[0-9a-f]{64}$/.test(expected??'')||digest(bytes)!==expected)throw Error('Artifact SHA256 does not match the reviewed release lock.')
  return bytes
}
function artifactChildEnvironment(environment=process.env){
  return Object.fromEntries(Object.entries(environment).filter(([name])=>!['CIRNET_ARTIFACTS_TOKEN','NETCIRCUIT_ARTIFACTS_TOKEN'].includes(name.toUpperCase())))
}
export function archiveEntry(bytes,path){
  return execFileSync('tar',['-xzOf','-',path],{input:bytes,env:artifactChildEnvironment(),windowsHide:true,maxBuffer:16*1024*1024,stdio:['pipe','pipe','pipe']})
}
export function cachedSelection() {
  return JSON.parse(readFileSync(resolve(root, '.artifacts/selection.json'), 'utf8'))
}
function cachePath(entry){return resolve(root,'.artifacts',entry.filename)}
export function checkedManifestFile(path, stat=lstatSync){
  if(!isAbsolute(path??''))throw Error('Local release manifest requires absolute artifact paths.')
  const full=resolve(path), volume=parse(full).root
  let current=volume
  for(const part of full.slice(volume.length).split(sep).filter(Boolean)){
    current=resolve(current,part)
    const entry=stat(current)
    if(entry.isSymbolicLink())throw Error('Local release manifest artifact path must not contain a symlink or alias.')
    if(current===full&&!entry.isFile())throw Error('Local release manifest artifacts must be regular files.')
  }
  return full
}
function safeCache(){
  const directory=resolve(root,'.artifacts')
  if(existsSync(directory)&&lstatSync(directory).isSymbolicLink())throw Error('Artifact cache must not be a symlink.')
  mkdirSync(directory,{recursive:true})
  const location=relative(realpathSync(root),realpathSync(directory))
  if(isAbsolute(location)||location==='..'||location.startsWith('..'+(process.platform==='win32'?'\\':'/')))throw Error('Artifact cache escaped the product root.')
}
function selectedBytes(key, manifest) {
  const entry = lock[key], selected = manifest[key]
  if (!entry || !/^[0-9a-f]{64}$/.test(selected?.sha256 ?? '') ||
      (entry.sha256 && entry.sha256 !== selected.sha256)) {
    throw Error(`Manifest ${key} differs from the reviewed release lock.`)
  }
  return verifyBytes(readFileSync(checkedManifestFile(selected.path)), selected.sha256)
}
export async function bootstrap({manifestPath, githubEnv} = {}) {
  if (!isAbsolute(manifestPath ?? '')) throw Error('An absolute artifact manifest path is required.')
  const manifest = JSON.parse(readFileSync(checkedManifestFile(manifestPath), 'utf8'))
  const dev = selectedBytes('dev_npm', manifest)
  const metadata = JSON.parse(archiveEntry(dev, 'package/package.json'))
  if (metadata.name !== lock.dev_npm.name || metadata.version !== lock.dev_npm.version) {
    throw Error('DEV artifact package identity differs from its lock.')
  }
  const canonical = archiveEntry(dev, 'package/cirnet_artifact_paths/artifact-paths.mjs')
  const allocatorSha256 = digest(canonical)
  if (lock.dev_npm.nodeSha256) verifyBytes(canonical, lock.dev_npm.nodeSha256)
  const context=process.env.CIRNET_ARTIFACTS_CONTEXT??JSON.stringify({owner:`git:${realpathSync(root)}`,roots:[realpathSync(root)]})
  const allocatorEnvironment=synchronizeEnvironment({...artifactChildEnvironment(),CIRNET_ARTIFACTS_CONTEXT:context})
  const allocation=execFileSync(process.execPath,['--input-type=module'],{
    input:Buffer.concat([canonical,Buffer.from('\nconsole.log(JSON.stringify({artifactSession:getArtifactDirectory(),context:getArtifactContext()}))\n')]),
    cwd:root,env:allocatorEnvironment,encoding:'utf8',windowsHide:true,stdio:['pipe','pipe','pipe'],
  })
  const {artifactSession}=JSON.parse(allocation)
  const bootstrapDirectory=resolve(artifactSession,'bootstrap-dev')
  mkdirSync(bootstrapDirectory,{recursive:true})
  const bootstrapModule=resolve(bootstrapDirectory,'artifact-paths.mjs')
  if(existsSync(bootstrapModule))verifyBytes(readFileSync(bootstrapModule),allocatorSha256)
  else writeFileSync(bootstrapModule,canonical,{flag:'wx'})
  const environment=synchronizeEnvironment({CIRNET_ARTIFACTS_CONTEXT:context,CIRNET_ARTIFACTS_SESSION:artifactSession,
    CIRNET_ARTIFACTS_BOOTSTRAP_MODULE:bootstrapModule, CIRNET_ARTIFACTS_BOOTSTRAP_SHA256:allocatorSha256,
    TMP:resolve(artifactSession,'tmp'),TEMP:resolve(artifactSession,'tmp'),TMPDIR:resolve(artifactSession,'tmp'),npm_config_cache:resolve(artifactSession,'npm-cache')})
  // Publish the owner and verified cleanup tooling before another download or
  // npm installation can fail. Cleanup does not depend on node_modules.
  if(githubEnv)for(const [name,value]of Object.entries(environment)){
    if(/[\r\n]/.test(value))throw Error('Bootstrap environment values must be single lines.')
    appendFileSync(githubEnv,`${name}=${value}\n`)
  }
  for(const directory of [environment.TMP,environment.npm_config_cache])mkdirSync(directory,{recursive:true})
  Object.assign(process.env,environment)
  const artifacts = {dev_npm: dev, npm: selectedBytes('npm', manifest),
    native_crate: selectedBytes('native_crate', manifest), remote_openapi: selectedBytes('remote_openapi', manifest)}
  const sdkMetadata = JSON.parse(archiveEntry(artifacts.npm, 'package/package.json'))
  if (sdkMetadata.name !== lock.npm.name || sdkMetadata.version !== lock.npm.version ||
      ['dependencies','optionalDependencies','peerDependencies'].some(key => Object.keys(sdkMetadata[key] ?? {}).length)) {
    throw Error('SDK package identity or dependencies differ from the lock.')
  }
  archiveEntry(artifacts.native_crate, `${lock.native_crate.name}-${lock.native_crate.version}/Cargo.toml`)
  const openapi = JSON.parse(artifacts.remote_openapi)
  if (!openapi.openapi || !openapi.paths) throw Error('Expected a Remote OpenAPI document.')
  safeCache()
  const selection = {}
  for (const [key, bytes] of Object.entries(artifacts)) {
    const destination = cachePath(lock[key])
    if (existsSync(destination)) verifyBytes(readFileSync(checkedManifestFile(destination)), manifest[key].sha256)
    else writeFileSync(destination, bytes, {flag:'wx'})
    selection[key] = {path:destination, sha256:manifest[key].sha256}
  }
  writeFileSync(resolve(root, '.artifacts/selection.json'), JSON.stringify(selection) + '\n')
  return {artifactSession, environment, contractsVersion:lock.contractsVersion, status:lock.status}
}
