import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { formatCoverageShort, formatTowns } from '@/lib/coverageCopy'
import { BREAKFAST_SHOW } from '@/data/programGuide'
import { formatGuideHours } from '@/lib/guideHours'
import { PHOTO_DEFAULTS, STATION_PHOTOS } from '@/lib/stationPhotos'
import { WordReveal } from '@/components/WordReveal'
import { TiltCard } from '@/components/TiltCard'

const TILES = [
  {
    title: 'Listen Live',
    desc: 'Stream ONE FM now',
    path: 'https://fm985.com.au/audio-player/',
    external: true,
    image: STATION_PHOTOS.commentaryBoxAction,
    fallback: PHOTO_DEFAULTS.regional,
  },
  {
    title: 'Programs',
    desc: BREAKFAST_SHOW,
    path: '/programs',
    image: STATION_PHOTOS.studioPresenterMic,
    fallback: PHOTO_DEFAULTS.regional,
  },
  {
    title: 'Local Sport',
    desc: `GVL Match of the Day · ${formatGuideHours('GVL Match of the Day') ?? 'Saturday'} · ${formatTowns()}`,
    path: '/football',
    image: STATION_PHOTOS.gvlNightPanorama,
    fallback: PHOTO_DEFAULTS.regional,
  },
  {
    title: 'Community News',
    desc: 'Latest from fm985.com.au',
    path: 'https://fm985.com.au',
    external: true,
    // cultureFirstNationsDancer is only 196x257px (thumbnail-res) -- visibly
    // pixelated at full grid-tile size. No higher-res original exists.
    image: STATION_PHOTOS.cultureIndigenousElders,
    fallback: PHOTO_DEFAULTS.regional,
  },
  {
    title: 'Coverage Map',
    desc: formatCoverageShort(),
    path: '/coverage',
    image: STATION_PHOTOS.geoTownAerial,
    fallback: PHOTO_DEFAULTS.regional,
  },
  {
    title: 'Our Story',
    desc: 'Heritage since 1989',
    path: '/heritage',
    image: STATION_PHOTOS.studioExteriorRainbow,
    fallback: PHOTO_DEFAULTS.regional,
  },
  {
    title: 'Sponsor ONE FM',
    desc: `Partner across ${formatTowns()}`,
    path: '/proposal',
    image: STATION_PHOTOS.gvlPlayerHighFive,
    fallback: PHOTO_DEFAULTS.regional,
  },
  {
    title: 'Contact',
    desc: 'Get involved',
    path: '/contact',
    // cultureSiloArtFaces is only 287x175px (thumbnail-res). No higher-res
    // original exists.
    image: STATION_PHOTOS.communityBookStall,
    fallback: PHOTO_DEFAULTS.regional,
  },
] as const

export function ExploreOneFMGrid() {
  return (
    <section className="section-padding bg-surface-mid section-bleed-top" data-cursor-label="EXPLORE">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="font-label text-one-electric text-[10px] tracking-widest uppercase mb-2">Explore ONE FM</p>
          <WordReveal text="Everything the station offers" className="font-h2 text-one-white block" as="h2" stagger={0.022} variant="char" />
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
