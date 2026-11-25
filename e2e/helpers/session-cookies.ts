interface SessionCookieIdentity { name: string; value: string }

/** Return the original cookie so browser verification can check its privacy attributes. */
export function sessionCookies<T extends SessionCookieIdentity>(cookies: readonly T[]): T[] {
  if (cookies.some(cookie => cookie.name === 'netcircuit_session')) throw new Error('An obsolete session cookie was emitted.')
  const selected = cookies.filter(cookie => cookie.name === 'cirnet_session')
  if (!selected.length) throw new Error('Expected the native session cookie.')
  if (selected.length !== 1) throw new Error('Duplicate session cookie names have ambiguous scope.')
  if (!selected[0].value) throw new Error('The session cookie must contain a nonempty credential.')
  return selected
}
