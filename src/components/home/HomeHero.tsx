import { motion } from 'framer-motion'
import { BrandLogo } from '@/components/BrandLogo'
import { MediaImage } from '@/components/MediaImage'
import { BRAND, PHOTO } from '@/lib/brand'

export function HomeHero() {
  return (
    <section className="relative min-h-[88vh] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <MediaImage
          src={PHOTO.hero}
          fallbackSrc={PHOTO.regional}
          alt="Goulburn Murray region"
          priority
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-one-navy via-one-navy/80 to-one-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-one-navy/90 via-one-navy/30 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <BrandLogo variant="primary" className="h-16 sm:h-20 md:h-24 w-auto max-w-[min(420px,90vw)] mb-8 drop-shadow-2xl" />

          <p className="font-label text-one-gold text-xs tracking-[0.2em] uppercase mb-3">
            {BRAND.callsign} · Est. {BRAND.established} · Licensed {BRAND.licensed}
          </p>

          <h1 className="font-h1 text-one-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-5">
            Live &amp; Local across the Goulburn Murray
          </h1>

          <p className="font-body text-one-muted text-base sm:text-lg max-w-xl mb-6">
            Community-owned broadcasting from Shepparton — real presenters, local sport, multicultural
            voices, and the stories that matter to our region.
          </p>

          <div className="flex flex-wrap gap-3 font-label text-[11px] text-one-muted">
            <span className="px-3 py-1.5 rounded-full border border-one-border bg-one-navy/60 backdrop-blur-sm">
              Goulburn Valley Community Radio Inc.
            </span>
            <span className="px-3 py-1.5 rounded-full border border-one-border bg-one-navy/60 backdrop-blur-sm">
              {BRAND.frequency} FM
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
