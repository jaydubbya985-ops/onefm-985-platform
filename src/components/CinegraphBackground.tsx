import { useEffect, useState } from 'react'
import { MediaImage } from '@/components/MediaImage'
import { getCinegraph, type CinegraphKey } from '@/lib/cinegraphAssets'
import { BRAND } from '@/lib/brand'
import { formatCoverageShort } from '@/lib/coverageCopy'

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

  const lockup = `${asset.brief} — ${BRAND.fullName} · ${formatCoverageShort()}`

  if (mode === 'video' && asset.videoActive) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={asset.poster}
        title={lockup}
        aria-label={lockup}
        className={className}
        style={{ opacity }}
        onError={() => setMode('image')}
      >
        <source src={asset.video} type="video/mp4" />
      </video>
    )
  }

  return (
    <MediaImage
      src={asset.poster}
      fallbackSrc={asset.fallback}
      alt={lockup}
      priority={priority}
      skeleton={false}
      className={`${className} ${imageClassName ?? ''} ${reducedMotion ? '' : 'animate-ken-burns'}`}
      style={{ opacity }}
    />
  )
}
