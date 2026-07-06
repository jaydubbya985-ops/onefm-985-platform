/**
 * HISTORY — rebuilt per REBUILD-SPEC.md (page 5 of 6).
 * Absorbs Story (/story → redirect). Assembled from the ON AIR kit.
 * People & flood copy: src/data/stationHistory.ts (sourced).
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
import {
  BOARD_2024,
  EMERGENCY_BROADCAST_NARRATIVE,
  HERITAGE_LEGENDS,
  HISTORY_MILESTONES,
  LIFE_MEMBERS,
} from '@/data/stationHistory'

const RED = '#E51636'

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
        {HISTORY_MILESTONES.map((m) => (
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

function FloodEmergencyNarrative() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <LabelReveal className="mb-6">Community Resilience</LabelReveal>
      <h2 className="font-poster uppercase text-[clamp(26px,4vw,44px)] text-white leading-[0.95] mb-10 max-w-[900px]">
        Floods, emergencies and ONE FM
        <span style={{ color: RED }}>&apos;</span>s public-service role
      </h2>
      <div className="max-w-[720px] space-y-6">
        {EMERGENCY_BROADCAST_NARRATIVE.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="text-[17px] leading-relaxed text-white/60">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}

function LifeMembersRoll() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <LabelReveal className="mb-3">The People of ONE FM</LabelReveal>
      <h2 className="font-poster uppercase text-[clamp(28px,4.5vw,48px)] text-white leading-[0.95] mb-4">
        Volunteers, presenters, builders
        <span style={{ color: RED }}>.</span>
      </h2>
      <p className="text-[15px] text-white/50 max-w-[640px] mb-10 leading-relaxed">
        Life members named in the ONE FM Annual Report 2024 — the backbone of the station&apos;s
        living memory. Board and presenter lists from the same report; on-air roster today at{' '}
        <a href="https://fm985.com.au/guide/" className="underline hover:text-white/80">
          fm985.com.au/guide
        </a>
        .
      </p>

      <div className="mb-12">
        <h3 className="font-bold text-[12px] tracking-[0.14em] uppercase mb-4" style={{ color: RED }}>
          Life members ({LIFE_MEMBERS.length})
        </h3>
        <ul className="flex flex-wrap gap-2">
          {LIFE_MEMBERS.map((name) => (
            <li
              key={name}
              className="px-3 py-1.5 rounded-full border border-white/12 text-[13px] text-white/70 hover:border-[#E51636] hover:text-white transition-colors"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BOARD_2024.map(({ role, name }) => (
          <div
            key={role + name}
            className="border border-white/12 rounded-xl p-5 hover:border-[#E51636] transition-colors"
          >
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-1">
              {role}
            </div>
            <div className="font-poster uppercase text-[18px] text-white leading-tight">{name}</div>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-white/30 mt-8">
        Source: ONE FM Annual Report 2024 (fm985.com.au/about). Additional names from program
        guide, interviews and station archive — oral-history verification ongoing for per-event
        emergency broadcasts.
      </p>
    </section>
  )
}

export default function Heritage() {
  return (
    <Layout>
      <SEO
        title="History — ONE FM 98.5 Since 1989"
        description={`${stationStats.yearsBroadcasting} years of community broadcasting. Floods, football, multicultural programming and ${LIFE_MEMBERS.length} life members — Goulburn Valley Community Radio Inc.`}
      />
      <div style={{ background: '#0A0A0A' }} className="min-h-screen">
        <OnAirTicker
          items={[
            'Est. 1989 · Goulburn Valley Community Radio Inc.',
            'Callsign 3ONE · 98.5 FM Shepparton',
            `${LIFE_MEMBERS.length} life members · volunteer-run`,
            'Community resilience · emergency information · local sport',
          ]}
          delay={0.4}
        />
        <HeritageHero />

        <div id="archive">
          <HorizontalGallery />
        </div>

        <MilestoneStrip />

        <FloodEmergencyNarrative />

        <NameWall
          label="Legends & Voices"
          rows={HERITAGE_LEGENDS.map(({ name, sub, img }) => ({ name, sub, img }))}
        />

        <LifeMembersRoll />

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
              body: 'Operated by volunteers under Goulburn Valley Community Radio Inc. — sport, multicultural programs, outside broadcasts and community information for the region.',
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
            { n: String(LIFE_MEMBERS.length), t: 'Life members (2024 report)' },
            { n: '3ONE', t: 'ACMA callsign' },
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
