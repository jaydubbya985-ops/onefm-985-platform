import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { TiltCard } from '@/components/TiltCard'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

export interface PageJob {
  label: string
  path: string
  description: string
  icon: LucideIcon
  accent?: string
}

/**
 * Leftover unused station stills — archive photography, not presenter portraits.
 * These files are not used on any other main-branch surface.
 */
const LEFTOVER_STILLS = [
  STATION_PHOTOS.eventOutdoorCinema,
  STATION_PHOTOS.eventFestivalTents,
  STATION_PHOTOS.eventIlluminateWater,
  STATION_PHOTOS.gvlSpectacularMark,
] as const

function leftoverStill(path: string, index: number): string {
  if (path === '/football') return STATION_PHOTOS.gvlSpectacularMark
  return LEFTOVER_STILLS[index % LEFTOVER_STILLS.length]
}

export function PageJobsBar({ jobs, className = '' }: { jobs: PageJob[]; className?: string }) {
  return (
    <section className={`px-4 sm:px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {jobs.map((job, i) => {
            const Icon = job.icon
            const accent = job.accent ?? '#F2F2F2'
            const still = leftoverStill(job.path, i)
            return (
              <motion.div
                key={job.path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <TiltCard maxTilt={6} className="h-full">
                <Link
                  to={job.path}
                  data-cursor-label={job.label.toUpperCase()}
                  className="flex items-center gap-3 glass-card p-3 md:p-4 rounded-xl hover:border-one-gold/40 transition-colors group h-full relative overflow-hidden"
                >
                  <img
                    src={still}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(7,29,58,0.88) 0%, rgba(7,29,58,0.62) 55%, rgba(7,29,58,0.78) 100%)',
                    }}
                  />
                  <div aria-hidden className="explore-tile-scan" />
                  <div
                    className="relative z-10 w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accent}22` }}
                  >
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <p className="font-label text-one-white text-xs group-hover:text-one-gold transition-colors truncate">
                      {job.label}
                    </p>
                    <p className="font-body-small text-muted text-[10px] truncate hidden sm:block">{job.description}</p>
                  </div>
                  <ArrowRight size={14} className="relative z-10 text-one-gold opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
