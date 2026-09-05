/**
 * HashRouter recovery lander.
 * Supabase redirectTo is a real path (`/reset-password`) so `?code=` stays on
 * the origin URL. Netlify SPA fallback serves index.html; we then hoist to
 * `#/reset-password` without dropping the query.
 */
export const PASSWORD_RESET_PATH = '/reset-password'
export const PASSWORD_RESET_HASH = '#/reset-password'

export function passwordResetRedirectUrl(loc: Pick<Location, 'origin'> = window.location): string {
  return `${loc.origin}${PASSWORD_RESET_PATH}`
}

/** Move `/reset-password?code=` → `/?code=#/reset-password` for HashRouter. */
export function hoistPasswordResetPath(
  loc: Pick<Location, 'pathname' | 'search' | 'origin'> & { replace: (url: string) => void } = window.location,
): boolean {
  if (loc.pathname !== PASSWORD_RESET_PATH) return false
  loc.replace(`${loc.origin}/${loc.search}${PASSWORD_RESET_HASH}`)
  return true
}
