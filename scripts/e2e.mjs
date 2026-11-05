import {synchronizeEnvironment} from './environment.mjs'
import { spawn } from 'node:child_process'
import { resolve,dirname,relative,isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import { getArtifactDirectory,validateArtifactDirectory } from './artifact-paths.mjs'
import { copyBrowserRuntime } from './e2e-browser-runtime.mjs'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2)
const platform=args[0]==='test-platform'
if(platform) {
  // Commander accepts attached and grouped short options that can hide -c.
  if(args.slice(1).some(argument=>/^(?:--(?:config|last-failed-file)(?:=|$)|-[^-])/.test(argument))) {
    throw new Error('The native platform suite owns its Playwright config and last-run file. Use long options.')
  }
  args.splice(0,1,'test','--config',resolve(root,'playwright.platform.config.ts'))
}
for(let index=0;index<args.length;index++) {
  const output=/^(--output|-o)(?:=(.*))?$/.exec(args[index])
  if(!output) continue
  const directory=output[2]??args[index+1]
  if(!directory||directory.startsWith('-')) throw new Error(`${output[1]} requires an external artifact parent directory.`)
  process.env.CIRNET_ARTIFACTS_SESSION=getArtifactDirectory('',{directory:resolve(directory)})
  const ownedOutput=getArtifactDirectory('playwright')
  if(output[2]!==undefined) args[index]=`${output[1]}=${ownedOutput}`
  else args[++index]=ownedOutput
}
const session=getArtifactDirectory()
const environment=synchronizeEnvironment({...process.env,PLAYWRIGHT_BROWSERS_PATH:resolve(root,'.runtime/playwright')})
function execute(command,arguments_,options={}) {
  const child=spawn(command,arguments_,{stdio:'inherit',windowsHide:true,...options})
  const closed=new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1))})
  return {child,closed}
}
let vite,result=1
try {
 if(args[0]==='test') {
  let target
  if(!platform) {
   if(!environment.CIRNET_E2E_API_TARGET)throw new Error('CIRNET_E2E_API_TARGET must explicitly select a prepared Remote test API. Use the Remote integrated browser runner for the full suite.')
   target=new URL(environment.CIRNET_E2E_API_TARGET)
   if(!['http:','https:'].includes(target.protocol)||target.username||target.password||target.pathname!=='/'||target.search||target.hash)throw new Error('CIRNET_E2E_API_TARGET must be an HTTP(S) origin without credentials, path or query.')
   if(!environment.CIRNET_E2E_ADMIN_PASSWORD)throw new Error('The Remote test target must provide CIRNET_E2E_ADMIN_PASSWORD.')
   if(!environment.CIRNET_E2E_DATA_DIR)throw new Error('The full browser gate requires Remote-owned CIRNET_E2E_DATA_DIR for actual API process restart.')
   const data=validateArtifactDirectory(environment.CIRNET_E2E_DATA_DIR),position=relative(session,data)
   if(!position||isAbsolute(position)||position==='..'||position.startsWith('../')||position.startsWith('..\\'))throw new Error('The Remote restart control directory must be inside the same owned session.')
  }
  const runtimeId=randomBytes(4).toString('hex')
  environment.PLAYWRIGHT_BROWSERS_PATH=await copyBrowserRuntime(environment.PLAYWRIGHT_BROWSERS_PATH,getArtifactDirectory('br-'+runtimeId))
  if(platform) {
   const {startPlatformServer}=await import('./e2e-platform.mjs')
   const {server,origin}=await startPlatformServer(root,getArtifactDirectory('platform-vite-'+runtimeId))
   vite=server
   environment.CIRNET_E2E_PLATFORM_ORIGIN=origin
   environment.PLAYWRIGHT_LAST_RUN_OUTPUT_FILE=resolve(getArtifactDirectory('playwright'),'.last-run.json')
   environment.PLAYWRIGHT_BLOB_OUTPUT_FILE=resolve(getArtifactDirectory('playwright-reporters/blob'),`report-${runtimeId}.zip`)
   environment.PLAYWRIGHT_PERFETTO_OUTPUT_FILE=resolve(getArtifactDirectory('playwright-reporters'),`perfetto-${runtimeId}.json`)
  } else {
   process.env.CIRNET_DEV_API_TARGET=target.origin
   const {createServer}=await import('vite')
   vite=await createServer({root,server:{host:'127.0.0.1',port:14173,strictPort:true}})
   await vite.listen()
  }
 }
 result=await execute(process.execPath,[resolve(root,'node_modules/@playwright/test/cli.js'),...args],{cwd:root,env:environment}).closed
} finally {await vite?.close()}
process.exit(result)
