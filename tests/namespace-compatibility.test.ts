import test from 'node:test'
import assert from 'node:assert/strict'
import {parseStructural} from '../src/contracts/structural'
import {createApiClient,ApiError} from '../src/services/api/client'

test('native health accepts only the canonical service identity without rewriting the payload',()=>{
 const payload={status:'ok',service:'cirnet-api',hardware_mode:'simulation'}
 assert.equal(parseStructural('HealthResponse',payload),payload)
 for(const service of ['netcircuit-api','other-api']) assert.throws(()=>parseStructural('HealthResponse',{...payload,service}))
})

test('native capture and CSRF use canonical names and reject obsolete media',async()=>{
 for(const type of ['application/vnd.cirnet.capture; version=1','application/vnd.netcircuit.capture; version=1','application/vnd.cirnet.capture; version=2']){
  const client=createApiClient({csrfToken:()=> 'token',fetcher:async(_url,options)=>{
   const headers=new Headers(options?.headers)
   assert.equal(headers.get('X-CIRNET-CSRF'),'token');assert.equal(headers.get('X-CSRF-Token'),null)
   assert.equal(headers.get('Accept'),'application/vnd.cirnet.capture; version=1')
   return new Response(new Uint8Array([1,2]),{headers:{'Content-Type':type}})
  }})
  const request=client.request('/capture',{method:'POST',responseType:'arrayBuffer',accept:'application/vnd.cirnet.capture; version=1'})
  if(type==='application/vnd.cirnet.capture; version=1')assert.equal((await request).byteLength,2)
  else await assert.rejects(request,error=>error instanceof ApiError&&error.code==='INVALID_RESPONSE')
 }
})
