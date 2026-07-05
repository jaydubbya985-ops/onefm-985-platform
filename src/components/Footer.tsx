import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUp, Mail, Phone, MapPin } from 'lucide-react'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import { BrandLogo } from '@/components/BrandLogo'
import { BRAND } from '@/lib/brand'
import { FOOTER_LISTEN, FOOTER_SPONSOR, FOOTER_ABOUT, FOOTER_SUPPORT, FOOTER_RESOURCES } from '@/lib/siteNav'
import { MagneticButton } from '@/components/MagneticButton'
import { WordReveal } from '@/components/WordReveal'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const editorialRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: editorialRef, offset: ['start end', 'end start'] })
  const ghostX = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  return (
    <footer className="relative bg-surface-deep section-bleed-top overflow-hidden">

      {/* ── Large editorial statement ── */}
      <div ref={editorialRef} className="relative border-b border-white/10 overflow-hidden py-16 md:py-20" data-cursor-label="LISTEN LIVE">
        <motion.div aria-hidden style={{ x: ghostX }} className="pointer-events-none absolute inset-0 select-none flex items-center overflow-hidden">
          <span
            className="font-heading font-bold text-one-white/[0.025] whitespace-nowrap leading-none"
            style={{ fontSize: 'clamp(6rem, 18vw, 16rem)', letterSpacing: '-0.04em' }}
          >
            98.5 FM
          </span>
        </motion.div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease }}
              className="font-label text-one-electric text-[10px] tracking-[0.28em] mb-4"
            >
              GOULBURN VALLEY · SINCE 1989
            </motion.p>
            <h2
              className="font-heading font-bold mb-6"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              <WordReveal text="The valley's voice," as="span" className="block text-one-white" delay={0.1} stagger={0.022} variant="char" />
              <WordReveal text="on air 24/7." as="span" className="block text-[#E51636]" delay={0.65} stagger={0.028} variant="char" />
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.75, ease }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton strength={10} cursorLabel="LISTEN">
                <Link to="/listen" className="btn-primary text-sm">
                  Listen Live
                </Link>
              </MagneticButton>
              <MagneticButton strength={8} cursorLabel="CONTACT">
                <Link to="/contact" className="btn-secondary text-sm">
                  Get in Touch
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main link columns ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20" data-cursor-label="NAVIGATE">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-8">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0, ease }}
            className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-5"
          >
            <BrandLogo variant="primary" className="h-11 w-auto object-contain" />
            <p className="font-body-small text-one-muted max-w-xs leading-relaxed">
              {BRAND.org} — community radio for the Goulburn Valley.
              Callsign {BRAND.callsign} · Licensed since {BRAND.licensed}.
            </p>
            <div className="flex items-center gap-5 pt-1">
              <motion.a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="FACEBOOK"
                className="text-one-muted hover:text-[#E51636] transition-colors"
                aria-label="Facebook"
                whileHover={{ scale: 1.15, y: -1 }}
                transition={{ duration: 0.18, ease }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </motion.a>
              <motion.a
                href={BRAND.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="SOUNDCLOUD"
                className="text-one-muted hover:text-[#E51636] transition-colors"
                aria-label="SoundCloud"
                whileHover={{ scale: 1.15, y: -1 }}
                transition={{ duration: 0.18, ease }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/>
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Listen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.08, ease }}
          >
            <h3 className="font-label text-[10px] tracking-[0.22em] text-one-electric mb-5">LISTEN</h3>
            <ul className="space-y-3">
              {FOOTER_LISTEN.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150 text-sm link-hover">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Sponsor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.14, ease }}
          >
            <h3 className="font-label text-[10px] tracking-[0.22em] text-one-electric mb-5">SPONSOR</h3>
            <ul className="space-y-3">
              {FOOTER_SPONSOR.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150 text-sm link-hover">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.2, ease }}
          >
            <h3 className="font-label text-[10px] tracking-[0.22em] text-one-electric mb-5">ABOUT</h3>
            <ul className="space-y-3 mb-6">
              {FOOTER_ABOUT.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150 text-sm link-hover">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-label text-[10px] tracking-[0.22em] text-one-electric mb-4">SUPPORT</h3>
            <ul className="space-y-3">
              {FOOTER_SUPPORT.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150 text-sm link-hover">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.26, ease }}
            data-cursor-label="CONTACT"
          >
            <h3 className="font-label text-[10px] tracking-[0.22em] text-one-electric mb-5">CONTACT</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={14} className="text-one-muted mt-0.5 shrink-0" />
                <a href={`mailto:${BRAND.email}`} data-cursor-label="EMAIL" className="font-mono text-[11px] text-one-muted hover:text-one-white transition-colors leading-relaxed">
                  {BRAND.email}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={14} className="text-one-muted mt-0.5 shrink-0" />
                <a href={`tel:+61358313131`} data-cursor-label="CALL" className="font-mono text-[11px] text-one-muted hover:text-one-white transition-colors">
                  {BRAND.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-one-muted mt-0.5 shrink-0" />
                <span className="font-mono text-[11px] text-one-muted leading-relaxed">{BRAND.address}</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── EQ bars — broadcast signature ── */}
      <div
        aria-hidden
        className="flex items-end justify-center gap-[2px] py-5 border-t border-white/8"
      >
        {Array.from({ length: 56 }, (_, i) => {
          const dur = 0.85 + (i % 7) * 0.17
          const delay = (i * 0.08) % 1.3
          const maxH = 8 + (i % 5) * 9
          return (
            <div
              key={i}
              style={{
                width: 2,
                height: maxH,
                borderRadius: 1,
                background: 'rgba(212,175,55,0.14)',
                transformOrigin: 'bottom',
                animation: `freq-bar ${dur}s ${delay}s ease-in-out infinite`,
              }}
            />
          )
        })}
      </div>

      {/* ── Bottom bar (pb-20 leaves clearance for MiniPlayer) ── */}
      <div className="border-t border-white/10" data-cursor-label="LEGAL">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-label text-[10px] text-one-muted/85 tracking-wider">
            &copy; {new Date().getFullYear()} {BRAND.fullName} · ABN {BRAND.abn}
          </p>
          <div className="flex items-center gap-6">
            {FOOTER_RESOURCES.map((link) => (
              <Link key={link.label} to={link.path} className="font-label text-[10px] text-one-muted/85 hover:text-one-muted transition-colors tracking-wider link-hover">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-label text-[10px] text-one-muted/85 tracking-wider">
              {BRAND.callsign} · ACMA {BRAND.acma}
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              data-cursor-label="TOP"
              className="p-2 rounded-full border border-white/10 text-one-muted/85 hover:text-one-white hover:border-[#E51636]/40 transition-all"
              aria-label="Back to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>

    </footer>
  )
}
