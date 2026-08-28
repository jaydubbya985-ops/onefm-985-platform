/**
 * OUR COMMUNITY — rebuilt per REBUILD-SPEC.md (page 3 of 6).
 * Real towns (townData.ts), real multicultural programs (programGuide.ts),
 * real festival footage. GVL and Coverage keep their own pages until
 * their content is fully absorbed; this page fronts them.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { OnAirTicker, NameWall, FeatureFrame, StatsStrip, LabelReveal, EditorialCards, PosterReveal, StrokeFill } from '@/components/onair/kit'
import { towns } from '@/data/townData'
import { stationStats } from '@/data/pricing'
import { MULTICULTURAL_PROGRAMS, MULTICULTURAL_PROGRAM_COUNT } from '@/data/programGuide'

const RED = '#E51636'

/** Town wall photos — real station/valley imagery (not per-town photos yet). */
const TOWN_IMGS = [
  '/assets/images/heritage-ob-mall-1989.jpg',
  '/assets/images/gvl-action-sprint.jpg',
  '/assets/images/ob-van-branded.jpg',
  '/studio-control-room.jpg',
  '/assets/images/heritage-truck-2005.jpg',
  '/assets/images/tower-mount-major-day.png',
]

function CommunityHero() {
  const reduced = useReducedMotion()
  return (
    <section className="relative overflow-hidden px-6 md:px-12 lg:px-20 pt-24 pb-20 min-h-[82vh] flex flex-col justify-center">
      {reduced ? (
        <img src="/videos/heroes/hero-poster.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.45)' }} />
      ) : (
        <video
          src="/videos/heroes/hero-03-community-festival.mp4"
          autoPlay muted loop playsInline preload="auto" aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.45) saturate(0.9)' }}
        />
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,.15) 45%, #0A0A0A 100%)' }} aria-hidden />
      <div className="relative">
        <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(56px,11vw,160px)]">
          <PosterReveal lines={[
            <span key="a" className="poster-hover">Our</span>,
            <span key="b"><StrokeFill delay={0.9}>Community</StrokeFill><span style={{ color: RED }}>.</span></span>,
          ]} />
        </h1>
        <p className="mt-7 max-w-[560px] text-[17px] leading-relaxed text-white/60">
          Twenty-five towns, one signal. From the GVL grand final to {MULTICULTURAL_PROGRAM_COUNT} multicultural
          programs on the weekly guide — this is the Valley, on air.
        </p>
      </div>
    </section>
  )
}

export default function Community() {
  const [showAllTowns, setShowAllTowns] = useState(false)
  const wallTowns = (showAllTowns ? towns : towns.slice(0, 6)).map((t, i) => ({
    name: t.name,
    sub: `${t.lga} · pop. ${t.population2021.toLocaleString()}`,
    img: TOWN_IMGS[i % TOWN_IMGS.length],
  }))

  const multicultural = MULTICULTURAL_PROGRAMS.map((s) => ({
    tag: 'Multicultural',
    title: s.name,
    body: `With ${s.host} — part of the weekly world programming that keeps every corner of the Valley tuned in, in their own language.`,
  }))

  return (
    <Layout>
      <SEO
        title="Our Community — ONE FM 98.5"
        description={`${stationStats.totalTowns} towns across the Goulburn Valley: GVL footy called live, ${MULTICULTURAL_PROGRAM_COUNT} multicultural programs from the station guide, and the communities ONE FM serves.`}
      />
      <div style={{ background: '#0A0A0A' }} className="min-h-screen">
        <OnAirTicker
          items={[
            `● ${stationStats.totalTowns} towns across the Goulburn Valley`,
            'GVL footy called live every season',
            `Multicultural programming — ${MULTICULTURAL_PROGRAM_COUNT} programs on the weekly guide`,
            'Community radio since 1989',
          ]}
          delay={0.4}
        />
        <CommunityHero />

        <FeatureFrame
          to="/football"
          img="/assets/images/gvl-action-sprint.jpg"
          alt="GVL football under lights — called live on ONE FM 98.5"
          badge="GVL Footy · Called Live on 98.5"
        />

        <NameWall label={`The Towns We Serve${showAllTowns ? '' : ' · Top 6'}`} rows={wallTowns} />
        <div className="px-6 md:px-12 lg:px-20 -mt-8 pb-8">
          <button
            type="button"
            onClick={() => setShowAllTowns((v) => !v)}
            className="font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-1 hover:opacity-80"
            style={{ borderColor: RED }}
            data-cursor-label={showAllTowns ? 'LESS' : 'MORE'}
          >
            {showAllTowns ? 'Show fewer' : `All ${towns.length} towns`} →
          </button>
        </div>

        <EditorialCards label="The World, On the Weekend Dial" items={multicultural} columns={3} />

        <section className="px-6 md:px-12 lg:px-20 pb-16">
          <LabelReveal className="mb-8">Where the Signal Reaches</LabelReveal>
          <div className="border border-white/12 rounded-xl p-8 flex items-center justify-between gap-6 flex-wrap transition-colors hover:border-[#E51636]">
            <div>
              <h3 className="font-poster uppercase text-[30px] text-white">The Coverage Map</h3>
              <p className="text-[15px] text-white/55 mt-1 max-w-[480px]">
                100km of signal from Mt Major — explore every town, transmitter and GVL club on the interactive map.
              </p>
            </div>
            <Link
              to="/coverage"
              className="shrink-0 rounded-full px-6 py-3 font-bold text-[13px] tracking-[0.13em] uppercase text-white bloom-red hover:scale-[1.03] transition-transform"
              style={{ background: RED }}
              data-cursor-label="MAP"
            >
              Open the Map →
            </Link>
          </div>
        </section>

        <StatsStrip
          stats={[
            { n: String(stationStats.totalTowns), t: 'Towns across the Valley', red: true },
            { n: stationStats.broadcastPopulation.toLocaleString(), t: 'People in broadcast area (townData 2026 est.)' },
            { n: String(MULTICULTURAL_PROGRAM_COUNT), t: 'Multicultural programs (station guide)' },
            { n: `${stationStats.broadcastRadiusKm}km`, t: 'Signal radius from Mt Major' },
          ]}
        />
        <div className="pb-32" />
      </div>
    </Layout>
  )
}
