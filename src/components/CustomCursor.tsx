import { useEffect, useRef, useState } from 'react'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { liveNowFromMetadata, type LiveNowDisplay } from '@/lib/liveNow'

const RED = '#E51636'

/** Melbourne guide clock — remaining time must not freeze on first hover. */
function useGuideClock(ms = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const id = window.setInterval(() => setNow(new Date()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}

/** Home uses data-cursor; the rest of the site uses data-cursor-label. */
export function readCursorVerb(target: Element | null): string | null {
  const labeled = target?.closest?.('[data-cursor-label], [data-cursor]')
  if (!labeled) return null
  return labeled.getAttribute('data-cursor-label') ?? labeled.getAttribute('data-cursor')
}

export function isListenCursor(verb: string): boolean {
  return /^(LISTEN|PLAY|PAUSE|TUNE IN|ON AIR)\b/i.test(verb)
}

/** Official breakfast name keeps "(Breaky)" in the guide; the cursor needs the short lockup. */
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
 * Listen / play hovers name the Melbourne-guide show and remaining time.
 * Hosts come from liveNow (BREAKFAST_ROSTER). No live-now listener counts.
 */
export function listenCursorDetail(
  live: LiveNowDisplay,
  error: string | null,
): string {
  if (error) return shortStreamError(error)
  return [compactShowName(live.program), live.withLine, live.remainingLabel]
    .filter(Boolean)
    .join(' · ')
}

export function CustomCursor() {
  const now = useGuideClock()
  const meta = usePlayerMetadata()
  const { error } = useLiveStream()
  const live = liveNowFromMetadata(meta, now)

  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const labelElRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pressed, setPressed] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const currentLabel = useRef<string | null>(null)
  const isHovering = useRef(false)
  const pos = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const spot = useRef({ x: -100, y: -100 })
  const trail = useRef<Array<{ x: number; y: number }>>([])
  const rafId = useRef<number>(0)
  const electricRgb = useRef('0, 229, 255')
  const lastMoveAt = useRef(0)
  const idleCleared = useRef(true)
  const labelWide = useRef(false)

  const detail = label && isListenCursor(label) ? listenCursorDetail(live, error) : null
  const failed = Boolean(detail && error)
  labelWide.current = Boolean(detail)

  useEffect(() => {
    const readColor = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--one-electric-rgb').trim()
      if (v) electricRgb.current = v
    }
    readColor()
    const mo = new MutationObserver(readColor)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-time'] })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const canvas = canvasRef.current
    const setSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    setSize()
    window.addEventListener('resize', setSize)

    const deriveFromTarget = (target: Element | null) => {
      const hov = !!target?.closest?.('a, button, [role="button"], input, select, textarea')
      if (hov !== isHovering.current) {
        isHovering.current = hov
        setHovering(hov)
      }
      const next = readCursorVerb(target)
      if (next !== currentLabel.current) {
        currentLabel.current = next
        setLabel(next)
      }
    }

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      lastMoveAt.current = performance.now()
      idleCleared.current = false
      deriveFromTarget(e.target as Element)
    }

    // A click can swap/remove the labeled element under a stationary cursor
    // (e.g. Start Tour -> Stop) with no follow-up mousemove to re-derive the
    // label, leaving a stale label rendered over the new element. Re-check
    // post-render on click and on any DOM mutation near the cursor.
    const onClick = () => {
      requestAnimationFrame(() => {
        deriveFromTarget(document.elementFromPoint(pos.current.x, pos.current.y))
      })
    }

    const onLeave = () => { trail.current = [] }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    // mousedown with no matching mouseup (window loses focus mid-press,
    // e.g. switching tabs/apps) would otherwise leave the dot stuck gold.
    const onBlur = () => setPressed(false)

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const IDLE_MS = 1200

    const animate = () => {
      // The cursor decorations (trail, label, hover ring) only update on
      // mousemove. If the mouse goes idle — reading, scroll-wheel only,
      // keyboard nav, or simply resting — nothing clears them, so a stale
      // label or a frozen waveform trail sits on screen indefinitely. Once
      // idle, clear them once so the cursor decorations disappear.
      if (!idleCleared.current && performance.now() - lastMoveAt.current > IDLE_MS) {
        idleCleared.current = true
        if (trail.current.length) {
          trail.current = []
          const ctx = canvas?.getContext('2d')
          ctx?.clearRect(0, 0, canvas!.width, canvas!.height)
        }
        if (currentLabel.current !== null) {
          currentLabel.current = null
          setLabel(null)
        }
        if (isHovering.current) {
          isHovering.current = false
          setHovering(false)
        }
        // Without this, the dot/ring/spotlight glow stay rendered at the
        // last mousemove position indefinitely -- e.g. scrolling via mouse
        // wheel with no mousemove leaves a frozen glowing dot floating over
        // the content as the page scrolls past it.
        pos.current = { x: -100, y: -100 }
        ring.current = { x: -100, y: -100 }
        spot.current = { x: -100, y: -100 }
      }

      const dot = dotRef.current
      const ringEl = ringRef.current
      const spotEl = spotRef.current
      const labelEl = labelElRef.current
      if (dot && ringEl) {
        dot.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`
        ring.current.x = lerp(ring.current.x, pos.current.x, 0.12)
        ring.current.y = lerp(ring.current.y, pos.current.y, 0.12)
        ringEl.style.transform = `translate(${ring.current.x - 18}px, ${ring.current.y - 18}px)`
      }
      if (spotEl) {
        spot.current.x = lerp(spot.current.x, pos.current.x, 0.04)
        spot.current.y = lerp(spot.current.y, pos.current.y, 0.04)
        spotEl.style.transform = `translate(${spot.current.x - 200}px, ${spot.current.y - 200}px)`
      }
      if (labelEl) {
        const wide = labelWide.current
        const flip = pos.current.x > window.innerWidth - (wide ? 280 : 140)
        const x = flip ? pos.current.x - 16 : pos.current.x + 14
        const y = pos.current.y - (wide ? 46 : 32)
        labelEl.style.transform = flip
          ? `translate(${x}px, ${y}px) translateX(-100%)`
          : `translate(${x}px, ${y}px)`
      }

      // Waveform trail — sine wave perpendicular to path direction, fades to tail
      if (!reducedMotion && canvas) {
        const ctx = canvas.getContext('2d')!
        const pts = trail.current
        const p = pos.current
        if (pts.length === 0 || Math.hypot(p.x - pts[0].x, p.y - pts[0].y) > 3) {
          pts.unshift({ x: p.x, y: p.y })
          if (pts.length > 48) pts.pop()
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (pts.length > 3) {
          const t = performance.now()
          // Perpendicular-offset position for each trail point
          const offsets: Array<{ x: number; y: number }> = []
          for (let i = 0; i < pts.length; i++) {
            const prev = pts[Math.max(0, i - 1)]
            const next = pts[Math.min(pts.length - 1, i + 1)]
            const dx = next.x - prev.x
            const dy = next.y - prev.y
            const len = Math.hypot(dx, dy) || 1
            const nx = -dy / len
            const ny = dx / len
            const fade = 1 - i / (pts.length - 1)
            const s = Math.sin(i * 0.45 + t * 0.003) * fade * 5
            offsets.push({ x: pts[i].x + nx * s, y: pts[i].y + ny * s })
          }
          // Draw fading segments from head to tail
          for (let i = 0; i < offsets.length - 1; i++) {
            const fade = 1 - i / (offsets.length - 1)
            ctx.beginPath()
            ctx.moveTo(offsets[i].x, offsets[i].y)
            ctx.lineTo(offsets[i + 1].x, offsets[i + 1].y)
            ctx.strokeStyle = `rgba(${electricRgb.current},${(fade * 0.52).toFixed(3)})`
            ctx.lineWidth = 0.7 + fade * 0.8
            ctx.lineCap = 'round'
            ctx.stroke()
          }
        }
      }

      rafId.current = requestAnimationFrame(animate)
    }

    rafId.current = requestAnimationFrame(animate)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('click', onClick)
    window.addEventListener('blur', onBlur)

    return () => {
      cancelAnimationFrame(rafId.current)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('click', onClick)
      window.removeEventListener('resize', setSize)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null

  return (
    <>
      {/* Waveform trail — full-viewport canvas, screen blend so it only shows on dark areas */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 99994,
          mixBlendMode: 'screen',
        }}
      />
      {/* Spotlight glow — large ambient radial, very slow lerp */}
      <div
        ref={spotRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--one-electric-rgb),0.028) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9990,
          transform: 'translate(-100px, -100px)',
          transition: 'transform 0s',
          mixBlendMode: 'screen',
        }}
      />
      {/* Verb + live show / remaining time / honest stream error */}
      <div
        ref={labelElRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99997,
          opacity: label ? 1 : 0,
          transition: 'opacity 0.18s',
          transform: 'translate(-200px, -200px)',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            display: 'block',
            fontSize: 9,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: '#F2F2F2',
            fontWeight: 600,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {label}
        </span>
        {detail ? (
          <span
            style={{
              display: 'block',
              marginTop: 3,
              maxWidth: 260,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: 8,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: failed ? RED : 'rgba(242,242,242,0.72)',
              fontWeight: 600,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {detail}
          </span>
        ) : null}
      </div>
      {/* Solid dot — snaps to cursor */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: pressed ? '#F2F2F2' : 'var(--one-electric)',
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate(-100px, -100px)',
          transition: 'background 0.15s, transform 0s',
          mixBlendMode: 'difference',
        }}
      />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: label ? 56 : hovering ? 48 : pressed ? 28 : 36,
          height: label ? 56 : hovering ? 48 : pressed ? 28 : 36,
          borderRadius: '50%',
          border: `1.5px solid ${failed ? 'rgba(229,22,54,0.75)' : label || hovering ? 'rgba(212,175,55,0.7)' : 'rgba(var(--one-electric-rgb),0.35)'}`,
          background: failed ? 'rgba(229,22,54,0.08)' : label || hovering ? 'rgba(212,175,55,0.06)' : 'transparent',
          pointerEvents: 'none',
          zIndex: 99998,
          transform: 'translate(-100px, -100px)',
          transition: 'border-color 0.2s, background 0.2s, width 0.2s, height 0.2s',
        }}
      />
    </>
  )
}
