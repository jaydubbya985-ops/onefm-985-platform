import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { HOST_PHOTOS, PHOTO_DEFAULTS, STATION_PHOTOS } from '@/lib/stationPhotos'
import { HeadlinePop } from '@/components/motion/PosterReveal'
import { TiltCard } from '@/components/TiltCard'

const TILES = [
  {
    title: 'Listen Live',
    desc: 'Stream ONE FM now',
    path: 'https://fm985.com.au/audio-player/',
    external: true,
    image: HOST_PHOTOS.studioControlRoom,
    fallback: PHOTO_DEFAULTS.studio,
  },
  {
    title: 'Programs',
    desc: 'Full program guide',
    path: '/programs',
    image: STATION_PHOTOS.studioSbsDiversity,
    fallback: PHOTO_DEFAULTS.studio,
  },
  {
    title: 'Local Sport',
    desc: 'GVL & community sport',
    path: '/football',
    image: STATION_PHOTOS.gvlNightPanorama,
    fallback: PHOTO_DEFAULTS.football,
  },
  {
    title: 'Community News',
    desc: 'Latest from fm985.com.au',
    path: 'https://fm985.com.au',
    external: true,
    image: STATION_PHOTOS.communityBookStall,
    fallback: PHOTO_DEFAULTS.community,
  },
  {
    title: 'Coverage Map',
    desc: '25 towns · 100km radius',
    path: '/coverage',
    image: STATION_PHOTOS.geoTownAerial,
    fallback: PHOTO_DEFAULTS.regional,
  },
  {
    title: 'Our Story',
    desc: 'Heritage since 1989',
    path: '/heritage',
    image: '/assets/images/heritage-original-panel-1988.jpg',
    fallback: STATION_PHOTOS.studioExteriorRainbow,
  },
  {
    title: 'Sponsor ONE FM',
    desc: 'Partner with the Valley',
    path: '/sponsorship',
    image: HOST_PHOTOS.regionalLandscape,
    fallback: PHOTO_DEFAULTS.regional,
  },
  {
    title: 'Contact',
    desc: 'Get involved',
    path: '/contact',
    image: STATION_PHOTOS.studioPresenterMic,
    fallback: PHOTO_DEFAULTS.studio,
  },
] as const

export function ExploreOneFMGrid() {
  return (
    <section className="section-padding bg-surface-mid section-bleed-top" data-cursor-label="EXPLORE">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="font-label text-one-electric text-[10px] tracking-widest uppercase mb-2">Explore ONE FM</p>
          <h2 className="font-h2 text-one-white">
            <HeadlinePop>Everything the station offers</HeadlinePop>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TILES.map((tile, i) => {
            const isFeatured = i === 0
            const isCompanion = i === 1

            const inner = (
              <TiltCard maxTilt={isFeatured ? 3 : 5} className={isCompanion ? 'h-full' : ''}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className={`group relative rounded-xl overflow-hidden border border-one-border/60 hover:border-one-gold/40 transition-colors ${
                  isFeatured
                    ? 'aspect-[16/9]'
                    : isCompanion
                    ? 'h-full min-h-[240px]'
                    : 'aspect-[4/3]'
                }`}
              >
                <MediaImage
                  src={tile.image}
                  fallbackSrc={tile.fallback}
                  alt={tile.title}
                  className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-one-navy via-one-navy/50 to-transparent" />
                <div aria-hidden className="explore-tile-scan" />
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-h3 text-one-white mb-0.5 ${isFeatured ? 'text-base' : 'text-sm'}`}>{tile.title}</h3>
                      <p className="font-body-small text-one-muted text-xs">{tile.desc}</p>
                    </div>
                    <ArrowUpRight
                      size={isFeatured ? 18 : 16}
                      className="text-one-gold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              </motion.div>
              </TiltCard>
            )

            const linkClass = [
              isFeatured ? 'sm:col-span-2 lg:col-span-2' : '',
              isCompanion ? 'flex flex-col' : '',
            ].filter(Boolean).join(' ')

            return 'external' in tile && tile.external ? (
              <a key={tile.title} href={tile.path} target="_blank" rel="noopener noreferrer" data-cursor-label={tile.title.toUpperCase()} className={linkClass}>
                {inner}
              </a>
            ) : (
              <Link key={tile.title} to={tile.path} data-cursor-label={tile.title.toUpperCase()} className={linkClass}>
                {inner}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
