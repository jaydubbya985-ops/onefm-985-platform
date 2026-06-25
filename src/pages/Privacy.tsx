import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { BRAND } from '@/lib/brand'

export default function Privacy() {
  return (
    <Layout>
      <SEO
        title="Privacy Policy"
        description="ONE FM 98.5 privacy policy — how we collect, use, and protect your information."
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <p className="font-label text-[10px] tracking-[0.22em] text-one-electric/60 uppercase mb-4">
          Last updated: June 2026
        </p>
        <h1 className="font-h1 text-one-white mb-4">Privacy Policy</h1>
        <p className="font-body text-one-white/60 mb-12">
          {BRAND.org} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy. This policy
          explains how we collect, use, and protect information when you visit <strong className="text-one-white/80">fm985.com.au</strong> or
          interact with our services.
        </p>

        <div className="space-y-10 text-one-white/75 font-body-small leading-relaxed">

          <section>
            <h2 className="font-h3 text-one-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              We collect information you provide directly — for example, when you submit a sponsorship enquiry,
              request a song, make a donation, or contact us. This may include your name, email address,
              phone number, and message content.
            </p>
            <p>
              We also collect non-personal usage data automatically, including pages visited, time on page,
              browser type, and referring URLs via analytics tools (see Section 3).
            </p>
          </section>

          <section>
            <h2 className="font-h3 text-one-white mb-3">2. How We Use Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To respond to your enquiries and requests</li>
              <li>To process donations and send receipts</li>
              <li>To send station updates and newsletters (only where you have opted in)</li>
              <li>To improve the website based on aggregated usage patterns</li>
              <li>To meet our obligations as an ACMA-licensed broadcaster</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal information with third parties for marketing
              purposes.
            </p>
          </section>

          <section>
            <h2 className="font-h3 text-one-white mb-3">3. Cookies &amp; Analytics</h2>
            <p className="mb-3">
              We use cookies and analytics to understand how visitors use our website. You can accept or
              decline non-essential cookies via the banner shown on first visit. Essential cookies required
              for the site to function cannot be disabled.
            </p>
            <p>
              Our website may embed content from third-party platforms including Facebook, SoundCloud, and
              Google Maps. These services have their own privacy policies and may set their own cookies.
            </p>
          </section>

          <section>
            <h2 className="font-h3 text-one-white mb-3">4. Third-Party Services</h2>
            <p className="mb-3">
              Our website uses the following third-party services:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-one-white/90">Facebook</strong> — page embeds and social sharing. Governed by Meta&apos;s Privacy Policy.</li>
              <li><strong className="text-one-white/90">SoundCloud</strong> — embedded audio players for interview replays.</li>
              <li><strong className="text-one-white/90">Google Maps</strong> — interactive coverage map on fm985.com.au/coverage.</li>
              <li><strong className="text-one-white/90">Stripe</strong> — secure payment processing for donations. Card data is never stored on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-h3 text-one-white mb-3">5. Data Retention</h2>
            <p>
              We retain enquiry and contact records for a maximum of 3 years for operational and legal
              purposes, after which they are securely deleted. Donation records may be retained longer
              as required by Australian taxation law.
            </p>
          </section>

          <section>
            <h2 className="font-h3 text-one-white mb-3">6. Your Rights</h2>
            <p className="mb-3">
              Under the Australian Privacy Act 1988, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Request access to personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
            </ul>
          </section>

          <section id="terms">
            <h2 className="font-h3 text-one-white mb-3">7. Terms of Use</h2>
            <p>
              By using this website you agree to use it for lawful purposes only. Content on this site
              is provided for general information about ONE FM 98.5 community radio in the Goulburn
              Valley and may not be reproduced without written permission.
            </p>
          </section>

          <section>
            <h2 className="font-h3 text-one-white mb-3">8. Contact</h2>
            <p>
              For privacy enquiries, requests to access or correct your data, or to unsubscribe from
              communications, please contact us:
            </p>
            <div className="mt-3 glass-card p-5 inline-block">
              <p className="font-label text-[10px] tracking-[0.2em] text-one-electric/60 mb-2">PRIVACY OFFICER</p>
              <p className="font-body-small text-one-white">{BRAND.org}</p>
              <a href={`mailto:${BRAND.email}`} data-cursor-label="EMAIL" className="font-mono text-[11px] text-one-gold link-hover block mt-1">
                {BRAND.email}
              </a>
              <a href={`tel:+61358313131`} data-cursor-label="CALL" className="font-mono text-[11px] text-one-muted hover:text-one-white transition-colors block mt-0.5">
                {BRAND.phone}
              </a>
              <p className="font-body-small text-one-muted mt-1">{BRAND.address}</p>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  )
}
