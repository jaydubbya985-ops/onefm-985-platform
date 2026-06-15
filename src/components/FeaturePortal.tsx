import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { BRAND_COLORS } from '@/lib/brand'

export interface FeaturePortalProps {
  to: string
  title: string
  description: string
  image: string
  imageFallback?: string
  tags?: string[]
  accent?: string
  className?: string
}

export function FeaturePortal({
  to,
  title,
  description,
  image,
  imageFallback,
  tags = [],
  accent = BRAND_COLORS.gold,
  className = '',
}: FeaturePortalProps) {
  return (
    <Link
      to={to}
      className={`group relative block overflow-hidden rounded-2xl border border-one-border bg-one-midnight aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] hover:border-one-gold/40 transition-all duration-500 ${className}`}
    >
      <MediaImage
        src={image}
        fallbackSrc={imageFallback ?? image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(7,29,58,0.95) 0%, rgba(7,29,58,0.35) 45%, rgba(7,29,58,0.15) 100%)`,
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="font-label text-[9px] px-2 py-0.5 rounded-full border border-white/15 text-one-white/80 bg-black/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h2
              className="font-h4 text-one-white text-base md:text-lg group-hover:text-one-gold transition-colors truncate"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              {title}
            </h2>
            <p className="font-body-small text-one-muted text-xs mt-1 line-clamp-2">{description}</p>
          </div>
          <span
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-white/20 bg-black/30 group-hover:border-one-gold/50 group-hover:bg-one-gold/10 transition-all"
            style={{ color: accent }}
          >
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}
