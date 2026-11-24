import test from 'node:test'
import assert from 'node:assert/strict'
import {browserPendingObservations} from '../src/services/recovery/pendingObservations'

test('browser tracking requires actual Web Locks and performs storage reads only inside its exclusive callback',async()=>{
 const previousNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator'),previousStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage')
 let raw:string|null=null,held=false,reads=0
 try{
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>{assert.equal(held,true);reads++;return raw},setItem:(_key:string,value:string)=>{assert.equal(held,true);raw=value}}})
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}})
  const scope=browserPendingObservations.scope('alice')
  await assert.rejects(scope.begin({kind:'create',key:'unsupported'}) as Promise<void>,/requires Web Locks/)
  assert.equal(reads,0);assert.equal(raw,null)
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name:string,options:{mode:string},action:()=>void)=>{
   assert.equal(name,'netcircuit.pending-observations.v1');assert.equal(options.mode,'exclusive');held=true
   try{action()}finally{held=false}
  }}}})
  await scope.begin({kind:'create',key:'supported'});await scope.unknown('supported');await scope.complete('supported');await scope.forget('supported')
  assert.equal(reads,5);assert.equal(raw,'[]')
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(_name:string,options:{ifAvailable?:boolean},action:(lock:null)=>void)=>{
   assert.equal(options.ifAvailable,true);action(null)
  }}}})
  await assert.rejects(scope.begin({kind:'stop',key:'stop',experimentId:'e1'},{ifAvailable:true}) as Promise<void>,/lock is unavailable/)
  await assert.rejects(scope.complete('stop',{ifAvailable:true}) as Promise<void>,/lock is unavailable/)
  assert.equal(reads,5,'contested Stop tracking must not read outside a granted lock')
 }finally{
  if(previousNavigator)Object.defineProperty(globalThis,'navigator',previousNavigator);else Reflect.deleteProperty(globalThis,'navigator')
  if(previousStorage)Object.defineProperty(globalThis,'localStorage',previousStorage);else Reflect.deleteProperty(globalThis,'localStorage')
 }
})


test('legacy pending observations survive migration and old-tab mutations remain visible without resurrection',async()=>{
 const previousNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator'),previousStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage')
 const legacy='netcircuit.pending-observations.v1',canonical='cirnet.pending-observations.v1',now=Date.now()
 const row={principalId:'alice',kind:'create',key:'legacy',createdAt:now,expiresAt:now+60_000,status:'unknown'}
 const entries=new Map([[legacy,JSON.stringify([row])]])
 try{
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>entries.get(key)??null,setItem:(key:string,value:string)=>entries.set(key,value)}})
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name:string,_options:unknown,action:()=>void)=>{assert.equal(name,legacy);action()}}}})
  const scope=browserPendingObservations.scope('alice')
  assert.equal(scope.list()[0].key,'legacy')
  await scope.begin({kind:'create',key:'fresh'})
  assert.equal(entries.get(canonical),entries.get(legacy))
  entries.set(legacy,JSON.stringify([{...row,key:'from-old-tab'}]))
  assert.deepEqual(scope.list().map(value=>value.key),['from-old-tab'])
  await scope.complete('from-old-tab')
  assert.equal(entries.get(canonical),'[]');assert.equal(entries.get(legacy),'[]')
 }finally{
  if(previousNavigator)Object.defineProperty(globalThis,'navigator',previousNavigator);else Reflect.deleteProperty(globalThis,'navigator')
  if(previousStorage)Object.defineProperty(globalThis,'localStorage',previousStorage);else Reflect.deleteProperty(globalThis,'localStorage')
 }
})
