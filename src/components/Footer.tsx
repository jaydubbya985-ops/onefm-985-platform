import { Link } from 'react-router-dom'
import { ArrowUp, Mail, Phone, MapPin, Radio } from 'lucide-react'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import { BrandLogo } from '@/components/BrandLogo'
import { BRAND } from '@/lib/brand'
import { FOOTER_LISTEN, FOOTER_SPONSOR, FOOTER_ABOUT, FOOTER_SUPPORT, FOOTER_RESOURCES } from '@/lib/siteNav'

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-one-navy border-t border-one-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center gap-2">
              <BrandLogo variant="primary" className="h-12 w-auto object-contain" />
              <Radio size={20} className="text-one-gold" />
            </div>
            <p className="font-body-small text-one-white max-w-xs">
              {BRAND.org} — community radio for the Goulburn Valley since {BRAND.licensed}.
            </p>
            <div className="flex items-center gap-4">
              <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer" className="text-one-muted hover:text-one-white transition-colors" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href={BRAND.soundcloud} target="_blank" rel="noopener noreferrer" className="text-one-muted hover:text-one-white transition-colors" aria-label="SoundCloud">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/></svg>
              </a>
            </div>
          </div>

          {/* Listen */}
          <div>
            <h4 className="font-h4 text-one-white mb-6">Listen</h4>
            <ul className="space-y-3">
              {FOOTER_LISTEN.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sponsor */}
          <div>
            <h4 className="font-h4 text-one-white mb-6">Sponsor</h4>
            <ul className="space-y-3">
              {FOOTER_SPONSOR.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About + Support */}
          <div>
            <h4 className="font-h4 text-one-white mb-6">About</h4>
            <ul className="space-y-3 mb-8">
              {FOOTER_ABOUT.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-h4 text-one-white mb-4">Support</h4>
            <ul className="space-y-3">
              {FOOTER_SUPPORT.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-h4 text-one-white mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-one-gold mt-1 shrink-0" />
                <a href={`mailto:${BRAND.email}`} className="font-mono text-sm text-one-white hover:text-one-gold transition-colors">
                  {BRAND.email}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-one-gold mt-1 shrink-0" />
                <a href={`tel:+61358313131`} className="font-mono text-sm text-one-white hover:text-one-gold transition-colors">
                  {BRAND.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-one-gold mt-1 shrink-0" />
                <span className="font-mono text-sm text-one-white">{BRAND.address}</span>
              </div>
            </div>
            <ul className="space-y-2 mt-8 pt-6 border-t border-one-border">
              {FOOTER_RESOURCES.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="font-body-small text-one-muted hover:text-one-white transition-colors text-xs">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-one-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-micro text-one-muted">
            &copy; {new Date().getFullYear()} {BRAND.fullName} · ABN {BRAND.abn}
          </p>
          <p className="font-micro text-one-muted">Callsign {BRAND.callsign} · ACMA Licence 1385226/1</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="p-2 rounded-full border border-one-border text-one-muted hover:text-one-white hover:border-one-gold transition-all"
            aria-label="Back to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  )
}
