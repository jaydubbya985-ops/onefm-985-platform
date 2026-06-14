import { useState } from 'react'
import { logoCandidates, BRAND, type LogoVariant } from '@/lib/brand'

interface BrandLogoProps {
  variant?: LogoVariant
  className?: string
  alt?: string
  style?: React.CSSProperties
}

/**
 * Tries /public/brand/ official logos first, then legacy placeholders.
 */
export function BrandLogo({
  variant = 'primary',
  className = 'h-10 w-auto object-contain',
  alt = `${BRAND.fullName} — ${BRAND.tagline}`,
  style,
}: BrandLogoProps) {
  const candidates = logoCandidates(variant)
  const [index, setIndex] = useState(0)

  const src = candidates[Math.min(index, candidates.length - 1)]

  return (
    <img
      src={src}
      alt={alt}
      className={`brand-logo ${className}`}
      style={style}
      decoding="async"
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1)
      }}
    />
  )
}
