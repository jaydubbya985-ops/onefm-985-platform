import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, type LucideIcon } from 'lucide-react'

export interface PageJob {
  label: string
  path: string
  description: string
  icon: LucideIcon
  accent?: string
}

export function PageJobsBar({ jobs, className = '' }: { jobs: PageJob[]; className?: string }) {
  return (
    <section className={`px-4 sm:px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {jobs.map((job, i) => {
            const Icon = job.icon
            const accent = job.accent ?? '#D4AF37'
            return (
              <motion.div
                key={job.path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Link
                  to={job.path}
                  className="flex items-center gap-3 glass-card p-3 md:p-4 rounded-xl hover:border-one-gold/40 transition-colors group h-full"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accent}22` }}
                  >
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-label text-one-white text-xs group-hover:text-one-gold transition-colors truncate">
                      {job.label}
                    </p>
                    <p className="font-body-small text-muted text-[10px] truncate hidden sm:block">{job.description}</p>
                  </div>
                  <ArrowRight size={14} className="text-one-gold opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
