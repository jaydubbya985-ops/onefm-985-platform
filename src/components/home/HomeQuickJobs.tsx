import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Headphones, MapPin, Radio, Calendar } from 'lucide-react'
import { HOME_JOBS } from '@/lib/siteNav'

const ICONS = {
  'Listen Live': Headphones,
  Programs: Calendar,
  Broadcast: Radio,
  Coverage: MapPin,
} as const

export function HomeQuickJobs() {
  return (
    <section className="relative z-20 px-4 sm:px-6 -mt-8 mb-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {HOME_JOBS.map((job, i) => {
            const Icon = ICONS[job.label as keyof typeof ICONS] ?? Radio
            return (
              <motion.div
                key={job.path}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
              >
                <Link
                  to={job.path}
                  className="group flex flex-col h-full glass-card p-4 md:p-5 rounded-xl border-one-border hover:border-one-gold/40 transition-all duration-300"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${job.accent}22` }}
                  >
                    <Icon size={20} style={{ color: job.accent }} />
                  </div>
                  <h2 className="font-h4 text-one-white text-sm md:text-base group-hover:text-one-gold transition-colors">
                    {job.label}
                  </h2>
                  <p className="font-body-small text-muted text-xs mt-1 flex-1">{job.description}</p>
                  <span className="inline-flex items-center gap-1 font-label text-one-gold text-[10px] mt-3 group-hover:gap-2 transition-all">
                    Open <ArrowRight size={12} />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
