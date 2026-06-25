import { Facebook, Radio, Calendar, Users } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import { SocialPlatformFrame } from '@/components/social/SocialPlatformFrame'
import { cn } from '@/lib/utils'

const FACEBOOK_ACCENT = '#1877F2'

const HIGHLIGHTS = [
  {
    image: STATION_PHOTOS.gvlNightPanorama,
    label: 'GVL game day',
    caption: 'Live footy & netball updates every Saturday.',
    icon: Radio,
  },
  {
    image: STATION_PHOTOS.communityOutdoorMarket,
    label: 'Community events',
    caption: 'Festivals, markets, and Valley happenings.',
    icon: Calendar,
  },
  {
    image: STATION_PHOTOS.studioPresenterMic,
    label: 'Behind the mic',
    caption: 'Studio moments and multicultural programming.',
    icon: Users,
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
      imageFallback={STATION_PHOTOS.eventFoodTrucks}
      accent={FACEBOOK_ACCENT}
      icon={<Facebook size={18} />}
    >
      <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'sm:grid-cols-3')}>
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.label}
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 rounded-xl border border-one-border/60 bg-one-navy/40 p-2.5 hover:border-one-gold/30 hover:bg-one-navy/70 transition-all"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-one-border/50">
                <MediaImage
                  src={item.image}
                  alt=""
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
