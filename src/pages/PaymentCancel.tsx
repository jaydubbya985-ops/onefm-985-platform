import { Link } from 'react-router-dom'
import { XCircle, ArrowRight, Mail, Heart } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { BRAND } from '@/lib/brand'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from '@/lib/bankDetails'
import { formatTowns } from '@/lib/coverageCopy'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

export default function PaymentCancel() {
  return (
    <Layout>
      <SEO
        title="Payment not completed"
        description={`No online charge was taken. ${BRAND.org} invoices and donations are paid to our NAB account — this page is not a Stripe receipt.`}
      />
      <section className="relative min-h-[70dvh] flex items-center justify-center overflow-hidden bg-[#101010]">
        <img
          src={STATION_PHOTOS.obMatchDayBanner}
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
            <XCircle size={32} className="text-one-red" />
          </div>

          <span className="section-label justify-center mb-6 block">Volunteer-run · Shepparton</span>
          <h1 className="font-hero text-one-white mb-4">NO CHARGE</h1>
          <p className="font-body text-one-white/60 mb-6 leading-relaxed">
            Nothing was taken on this page. Online checkout is not live — {BRAND.fullName}{' '}
            invoices and donations for {formatTowns()} are paid to our NAB account.
            This screen is not a Stripe receipt.
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
              className="inline-flex items-center gap-2 font-label text-[11px] text-one-white/50 hover:text-one-gold transition-colors"
            >
              Back to Home
              <ArrowRight size={14} />
            </Link>
            <a
              href={`mailto:${BRAND.accountsEmail}?subject=${encodeURIComponent('Payment for ONE FM 98.5')}`}
              data-cursor-label="EMAIL"
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
