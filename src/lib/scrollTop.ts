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
