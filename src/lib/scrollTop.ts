import type Lenis from 'lenis'

let _lenis: Lenis | null = null

export function registerLenis(instance: Lenis | null) {
  _lenis = instance
}

export function scrollToTop() {
  if (_lenis) {
    _lenis.scrollTo(0, { duration: 0 })
  } else {
    window.scrollTo(0, 0)
  }
}

/** In-page section jump. HashRouter treats href="#id" as a new route — do not use that. */
export function scrollToId(id: string): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  if (_lenis) {
    _lenis.scrollTo(el, { duration: 1.05, offset: -8 })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return true
}
