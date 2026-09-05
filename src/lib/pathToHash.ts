/**
 * HashRouter only reads window.location.hash (`#/listen`).
 * A typed or shared path (`/listen`) serves index.html with an empty hash,
 * so the app paints Home. Rewrite the path onto the hash before React mounts.
 *
 * Static files and API proxies stay on the pathname.
 */

const LEAVE_ON_PATH = [
  '/api/',
  '/assets/',
  '/brand/',
  '/videos/',
  '/photos/',
  '/.netlify/',
]

export function shouldLeaveOnPathname(pathname: string): boolean {
  if (!pathname || pathname === '/') return true
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (LEAVE_ON_PATH.some((prefix) => path.startsWith(prefix))) return true
  // Real files: /favicon.ico, /manifest.json, /robots.txt
  if (/\.[a-zA-Z0-9]+$/.test(path)) return true
  return false
}

/** Hash path to apply, or null when the URL is already HashRouter-correct. */
export function pathToHashTarget(pathname: string, hash = ''): string | null {
  if (hash.startsWith('#/')) return null
  if (shouldLeaveOnPathname(pathname)) return null
  const trimmed = pathname.replace(/\/+$/, '') || '/'
  if (trimmed === '/') return null
  return trimmed
}

let installed = false

export function installPathToHash(): void {
  if (installed || typeof window === 'undefined') return
  installed = true
  const next = pathToHashTarget(window.location.pathname, window.location.hash)
  if (!next) return
  const search = window.location.search
  window.history.replaceState(null, '', `/#${next}${search}`)
}
