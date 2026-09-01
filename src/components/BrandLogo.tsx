import { useState } from 'react'
import { logoCandidates, BRAND, type LogoVariant } from '@/lib/brand'
import { formatCoverageShort } from '@/lib/coverageCopy'

const DEFAULT_ALT = `${BRAND.fullName} — ${BRAND.tagline} · ${formatCoverageShort()}`

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
  alt = DEFAULT_ALT,
  style,
}: BrandLogoProps) {
  const candidates = logoCandidates(variant)
  const [index, setIndex] = useState(0)

  const src = candidates[Math.min(index, candidates.length - 1)]

  return (
    <img
      src={src}
      alt={alt}
      title={alt}
      className={`brand-logo ${className}`}
      style={style}
      decoding="async"
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1)
      }}
    />
  )
}
