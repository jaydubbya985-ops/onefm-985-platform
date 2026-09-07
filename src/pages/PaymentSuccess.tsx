import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Mail } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { BRAND } from '@/lib/brand'
import {
  BANK_ACCOUNT,
  BANK_ACCOUNT_NAME,
  BANK_BSB,
  receiptRequestMailto,
} from '@/lib/bankDetails'
import { formatTowns } from '@/lib/coverageCopy'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

const RED = '#E51636'

export default function PaymentSuccess() {
  const reduced = useReducedMotion()

  return (
    <Layout>
      <SEO
        title="Not a card receipt"
        description={`This screen is not a Stripe receipt. ${BRAND.org} invoices and donations for ${formatTowns()} are matched to our NAB account. Nothing is emailed from this page.`}
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-one-red/10 border border-one-red/30 mb-8">
            <Heart size={32} className="text-one-red" />
          </div>

          <span className="section-label justify-center mb-3 block">NAB pay-to · not Stripe</span>
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-end justify-center gap-[1.5px] mb-6"
            aria-hidden
          >
            {Array.from({ length: 18 }, (_, i) => (
              <div
                key={i}
                className="w-[1.5px] rounded-sm"
                style={{
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.61 + 1.2)) * 12 + 2),
                  backgroundColor: 'rgba(229,22,54,0.38)',
                  animation: reduced
                    ? undefined
                    : `freq-bar ${0.7 + (i % 6) * 0.13}s ${(i * 0.086) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>
          <h1 className="font-hero text-one-white mb-4">
            NOT A CARD RECEIPT<span style={{ color: RED }}>.</span>
          </h1>
          <p className="font-body text-one-white/70 mb-6 leading-relaxed">
            Landing here does not mean a card payment went through. Online checkout is not live.
            Invoice and donation payments for {formatTowns()} are matched to our NAB account.
            This page does not send a receipt.
          </p>
          <p className="font-label text-[11px] tracking-[0.12em] uppercase text-one-white/50 mb-8">
            {BANK_ACCOUNT_NAME} · NAB BSB {BANK_BSB} · {BANK_ACCOUNT}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/support" data-cursor-label="SUPPORT" className="btn-primary inline-flex items-center gap-2 text-sm">
              Pay by bank transfer
              <Heart size={14} />
            </Link>
            <Link
              to="/"
              data-cursor-label="HOME"
              className="inline-flex items-center gap-2 font-label text-[11px] text-one-white/50 hover:text-one-red transition-colors"
            >
              Back to Home
              <ArrowRight size={14} />
            </Link>
            <a
              href={receiptRequestMailto()}
              data-cursor-label="DRAFT"
              className="inline-flex items-center gap-2 font-label text-[11px] text-one-white/50 hover:text-one-red transition-colors"
            >
              <Mail size={14} />
              Draft a receipt request
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}
