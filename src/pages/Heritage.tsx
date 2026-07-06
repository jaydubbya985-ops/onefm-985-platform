/**
 * HISTORY — rebuilt per REBUILD-SPEC.md (page 5 of 6).
 * Master public-record research: src/data/stationHistory.ts
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
  ACMA_FACTS,
  BOARD_2024,
  BRANDING_NOTE,
  EMERGENCY_BROADCAST_NARRATIVE,
  HERITAGE_LEGENDS,
  HISTORY_MILESTONES,
  INSTITUTION_FACTS,
  LIFE_MEMBERS,
  LIFE_MEMBER_NOTE,
  ORIGIN_LAYERS,
  SPORT_HISTORY_NARRATIVE,
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
        <p className="mt-7 max-w-[600px] text-[17px] leading-relaxed text-white/60">
          {ACMA_FACTS.licensee} — callsign <strong className="text-white/80">{ACMA_FACTS.callsign}</strong>{' '}
          on {ACMA_FACTS.frequency}. Licensed service commenced {ACMA_FACTS.licenceCommenced}; roots in
          the late 1970s and established organisationally in 1980.
        </p>
      </div>
    </section>
  )
}

function OriginLayers() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <LabelReveal className="mb-8">Three Layers of Origin</LabelReveal>
      <div className="grid md:grid-cols-3 gap-5">
        {ORIGIN_LAYERS.map((layer) => (
          <article
            key={layer.era}
            className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636]"
          >
            <div className="font-poster text-[clamp(28px,4vw,40px)] leading-none mb-2" style={{ color: RED }}>
              {layer.era}
            </div>
            <h3 className="font-poster uppercase text-[20px] text-white mb-3">{layer.title}</h3>
            <p className="text-[15px] leading-relaxed text-white/55">{layer.body}</p>
          </article>
        ))}
      </div>
      <p className="text-[13px] text-white/35 mt-8 max-w-[720px]">{BRANDING_NOTE}</p>
    </section>
  )
}

function MilestoneStrip() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <LabelReveal className="mb-8">Public Record Timeline</LabelReveal>
      <div
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {HISTORY_MILESTONES.map((m) => (
          <article
            key={m.year + m.title}
            className="snap-start shrink-0 w-[min(88vw,300px)] border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636]"
          >
            <div className="font-poster text-[clamp(32px,4.5vw,48px)] leading-none mb-3" style={{ color: RED }}>
              {m.year}
            </div>
            <h3 className="font-poster uppercase text-[20px] text-white leading-[1.1] mb-2">{m.title}</h3>
            <p className="text-[14px] leading-relaxed text-white/55">{m.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProseSection({ label, title, paragraphs }: { label: string; title: string; paragraphs: readonly string[] }) {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <LabelReveal className="mb-6">{label}</LabelReveal>
      <h2 className="font-poster uppercase text-[clamp(26px,4vw,44px)] text-white leading-[0.95] mb-10 max-w-[900px]">
        {title}
      </h2>
      <div className="max-w-[720px] space-y-6">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 52)} className="text-[17px] leading-relaxed text-white/60">
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
        {LIFE_MEMBER_NOTE} On-air roster today at{' '}
        <a href="https://fm985.com.au/guide/" className="underline hover:text-white/80">
          fm985.com.au/guide
        </a>
        .
      </p>

      <div className="mb-12">
        <h3 className="font-bold text-[12px] tracking-[0.14em] uppercase mb-4" style={{ color: RED }}>
          Named in Annual Report 2024
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
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-1">{role}</div>
            <div className="font-poster uppercase text-[18px] text-white leading-tight">{name}</div>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-white/30 mt-8">
        Sources: ONE FM Annual Report 2024; ACMA licence register; fm985.com.au/about; Shepparton News
        (Ern Meharry, 2022); Greater Shepparton council records.
      </p>
    </section>
  )
}

export default function Heritage() {
  return (
    <Layout>
      <SEO
        title="History — ONE FM 98.5 · 3ONE Since 1989"
        description="Goulburn Valley Community Radio Inc. Licensed 1 April 1989. Sport, floods, multicultural programming, life members and 35 years of local broadcasting from Shepparton."
      />
      <div style={{ background: '#0A0A0A' }} className="min-h-screen">
        <OnAirTicker
          items={[
            `Callsign ${ACMA_FACTS.callsign} · ${ACMA_FACTS.frequency} · ${ACMA_FACTS.power}`,
            `Licensed ${ACMA_FACTS.licenceCommenced}`,
            'Est. 1980 · organising from late 1970s',
            'GVL football · multicultural · emergency information',
          ]}
          delay={0.4}
        />
        <HeritageHero />

        <OriginLayers />

        <div id="archive">
          <HorizontalGallery />
        </div>

        <MilestoneStrip />

        <ProseSection
          label="Sport & OB"
          title="The call of the match"
          paragraphs={SPORT_HISTORY_NARRATIVE}
        />

        <FeatureFrame
          to="/football"
          img="/assets/images/gvl-action-sprint.jpg"
          alt="GVL football — live on ONE FM 98.5"
          badge="GVL & local sport · Since May 1989"
        />

        <ProseSection
          label="Community Resilience"
          title="Floods, emergencies and ONE FM's public-service role"
          paragraphs={EMERGENCY_BROADCAST_NARRATIVE}
        />

        <NameWall
          label="Legends & Voices"
          rows={HERITAGE_LEGENDS.map(({ name, sub, img }) => ({ name, sub, img }))}
        />

        <LifeMembersRoll />

        <EditorialCards
          label="Institution"
          items={[...INSTITUTION_FACTS]}
          columns={2}
        />

        <FeatureFrame
          to="/listen"
          img="/assets/images/heritage-original-panel-1988.jpg"
          alt="The original ONE FM mixing panel, built in 1988"
          badge="The 1988 Mixing Panel · Still in the studio"
        />

        <StatsStrip
          stats={[
            { n: '1989', t: 'ACMA licence commenced', red: true },
            { n: ACMA_FACTS.power, t: 'Community FM (3ONE)' },
            { n: '35', t: 'Years local broadcasting (2024 AGM)' },
            { n: String(stationStats.totalTowns), t: 'Towns in station reach model' },
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
