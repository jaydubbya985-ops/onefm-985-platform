import { BookOpen, Facebook, Mic, Radio } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import { formatGuideHours } from '@/lib/guideHours'
import { SocialPlatformFrame } from '@/components/social/SocialPlatformFrame'
import { cn } from '@/lib/utils'

const FACEBOOK_ACCENT = '#1877F2'

const GVL_GAME_DAY_CAPTION = `GVL Match of the Day · ${formatGuideHours('GVL Match of the Day') ?? 'Saturday'}`

const HIGHLIGHTS = [
  {
    image: STATION_PHOTOS.gvlNightPanorama,
    label: 'On the weekly guide',
    caption: GVL_GAME_DAY_CAPTION,
    alt: 'GVL night panorama — station archive',
    icon: Radio,
  },
  {
    image: STATION_PHOTOS.communityOutdoorMarket,
    label: 'Station archive',
    caption: 'Community book stall — station archive.',
    alt: 'Community book stall — station archive',
    icon: BookOpen,
  },
  {
    image: STATION_PHOTOS.studioPresenterMic,
    label: 'Station archive',
    caption: 'Studio microphone — station archive.',
    alt: 'Studio microphone — station archive',
    icon: Mic,
  },
] as const

export interface FacebookPanelProps {
  compact?: boolean
  className?: string
}

export function FacebookPanel({ compact, className }: FacebookPanelProps) {
  return (
    <SocialPlatformFrame
      compact={compact}
      className={className}
      eyebrow="COMMUNITY"
      title="ONE FM on Facebook"
      description="News, events, and local stories from facebook.com/onefmshepparton."
      href={FACEBOOK_PAGE_URL}
      hrefLabel="Follow"
      image={STATION_PHOTOS.communityOutdoorMarket}
      imageFallback={STATION_PHOTOS.studioPresenterMic}
      accent={FACEBOOK_ACCENT}
      icon={<Facebook size={18} />}
    >
      <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'sm:grid-cols-3')}>
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.caption}
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 rounded-xl border border-one-border/60 bg-one-navy/40 p-2.5 hover:border-one-gold/30 hover:bg-one-navy/70 transition-all"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-one-border/50">
                <MediaImage
                  src={item.image}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-one-navy/20 group-hover:bg-one-navy/10 transition-colors" />
                <div aria-hidden className="explore-tile-scan" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className="text-one-gold shrink-0" />
                  <span className="font-label text-[9px] text-one-gold">{item.label}</span>
                </div>
                <p className="font-body-small text-one-muted text-xs mt-1 line-clamp-2 leading-snug">
                  {item.caption}
                </p>
              </div>
            </a>
          )
        })}
      </div>
    </SocialPlatformFrame>
  )
}
