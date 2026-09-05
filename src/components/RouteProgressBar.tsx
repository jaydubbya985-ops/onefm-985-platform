import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { liveNowFromMetadata, type LiveNowDisplay } from '@/lib/liveNow'

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

/** Official breakfast name keeps "(Breaky)" in the guide; the rail needs the short lockup. */
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
 * Top rail names the Melbourne-guide show and remaining time.
 * Hosts come from liveNow (BREAKFAST_ROSTER). No live-now listener counts.
 */
export function railShowLabel(live: LiveNowDisplay, error: string | null): string {
  if (error) return shortStreamError(error)
  return [compactShowName(live.program), live.withLine, live.remainingLabel]
    .filter(Boolean)
    .join(' · ')
}

/** Idle fill is the current slot's elapsed ratio. Route changes still sweep. */
export function railFillPercent(
  live: LiveNowDisplay,
  routing: boolean,
  routeWidth: number,
): number {
  if (routing) return routeWidth
  return Math.round(Math.min(100, Math.max(0, live.elapsedRatio * 100)))
}

/**
 * Site-wide program clock.
 * The old bar faked a 0→75→90→100 load on every route. A listener cannot
 * use that. Idle state is now how far through the Melbourne-guide slot we
 * are; route changes still flash a sweep so navigation feels instant.
 */
export function RouteProgressBar() {
  const location = useLocation()
  const now = useGuideClock()
  const meta = usePlayerMetadata()
  const { error } = useLiveStream()
  const live = liveNowFromMetadata(meta, now)

  const [routeWidth, setRouteWidth] = useState(0)
  const [routing, setRouting] = useState(false)
  const [prevKey, setPrevKey] = useState(location.key)

  if (prevKey !== location.key) {
    setPrevKey(location.key)
    setRouting(true)
    setRouteWidth(0)
  }

  useEffect(() => {
    if (!routing) return

    const t1 = window.setTimeout(() => setRouteWidth(75), 30)
    const t2 = window.setTimeout(() => setRouteWidth(90), 400)
    const t3 = window.setTimeout(() => setRouteWidth(100), 700)
    const t4 = window.setTimeout(() => {
      setRouting(false)
      setRouteWidth(0)
    }, 900)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
    }
  }, [routing])

  const failed = Boolean(error)
  const label = railShowLabel(live, error)
  const fill = railFillPercent(live, routing, routeWidth)
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99997,
        pointerEvents: 'none',
      }}
    >
      <div
        aria-hidden
        style={{
          height: 2,
          width: '100%',
          background: 'rgba(10,10,10,0.35)',
        }}
      >
        <div
          style={{
            height: 2,
            width: `${fill}%`,
            background: failed
              ? RED
              : routing
                ? 'linear-gradient(90deg, #F2F2F2 0%, var(--one-electric) 60%, #F2F2F2 100%)'
                : RED,
            backgroundSize: routing ? '200% 100%' : undefined,
            animation:
              routing && !reduced && routeWidth > 0 && routeWidth < 100
                ? 'shimmerBar 1.2s linear infinite'
                : 'none',
            opacity: fill > 0 ? 1 : 0.35,
            transition: reduced
              ? 'none'
              : `width ${routing ? (routeWidth === 0 ? '0ms' : routeWidth === 100 ? '250ms' : '600ms') : '400ms'} cubic-bezier(0.16,1,0.3,1)`,
            boxShadow: failed
              ? '0 0 8px rgba(229,22,54,0.55)'
              : routing
                ? '0 0 8px rgba(var(--one-electric-rgb), 0.4)'
                : '0 0 8px rgba(229,22,54,0.35)',
          }}
        />
      </div>

      <Link
        to="/listen"
        data-cursor-label="LISTEN"
        title={label}
        aria-label={`On air: ${label}. Open Listen Live.`}
        className="hidden min-[420px]:inline-flex"
        style={{
          pointerEvents: 'auto',
          position: 'absolute',
          top: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 'min(52vw, 420px)',
          alignItems: 'center',
          gap: 8,
          padding: '5px 12px',
          borderRadius: 999,
          background: failed ? 'rgba(229,22,54,0.92)' : 'rgba(10,10,10,0.78)',
          border: failed ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
          color: '#F2F2F2',
          textDecoration: 'none',
          boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
        }}
      >
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: failed ? '#F2F2F2' : RED,
            boxShadow: failed ? 'none' : '0 0 0 3px rgba(229,22,54,0.28)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
      </Link>
    </div>
  )
}
