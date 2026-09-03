import { motion } from 'framer-motion'
import { BRAND } from '@/lib/brand'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { TextScramble } from '@/components/TextScramble'

const FACTS = [
  { label: 'Organisation', value: BRAND.org, scramble: false },
  { label: 'Callsign',     value: BRAND.callsign,           scramble: true  },
  { label: 'Frequency',   value: `${BRAND.frequency} FM`,  scramble: true  },
  { label: 'Licensed',    value: String(BRAND.licensed),   scramble: true  },
  { label: 'Coverage',    value: formatCoverageShort(),     scramble: false },
  { label: 'Contact',     value: BRAND.email,               scramble: false },
] as const

const ease = [0.16, 1, 0.3, 1] as const

export function CredibilityStrip() {
  return (
    <section className="border-y border-one-border/30 bg-surface-deep section-bleed-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {FACTS.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07, duration: 0.5, ease }}
              className="group"
            >
              <p className="font-label text-[9px] text-one-electric/85 uppercase tracking-[0.2em] mb-1.5">
                {f.label}
              </p>
              {f.scramble ? (
                <TextScramble
                  text={f.value}
                  delay={i * 80 + 200}
                  duration={600}
                  className="font-body-small text-one-white text-sm leading-snug group-hover:text-one-gold transition-colors duration-300"
                />
              ) : (
                <p className="font-body-small text-one-white text-sm leading-snug group-hover:text-one-gold transition-colors duration-300">
                  {f.value}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
