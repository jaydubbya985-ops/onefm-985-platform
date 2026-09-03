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

/** In-page section scroll. Uses Lenis when it is running so smooth-scroll stays in sync. */
export function scrollToElement(el: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (_lenis && !reduced) {
    _lenis.scrollTo(el, { duration: 1.1 })
    return
  }
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}
