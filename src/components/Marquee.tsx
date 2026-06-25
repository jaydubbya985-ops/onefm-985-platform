import { type ReactNode, useEffect, useState } from 'react'

interface MarqueeProps {
  items: ReactNode[]
  speed?: number       // seconds for one full loop (default 28)
  separator?: ReactNode
  className?: string
  reverse?: boolean
}

/**
 * Infinite horizontal ticker.
 * Duplicates the item list to fill a second track so there's no gap on loop.
 * Respects prefers-reduced-motion — static display when set.
 */
export function Marquee({
  items = [],
  speed = 28,
  separator,
  className = '',
  reverse = false,
}: MarqueeProps) {
  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const sep = separator ?? (
    <span aria-hidden className="mx-6 w-1 h-1 rounded-full bg-one-gold/50 inline-block align-middle shrink-0" />
  )

  const track = items.flatMap((item, i) => [
    <span key={`a-${i}`} className="inline-flex items-center whitespace-nowrap shrink-0">{item}</span>,
    <span key={`sep-a-${i}`} aria-hidden className="inline-flex items-center shrink-0">{sep}</span>,
  ])

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div
        className="flex"
        style={{
          animation: reduceMotion ? 'none' : `marquee${reverse ? 'Reverse' : ''} ${speed}s linear infinite`,
          willChange: reduceMotion ? 'auto' : 'transform',
        }}
      >
        {/* Two identical tracks — second starts where first ends */}
        <div className="flex items-center shrink-0">{track}</div>
        {!reduceMotion && <div className="flex items-center shrink-0" aria-hidden>{track}</div>}
      </div>
    </div>
  )
}
