import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { HomeHero } from '@/components/home/HomeHero'
import { LivePlayerWidget } from '@/components/home/LivePlayerWidget'
import { ExploreOneFMGrid } from '@/components/home/ExploreOneFMGrid'
import { CredibilityStrip } from '@/components/home/CredibilityStrip'
import { BRAND } from '@/lib/brand'

export default function Home() {
  return (
    <Layout>
      <SEO
        title="Home"
        description={`${BRAND.fullName} — Live & Local across the Goulburn Murray. Community radio from Shepparton. Callsign ${BRAND.callsign}.`}
      />
      <HomeHero />
      <LivePlayerWidget />
      <ExploreOneFMGrid />
      <CredibilityStrip />
    </Layout>
  )
}
