import { ArrowUpRight, Facebook } from 'lucide-react'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import { SocialPlatformFrame } from '@/components/social/SocialPlatformFrame'

const FACEBOOK_ACCENT = '#1877F2'

export interface FacebookPanelProps {
  compact?: boolean
  className?: string
}

/**
 * Follow link only. Do not dress station stills as Facebook posts
 * or stamp GVL hours onto this panel.
 */
export function FacebookPanel({ compact, className }: FacebookPanelProps) {
  return (
    <SocialPlatformFrame
      compact={compact}
      className={className}
      eyebrow="STATION PAGE"
      title="ONE FM on Facebook"
      description="This site does not load a Facebook timeline. Station news lives on facebook.com/onefmshepparton."
      href={FACEBOOK_PAGE_URL}
      hrefLabel="Open Facebook"
      image={STATION_PHOTOS.studioExteriorRainbow}
      imageFallback={STATION_PHOTOS.communityBookStall}
      accent={FACEBOOK_ACCENT}
      icon={<Facebook size={18} />}
    >
      <div className="space-y-3">
        <p className="font-body-small text-one-muted text-sm leading-relaxed">
          The photo above is a station still — not a Facebook post. We do not reconstruct a feed
          from stills.
        </p>
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-label text-[10px] tracking-[0.14em] uppercase text-one-gold hover:text-one-white transition-colors"
        >
          facebook.com/onefmshepparton
          <ArrowUpRight size={12} aria-hidden />
        </a>
      </div>
    </SocialPlatformFrame>
  )
}
