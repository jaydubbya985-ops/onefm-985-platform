import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { liveNowFromMetadata, type LiveNowDisplay } from '@/lib/liveNow'
import { getScheduleMetadata } from '@/lib/playerMetadata'

interface MagneticButtonProps {
  children: ReactNode
  strength?: number   // how many px it pulls at the edge (default 12)
  className?: string
  as?: 'div' | 'span'
  cursorLabel?: string
}

/**
 * Wraps a button/link in a magnetic hover zone.
 * The inner element slides up to `strength` px toward the cursor,
 * then springs back on leave via CSS transition.
 *
 * Usage: wrap any <Link> or <button> — the wrapper is transparent.
 *   <MagneticButton><Link to="/listen" className="btn-primary">Listen</Link></MagneticButton>
 *
 * cursorLabel="LISTEN" is the leftover: a generic hover used to hide the
 * Melbourne-guide show. Hosts come from liveNow (BREAKFAST_ROSTER).
 * Remaining time ticks on the guide clock. Not a live-now listener count.
 */

/** Official breakfast name keeps "(Breaky)" in the guide; the Listen lockup is short. */
export function compactShowName(name: string): string {
  return name.replace(/\s*\(Breaky\)\s*/i, '').trim()
}

export function isListenCursorLabel(label: string | undefined): boolean {
  return (label ?? '').trim().toUpperCase() === 'LISTEN'
}

/** Cursor / caption. Hosts come from liveNow (BREAKFAST_ROSTER). No invented counts. */
export function magneticListenLabel(live: LiveNowDisplay): string {
  return [compactShowName(live.program), live.withLine, live.remainingLabel]
    .filter(Boolean)
    .join(' · ')
}

export function magneticListenEyebrow(live: LiveNowDisplay): string {
  return live.isLive ? 'On air' : 'Melbourne guide'
}

export function magneticListenTitle(live: LiveNowDisplay): string {
  const line = `${magneticListenEyebrow(live)} · ${magneticListenLabel(live)}`
  if (live.breakfastOnAir && live.breakfastLabel) {
    return `${line} · Weekday breakfast · ${live.breakfastLabel}`
  }
  if (live.programTime) return `${line} · ${live.programTime}`
  return line
}

/** Melbourne guide clock — remaining time must not freeze after first paint. */
function useGuideClock(enabled: boolean, ms = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setNow(new Date()), ms)
    return () => window.clearInterval(id)
  }, [enabled, ms])
  return now
}

export function MagneticButton({
  children,
  strength = 12,
  className = '',
  as: Tag = 'div',
  cursorLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isListen = isListenCursorLabel(cursorLabel)
  const now = useGuideClock(isListen)
  const live = isListen ? liveNowFromMetadata(getScheduleMetadata(now), now) : null
  const resolvedLabel = live ? magneticListenLabel(live) : cursorLabel
  const resolvedTitle = live ? magneticListenTitle(live) : undefined

  const handleMouseMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
    el.style.transition = 'transform 0.1s cubic-bezier(0.16,1,0.3,1)'
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0px, 0px)'
    el.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)'
  }

  return (
    <Tag className={`${live ? 'inline-flex flex-col items-start' : 'inline-block'} ${className}`}>
      <span
        ref={ref}
        className="inline-block"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...(resolvedLabel ? { 'data-cursor-label': resolvedLabel } : {})}
        {...(resolvedTitle ? { title: resolvedTitle } : {})}
      >
        {children}
      </span>
      {live ? (
        <span className="mt-1.5 max-w-[20rem] font-label text-[9px] leading-snug tracking-[0.12em] uppercase text-one-white/50">
          <span className="text-one-gold/80">{magneticListenEyebrow(live)}</span>
          {' · '}
          {magneticListenLabel(live)}
          {live.breakfastOnAir && live.breakfastLabel ? (
            <span className="mt-0.5 block normal-case tracking-normal text-[8px] text-one-white/40">
              Weekday breakfast · {live.breakfastLabel}
            </span>
          ) : null}
        </span>
      ) : null}
    </Tag>
  )
}
