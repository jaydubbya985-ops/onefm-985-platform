import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, FileText, Mail } from 'lucide-react'
import { WordReveal } from '@/components/WordReveal'
import { MagneticButton } from '@/components/MagneticButton'

interface SponsorCommercialCtaProps {
  headline?: string
  subline?: string
  className?: string
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function SponsorCommercialCta({
  headline = 'Ready to reach the Goulburn Valley?',
  subline = 'Explore coverage, build a proposal, or speak with our partnerships team.',
  className = '',
}: SponsorCommercialCtaProps) {
  return (
    <section className={`relative overflow-hidden bg-surface-deep section-bleed-top ${className}`} data-cursor-label="PARTNER UP">
      <div aria-hidden className="grain-overlay" />
      {/* Gold ambient glow — bottom-center */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 130%, rgba(212,168,75,0.10) 0%, transparent 60%)',
      }} />
      {/* Hairline gold accent — top edge */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, pointerEvents: 'none',
        background: 'linear-gradient(to right, transparent, rgba(212,168,75,0.35) 30%, rgba(212,168,75,0.35) 70%, transparent)',
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
            <span className="section-label text-gold-gradient mb-2 block">Partner with ONE FM</span>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-end gap-[1.5px] mb-4"
              aria-hidden
            >
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="w-[1.5px] rounded-sm" style={{
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.61 + 0.8)) * 12 + 2),
                  backgroundColor: 'rgba(201,162,39,0.35)',
                  animation: `freq-bar ${0.7 + (i % 6) * 0.13}s ${(i * 0.086) % 1}s ease-in-out infinite`,
                }} />
              ))}
            </motion.div>
            <WordReveal text={headline} className="font-h2 text-one-white mb-3 block" as="h2" stagger={0.04} />
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
              <Link to="/proposal" data-cursor-label="PROPOSAL" className="btn-secondary text-xs inline-flex items-center gap-2">
                <FileText size={14} />
                Build a proposal
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
