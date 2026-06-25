import { motion } from 'framer-motion'
import { HOME_JOBS } from '@/lib/siteNav'
import { FeaturePortal } from '@/components/FeaturePortal'
import { TiltCard } from '@/components/TiltCard'

export function HomeQuickJobs() {
  return (
    <section className="relative z-20 px-4 sm:px-6 -mt-20 mb-6">
      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="font-label text-one-muted text-[10px] mb-4 text-center sm:text-left"
        >
          Explore ONE FM
        </motion.p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {HOME_JOBS.map((job, i) => (
            <motion.div
              key={job.path}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard maxTilt={6}>
                <FeaturePortal
                  to={job.path}
                  title={job.label}
                  description={job.description}
                  image={job.image}
                  tags={[...job.tags]}
                  accent={job.accent}
                />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
