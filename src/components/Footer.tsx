import { Link } from 'react-router-dom'
import { ArrowUp, Mail, Phone, MapPin, Radio } from 'lucide-react'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import { BrandLogo } from '@/components/BrandLogo'

const pageLinks = [
  { label: 'Home', path: '/' },
  { label: 'Media Kit', path: '/media-kit' },
  { label: 'Broadcast', path: '/broadcast' },
  { label: 'Sponsorship', path: '/sponsorship' },
  { label: 'Audience', path: '/audience' },
  { label: 'Social', path: '/social' },
  { label: 'Proposal Builder', path: '/proposal' },
  { label: 'Heritage', path: '/heritage' },
]

const resourceLinks = [
  { label: 'Brand Guidelines', path: '/media-kit' },
  { label: 'Rate Card', path: '/sponsorship' },
  { label: 'Press Kit', path: '/media-kit' },
  { label: 'API Access', path: '/audience' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms of Use', path: '/privacy#terms' },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-one-navy border-t border-one-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <BrandLogo variant="primary" className="h-12 w-auto object-contain" />
              <Radio size={20} className="text-one-gold" />
            </div>
            <p className="font-body-small text-one-white max-w-xs">
              Community radio for the Goulburn Valley since 1989. Local voices, local stories, local music.
            </p>
            <div className="flex items-center gap-4">
              <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer" className="text-one-muted hover:text-one-white transition-colors" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="text-one-muted hover:text-one-white transition-colors" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="text-one-muted hover:text-one-white transition-colors" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="text-one-muted hover:text-one-white transition-colors" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
              <a href="#" className="text-one-muted hover:text-one-white transition-colors" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-h4 text-one-white mb-6">Navigate</h4>
            <ul className="space-y-3">
              {pageLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-h4 text-one-white mb-6">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="font-body-small text-one-muted hover:text-one-white transition-colors duration-150"
                  >
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
                <span className="font-mono text-sm text-one-white">partnerships@onefm.station</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-one-gold mt-1 shrink-0" />
                <span className="font-mono text-sm text-one-white">+1 (555) 98-ONE-FM</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-one-gold mt-1 shrink-0" />
                <span className="font-mono text-sm text-one-white">100 Broadcast Plaza<br />Regional CBD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-one-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-micro text-one-muted">
            &copy; {new Date().getFullYear()} ONE FM. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-micro text-one-muted flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-one-gold"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5A9.9 9.9 0 0 0 12 21a10 10 0 0 0 8.5-4.5"/></svg>
              Powered by ONE FM AI
            </span>
          </div>
          <button
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
