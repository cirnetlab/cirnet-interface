import test from 'node:test'
import assert from 'node:assert/strict'
import { sessionCookies } from '../../e2e/helpers/session-cookies'

const cookie = (name: string, value = 'opaque-session') => ({ name, value, httpOnly: true, sameSite: 'Lax', path: '/' })

test('session evidence selects the native cookie without hiding its original attributes', () => {
  const canonical = Object.freeze({ ...cookie('cirnet_session'), httpOnly: false, sameSite: 'None', path: '/api' })
  const input = Object.freeze([cookie('analytics'), canonical])
  const selected = sessionCookies(input)
  assert.deepEqual(selected, [canonical])
  assert.equal(selected[0], canonical)
  assert.equal(input[1], canonical)
})

test('session evidence rejects obsolete cookies even when the native cookie is present', () => {
  const obsolete = cookie('netcircuit_session')
  assert.throws(() => sessionCookies([obsolete]), /obsolete session cookie/i)
  assert.throws(() => sessionCookies([cookie('cirnet_session'), obsolete]), /obsolete session cookie/i)
})

test('session evidence rejects missing, empty, duplicate and lookalike cookies', () => {
  for (const cookies of [[], [cookie('analytics')], [cookie('cirnet_session_backup')], [cookie('__Secure-cirnet_session')]]) {
    assert.throws(() => sessionCookies(cookies), /session cookie/i)
  }
  const canonical = cookie('cirnet_session')
  assert.throws(() => sessionCookies([cookie('cirnet_session', '')]), /nonempty/i)
  assert.throws(() => sessionCookies([canonical, { ...canonical, path: '/api' }]), /duplicate/i)
})
