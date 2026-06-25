import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { cn } from '@/lib/utils'

export interface SocialPlatformFrameProps {
  eyebrow: string
  title: string
  description?: string
  href: string
  hrefLabel: string
  image: string
  imageFallback?: string
  accent: string
  icon: ReactNode
  children?: ReactNode
  className?: string
  compact?: boolean
}

/** Branded shell for external social platforms — no third-party iframe chrome. */
export function SocialPlatformFrame({
  eyebrow,
  title,
  description,
  href,
  hrefLabel,
  image,
  imageFallback,
  accent,
  icon,
  children,
  className,
  compact = false,
}: SocialPlatformFrameProps) {
  return (
    <article
      data-cursor-label={eyebrow}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-one-border bg-one-midnight group',
        'hover:border-one-gold/25 transition-colors duration-300',
        className
      )}
    >
      <div className={cn('relative overflow-hidden', compact ? 'h-28' : 'h-36 sm:h-40')}>
        <MediaImage
          src={image}
          fallbackSrc={imageFallback ?? image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, rgba(7,29,58,0.92) 0%, rgba(7,29,58,0.55) 50%, rgba(7,29,58,0.35) 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse at 100% 0%, ${accent}33 0%, transparent 55%)`,
          }}
        />
        <div aria-hidden className="explore-tile-scan" />
        <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-black/30 backdrop-blur-sm"
              style={{ color: accent }}
            >
              {icon}
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-label text-[10px] text-one-white/90 px-3 py-1.5 rounded-full border border-white/15 bg-black/25 hover:border-one-gold/40 hover:text-one-gold transition-colors"
            >
              {hrefLabel}
              <ArrowUpRight size={12} />
            </a>
          </div>
          <div>
            <p className="font-label text-[9px] tracking-[0.18em] text-one-muted">{eyebrow}</p>
            <h3 className="font-h4 text-one-white text-base sm:text-lg mt-0.5">{title}</h3>
            {description && !compact && (
              <p className="font-body-small text-one-muted text-xs mt-1 line-clamp-2 max-w-md">{description}</p>
            )}
          </div>
        </div>
      </div>
      {children && <div className="p-4 sm:p-5 pt-4 border-t border-one-border/80">{children}</div>}
    </article>
  )
}
