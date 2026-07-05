/**
 * Home — "ON AIR" design system (Direction A, approved 2026-07-05).
 * Black canvas · Anton poster type · signal red #E51636 as the on-air light.
 * Discipline rule: red is the brand, one fluoro is the signal,
 * nothing else gets colour. All names, photos and stats are real.
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { LatestInterviews } from '@/components/LatestInterviews'
import { ExploreOneFMGrid } from '@/components/home/ExploreOneFMGrid'
import { stationStats } from '@/data/pricing'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'

const RED = '#E51636'
const INK = '#0A0A0A'
const BAR = '#161616'

/** Real weekly presenters — source: programGuide.ts (fm985.com.au/guide). */
const ON_AIR_WALL: { name: string; show: string; img: string }[] = [
  { name: 'Tim Ahemt', show: 'ONE FM Breakfast · Mon & Tue', img: '/on-air-host-1.jpg' },
  { name: 'The Big G', show: 'Craig Stott · Wednesday Breakfast', img: '/studio-control-room.jpg' },
  { name: 'Ralph Whitehead', show: 'Thursday Breakfast', img: '/assets/images/studio-presenter-mic.jpg' },
  { name: 'Josh Revens', show: 'Friday Breakfast · Live Music', img: '/assets/images/ob-van-branded.jpg' },
  { name: 'Tim Symonds', show: 'The Essential Hits', img: '/assets/images/heritage-truck-2005.jpg' },
  { name: 'Di Hunter', show: 'On Air Since the Early Days', img: '/assets/images/heritage-di-hunter-carols-2014.jpg' },
]

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
    <div className="overflow-hidden" style={{ background: RED }} aria-hidden>
      <div className="flex whitespace-nowrap py-2 font-bold text-[13px] tracking-[0.12em] uppercase text-white animate-marquee">
        {[0, 1].map((i) => (
          <span key={i} className="pr-12">{line}   ·   </span>
        ))}
      </div>
    </div>
  )
}

function Hero() {
  const meta = usePlayerMetadata()
  return (
    <section className="px-6 md:px-12 lg:px-20 pt-20 pb-16">
      <Link
        to="/listen"
        className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 mb-9 font-bold text-[13px] tracking-[0.14em] uppercase text-white transition-transform hover:scale-[1.03]"
        style={{ background: RED }}
        data-cursor="LISTEN"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        {meta.isLive ? 'On Air Now · Listen Live' : 'Listen Live · 98.5 FM'}
      </Link>
      <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(56px,11vw,170px)]">
        The Voice<br />
        of the{' '}
        <span style={{ color: 'transparent', WebkitTextStroke: '2px #fff' }}>Goulburn</span>
        <br />
        <span style={{ color: 'transparent', WebkitTextStroke: '2px #fff' }}>Valley</span>
        <span style={{ color: RED }}>.</span>
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
    </section>
  )
}

function NameWall() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16">
      <div className="font-bold text-[13px] tracking-[0.18em] uppercase mb-8" style={{ color: RED }}>
        — On Air This Week
      </div>
      <div>
        {ON_AIR_WALL.map((p, i) => (
          <motion.div
            key={p.name}
            {...reveal}
            className={`flex items-stretch gap-5 mb-3.5 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}
          >
            <div className="font-poster uppercase leading-none whitespace-nowrap text-white text-[clamp(40px,7vw,104px)]">
              {p.name}
              <span className="block font-body normal-case text-[13px] tracking-[0.14em] text-white/40 mt-1.5">
                {p.show}
              </span>
            </div>
            <div
              className="flex-1 min-w-[60px] rounded bg-cover bg-center grayscale-[35%] hover:grayscale-0 transition-[filter] duration-300"
              style={{ backgroundColor: BAR, backgroundImage: `url('${p.img}')` }}
              role="img"
              aria-label={`${p.name} — ${p.show}`}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function FeatureFrame() {
  return (
    <motion.div {...reveal} className="mx-6 md:mx-12 lg:mx-20 my-10">
      <Link
        to="/football"
        className="block relative rounded-2xl overflow-hidden border-2 group"
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
          GVL Footy · Called Live on 98.5
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
          <div className="font-poster text-[clamp(36px,5vw,68px)] leading-none" style={{ color: s.red ? RED : '#fff' }}>
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
        <NameWall />
        <FeatureFrame />
        <StatsStrip />
        <section className="px-6 md:px-12 lg:px-20 pb-10">
          <LatestInterviews />
        </section>
        <section className="px-6 md:px-12 lg:px-20 pb-32">
          <div className="font-bold text-[13px] tracking-[0.18em] uppercase mb-8" style={{ color: RED }}>
            — Explore ONE FM
          </div>
          <ExploreOneFMGrid />
        </section>
      </div>
    </Layout>
  )
}
