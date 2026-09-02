import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, FileText, Mail } from 'lucide-react'
import { WordReveal } from '@/components/WordReveal'
import { MagneticButton } from '@/components/MagneticButton'
import { BRAND } from '@/lib/brand'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { formatCoverageShort, formatWeeklyListeners } from '@/lib/coverageCopy'
import { formatBreakfastChromeLabel } from '@/data/programGuide'
import { formatGuideHours } from '@/lib/guideHours'
import { GVL_PREMIUM_BADGE, STANDARD_SPOT_PLUS_GST } from '@/lib/inventoryCopy'

interface SponsorCommercialCtaProps {
  headline?: string
  subline?: string
  className?: string
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

const COVERAGE = formatCoverageShort()
const GVL_MATCH_HOURS = formatGuideHours('GVL Match of the Day') ?? 'Saturday'
const BREAKFAST_CHROME = formatBreakfastChromeLabel()
/** Unused valley lookout — not a presenter portrait. Named portraits: Di Hunter, Sally Nayler only. */
const LOOKOUT_ALT = `Mountain-bike lookout over the Goulburn Valley — ${BRAND.fullName} station archive · ${COVERAGE}`

export function SponsorCommercialCta({
  headline = 'Ready to reach the Goulburn Valley?',
  subline = `Explore coverage, request a proposal, or email ${BRAND.email}.`,
  className = '',
}: SponsorCommercialCtaProps) {
  return (
    <section className={`relative overflow-hidden bg-surface-deep section-bleed-top ${className}`} data-cursor-label="PARTNER UP">
      {/* Unused station archive photo — valley lookout, not a presenter portrait. */}
      <img
        src={STATION_PHOTOS.geoMtbLookout}
        alt={LOOKOUT_ALT}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div aria-hidden className="grain-overlay" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#101010]/92 via-[#101010]/84 to-[#101010]/72"
      />
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
            <p className="font-label text-[10px] tracking-[0.12em] uppercase text-one-muted/80 mt-3 max-w-xl leading-relaxed">
              {formatWeeklyListeners()} across {COVERAGE}
              <span className="text-one-muted/60"> · ABS 2021 via townData</span>
              <br />
              Weekday breakfast · {BREAKFAST_CHROME}
              <br />
              GVL Match of the Day · {GVL_MATCH_HOURS}
              <br />
              {STANDARD_SPOT_PLUS_GST}. {GVL_PREMIUM_BADGE} — never the $25 floor.
            </p>
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
