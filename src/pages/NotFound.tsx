import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

function StaticNoise() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let id: number
    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const img = ctx.createImageData(w, h)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 220) | 0
        img.data[i] = v
        img.data[i + 1] = v
        img.data[i + 2] = v
        img.data[i + 3] = (Math.random() * 90 + 10) | 0
      }
      ctx.putImageData(img, 0, 0)
      id = requestAnimationFrame(draw)
    }
    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    onResize()
    window.addEventListener('resize', onResize)
    draw()
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
    />
  )
}

export default function NotFound() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020408',
        overflow: 'hidden',
        color: '#fff',
      }}
    >
      <StaticNoise />

      {/* Horizontal scanline bands */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '2rem',
          maxWidth: 560,
        }}
      >
        {/* NO SIGNAL pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#E51636',
            border: '1px solid rgba(229,22,54,0.35)',
            padding: '5px 14px',
            borderRadius: 3,
            marginBottom: 32,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#E51636',
              animation: 'dot-pulse 1.4s ease-in-out infinite',
            }}
          />
          NO SIGNAL
        </div>

        {/* 404 glitch stack */}
        <div style={{ position: 'relative', marginBottom: 8, lineHeight: 1 }}>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 'clamp(5rem, 18vw, 10rem)',
              fontWeight: 900,
              color: '#E51636',
              animation: 'deadAirGlitchR 3.6s steps(1) infinite',
              userSelect: 'none',
            }}
          >
            404
          </span>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 'clamp(5rem, 18vw, 10rem)',
              fontWeight: 900,
              color: 'var(--one-electric)',
              animation: 'deadAirGlitchC 3.6s steps(1) infinite',
              userSelect: 'none',
            }}
          >
            404
          </span>
          <span
            style={{
              display: 'block',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 'clamp(5rem, 18vw, 10rem)',
              fontWeight: 900,
              color: '#fff',
              userSelect: 'none',
            }}
          >
            404
          </span>
        </div>

        {/* DEAD AIR label */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 'clamp(0.55rem, 2vw, 0.75rem)',
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: 28,
          }}
        >
          DEAD AIR
        </div>

        {/* Message */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          This frequency is off the air.
          <br />
          The page you're looking for doesn't exist or has moved.
        </p>

        {/* Back home */}
        <Link
          to="/"
          data-cursor-label="HOME"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#D4AF37',
            border: '1px solid rgba(212,175,55,0.4)',
            padding: '12px 28px',
            borderRadius: 4,
            textDecoration: 'none',
            background: 'rgba(212,175,55,0.06)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.14)'
            ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,175,55,0.7)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.06)'
            ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,175,55,0.4)'
          }}
        >
          ← Return to broadcast
        </Link>

        {/* Station ID */}
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.5rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.18)',
            marginTop: 48,
          }}
        >
          ONE FM 98.5 · SHEPPARTON · BROADCASTING SINCE 1989
        </p>
      </div>
    </div>
  )
}
