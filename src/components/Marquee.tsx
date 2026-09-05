import { type ReactNode, useEffect, useState } from 'react'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { formatGuideHours } from '@/lib/guideHours'

interface MarqueeProps {
  items: ReactNode[]
  speed?: number       // seconds for one full loop (default 28)
  separator?: ReactNode
  className?: string
  reverse?: boolean
}

const COVERAGE = formatCoverageShort()
const GVL_HOURS = formatGuideHours('GVL Match of the Day')

/**
 * Unused match-day banner still (1600×1537). Mark size only — not a hero
 * or presenter portrait. Station archive OB signage, unique of the van still.
 * Caption is licensed GVL hours + coverage — not a live-now count.
 */
function MatchDayBannerMark() {
  return (
    <span className="mx-6 inline-flex items-center gap-2 align-middle shrink-0">
      <img
        src={STATION_PHOTOS.obMatchDayBanner}
        alt=""
        aria-hidden
        width={56}
        height={28}
        decoding="async"
        className="inline-block shrink-0"
        style={{
          width: 56,
          height: 28,
          objectFit: 'cover',
          objectPosition: 'center',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.14)',
          opacity: 0.88,
        }}
      />
      <span className="font-label text-[9px] tracking-[0.16em] uppercase text-one-gold/70 whitespace-nowrap">
        {GVL_HOURS ? `GVL · ${GVL_HOURS}` : 'GVL'} · {COVERAGE}
      </span>
    </span>
  )
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

  const sep = separator ?? <MatchDayBannerMark />

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
