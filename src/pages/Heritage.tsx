/**
 * HISTORY — rebuilt per REBUILD-SPEC.md (page 5 of 6).
 * Absorbs Story (/story → redirect). Assembled from the ON AIR kit.
 * Sources: fm985.com.au/about, ACMA licence records, station archive photos.
 */
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { HorizontalGallery } from '@/components/HorizontalGallery'
import {
  OnAirTicker,
  NameWall,
  FeatureFrame,
  StatsStrip,
  LabelReveal,
  EditorialCards,
  PosterReveal,
  StrokeFill,
} from '@/components/onair/kit'
import { stationStats } from '@/data/pricing'

const RED = '#E51636'

/** Milestones — source: ACMA records, fm985.com.au, station archive */
const MILESTONES = [
  {
    year: '1980',
    title: 'Founded',
    body: 'Goulburn Valley Community Radio Inc. established in Shepparton — volunteers building a community voice for regional Victoria.',
  },
  {
    year: '1989',
    title: 'Licensed Broadcaster',
    body: 'Permanent full-time licence granted. ONE FM 98.5 (callsign 3ONE) begins licensed FM transmissions across the Goulburn Murray.',
  },
  {
    year: '1990',
    title: 'Multicultural Programming',
    body: 'Dedicated language and multicultural shows connect Italian, Samoan, and diverse Valley communities on the dial.',
  },
  {
    year: '2005',
    title: 'Online Streaming',
    body: 'Live stream at fm985.com.au — the Valley on air wherever listeners are, across Australia and beyond.',
  },
  {
    year: '2010',
    title: 'GVL Football & Netball',
    body: 'ONE FM becomes the broadcast partner for Goulburn Valley League — live match calls every weekend.',
  },
  {
    year: String(stationStats.yearsBroadcasting + 1989),
    title: 'Live & Local — Always',
    body: `${stationStats.yearsBroadcasting} years on air — volunteer-run, community-owned, still broadcasting 24/7 from Shepparton.`,
  },
]

const LEGENDS = [
  {
    name: 'Sally Nayler',
    sub: 'On air in Studio A · 1990s',
    img: '/assets/images/heritage-sally-nayler-90s.jpg',
  },
  {
    name: 'Di Hunter',
    sub: 'On air since the early days',
    img: '/assets/images/heritage-di-hunter-carols-2014.jpg',
  },
  {
    name: 'The 1988 Panel',
    sub: 'Original mixing desk · built in-house',
    img: '/assets/images/heritage-original-panel-1988.jpg',
  },
]

function HeritageHero() {
  const reduced = useReducedMotion()
  return (
    <section className="relative overflow-hidden px-6 md:px-12 lg:px-20 pt-24 pb-20 min-h-[82vh] flex flex-col justify-center">
      {reduced ? (
        <img
          src="/assets/images/heritage-original-panel-1988.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
        />
      ) : (
        <video
          src="/videos/heroes/hero-05-river-bridge.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.42) saturate(0.85)' }}
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,.15) 45%, #0A0A0A 100%)',
        }}
        aria-hidden
      />
      <div className="relative">
        <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(56px,11vw,160px)]">
          <PosterReveal
            lines={[
              <span key="a" className="poster-hover">
                Since
              </span>,
              <span key="b">
                <StrokeFill delay={0.9}>1989</StrokeFill>
                <span style={{ color: RED }}>.</span>
              </span>,
            ]}
          />
        </h1>
        <p className="mt-7 max-w-[560px] text-[17px] leading-relaxed text-white/60">
          Established in 1980, licensed in 1989 — Goulburn Valley Community Radio Inc. has been
          the Valley&apos;s volunteer-run voice for {stationStats.yearsBroadcasting} years. Callsign{' '}
          <strong className="text-white/80">3ONE</strong>.
        </p>
      </div>
    </section>
  )
}

function MilestoneStrip() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <LabelReveal className="mb-8">The Timeline</LabelReveal>
      <div
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {MILESTONES.map((m) => (
          <article
            key={m.year + m.title}
            className="snap-start shrink-0 w-[min(88vw,340px)] border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636]"
          >
            <div
              className="font-poster text-[clamp(36px,5vw,52px)] leading-none mb-3"
              style={{ color: RED }}
            >
              {m.year}
            </div>
            <h3 className="font-poster uppercase text-[22px] text-white leading-[1.1] mb-2">
              {m.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-white/55">{m.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function Heritage() {
  return (
    <Layout>
      <SEO
        title="History — ONE FM 98.5 Since 1989"
        description={`${stationStats.yearsBroadcasting} years of community broadcasting. Goulburn Valley Community Radio Inc. · callsign 3ONE · volunteer-run from Shepparton.`}
      />
      <div style={{ background: '#0A0A0A' }} className="min-h-screen">
        <OnAirTicker
          items={[
            'Est. 1989 · Goulburn Valley Community Radio Inc.',
            'Callsign 3ONE · 98.5 FM Shepparton',
            `${stationStats.yearsBroadcasting} years on air`,
            'Volunteer-run · community-owned · not for profit',
          ]}
          delay={0.4}
        />
        <HeritageHero />

        <div id="archive">
          <HorizontalGallery />
        </div>

        <MilestoneStrip />

        <NameWall label="Legends & Archive" rows={LEGENDS} />

        <EditorialCards
          label="What We Stand For"
          items={[
            {
              tag: 'Mission',
              title: 'Live & Local',
              body: 'Predominantly live local content 24 hours a day, seven days a week — real presenters, real Valley voices. Source: fm985.com.au/about.',
            },
            {
              tag: 'Reach',
              title: 'Online Streaming',
              body: 'FM 98.5 plus streaming via fm985.com.au and Radio.co — so listeners across the Goulburn Murray can tune in anywhere.',
            },
            {
              tag: 'Community',
              title: 'Volunteer-Run',
              body: 'Operated and managed by volunteers under Goulburn Valley Community Radio Inc. — sport, multicultural programs, and emergency broadcasting for the region.',
            },
          ]}
          columns={3}
        />

        <FeatureFrame
          to="/listen"
          img="/assets/images/heritage-original-panel-1988.jpg"
          alt="The original ONE FM mixing panel, built in 1988"
          badge="The 1988 Mixing Panel · Still in the studio"
        />

        <StatsStrip
          stats={[
            { n: '1989', t: 'Licensed to broadcast', red: true },
            { n: '3ONE', t: 'ACMA callsign' },
            { n: String(stationStats.yearsBroadcasting), t: 'Years on air' },
            { n: '24/7', t: 'Live & local' },
          ]}
        />

        <section className="px-6 md:px-12 lg:px-20 pb-32 text-center">
          <h2 className="font-poster uppercase text-[clamp(28px,4vw,44px)] text-white mb-6">
            The story continues on air<span style={{ color: RED }}>.</span>
          </h2>
          <Link
            to="/listen"
            className="inline-block rounded-full px-8 py-4 font-bold text-[13px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.03] transition-transform"
            style={{ background: RED }}
            data-cursor-label="LISTEN"
          >
            Listen Live →
          </Link>
        </section>
      </div>
    </Layout>
  )
}
