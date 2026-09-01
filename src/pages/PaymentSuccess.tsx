import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { BRAND } from '@/lib/brand'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from '@/lib/bankDetails'
import { formatTowns } from '@/lib/coverageCopy'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

export default function PaymentSuccess() {
  return (
    <Layout>
      <SEO
        title="Thank you"
        description={`Thank you for supporting ${BRAND.org} — volunteer-run community radio across ${formatTowns()}. Payments are confirmed against our NAB account.`}
      />
      <section className="relative min-h-[70dvh] flex items-center justify-center overflow-hidden bg-[#101010]">
        <img
          src={STATION_PHOTOS.obTruckBranded}
          alt=""
          aria-hidden
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div aria-hidden className="grain-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/88 via-one-navy/78 to-[#101010]" />

        <div className="relative z-10 max-w-lg mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-one-gold/15 border border-one-gold/40 mb-8">
            <Heart size={32} className="text-one-gold" />
          </div>

          <span className="section-label justify-center mb-3 block">Volunteer-run · Shepparton</span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-end justify-center gap-[1.5px] mb-6"
            aria-hidden
          >
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} className="w-[1.5px] rounded-sm" style={{
                height: 3 + Math.floor(Math.abs(Math.sin(i * 0.61 + 1.2)) * 12 + 2),
                backgroundColor: 'rgba(201,162,39,0.38)',
                animation: `freq-bar ${0.7 + (i % 6) * 0.13}s ${(i * 0.086) % 1}s ease-in-out infinite`,
              }} />
            ))}
          </motion.div>
          <h1 className="font-hero text-gold-gradient mb-4">THANK YOU</h1>
          <p className="font-body text-one-white/70 mb-6 leading-relaxed">
            Your support keeps {BRAND.fullName} live and local across {formatTowns()}.{' '}
            {BRAND.org} is volunteer-run. Invoice and donation payments are matched
            to our NAB account — this page does not send a receipt automatically.
          </p>
          <p className="font-label text-[11px] tracking-[0.12em] uppercase text-one-white/50 mb-8">
            {BANK_ACCOUNT_NAME} · NAB BSB {BANK_BSB} · {BANK_ACCOUNT}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/" data-cursor-label="HOME" className="btn-primary inline-flex items-center gap-2 text-sm">
              Back to Home
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/support"
              data-cursor-label="SUPPORT"
              className="inline-flex items-center gap-2 font-label text-[11px] text-one-white/50 hover:text-one-gold transition-colors"
            >
              <Heart size={14} />
              Support ONE FM
            </Link>
            <a
              href={`mailto:${BRAND.accountsEmail}?subject=${encodeURIComponent('Receipt for ONE FM 98.5')}`}
              data-cursor-label="RECEIPT"
              className="inline-flex items-center gap-2 font-label text-[11px] text-one-white/50 hover:text-one-gold transition-colors"
            >
              <Mail size={14} />
              {BRAND.accountsEmail}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}
