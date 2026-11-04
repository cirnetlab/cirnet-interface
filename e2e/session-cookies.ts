interface SessionCookieIdentity { name: string; value: string }

const names = new Set(['cirnet_session', 'netcircuit_session'])

/** Published API 0.1.1 uses the legacy name; current APIs can emit both.
 * Return every alias unchanged so the browser test checks each one's privacy. */
export function sessionCookies<T extends SessionCookieIdentity>(cookies: readonly T[]): T[] {
  const selected = cookies.filter(cookie => names.has(cookie.name))
  if (!selected.length) throw new Error('Expected a reviewed session cookie.')
  if (new Set(selected.map(cookie => cookie.name)).size !== selected.length) throw new Error('Duplicate session cookie names have ambiguous scope.')
  if (selected.some(cookie => typeof cookie.value !== 'string' || !cookie.value)) throw new Error('Session cookies must contain a nonempty credential.')
  if (selected.some(cookie => cookie.value !== selected[0].value)) throw new Error('Session cookie aliases must contain the same credential.')
  return selected
}
