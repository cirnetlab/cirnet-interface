import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readdirSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {randomUUID} from 'node:crypto'
import {getArtifactContext,getArtifactDirectory,cleanupArtifactSession} from './artifact-paths.mjs'

for(const empty of [false,true])test(`pinned allocator output aliases stay stable (empty current session: ${empty})`,()=>{
 const keys=['CIRNET_','NETCIRCUIT_'].flatMap(prefix=>['ARTIFACTS_SESSION','ARTIFACTS_CONTEXT','ARTIFACTS_DIR'].map(suffix=>prefix+suffix))
 const previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]))
 const context=getArtifactContext()
 const parent=getArtifactDirectory('allocator-compat-'+randomUUID())
 try{
  process.env.CIRNET_ARTIFACTS_DIR=parent
  if(empty)process.env.CIRNET_ARTIFACTS_SESSION=''
  const selected=getArtifactDirectory('',empty?{}:{directory:parent})
  assert.equal(dirname(selected),parent)
  const active=empty?selected:previous.CIRNET_ARTIFACTS_SESSION??previous.NETCIRCUIT_ARTIFACTS_SESSION
  assert.equal(resolve(process.env.CIRNET_ARTIFACTS_SESSION),resolve(active))
  assert.equal(resolve(process.env.NETCIRCUIT_ARTIFACTS_SESSION),resolve(active))
  assert.equal(dirname(getArtifactDirectory('evidence')),resolve(active))
 }finally{
  // Clean only directly allocated disposable children, even after a regression.
  for(const child of readdirSync(parent,{withFileTypes:true}))if(child.isDirectory()&&/^netcircuit-[A-Za-z0-9]+$/.test(child.name)){
   const path=resolve(parent,child.name)
   assert.equal(dirname(path),parent)
   cleanupArtifactSession(path,{context})
  }
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete process.env[key]
   else process.env[key]=value
  }
 }
})
