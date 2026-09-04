import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, FileText, Mail } from 'lucide-react'
import { WordReveal } from '@/components/WordReveal'
import { MagneticButton } from '@/components/MagneticButton'
import { BRAND } from '@/lib/brand'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

interface SponsorCommercialCtaProps {
  headline?: string
  subline?: string
  className?: string
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function SponsorCommercialCta({
  headline = 'Ready to reach the Goulburn Valley?',
  subline = `Explore coverage, request a proposal, or email ${BRAND.email}.`,
  className = '',
}: SponsorCommercialCtaProps) {
  return (
    <section className={`relative overflow-hidden bg-surface-deep section-bleed-top ${className}`} data-cursor-label="SPONSOR">
      {/* Unused station archive photo — valley lookout, not a presenter portrait. */}
      <img
        src={STATION_PHOTOS.geoMtbLookout}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div aria-hidden className="grain-overlay" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#101010]/92 via-[#101010]/84 to-[#101010]/72"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="section-label text-white/50 mb-2 block">Sponsor on ONE FM</span>
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
                Request a proposal
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
