import { type RefObject, useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Sighted theatre ticks 0 → value. Assistive tech must hear the finished
 * sourced figure once — never a rising invented count ("0 years on air").
 * Same honesty split as WordReveal / TextScramble.
 */
function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function formatFigure(n: number, prefix: string, suffix: string) {
  return `${prefix}${n.toLocaleString()}${suffix}`
}

export function AnimatedNumber({
  value,
  suffix = '',
  prefix = '',
  duration = 1200,
}: {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const reduced = prefersReducedMotion()
  const [count, setCount] = useState(reduced ? value : 0)
  const ref = useRef<HTMLSpanElement>(null)
  // No negative rootMargin — a -50px inset left the first Football hero
  // figure (39,375) sitting on an invented 0 on short mobile viewports.
  const inView = useInView(ref as unknown as RefObject<Element>, { once: true })
  const hasRun = useRef(false)

  useEffect(() => {
    if (reduced) return
    if (inView) {
      if (hasRun.current) return
      hasRun.current = true
      let start: number | undefined
      const tick = (now: number) => {
        if (start === undefined) start = now
        // Clamp — a first rAF timestamp before performance.now() made
        // p negative and the theatre flashed invented counts like -297.
        const p = Math.min(Math.max((now - start) / duration, 0), 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setCount(p < 1 ? Math.floor(eased * value) : value)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
  }, [inView, value, duration, reduced])

  // If IntersectionObserver never fires, snap to the sourced figure.
  // Sighted users must not sit on an invented 0.
  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => {
      if (!hasRun.current) {
        hasRun.current = true
        setCount(value)
      }
    }, duration + 250)
    return () => window.clearTimeout(id)
  }, [value, duration, reduced])

  return (
    <span ref={ref}>
      <span className="sr-only">{formatFigure(value, prefix, suffix)}</span>
      <span aria-hidden="true">{formatFigure(count, prefix, suffix)}</span>
    </span>
  )
}
