import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FacebookPanel } from '@/components/social/FacebookPanel'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { liveNowFromMetadata, type LiveNowDisplay } from '@/lib/liveNow'
import { confirmedSocialNote, FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import { formatCoverageShort } from '@/lib/coverageCopy'

const RED = '#E51636'

/** Melbourne guide clock — remaining time must not freeze after first paint. */
function useGuideClock(ms = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}

/** Official breakfast name keeps "(Breaky)" in the guide; the follow strip needs the short lockup. */
export function compactShowName(name: string): string {
  return name.replace(/\s*\(Breaky\)\s*/i, '').trim()
}

/**
 * Follow-block headline. Hosts come from liveNow (BREAKFAST_ROSTER).
 * No live-now listener counts. Playback errors belong to the stream hook.
 */
export function facebookOnAirLine(live: LiveNowDisplay): string {
  return [compactShowName(live.program), live.withLine, live.remainingLabel]
    .filter(Boolean)
    .join(' · ')
}

export function facebookOnAirEyebrow(live: LiveNowDisplay): string {
  return live.isLive ? 'On air now' : 'Melbourne guide'
}

/**
 * Facebook follow block — names the Melbourne-guide show before the page card.
 * Confirmed profiles: Facebook + SoundCloud only.
 */
export function FacebookPageEmbed({
  height: _height,
  compact,
  className,
}: {
  height?: number
  compact?: boolean
  className?: string
}) {
  const now = useGuideClock()
  const meta = usePlayerMetadata()
  const live = liveNowFromMetadata(meta, now)
  const line = facebookOnAirLine(live)
  const eyebrow = facebookOnAirEyebrow(live)

  return (
    <div className={className}>
      <div
        className="mb-4 rounded-2xl border border-one-border/60 bg-one-navy/50 px-4 py-3.5 sm:px-5"
        data-cursor-label="LISTEN"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="font-label text-[9px] tracking-[0.18em] uppercase"
              style={{ color: live.isLive ? RED : 'rgba(255,255,255,0.45)' }}
            >
              {live.isLive ? '● ' : ''}
              {eyebrow}
            </p>
            <p className="mt-1 font-body text-sm text-one-white leading-snug">{line}</p>
            {live.breakfastOnAir && live.breakfastLabel ? (
              <p className="mt-1 font-label text-[10px] tracking-[0.08em] text-one-white/50">
                Weekday breakfast · {live.breakfastLabel}
              </p>
            ) : (
              <p className="mt-1 font-label text-[10px] tracking-[0.08em] text-one-white/40">
                {live.programTime}
              </p>
            )}
          </div>
          <Link
            to="/listen"
            className="shrink-0 rounded-full px-3 py-1.5 font-bold text-[10px] tracking-[0.14em] uppercase text-white hover:scale-[1.03] transition-transform"
            style={{ background: RED }}
          >
            Listen
          </Link>
        </div>
        {!compact ? (
          <p className="mt-3 font-label text-[9px] tracking-[0.08em] uppercase text-one-white/40 leading-relaxed">
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-one-white/55 hover:text-one-white underline-offset-2 hover:underline"
            >
              facebook.com/onefmshepparton
            </a>
            {' · '}
            {confirmedSocialNote()}
            {' · '}
            {formatCoverageShort()}
            <span className="normal-case tracking-normal"> — ABS 2021 via townData</span>
          </p>
        ) : null}
      </div>
      <FacebookPanel compact={compact} />
    </div>
  )
}
