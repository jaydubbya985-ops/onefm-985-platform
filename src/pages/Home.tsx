/**
 * Home — "ON AIR" design system (Direction A, approved 2026-07-05).
 * Black canvas · Anton poster type · signal red #E51636 as the on-air light.
 * Discipline rule: red is the brand, one fluoro is the signal,
 * nothing else gets colour. All names, photos and stats are real.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { LatestInterviews } from '@/components/LatestInterviews'
import { RecentStationActivity } from '@/components/RecentStationActivity'
import { ExploreOneFMGrid } from '@/components/home/ExploreOneFMGrid'
import { LivePlayerWidget } from '@/components/home/LivePlayerWidget'
import { stationStats } from '@/data/pricing'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { PosterReveal, StrokeFill } from '@/components/motion/PosterReveal'
import { NameWall } from '@/components/onair/kit'
import { wallRows } from '@/data/onAirPeople'
import { GVL_FINALS_2026 } from '@/data/gvlSeason'

const RED = '#E51636'
const INK = '#0A0A0A'


const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
}

function Ticker() {
  const meta = usePlayerMetadata()
  const items = [
    meta.isLive ? `● ON AIR — ${meta.program}${meta.presenter ? ` with ${meta.presenter}` : ''}` : `● ${meta.program}`,
    meta.nowPlaying ? `Now playing: ${meta.nowPlaying}${meta.artist ? ` — ${meta.artist}` : ''}` : '98.5 FM · Shepparton · Goulburn Valley',
    `Est. ${stationStats.weeklyListeners.toLocaleString()} weekly listeners`,
    'Community radio since 1989 · Callsign 3ONE',
  ]
  const line = items.join('   ·   ')
  return (
    <motion.div
      className="overflow-hidden"
      style={{ background: RED }}
      aria-hidden
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex whitespace-nowrap py-2 font-bold text-[13px] tracking-[0.12em] uppercase text-white animate-marquee">
        {[0, 1].map((i) => (
          <span key={i} className="pr-12">{line}   ·   </span>
        ))}
      </div>
    </motion.div>
  )
}

/** Real Goulburn Valley drone footage — six shots cycling under the type. */
const HERO_REEL = [
  '/videos/heroes/hero-01-aerial-factory.mp4',
  '/videos/heroes/hero-02-pink-tower.mp4',
  '/videos/heroes/hero-03-community-festival.mp4',
  '/videos/heroes/hero-04-wetland-aerial.mp4',
  '/videos/heroes/hero-05-river-bridge.mp4',
  '/videos/heroes/hero-06-canola-finale.mp4',
]

function HeroReel() {
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <img
        src="/videos/heroes/hero-poster.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.45) saturate(0.9)' }}
      />
    )
  }
  return (
    <>
      <video
        key={i}
        src={HERO_REEL[i]}
        poster={i === 0 ? '/videos/heroes/hero-poster.jpg' : undefined}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setI((v) => (v + 1) % HERO_REEL.length)}
        className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        style={{ filter: 'brightness(0.45) saturate(0.9)' }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,.15) 45%, #0A0A0A 100%)' }}
        aria-hidden
      />
    </>
  )
}

function Hero() {
  const meta = usePlayerMetadata()
  return (
    <section className="relative overflow-hidden px-6 md:px-12 lg:px-20 pt-24 pb-20 min-h-[88vh] flex flex-col justify-center">
      <HeroReel />
      <div className="relative">
      <Link
        to="/listen"
        className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 mb-9 font-bold text-[13px] tracking-[0.14em] uppercase text-white transition-transform hover:scale-[1.03] bloom-red"
        style={{ background: RED }}
        data-cursor="LISTEN"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        {meta.isLive ? 'On Air Now · Listen Live' : 'Listen Live · 98.5 FM'}
      </Link>
      <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(56px,11vw,170px)]">
        <PosterReveal
          lines={[
            <span className="poster-hover">The Voice</span>,
            <>of the <StrokeFill delay={1.0}>Goulburn</StrokeFill></>,
            <>
              <StrokeFill delay={1.15}>Valley</StrokeFill>
              <span style={{ color: RED }}>.</span>
            </>,
          ]}
        />
      </h1>
      <p className="mt-7 max-w-[520px] text-[17px] leading-relaxed text-white/60">
        Volunteer-run, community-owned. From emergency broadcasts during the 2022 floods to
        calling the GVL Grand Final live — on air since 1989.
      </p>
      <div className="mt-9 flex items-center gap-8 flex-wrap">
        <Link
          to="/programs"
          className="font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-1 hover:opacity-80"
          style={{ borderColor: RED }}
        >
          Full Program Guide →
        </Link>
        <Link
          to="/sponsorship"
          className="font-bold text-[13px] tracking-[0.12em] uppercase text-white/50 hover:text-white border-b-2 border-white/20 pb-1 transition-colors"
        >
          Advertise With Us
        </Link>
      </div>
      </div>
    </section>
  )
}

function FeatureFrame() {
  return (
    <motion.div {...reveal} className="mx-6 md:mx-12 lg:mx-20 my-10">
      <Link
        to="/football"
        className="block relative rounded-2xl overflow-hidden border-2 group border-beam"
        style={{ borderColor: RED }}
        data-cursor="GVL"
      >
        <img
          src="/assets/images/gvl-action-sprint.jpg"
          alt="GVL football action — called live on ONE FM 98.5"
          className="w-full h-[420px] md:h-[520px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute bottom-6 left-6 px-5 py-2.5 rounded font-bold text-[13px] tracking-[0.13em] uppercase text-white"
          style={{ background: RED }}
        >
          GVL finals · {GVL_FINALS_2026.firstFinalsWeekend}
        </div>
      </Link>
    </motion.div>
  )
}

function StatsStrip() {
  const stats = [
    { n: stationStats.weeklyListeners.toLocaleString(), t: 'Est. weekly listeners', red: false },
    { n: '98.5', t: 'FM · Callsign 3ONE', red: true },
    { n: String(stationStats.totalTowns), t: 'Towns across the Valley', red: false },
    { n: '1989', t: 'On air ever since', red: false },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px my-20" style={{ background: '#222' }}>
      {stats.map((s) => (
        <div key={s.t} className="px-8 py-11" style={{ background: INK }}>
          <div
            className={`font-poster text-[clamp(36px,5vw,68px)] leading-none ${s.red ? '' : 'stroke-hover'}`}
            style={s.red ? { color: RED } : undefined}
          >
            {s.n}
          </div>
          <div className="text-[13px] tracking-[0.14em] uppercase text-white/40 mt-2">{s.t}</div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <Layout>
      <SEO
        title="ONE FM 98.5 — The Voice of the Goulburn Valley"
        description="Community radio for the Goulburn Valley. Volunteer-run since 1989. Listen live, program guide, GVL football, and local voices from Shepparton."
      />
      <div style={{ background: INK }} className="min-h-screen">
        <Ticker />
        <Hero />
        <LivePlayerWidget className="relative z-20 -mt-4 mb-6" />
        <NameWall label="On Air This Week" rows={wallRows()} />
        <FeatureFrame />
        <StatsStrip />
        <LatestInterviews />
        <RecentStationActivity kinds={['sport', 'community']} />
        <section className="pb-32">
          <ExploreOneFMGrid />
        </section>
      </div>
    </Layout>
  )
}
