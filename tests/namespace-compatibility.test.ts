import test from 'node:test'
import assert from 'node:assert/strict'
import {parseStructural} from '../src/contracts/structural'
import {createApiClient,ApiError} from '../src/services/api/client'

test('canonical and published health identities validate without rewriting the returned payload',()=>{
 for(const service of ['cirnet-api','netcircuit-api']){
  const payload={status:'ok',service,hardware_mode:'simulation'}
  assert.equal(parseStructural('HealthResponse',payload),payload)
 }
 assert.throws(()=>parseStructural('HealthResponse',{status:'ok',service:'other-api',hardware_mode:'simulation'}))
})

test('capture namespace aliases preserve version validation and canonical CSRF keeps the old server header',async()=>{
 for(const type of ['application/vnd.cirnet.capture; version=1','application/vnd.netcircuit.capture; version=1']){
  const client=createApiClient({csrfToken:()=> 'token',fetcher:async(_url,options)=>{
   const headers=new Headers(options?.headers)
   assert.equal(headers.get('X-CIRNET-CSRF'),'token');assert.equal(headers.get('X-CSRF-Token'),'token')
   assert.equal(headers.get('Accept'),'application/vnd.cirnet.capture; version=1')
   return new Response(new Uint8Array([1,2]),{headers:{'Content-Type':type}})
  }})
  assert.equal((await client.request('/capture',{method:'POST',responseType:'arrayBuffer',accept:'application/vnd.cirnet.capture; version=1'})).byteLength,2)
 }
 const client=createApiClient({fetcher:async()=>new Response(new Uint8Array([1]),{headers:{'Content-Type':'application/vnd.netcircuit.capture; version=2'}})})
 await assert.rejects(client.request('/capture',{responseType:'arrayBuffer',accept:'application/vnd.cirnet.capture; version=1'}),error=>error instanceof ApiError&&error.code==='INVALID_RESPONSE')
})
