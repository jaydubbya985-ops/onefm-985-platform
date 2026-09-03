import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { BrandLogo } from '@/components/BrandLogo'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { BRAND } from '@/lib/brand'
import {
  formatCoverageShort,
  formatWeeklyListeners,
} from '@/lib/coverageCopy'
import { formatGuideHours } from '@/lib/guideHours'
import {
  BREAKFAST_TIME,
  formatBreakfastChromeLabel,
  getBreakfastScheduleLabel,
} from '@/data/programGuide'

const GVL_MATCH_HOURS = formatGuideHours('GVL Match of the Day') ?? 'Saturday'
const BREAKFAST_CHROME = formatBreakfastChromeLabel()
const BREAKFAST_ROSTER_LINE = getBreakfastScheduleLabel()

const WAYS_BACK = [
  { to: '/programs', label: 'Program Guide' },
  { to: '/football', label: 'GVL Football' },
  { to: '/coverage', label: 'Coverage' },
  { to: '/contact', label: 'Contact' },
] as const

function StaticNoise() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let id: number
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const paint = () => {
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
    }

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      paint()
    }
    onResize()
    window.addEventListener('resize', onResize)
    if (reduced) return () => window.removeEventListener('resize', onResize)

    const draw = () => {
      paint()
      id = requestAnimationFrame(draw)
    }
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
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}
    />
  )
}

function goldHover(enter: boolean) {
  return {
    background: enter ? 'rgba(212,175,55,0.14)' : 'rgba(212,175,55,0.06)',
    borderColor: enter ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.4)',
  }
}

export default function NotFound() {
  const coverage = `${formatWeeklyListeners()} · ${formatCoverageShort()}`

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
      <SEO
        title="Page not found"
        description={`This frequency is off the air. ${formatWeeklyListeners()} across ${formatCoverageShort()} (ABS 2021 via townData). GVL Match of the Day · ${GVL_MATCH_HOURS}. Breakfast: ${BREAKFAST_ROSTER_LINE}.`}
        ogImage={STATION_PHOTOS.towerStarsNight}
      />

      <img
        src={STATION_PHOTOS.towerStarsNight}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 30%',
          opacity: 0.28,
          filter: 'grayscale(40%) brightness(0.55)',
        }}
      />

      <StaticNoise />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(2,4,8,0.55) 0%, rgba(2,4,8,0.35) 40%, rgba(2,4,8,0.82) 100%)',
          pointerEvents: 'none',
        }}
      />

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

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '2rem 1.25rem 7.5rem',
          maxWidth: 640,
        }}
      >
        <Link
          to="/"
          data-cursor-label="HOME"
          aria-label={`${BRAND.fullName} — Home`}
          style={{ display: 'inline-block', marginBottom: 28 }}
        >
          <BrandLogo variant="white" className="h-11 w-auto object-contain max-w-[min(200px,56vw)]" />
        </Link>

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

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          This frequency is off the air.
          <br />
          Tune back to {BRAND.frequency} FM — {coverage}.
        </p>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.42)',
            lineHeight: 1.6,
            marginBottom: 36,
          }}
        >
          Weekdays {BREAKFAST_TIME}
          <br />
          {BREAKFAST_CHROME}
          <br />
          GVL Match of the Day · {GVL_MATCH_HOURS}
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Link
            to="/listen"
            data-cursor-label="LISTEN"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: '#fff',
              border: '1px solid rgba(229,22,54,0.55)',
              padding: '12px 24px',
              borderRadius: 4,
              textDecoration: 'none',
              background: '#E51636',
            }}
          >
            ▶ Listen Live
          </Link>
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
              color: '#F2F2F2',
              border: '1px solid rgba(212,175,55,0.4)',
              padding: '12px 24px',
              borderRadius: 4,
              textDecoration: 'none',
              background: 'rgba(212,175,55,0.06)',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, goldHover(true))}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, goldHover(false))}
          >
            ← Return to broadcast
          </Link>
        </div>

        <nav
          aria-label="Other station pages"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.25rem',
            marginTop: 28,
          }}
        >
          {WAYS_BACK.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-cursor-label={item.label.toUpperCase()}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.5rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.22)',
            marginTop: 48,
            lineHeight: 1.7,
          }}
        >
          {BRAND.fullName} · {BRAND.callsign} · Licensed {BRAND.licensed}
          <br />
          {coverage}
        </p>
      </div>
    </div>
  )
}
