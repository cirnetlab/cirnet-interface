import test from 'node:test'
import assert from 'node:assert/strict'
import {environmentValue,synchronizeEnvironment} from './environment.mjs'

test('canonical environment settings win and synchronize legacy subprocess aliases',()=>{
 const values={NETCIRCUIT_ARTIFACTS_SESSION:'old',CIRNET_ARTIFACTS_SESSION:'new',NETCIRCUIT_E2E_API_TARGET:'legacy-only',PATH:'untouched'}
 assert.equal(environmentValue('NETCIRCUIT_ARTIFACTS_SESSION',values),'new')
 synchronizeEnvironment(values)
 assert.deepEqual(values,{NETCIRCUIT_ARTIFACTS_SESSION:'new',CIRNET_ARTIFACTS_SESSION:'new',NETCIRCUIT_E2E_API_TARGET:'legacy-only',CIRNET_E2E_API_TARGET:'legacy-only',PATH:'untouched'})
 assert.equal(environmentValue('CIRNET_UNKNOWN',values),undefined)
 const empty={CIRNET_SETTING:'',NETCIRCUIT_SETTING:'legacy'}
 synchronizeEnvironment(empty);assert.equal(empty.NETCIRCUIT_SETTING,'')
})
