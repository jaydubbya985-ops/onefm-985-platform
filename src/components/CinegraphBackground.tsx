import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MediaImage } from '@/components/MediaImage'
import { getCinegraph, type CinegraphKey } from '@/lib/cinegraphAssets'

interface CinegraphBackgroundProps {
  slot: CinegraphKey
  className?: string
  imageClassName?: string
  opacity?: number
  priority?: boolean
}

/**
 * Poster + optional looping MP4. Falls back to Ken Burns still when:
 * - prefers-reduced-motion
 * - video missing or fails to load
 * - videoActive is false on the slot
 */
function ArchiveStillCredit() {
  const [host, setHost] = useState<Element | null>(null)
  useEffect(() => {
    setHost(document.querySelector('[data-cursor-label="GAME DAY"]'))
  }, [])
  if (!host) return null
  // Football hero gradients sit on top of the cinegraph layer — portal the
  // credit onto the section so it is actually readable.
  return createPortal(
    <p className="pointer-events-none absolute top-24 left-6 z-[5] rounded-full border border-white/20 bg-black/55 px-3 py-1 font-label text-[10px] tracking-[0.14em] uppercase text-white/90">
      Station archive still
    </p>,
    host,
  )
}

export function CinegraphBackground({
  slot,
  className = 'absolute inset-0 w-full h-full object-cover',
  imageClassName,
  opacity = 0.45,
  priority = true,
}: CinegraphBackgroundProps) {
  const asset = getCinegraph(slot)
  const [mode, setMode] = useState<'image' | 'video'>('image')
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      const reduce = mq.matches
      setReducedMotion(reduce)
      if (reduce || !asset.videoActive) {
        setMode('image')
      } else {
        setMode('video')
      }
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [asset.videoActive])

  if (mode === 'video' && asset.videoActive) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={asset.poster}
        className={className}
        style={{ opacity }}
        onError={() => setMode('image')}
      >
        <source src={asset.video} type="video/mp4" />
      </video>
    )
  }

  return (
    <>
      <MediaImage
        src={asset.poster}
        fallbackSrc={asset.fallback}
        alt={asset.brief}
        priority={priority}
        skeleton={false}
        className={`${className} ${imageClassName ?? ''} ${reducedMotion ? '' : 'animate-ken-burns'}`}
        style={{ opacity }}
      />
      <ArchiveStillCredit />
    </>
  )
}
