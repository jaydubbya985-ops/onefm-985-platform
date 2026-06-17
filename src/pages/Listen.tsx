import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { LivePlayerWidget } from '@/components/home/LivePlayerWidget'
import { CinegraphBackground } from '@/components/CinegraphBackground'
import { PageJobsBar, type PageJob } from '@/components/PageJobsBar'
import { SoundCloudPanel } from '@/components/social/SoundCloudPanel'
import { FacebookPanel } from '@/components/social/FacebookPanel'
import { LISTEN_LINKS } from '@/lib/listenLinks'
import { BRAND } from '@/lib/brand'
import { ExternalLink, Headphones, MapPin, Radio, Smartphone, Trophy } from 'lucide-react'

const PAGE_JOBS: PageJob[] = [
  { label: 'Programs', path: '/programs', description: 'Weekly guide', icon: Radio, accent: '#D4AF37' },
  { label: 'Broadcast', path: '/broadcast', description: 'Schedule grid', icon: Headphones, accent: '#2EC4B6' },
  { label: 'Coverage', path: '/coverage', description: '25 towns', icon: MapPin, accent: '#1B458F' },
  { label: 'GVL Football', path: '/football', description: 'Game day', icon: Trophy, accent: '#E51636' },
]

const WAYS = [
  {
    icon: Radio,
    title: LISTEN_LINKS.fm.label,
    desc: LISTEN_LINKS.fm.description,
    detail: 'Tune your radio to 98.5 FM in the Goulburn Murray',
    href: null,
  },
  {
    icon: Headphones,
    title: LISTEN_LINKS.web.label,
    desc: LISTEN_LINKS.web.description,
    detail: 'Official web audio player',
    href: LISTEN_LINKS.web.href,
  },
  {
    icon: Smartphone,
    title: LISTEN_LINKS.crp.label,
    desc: LISTEN_LINKS.crp.description,
    detail: 'Search ONE FM in the app',
    href: LISTEN_LINKS.crp.href,
  },
] as const

export default function Listen() {
  return (
    <Layout>
      <SEO
        title="Listen Live"
        description="Listen to ONE FM 98.5 live — FM 98.5 across the Goulburn Murray, stream at fm985.com.au, or via Community Radio Plus."
      />

      <section className="relative min-h-[58dvh] flex flex-col justify-end overflow-hidden pt-24 bg-[#050D1A]">
        <div aria-hidden className="grain-overlay" />
        <div className="absolute inset-0 z-0">
          <CinegraphBackground slot="listenStudio" opacity={0.35} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050D1A]/60 via-[#050D1A]/30 to-one-navy" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050D1A]/40 via-transparent to-[#050D1A]/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pb-12 w-full text-center">
          <span className="section-label justify-center mb-6 block">On Air Now</span>
          <h1 className="font-hero text-one-white mb-4">
            LISTEN <span className="text-one-gold">LIVE</span>
          </h1>
          <p className="font-body text-one-white/50 max-w-2xl mx-auto italic">
            {BRAND.fullName} — {BRAND.tagline} across the {BRAND.region}. FM, online stream, and Community Radio Plus.
          </p>
        </div>
      </section>

      <PageJobsBar jobs={PAGE_JOBS} className="-mt-4 pb-6 relative z-20" />

      <LivePlayerWidget className="-mt-2" />

      <section className="section-padding bg-one-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-h2 text-one-white mb-2">Ways to Listen</h2>
          <p className="font-body-small text-muted mb-8">All official ONE FM listening options</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WAYS.map((way) => {
              const Icon = way.icon
              const inner = (
                <div className="glass-card p-6 h-full hover:border-one-gold/30 transition-colors">
                  <Icon size={28} className="text-one-gold mb-4" />
                  <h3 className="font-h4 text-one-white mb-1">{way.title}</h3>
                  <p className="font-body-small text-muted mb-2">{way.desc}</p>
                  <p className="font-label text-xs text-one-white/70">{way.detail}</p>
                  {way.href && (
                    <span className="inline-flex items-center gap-1 font-label text-one-gold text-[10px] mt-4">
                      Open <ExternalLink size={10} />
                    </span>
                  )}
                </div>
              )
              return way.href ? (
                <a key={way.title} href={way.href} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={way.title}>{inner}</div>
              )
            })}
          </div>

          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            <SoundCloudPanel compact />
            <FacebookPanel compact />
          </div>

          <div className="mt-8 glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-label text-one-gold text-xs mb-1">Studio line</p>
              <a href={LISTEN_LINKS.phone.href!} className="font-h4 text-one-white hover:text-one-gold transition-colors">
                {BRAND.phone}
              </a>
            </div>
            <p className="font-body-small text-muted text-sm max-w-md">
              {BRAND.org} · {BRAND.address}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  )
}
