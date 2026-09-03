import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FacebookPanel } from '@/components/social/FacebookPanel'
import { useLiveStream } from '@/hooks/useLiveStream'
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

/** Shorten the stream hook's real errors — do not invent a new failure. */
export function shortStreamError(error: string): string {
  if (/unavailable/i.test(error)) return 'Stream unavailable'
  if (/blocked/i.test(error)) return 'Playback blocked'
  return error
}

/**
 * Follow-block headline. Hosts come from liveNow (BREAKFAST_ROSTER).
 * No live-now listener counts. No unnamed social.
 */
export function facebookOnAirLine(live: LiveNowDisplay, error: string | null): string {
  if (error) return shortStreamError(error)
  return [compactShowName(live.program), live.withLine, live.remainingLabel]
    .filter(Boolean)
    .join(' · ')
}

export function facebookOnAirEyebrow(live: LiveNowDisplay, error: string | null): string {
  if (error) return 'Stream'
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
  const { error } = useLiveStream()
  const live = liveNowFromMetadata(meta, now)
  const failed = Boolean(error)
  const line = facebookOnAirLine(live, error)
  const eyebrow = facebookOnAirEyebrow(live, error)

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
              style={{ color: failed ? RED : live.isLive ? RED : 'rgba(255,255,255,0.45)' }}
            >
              {live.isLive && !failed ? '● ' : ''}
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
