import { useEffect, useState } from 'react'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

/**
 * Unused Shepparton silo-art still (287×175 — mark size only, not a hero).
 * Landmark mural, not a presenter portrait.
 */
function SiloArchiveMark() {
  return (
    <img
      src={STATION_PHOTOS.cultureSiloArtFaces}
      alt=""
      aria-hidden
      width={72}
      height={44}
      decoding="async"
      style={{
        width: 72,
        height: 44,
        objectFit: 'cover',
        objectPosition: 'center',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.14)',
        opacity: 0.82,
      }}
    />
  )
}

/**
 * Fixed right-side vertical progress line + numeric % indicator.
 * Only shown on desktop (hidden on touch/narrow viewports).
 * Appears after 5% scroll, disappears near bottom.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (total <= 0) return
      const pct = Math.min(100, (scrolled / total) * 100)
      setProgress(pct)
      setVisible(pct > 3 && pct < 97)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        right: 18,
        top: '50%',
        transform: 'translateY(-50%)',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 9000,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}
      className="hidden lg:flex"
    >
      <SiloArchiveMark />
      {/* Track */}
      <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,0.08)', borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${progress}%`,
            background: 'linear-gradient(180deg, #F2F2F2 0%, var(--one-electric) 100%)',
            transition: 'height 0.1s linear',
            borderRadius: 1,
          }}
        />
      </div>

      {/* Numeric */}
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 8,
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.2)',
          writingMode: 'vertical-rl',
          userSelect: 'none',
        }}
      >
        {Math.round(progress).toString().padStart(2, '0')}%
      </span>
    </div>
  )
}
