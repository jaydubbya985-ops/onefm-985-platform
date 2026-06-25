import { useRef, useEffect, useState, useCallback } from 'react'

const FM_MIN = 87.5
const FM_MAX = 108.0
const TARGET = 98.5
const MAJOR_TICKS = [88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108] as const

function freqToFrac(f: number) {
  return (f - FM_MIN) / (FM_MAX - FM_MIN)
}

interface FrequencyTunerProps {
  onDemodChange?: (isDemod: boolean) => void
  className?: string
  autoSweep?: boolean
}

export function FrequencyTuner({ onDemodChange, className = '', autoSweep = false }: FrequencyTunerProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [freq, setFreq] = useState(() => {
    if (autoSweep && typeof window !== 'undefined' && !localStorage.getItem('one-fm-tuned')) {
      return 90.4
    }
    return TARGET
  })
  const [dragging, setDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const draggingRef = useRef(false)

  const isOnTarget = Math.abs(freq - TARGET) < 0.15
  const isDemod = Math.abs(freq - TARGET) > 0.9

  useEffect(() => {
    onDemodChange?.(isDemod)
  }, [isDemod, onDemodChange])

  // First-visit sweep: 90.4 → 95.6 → 98.5, then gate with localStorage
  useEffect(() => {
    if (!autoSweep) return
    if (typeof window === 'undefined') return
    if (localStorage.getItem('one-fm-tuned')) return

    const t1 = setTimeout(() => setFreq(95.6), 700)
    const t2 = setTimeout(() => setFreq(TARGET), 1500)
    const t3 = setTimeout(() => localStorage.setItem('one-fm-tuned', '1'), 2500)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [autoSweep])

  // Radio "lock-in" click when needle snaps onto 98.5
  const prevOnTargetRef = useRef(isOnTarget)
  useEffect(() => {
    const justLocked = isOnTarget && !prevOnTargetRef.current
    prevOnTargetRef.current = isOnTarget
    if (!justLocked) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    try {
      const ctx = new AudioContext()
      const bufSize = Math.floor(ctx.sampleRate * 0.065)
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 5)
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      const hpf = ctx.createBiquadFilter()
      hpf.type = 'highpass'
      hpf.frequency.value = 2400
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.09, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065)
      src.connect(hpf)
      hpf.connect(gain)
      gain.connect(ctx.destination)
      src.start()
      src.onended = () => ctx.close()
    } catch {
      // Web Audio unavailable — fail silently
    }
  }, [isOnTarget])

  const getFreqFromEvent = useCallback((e: PointerEvent) => {
    const track = trackRef.current
    if (!track) return TARGET
    const rect = track.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    return Math.round((FM_MIN + p * (FM_MAX - FM_MIN)) * 10) / 10
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const onPointerDown = (e: PointerEvent) => {
      track.setPointerCapture(e.pointerId)
      draggingRef.current = true
      setDragging(true)
      setHasInteracted(true)
      setFreq(getFreqFromEvent(e))
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      setFreq(getFreqFromEvent(e))
    }

    const release = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      setDragging(false)
      setFreq(TARGET)
    }

    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointermove', onPointerMove)
    track.addEventListener('pointerup', release)
    track.addEventListener('pointercancel', release)
    return () => {
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup', release)
      track.removeEventListener('pointercancel', release)
    }
  }, [getFreqFromEvent])

  const needlePct = freqToFrac(freq) * 100
  const targetPct = freqToFrac(TARGET) * 100
  const needleColor = isOnTarget ? '#D4AF37' : isDemod ? '#E51636' : 'rgba(255,255,255,0.8)'

  return (
    <div
      className={className}
      data-cursor-label="TUNE"
      style={{ userSelect: 'none' }}
      role="slider"
      aria-valuemin={FM_MIN}
      aria-valuemax={FM_MAX}
      aria-valuenow={freq}
      aria-label="Frequency tuner — drag to tune"
    >
      {/* Readout row — capped width so the status badge sits near the
          frequency number instead of drifting to the far edge of the
          (much wider) dial track below it. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18, maxWidth: 280 }}>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            color: needleColor,
            transition: 'color 0.2s',
          }}
        >
          {freq.toFixed(1)}
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.3)',
            fontWeight: 600,
          }}
        >
          FM
        </span>
        <span
          aria-live="polite"
          aria-atomic
          style={{
            marginLeft: 'auto',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.18em',
            fontWeight: 700,
            padding: '4px 9px',
            borderRadius: 3,
            textTransform: 'uppercase',
            background: isOnTarget
              ? 'rgba(212,175,55,0.12)'
              : isDemod
              ? 'rgba(229,22,54,0.14)'
              : 'rgba(255,255,255,0.06)',
            color: isOnTarget ? '#D4AF37' : isDemod ? '#E51636' : 'rgba(255,255,255,0.45)',
            transition: 'all 0.25s',
          }}
        >
          {isOnTarget ? '● ON AIR' : isDemod ? '✕ SIGNAL LOST' : '~ SCANNING'}
        </span>
      </div>

      {/* Dial track */}
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          height: 68,
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        {/* SVG background: rail + ticks + labels + target marker */}
        <svg
          aria-hidden
          width="100%"
          height="68"
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          preserveAspectRatio="none"
          viewBox="0 0 1000 68"
        >
          {/* Rail */}
          <line x1={0} y1={34} x2={1000} y2={34} stroke="rgba(255,255,255,0.10)" strokeWidth={1} />

          {/* Half-MHz minor ticks */}
          {Array.from({ length: Math.round((FM_MAX - FM_MIN) / 0.5) + 1 }, (_, i) => {
            const f = FM_MIN + i * 0.5
            if (f > FM_MAX) return null
            const x = freqToFrac(f) * 1000
            const major = Number.isInteger(f)
            return (
              <line
                key={f}
                x1={x} y1={major ? 22 : 28}
                x2={x} y2={major ? 46 : 40}
                stroke={major ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.14)'}
                strokeWidth={major ? 1.5 : 1}
              />
            )
          })}

          {/* Frequency labels */}
          {MAJOR_TICKS.map(f => (
            <text
              key={f}
              x={freqToFrac(f) * 1000}
              y={62}
              textAnchor="middle"
              fill="rgba(255,255,255,0.28)"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
            >
              {f}
            </text>
          ))}

          {/* 98.5 target: dashed gold marker */}
          <line
            x1={targetPct * 10} y1={18}
            x2={targetPct * 10} y2={50}
            stroke="rgba(212,175,55,0.4)"
            strokeWidth={1.5}
            strokeDasharray="3,3"
          />
          <text
            x={targetPct * 10}
            y={12}
            textAnchor="middle"
            fill="rgba(212,175,55,0.55)"
            fontSize={8}
            fontFamily="JetBrains Mono, monospace"
            fontWeight="700"
            letterSpacing="0.1em"
          >
            98.5
          </text>
        </svg>

        {/* Needle — CSS-transitioned absolute position */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${needlePct}%`,
            transform: 'translateX(-50%)',
            transition: dragging
              ? 'none'
              : 'left 0.65s cubic-bezier(0.34, 1.4, 0.64, 1)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Triangle head (top) */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: `8px solid ${needleColor}`,
              transition: 'border-bottom-color 0.2s',
              marginTop: 16,
            }}
          />
          {/* Vertical line */}
          <div
            style={{
              width: 2,
              flex: 1,
              background: needleColor,
              transition: 'background 0.2s',
              borderRadius: 1,
            }}
          />
          {/* Triangle foot (bottom) */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `8px solid ${needleColor}`,
              transition: 'border-top-color 0.2s',
              marginBottom: 10,
            }}
          />
        </div>

        {/* Glow halo when on target */}
        {isOnTarget && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%',
              left: `${targetPct}%`,
              transform: 'translate(-50%, -50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'tunedPulse 2s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Hint */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.55rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: hasInteracted ? 'transparent' : 'rgba(255,255,255,0.22)',
          marginTop: 8,
          transition: 'color 0.4s',
          pointerEvents: 'none',
        }}
        aria-hidden
      >
        drag to tune · snaps to 98.5
      </div>
    </div>
  )
}
