import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { BRAND } from '@/lib/brand'

export default function PaymentSuccess() {
  return (
    <Layout>
      <SEO
        title="Payment Received"
        description="Thank you — your payment to ONE FM 98.5 has been received."
      />
      <section className="relative min-h-[70dvh] flex items-center justify-center overflow-hidden bg-[#101010]">
        <div aria-hidden className="grain-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/90 via-one-navy/80 to-[#101010]" />

        <div className="relative z-10 max-w-lg mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-one-gold/15 border border-one-gold/40 mb-8">
            <CheckCircle size={32} className="text-one-gold" />
          </div>

          <span className="section-label justify-center mb-3 block">Payment confirmed</span>
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
          <p className="font-body text-one-white/60 mb-8 leading-relaxed">
            Your payment to {BRAND.org} has been processed. A receipt will be sent to the email
            address on your invoice. If you have questions, our team is here to help.
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
          </div>
        </div>
      </section>
    </Layout>
  )
}
