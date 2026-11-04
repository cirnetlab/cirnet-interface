import test from 'node:test'
import assert from 'node:assert/strict'
import { sessionCookies } from '../e2e/session-cookies'

const cookie = (name: string, value = 'opaque-session') => ({ name, value, httpOnly: true, sameSite: 'Lax', path: '/' })

for (const name of ['netcircuit_session', 'cirnet_session']) test(`session evidence recognizes the reviewed ${name} cookie`, () => {
  const expected = cookie(name)
  assert.deepEqual(sessionCookies([expected]), [expected])
})

test('dual-name session evidence retains both cookies and ignores unrelated names', () => {
  const canonical = cookie('cirnet_session'), legacy = cookie('netcircuit_session')
  assert.deepEqual(sessionCookies([cookie('analytics'), canonical, legacy]), [canonical, legacy])
})

test('session evidence rejects absent, unrelated and lookalike cookie names', () => {
  for (const cookies of [[], [cookie('analytics')], [cookie('cirnet_session_backup')], [cookie('__Secure-cirnet_session')]]) {
    assert.throws(() => sessionCookies(cookies), /session cookie/i)
  }
})

test('dual-name session evidence rejects different credentials instead of hiding an obsolete alias', () => {
  assert.throws(() => sessionCookies([cookie('cirnet_session', 'current'), cookie('netcircuit_session', 'obsolete')]), /same credential/i)
})

test('session evidence rejects an empty credential even when the other alias is populated', () => {
  for (const name of ['netcircuit_session', 'cirnet_session']) {
    assert.throws(() => sessionCookies([cookie(name, '')]), /nonempty/i)
    const other = name === 'cirnet_session' ? 'netcircuit_session' : 'cirnet_session'
    assert.throws(() => sessionCookies([cookie(name, ''), cookie(other)]), /nonempty/i)
  }
})

test('session evidence rejects duplicate same-name cookies with ambiguous scope', () => {
  for (const name of ['netcircuit_session', 'cirnet_session']) {
    assert.throws(() => sessionCookies([cookie(name), { ...cookie(name), path: '/api' }]), /duplicate/i)
  }
})

test('session evidence never hides weak attributes on either recognized alias', () => {
  for (const name of ['netcircuit_session', 'cirnet_session']) {
    const other = name === 'cirnet_session' ? 'netcircuit_session' : 'cirnet_session'
    const weak = { ...cookie(name), httpOnly: false, sameSite: 'None', path: '/api' }
    const selected = sessionCookies([cookie(other), weak])
    assert.equal(selected.length, 2, 'the E2E security assertions must inspect both aliases')
    assert.equal(selected[1], weak, 'attribute checks receive the original cookie, without normalization')
    assert.equal(selected[1].httpOnly, false)
    assert.equal(selected[1].sameSite, 'None')
    assert.equal(selected[1].path, '/api')
  }
})

test('session evidence leaves the browser cookie collection unchanged', () => {
  const expected = Object.freeze(cookie('netcircuit_session'))
  const input = Object.freeze([expected])
  assert.deepEqual(sessionCookies(input), [expected])
  assert.equal(input[0], expected)
})
