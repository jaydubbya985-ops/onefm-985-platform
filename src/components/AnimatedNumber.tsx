import { type RefObject, useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

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
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [count, setCount] = useState(reduced ? value : 0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as unknown as RefObject<Element>, { once: true, margin: '-50px' })
  const hasRun = useRef(false)

  useEffect(() => {
    if (reduced) return
    if (inView) {
      if (hasRun.current) return
      hasRun.current = true
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setCount(Math.floor(eased * value))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
  }, [inView, value, duration, reduced])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}
