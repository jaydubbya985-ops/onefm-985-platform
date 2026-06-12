import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'

export default function Privacy() {
  return (
    <Layout>
      <SEO
        title="Privacy Policy"
        description="ONE FM 98.5 privacy policy and terms of use."
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <h1 className="font-h1 text-one-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-one-white/80 font-body-small">
          <p>
            ONE FM 98.5 (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy. This policy
            explains how we collect, use, and protect information when you visit our website or
            interact with our services.
          </p>
          <h2 id="terms" className="font-h3 text-one-white pt-4">
            Terms of Use
          </h2>
          <p>
            By using this website you agree to use it for lawful purposes only. Content on this site
            is provided for general information about ONE FM 98.5 community radio in the Goulburn
            Valley.
          </p>
          <h2 className="font-h3 text-one-white pt-4">Cookies & Analytics</h2>
          <p>
            We use cookies and analytics to improve your experience. You can accept or decline
            cookies via the banner shown on first visit.
          </p>
          <h2 className="font-h3 text-one-white pt-4">Contact</h2>
          <p>
            For privacy enquiries contact{' '}
            <a href="mailto:jason@onefm.com.au" className="text-one-gold hover:underline">
              jason@onefm.com.au
            </a>{' '}
            or call (03) 5831 3131.
          </p>
        </div>
      </div>
    </Layout>
  )
}
