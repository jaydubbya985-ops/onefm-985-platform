/**
 * HashRouter-safe path helpers.
 * React Router's HashRouter already puts the hash path on `location.pathname`
 * (e.g. `#/listen` → `/listen`). Never use `window.location.pathname` for app
 * routes here — that stays `/` on Netlify and would hide the mini player.
 */

export function appPathname(pathname: string, hash = ''): string {
  if (pathname && pathname !== '/') {
    return pathname.split('?')[0] || pathname
  }
  if (hash.startsWith('#/')) {
    const fromHash = hash.slice(1).split('?')[0]
    return fromHash || '/'
  }
  return pathname || '/'
}

export function isAppPath(pathname: string, route: string, hash = ''): boolean {
  const path = appPathname(pathname, hash).replace(/\/+$/, '') || '/'
  const target = route.replace(/\/+$/, '') || '/'
  if (target === '/') return path === '/'
  return path === target || path.startsWith(`${target}/`)
}
