import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Mail } from 'lucide-react'
import { LabelReveal } from '@/components/motion/PosterReveal'
import { MagneticButton } from '@/components/MagneticButton'

interface SponsorCommercialCtaProps {
  headline?: string
  subline?: string
  className?: string
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function SponsorCommercialCta({
  headline = 'Ready to reach the Goulburn Valley?',
  subline = 'Explore coverage, see the rate card, or start a conversation with the station.',
  className = '',
}: SponsorCommercialCtaProps) {
  return (
    <section className={`relative overflow-hidden bg-surface-deep section-bleed-top ${className}`} data-cursor-label="PARTNER UP">
      <div aria-hidden className="grain-overlay" />
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 130%, rgba(229,22,54,0.08) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease }}
          >
            <LabelReveal className="mb-4">Partner with ONE FM</LabelReveal>
            <h2 className="font-poster uppercase text-[clamp(28px,4vw,44px)] text-one-white mb-3 leading-[0.95]">
              {headline}
            </h2>
            <p className="font-body-small text-muted">{subline}</p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
          >
            <MagneticButton strength={6}>
              <Link to="/coverage" data-cursor-label="COVERAGE" className="btn-secondary text-xs inline-flex items-center gap-2">
                <MapPin size={14} />
                See coverage map
              </Link>
            </MagneticButton>
            <MagneticButton strength={6}>
              <Link to="/sponsorship#enquire" data-cursor-label="ENQUIRE" className="btn-secondary text-xs inline-flex items-center gap-2">
                Start a conversation
              </Link>
            </MagneticButton>
            <MagneticButton strength={10}>
              <Link to="/contact" data-cursor-label="CONTACT" className="btn-primary text-xs inline-flex items-center gap-2">
                <Mail size={14} />
                Contact us
                <ArrowRight size={12} />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
