import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { apiOperations } from '@cirnet/contracts/operations'
import { createApiClient, ApiError } from '../../src/services/api/client'
import { createExperimentsApi } from '../../src/services/api/experiments'
import { runningExperiment } from '../helpers/station'
import { callOperation } from '../../src/services/api/operations'
import {sessionFixture} from '../helpers/auth'

test('native browser operations preserve their reviewed method and route bindings', () => {
  const expected = {
    listAssignmentDocumentsV2: ['GET', '/api/v2/assignment-documents'],
    createAssignmentDocumentV2: ['POST', '/api/v2/assignment-documents'],
    getAssignmentDocumentV2: ['GET', '/api/v2/assignment-documents/{assignment_id}'],
    saveAssignmentDocumentV2: ['PUT', '/api/v2/assignment-documents/{assignment_id}'],
    publishAssignmentDocumentV2: ['PATCH', '/api/v2/assignment-documents/{assignment_id}/publication'],
    listAssignmentsV2: ['GET', '/api/v2/assignments'],
    getAssignmentV2: ['GET', '/api/v2/assignments/{assignment_id}'],
    previewCircuitV2: ['POST', '/api/v2/circuits/physical-preview'],
    validateCircuitV2: ['POST', '/api/v2/circuits/validate'],
    getCircuitV2: ['GET', '/api/v2/circuits/{document_id}'],
    saveCircuitV2: ['PUT', '/api/v2/circuits/{document_id}'],
    createExperimentV2: ['POST', '/api/v2/experiments'],
    getExperimentDocumentReferenceV2: ['GET', '/api/v2/experiments/{experiment_id}/document-reference'],
    listCircuitsV2: ['GET', '/api/v2/projects/{project_id}/circuits'],
    createCircuitV2: ['POST', '/api/v2/projects/{project_id}/circuits'],
    deleteCircuit: ['DELETE', '/api/circuits/{document_id}'],
    runExperiment: ['POST', '/api/experiments/{experiment_id}/run'],
    stopExperiment: ['POST', '/api/experiments/{experiment_id}/stop'],
    getOperation: ['GET', '/api/operations/{operation_key}'],
  } satisfies Partial<Record<keyof typeof apiOperations, string[]>>
  for (const name of Object.keys(expected) as (keyof typeof expected)[]) {
    const {method, path} = apiOperations[name]
    assert.deepEqual([method, path], expected[name], name)
  }
})

test('a missing native write route never retries the legacy endpoint', async () => {
  for (const status of [404, 405, 422]) {
    const calls: string[] = []
    const api = createExperimentsApi(createApiClient({fetcher: async (url, options) => {
      calls.push(`${options?.method} ${String(url)}`)
      return Response.json({code: 'UNSUPPORTED_DOCUMENT_VERSION', message: 'Update the selected backend.'}, {status})
    }}))
    await assert.rejects(api.create({
      station_id: 'v1', circuit_graph: {schema_version: '1.0', circuit_id: 'c1', modules: [], connections: []},
    }))
    assert.deepEqual(calls, ['POST /api/v2/experiments'], `status ${status}`)
  }
})

test('307 and 308 redirects cannot replay an experiment write on the legacy route', async () => {
  for (const status of [307, 308]) {
    const calls: string[] = []
    const server = createServer((request, response) => {
      calls.push(`${request.method} ${request.url}`)
      request.resume()
      if (request.url === '/api/v2/experiments') {
        response.writeHead(status, {location: '/api/experiments'}).end()
      } else {
        response.writeHead(404, {'content-type': 'application/json'}).end('{}')
      }
    })
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })
    try {
      const address = server.address()
      assert(address && typeof address !== 'string')
      const api = createExperimentsApi(createApiClient({baseUrl: `http://127.0.0.1:${address.port}/api`}))
      await assert.rejects(api.create({
        station_id: 'v1', circuit_graph: {schema_version: '1.0', circuit_id: 'c1', modules: [], connections: []},
      }))
      assert.deepEqual(calls, ['POST /api/v2/experiments'], `status ${status}`)
    } finally {
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
  }
})

test('operation recovery queries the original identity without replaying a lifecycle command', async () => {
  const calls: { url: string; method: string }[] = []
  const record = { schema_version: '1.0', operation_key: 'lost/ack', kind: 'run', status: 'ACCEPTED', experiment_id: 'e1', error_code: null, revision: 2, experiment: runningExperiment() }
  const api = createExperimentsApi(createApiClient({ baseUrl: '/backend/api', fetcher: async (url, options) => {
    calls.push({ url: String(url), method: options?.method ?? 'GET' })
    return Response.json(record)
  } }))
  assert.equal(typeof api.operation, 'function')
  assert.deepEqual(await api.operation('lost/ack', { kind: 'run', experiment_id: 'e/1' }), record)
  assert.deepEqual(calls, [{ url: '/backend/api/operations/lost%2Fack?kind=run&experiment_id=e%2F1', method: 'GET' }])
})

test('lifecycle operation identity is sent through the generated optional header', async () => {
  const requests: RequestInit[] = []
  const paths: string[] = []
  const api = createExperimentsApi(createApiClient({ fetcher: async (url, options) => {
    requests.push(options ?? {})
    paths.push(String(url))
    return Response.json(runningExperiment('CREATED'),{status:String(url).endsWith('/experiments')?201:200})
  } }))
  await api.create({ station_id: 'v1', circuit_graph: { schema_version: '1.0', circuit_id: 'c1', modules: [], connections: [] } }, undefined, 'create-key')
  await api.run('e1', undefined, 'run-key')
  assert.deepEqual(paths, ['/api/v2/experiments', '/api/experiments/e1/run'])
  assert.deepEqual(requests.map(request => new Headers(request.headers).get('Idempotency-Key')), ['create-key', 'run-key'])
})

test('operation recovery rejects an invalid generated response contract', async () => {
  const api = createExperimentsApi(createApiClient({ fetcher: async () => Response.json({ schema_version: '1.0', operation_key: 'k', kind: 'run', status: 'UNKNOWN' }) }))
  assert.equal(typeof api.operation, 'function')
  await assert.rejects(api.operation('k'), (error: unknown) => error instanceof ApiError && error.code === 'INVALID_RESPONSE')
})

function operationTypes() {
  const client=createApiClient()
  // @ts-expect-error The generated operation requires its named path parameter.
  callOperation(client,'getExperiment',{})
  // @ts-expect-error The generated operation requires a request DTO.
  callOperation(client,'createExperimentV2',{})
  // @ts-expect-error Read operations cannot acquire a command body.
  callOperation(client,'getExperiment',{path:{experiment_id:'e'},body:{}})
  // @ts-expect-error The generated operation name determines its response DTO.
  callOperation<'InventedReturnType'>(client,'getExperiment',{path:{experiment_id:'e'}})
  return callOperation(client,'getOperation',{path:{operation_key:'k'},query:{kind:'run'}})
}
void operationTypes

test('operation boundaries reject undocumented success statuses and malformed declared errors',async()=>{
  for(const status of [201,401,403,409,422]) {
    const client=createApiClient({fetcher:async()=>Response.json(status===201?runningExperiment():{code:'FORBIDDEN',message:'denied'},{status})})
    await assert.rejects(callOperation(client,'getExperiment',{path:{experiment_id:'e1'}}),
      (error:unknown)=>error instanceof ApiError&&error.code==='INVALID_RESPONSE',`status ${status}`)
  }
})

test('declared error envelopes are validated before exposing revision or operation details',async()=>{
  const valid={code:'REVISION_CONFLICT',message:'Changed.',request_id:'request-1',current_revision:3}
  for(const payload of [valid,{...valid,current_revision:'three'}]) {
    const client=createApiClient({fetcher:async()=>Response.json(payload,{status:409})})
    await assert.rejects(callOperation(client,'getExperiment',{path:{experiment_id:'e1'}}),
      (error:unknown)=>error instanceof ApiError&&error.code===(payload===valid?'REVISION_CONFLICT':'INVALID_RESPONSE'))
  }
})

test('malformed authentication denial invalidates only the matching current session',async()=>{
  let lost=0
  const client=createApiClient({csrfToken:()=> 'session',onAuthenticationLost:()=>lost++,fetcher:async()=>new Response('<html>no</html>',{status:401,headers:{'Content-Type':'text/html'}})})
  await assert.rejects(callOperation(client,'getExperiment',{path:{experiment_id:'e1'}}),(error:unknown)=>error instanceof ApiError&&error.code==='INVALID_RESPONSE')
  assert.equal(lost,1)
})

test('acceptStatuses does not bypass the documented validation error schema',async()=>{
  const graph={schema_version:'1.0' as const,circuit_id:'c',modules:[],connections:[]}
  const client=createApiClient({fetcher:async()=>Response.json({code:'INVALID_CONTRACT',message:'invalid',request_id:'r'},{status:422})})
  await assert.rejects(callOperation(client,'validateCircuitV2',{body:graph,acceptStatuses:[422]}),(error:unknown)=>error instanceof ApiError&&error.code==='INVALID_RESPONSE')
})

test('documented media permits equivalent quoted parameters and case without weakening status or body validation',async()=>{
  const json=createApiClient({fetcher:async()=>Response.json(runningExperiment(),{headers:{'Content-Type':'Application/JSON; charset="UTF-8"'}})})
  assert.equal((await callOperation(json,'getExperiment',{path:{experiment_id:'e1'}})).experiment_id,'e1')
  const binary=createApiClient({fetcher:async()=>new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'Application/Vnd.Cirnet.Capture; version="1"'}})})
  assert.deepEqual(new Uint8Array(await callOperation(binary,'getCapturePayload',{path:{capture_id:'c1'}})),new Uint8Array([1,2,3]))
})

test('an already prepared core auth operation dispatches immediately and preserves its cancellation signal',async()=>{
  let dispatched=false,signal:AbortSignal|undefined
  const caller=new AbortController()
  const client=createApiClient({fetcher:async(_url,options)=>{dispatched=true;signal=options?.signal??undefined;return Response.json(sessionFixture())}})
  const pending=callOperation(client,'getSession',{signal:caller.signal})
  assert.equal(dispatched,true);assert.equal(signal?.aborted,false)
  await pending
})
