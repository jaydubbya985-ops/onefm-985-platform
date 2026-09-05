/**
 * HashRouter ops desk. Listeners on Home / Listen must not wait on this route.
 */

export function isOpsHash(hash: string): boolean {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const path = raw.split('?')[0] ?? ''
  return path === '/ops' || path.startsWith('/ops/')
}
