/**
 * HashRouter stores the route in window.location.hash (`#/media-kit`).
 * Bare in-page anchors (`href="#rate-card"`) overwrite that hash and 404.
 *
 * Capture those clicks globally so existing page markup can stay as-is.
 * HashRouter paths (`#/listen`) are left alone.
 */
import { scrollToElement } from '@/lib/scrollTop'

let installed = false

export function isHashRouterHref(href: string): boolean {
  const hash = href.trim()
  return hash === '#/' || hash.startsWith('#/')
}

/** Section id for a same-document `#id` href, or null for routes / empty / non-hash. */
export function inPageSectionId(href: string): string | null {
  const hash = href.trim()
  if (!hash.startsWith('#') || isHashRouterHref(hash)) return null
  const raw = hash.slice(1)
  if (!raw) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function onClick(e: MouseEvent): void {
  if (e.defaultPrevented || e.button !== 0) return
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

  const target = e.target
  if (!(target instanceof Element)) return
  const a = target.closest('a[href]')
  if (!a || !(a instanceof HTMLAnchorElement)) return
  if (a.target === '_blank' || a.hasAttribute('download')) return

  const href = a.getAttribute('href')
  if (!href) return
  if (/^(https?:|mailto:|tel:|javascript:)/i.test(href.trim())) return
  if (isHashRouterHref(href)) return
  if (!href.trim().startsWith('#')) return

  // Stop the hash rewrite even when the section is missing — never 404 the route.
  e.preventDefault()
  const id = inPageSectionId(href)
  if (!id) return
  const el = document.getElementById(id)
  if (!el) return

  scrollToElement(el)
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

export function installInPageHash(): void {
  if (installed || typeof document === 'undefined') return
  installed = true
  document.addEventListener('click', onClick, true)
}
