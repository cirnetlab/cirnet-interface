import {synchronizeEnvironment} from './environment.mjs'
/** The pinned DEV package owns every path and cleanup rule. */
import * as allocator from '@tinihi-labs/artifact-paths'
import {realpathSync} from 'node:fs'
import {resolve,dirname,basename} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'))
const context=value=>value===undefined&&!process.env.CIRNET_ARTIFACTS_CONTEXT?{owner:`git:${root}`,roots:[root]}:value
export function getArtifactContext(options={}) {synchronizeEnvironment();return allocator.getArtifactContext({...options,context:context(options.context)})}
export function getArtifactDirectory(subdirectory='',options={}) {synchronizeEnvironment();return allocator.getArtifactDirectory(subdirectory,{...options,context:context(options.context)})}
export function validateArtifactDirectory(directory,options={}) {synchronizeEnvironment();return allocator.validateArtifactDirectory(directory,{...options,context:context(options.context)})}
export function cleanupArtifactSession(directory,options={}) {synchronizeEnvironment();return allocator.cleanupArtifactSession(directory,{...options,context:context(options.context)})}
export function runArtifactCli(args=process.argv.slice(2)) {
 synchronizeEnvironment()
 const selected=[...args]
 if(!selected.includes('--context')&&!process.env.CIRNET_ARTIFACTS_CONTEXT)selected.push('--context',JSON.stringify(context()))
 return allocator.runArtifactCli(selected)
}
export const runCli=runArtifactCli
if(process.argv[1]&&basename(process.argv[1])==='artifact-paths.mjs'&&resolve(process.argv[1])===fileURLToPath(import.meta.url))runArtifactCli()
