import { useState, useRef, useEffect } from 'react'

interface MediaImageProps {
  src: string
  alt: string
  className?: string
  /** Secondary URL tried if primary fails */
  fallbackSrc?: string
  /** Skip lazy loading for above-the-fold images */
  priority?: boolean
  /** Show shimmer skeleton while loading */
  skeleton?: boolean
  /** Extra style object */
  style?: React.CSSProperties
  onClick?: () => void
}

/**
 * Smart image component:
 * — Shimmer skeleton while loading
 * — Falls back to fallbackSrc on error, then to branded placeholder
 * — Lazy by default, eager when priority={true}
 */
export function MediaImage({
  src,
  alt,
  className = '',
  fallbackSrc,
  priority = false,
  skeleton = true,
  style,
  onClick,
}: MediaImageProps) {
  const [loaded, setLoaded]       = useState(false)
  const [errored, setErrored]     = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)

  // Sync src prop changes (e.g. tab switches)
  useEffect(() => {
    setLoaded(false)
    setErrored(false)
    setCurrentSrc(src)
  }, [src])

  // If the image is already cached the onLoad may fire before React mounts it
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [])

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    } else {
      setErrored(true)
    }
  }

  /* ── Branded placeholder (error state) ── */
  if (errored) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center ${className}`}
        style={{
          background: 'linear-gradient(135deg, #101010 0%, #0E1E38 50%, #101010 100%)',
          ...style,
        }}
        aria-label={alt}
        onClick={onClick}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(212,168,75,0.8) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative text-center select-none pointer-events-none">
          <div className="text-one-gold/20 font-bold text-5xl leading-none tracking-tight">
            98.5
          </div>
          <div className="text-one-gold/10 font-mono text-xs tracking-widest mt-1">
            ONE FM
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`} style={style} onClick={onClick}>
      {/* Shimmer skeleton */}
      {skeleton && !loaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      <picture>
        {/\.(jpe?g|png)$/i.test(currentSrc) && (
          <source srcSet={currentSrc.replace(/\.(jpe?g|png)$/i, '.webp')} type="image/webp" />
        )}
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>
    </div>
  )
}
