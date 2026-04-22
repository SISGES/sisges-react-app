function encodeJwtPart(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

/** JWT-shaped string valid for `authService.isAuthenticated` (exp in the future). */
export function createTestJwt(): string {
  const header = encodeJwtPart({ alg: 'none', typ: 'JWT' })
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365
  const payload = encodeJwtPart({ exp })
  return `${header}.${payload}.`
}
