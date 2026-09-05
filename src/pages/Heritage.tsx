/**
 * HISTORY — rebuilt per REBUILD-SPEC.md (page 5 of 6).
 * Master public-record research: src/data/stationHistory.ts
 */
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { HorizontalGallery } from '@/components/HorizontalGallery'
import { PeopleWall } from '@/components/archive/PeopleWall'
import { DecadeDial } from '@/components/archive/DecadeDial'
import { ContributePortal } from '@/components/archive/ContributePortal'
import { ARCHIVE_PEOPLE } from '@/data/livingArchive/people'
import { PANEL_1988_BADGE } from '@/data/livingArchive/decades'
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
import { formatTowns, yearsBroadcastingValue } from '@/lib/coverageCopy'
import { formatGuideHours } from '@/lib/guideHours'
import {
  ACMA_FACTS,
  EMERGENCY_BROADCAST_NARRATIVE,
  HERITAGE_LEGENDS,
  INSTITUTION_FACTS,
  ORIGIN_LAYERS,
  SPORT_HISTORY_NARRATIVE,
  BRANDING_NOTE,
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
          For {yearsBroadcastingValue()} years, ONE FM 98.5 has carried the voices, stories, sport, music,
          emergencies and community life of the Goulburn Valley. Callsign{' '}
          <strong className="text-white/80">{ACMA_FACTS.callsign}</strong> · licensed{' '}
          {ACMA_FACTS.licenceCommenced}.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#timeline"
            className="rounded-full px-6 py-3 font-bold text-[12px] tracking-[0.12em] uppercase text-white bloom-red"
            style={{ background: RED }}
          >
            Explore the Timeline
          </a>
          <a
            href="#people"
            className="rounded-full px-6 py-3 font-bold text-[12px] tracking-[0.12em] uppercase text-white border border-white/25 hover:border-[#E51636] transition-colors"
          >
            Search the Archive
          </a>
          <a
            href="#contribute"
            className="rounded-full px-6 py-3 font-bold text-[12px] tracking-[0.12em] uppercase text-white/70 border border-white/15 hover:border-white/40 transition-colors"
          >
            Add Your Memory
          </a>
        </div>
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

export default function Heritage() {
  return (
    <Layout>
      <SEO
        title="The Living Archive — ONE FM 98.5 · 3ONE Since 1989"
        description="The Living Archive of the Goulburn Valley — decades, people, sport, floods, multicultural voices. Searchable history from Shepparton community radio 3ONE."
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

        <DecadeDial />

        <div id="archive">
          <HorizontalGallery />
        </div>

        <ProseSection
          label="Sport & OB"
          title="The call of the match"
          paragraphs={SPORT_HISTORY_NARRATIVE}
        />

        <FeatureFrame
          to="/football"
          img="/assets/images/gvl-action-sprint.jpg"
          alt="GVL football — live on ONE FM 98.5"
          badge={`GVL Match of the Day · ${formatGuideHours('GVL Match of the Day') ?? 'Saturday'} · live since May 1989`}
        />

        <ProseSection
          label="Community Resilience"
          title="Floods, emergencies and ONE FM's public-service role"
          paragraphs={EMERGENCY_BROADCAST_NARRATIVE}
        />

        <NameWall
          label="Legends & Voices"
          rows={HERITAGE_LEGENDS.map(({ name, sub, img }) => ({ name, sub, img }))}
          photoNote="Named archive portraits: Di Hunter and Sally Nayler only. Other rows use station photography."
          portraits={['Di Hunter', 'Sally Nayler']}
        />

        <PeopleWall people={ARCHIVE_PEOPLE} />

        <ContributePortal />

        <EditorialCards
          label="Institution"
          items={[...INSTITUTION_FACTS]}
          columns={2}
        />

        <FeatureFrame
          to="/listen"
          img="/assets/images/heritage-original-panel-1988.jpg"
          alt="The original ONE FM mixing panel, built in 1988"
          badge={PANEL_1988_BADGE}
        />

        <StatsStrip
          stats={[
            { n: '1989', t: 'ACMA licence commenced', red: true },
            { n: ACMA_FACTS.power, t: 'Community FM (3ONE)' },
            { n: String(ARCHIVE_PEOPLE.length), t: 'People in living archive' },
            { n: formatTowns(), t: 'Towns in station reach model' },
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
