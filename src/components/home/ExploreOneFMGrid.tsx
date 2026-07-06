import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { PHOTO_DEFAULTS, STATION_PHOTOS } from '@/lib/stationPhotos'
import { LabelReveal } from '@/components/motion/PosterReveal'
import { TiltCard } from '@/components/TiltCard'
import { SIX_PAGES } from '@/lib/siteNav'

/** Six-page IA tiles — sitemap law */
const TILE_META: Record<string, { desc: string; image: string; fallback: string }> = {
  '/': {
    desc: 'The Voice of the Goulburn Valley',
    image: STATION_PHOTOS.commentaryBoxAction,
    fallback: PHOTO_DEFAULTS.regional,
  },
  '/listen': {
    desc: 'Stream ONE FM now',
    image: STATION_PHOTOS.studioPresenterMic,
    fallback: PHOTO_DEFAULTS.regional,
  },
  '/community': {
    desc: '25 towns · GVL · multicultural',
    image: STATION_PHOTOS.geoTownAerial,
    fallback: PHOTO_DEFAULTS.regional,
  },
  '/heritage': {
    desc: 'Living Archive since 1989',
    image: STATION_PHOTOS.studioExteriorRainbow,
    fallback: PHOTO_DEFAULTS.regional,
  },
  '/sponsorship': {
    desc: 'Partner with the Valley',
    image: STATION_PHOTOS.gvlPlayerHighFive,
    fallback: PHOTO_DEFAULTS.regional,
  },
  '/support': {
    desc: 'Keep community radio on air',
    image: STATION_PHOTOS.communityBookStall,
    fallback: PHOTO_DEFAULTS.regional,
  },
}

const TILES = SIX_PAGES.filter((p) => p.path !== '/').map((page) => ({
  title: page.label,
  desc: TILE_META[page.path]?.desc ?? page.description ?? '',
  path: page.path,
  image: TILE_META[page.path]?.image ?? PHOTO_DEFAULTS.regional,
  fallback: TILE_META[page.path]?.fallback ?? PHOTO_DEFAULTS.regional,
}))

export function ExploreOneFMGrid() {
  return (
    <section className="section-padding bg-surface-mid section-bleed-top" data-cursor-label="EXPLORE">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <LabelReveal className="mb-2">Explore ONE FM</LabelReveal>
          <h2 className="font-poster uppercase text-[clamp(32px,5vw,56px)] text-one-white leading-[0.95]">
            The six pages
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TILES.map((tile, i) => {
            const isFeatured = i === 0
            const inner = (
              <TiltCard maxTilt={isFeatured ? 3 : 5}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className={`group relative rounded-xl overflow-hidden border border-one-border/60 hover:border-[#E51636]/40 transition-colors ${
                    isFeatured ? 'aspect-[16/9] sm:col-span-2 lg:col-span-2' : 'aspect-[4/3]'
                  }`}
                >
                  <MediaImage
                    src={tile.image}
                    fallbackSrc={tile.fallback}
                    alt={tile.title}
                    className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-h3 text-one-white mb-0.5 ${isFeatured ? 'text-base' : 'text-sm'}`}>
                          {tile.title}
                        </h3>
                        <p className="font-body-small text-one-muted text-xs">{tile.desc}</p>
                      </div>
                      <ArrowUpRight
                        size={isFeatured ? 18 : 16}
                        className="text-[#E51636] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            )

            return (
              <Link
                key={tile.path}
                to={tile.path}
                data-cursor-label={tile.title.toUpperCase()}
                className={isFeatured ? 'sm:col-span-2 lg:col-span-2' : ''}
              >
                {inner}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
