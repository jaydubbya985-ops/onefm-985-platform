import { Link } from 'react-router-dom'
import { XCircle, ArrowRight, Mail } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { BRAND } from '@/lib/brand'

export default function PaymentCancel() {
  return (
    <Layout>
      <SEO
        title="Payment Cancelled"
        description="Your payment was not completed. Contact ONE FM 98.5 if you need assistance."
      />
      <section className="relative min-h-[70dvh] flex items-center justify-center overflow-hidden bg-[#050D1A]">
        <div aria-hidden className="grain-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050D1A]/90 via-one-navy/80 to-[#050D1A]" />

        <div className="relative z-10 max-w-lg mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-one-red/10 border border-one-red/30 mb-8">
            <XCircle size={32} className="text-one-red" />
          </div>

          <span className="section-label justify-center mb-6 block">Payment not completed</span>
          <h1 className="font-hero text-one-white mb-4">CANCELLED</h1>
          <p className="font-body text-one-white/60 mb-8 leading-relaxed">
            No charge was made. You can return to your invoice link to try again, or contact us
            if you need an alternative payment method (EFT, direct debit, or phone).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/" data-cursor-label="HOME" className="btn-primary inline-flex items-center gap-2 text-sm">
              Back to Home
              <ArrowRight size={14} />
            </Link>
            <a
              href={`mailto:${BRAND.email}`}
              data-cursor-label="EMAIL"
              className="inline-flex items-center gap-2 font-label text-[11px] text-one-white/50 hover:text-one-gold transition-colors"
            >
              <Mail size={14} />
              {BRAND.email}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}
