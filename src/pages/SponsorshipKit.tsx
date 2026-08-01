/**
 * SPONSOR — rebuilt per REBUILD-SPEC.md (page 4 of 6). The money page.
 * Flow: ARRIVE (ticker+hero) → HOOK (reach stats) → BODY (tiers, GVL,
 * evidence) → ACT (one working enquiry form → live Supabase).
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { OnAirTicker, FeatureFrame, StatsStrip, LabelReveal, EditorialCards, PosterReveal, StrokeFill } from '@/components/onair/kit'
import {
  generalTiers,
  stationStats,
  PRICING_COPY,
  GENERAL_ENTRY_WEEKLY,
  formatWeeklyRange,
  formatWeeklyTypical,
} from '@/data/pricing'
import { submitEnquiry } from '@/lib/enquiries'

const RED = '#E51636'

function SponsorHero() {
  const reduced = useReducedMotion()
  return (
    <section className="relative overflow-hidden px-6 md:px-12 lg:px-20 pt-24 pb-20 min-h-[82vh] flex flex-col justify-center">
      {reduced ? (
        <img src="/videos/heroes/hero-poster.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.45)' }} />
      ) : (
        <video
          src="/videos/heroes/hero-01-aerial-factory.mp4"
          autoPlay muted loop playsInline preload="auto" aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.45) saturate(0.9)' }}
        />
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,.15) 45%, #0A0A0A 100%)' }} aria-hidden />
      <div className="relative">
        <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(52px,10vw,150px)]">
          <PosterReveal lines={[
            <span key="a" className="poster-hover">Your Brand,</span>,
            <span key="b"><StrokeFill delay={0.9}>On Air</StrokeFill><span style={{ color: RED }}>.</span></span>,
          ]} />
        </h1>
        <p className="mt-7 max-w-[560px] text-[17px] leading-relaxed text-white/60">
          Radio advertising that supports the community it sells to — {PRICING_COPY.generalFrom.toLowerCase()},
          heard across 25 towns of the Goulburn Valley.
        </p>
        <a
          href="#enquire"
          className="inline-block mt-8 rounded-full px-7 py-3.5 font-bold text-[13px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.03] transition-transform"
          style={{ background: RED }}
          data-cursor-label="ENQUIRE"
        >
          Start a Conversation →
        </a>
      </div>
    </section>
  )
}

function EnquiryForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setState('sending')
    const result = await submitEnquiry({
      name: String(f.get('name') ?? ''),
      email: String(f.get('email') ?? ''),
      phone: String(f.get('phone') ?? '') || undefined,
      company: String(f.get('company') ?? '') || undefined,
      subject: 'Sponsorship enquiry',
      message: String(f.get('message') ?? ''),
      source: 'sponsorship',
      priority: 'high',
    })
    if (result.success) {
      setState('done')
    } else {
      setError(result.error ?? 'Something went wrong — email admin@fm985.com.au instead.')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="border-2 rounded-2xl p-10 text-center" style={{ borderColor: RED }}>
        <div className="font-poster uppercase text-[34px] text-white">You're in the pipeline<span style={{ color: RED }}>.</span></div>
        <p className="text-white/55 mt-2 text-[15px]">We'll be in touch within one business day. — ONE FM 98.5</p>
      </div>
    )
  }

  const input = 'w-full bg-[#111] border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#E51636] focus:outline-none'
  return (
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4" id="enquire">
      <input name="name" required placeholder="Your name" aria-label="Your name" className={input} />
      <input name="company" placeholder="Business name" aria-label="Business name" className={input} />
      <input name="email" type="email" required placeholder="Email" aria-label="Email" className={input} />
      <input name="phone" placeholder="Phone (optional)" aria-label="Phone" className={input} />
      <textarea name="message" required placeholder="Tell us about your business and what you're after…" aria-label="Message" rows={4} className={`${input} md:col-span-2`} />
      {state === 'error' && <p className="text-sm md:col-span-2" style={{ color: RED }}>{error}</p>}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="md:col-span-2 rounded-full px-7 py-4 font-bold text-[13px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: RED }}
        data-cursor-label="SEND"
      >
        {state === 'sending' && <Loader2 size={16} className="animate-spin" />}
        Send the Enquiry →
      </button>
    </form>
  )
}

export default function SponsorshipKit() {
  const tiers = Object.values(generalTiers).map((t) => ({
    tag: formatWeeklyRange(t.minPrice, t.maxPrice),
    title: t.name,
    body: `${t.spots} announcements a week and ${t.socialPosts} social posts a month${'exclusivity' in t && t.exclusivity ? ' — with category exclusivity' : ''}. ${formatWeeklyTypical(t.weeklyPrice)} for most campaigns.`,
  }))

  return (
    <Layout>
      <SEO
        title="Sponsor ONE FM 98.5 — Advertise Across the Goulburn Valley"
        description={`${PRICING_COPY.generalFrom}: est. 39,375 weekly listeners across 25 towns. Packages, GVL football, and a real conversation — not a call centre.`}
      />
      <div style={{ background: '#0A0A0A' }} className="min-h-screen">
        <OnAirTicker
          items={[
            `● Est. ${stationStats.weeklyListeners.toLocaleString()} weekly listeners`,
            `${stationStats.totalTowns} towns across the Goulburn Valley`,
            PRICING_COPY.generalTicker,
            `Supporting ${stationStats.nfpsSupported}+ local not-for-profits`,
          ]}
          delay={0.4}
        />
        <SponsorHero />

        <StatsStrip
          stats={[
            { n: stationStats.weeklyListeners.toLocaleString(), t: 'Est. weekly listeners', red: true },
            { n: stationStats.broadcastPopulation.toLocaleString(), t: 'People in reach (ABS 2021)' },
            { n: String(stationStats.totalTowns), t: 'Towns across the Valley' },
            { n: `$${GENERAL_ENTRY_WEEKLY}`, t: 'From — general sponsorship' },
          ]}
        />

        <EditorialCards label="The Packages" items={tiers} columns={2} />

        <FeatureFrame
          to="/football"
          img="/assets/images/gvl-action-sprint.jpg"
          alt="GVL football — sponsor the live call on ONE FM 98.5"
          badge={`GVL Footy Sponsorship · ${PRICING_COPY.footballFrom}`}
        />

        <section className="px-6 md:px-12 lg:px-20 pb-16">
          <LabelReveal className="mb-8">The Evidence</LabelReveal>
          <div className="grid md:grid-cols-2 gap-5">
            <Link to="/audience" className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636] block" data-cursor-label="DATA">
              <h3 className="font-poster uppercase text-[26px] text-white">Audience &amp; Reach Data</h3>
              <p className="text-[15px] text-white/55 mt-2">Demographics, listening habits and platform numbers — the full picture behind the stats.</p>
              <span className="inline-block mt-4 font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-0.5" style={{ borderColor: RED }}>See the data →</span>
            </Link>
            <Link to="/media-kit" className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636] block" data-cursor-label="KIT">
              <h3 className="font-poster uppercase text-[26px] text-white">Media Kit &amp; Rate Card</h3>
              <p className="text-[15px] text-white/55 mt-2">Downloadable rates, specs and station assets for your marketing team or agency.</p>
              <span className="inline-block mt-4 font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-0.5" style={{ borderColor: RED }}>Open the kit →</span>
            </Link>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-20 pb-16">
          <LabelReveal className="mb-3">Start Here</LabelReveal>
          <h2 className="font-poster uppercase text-[clamp(30px,4.5vw,52px)] text-white mb-8">
            Talk to the station, not a call centre<span style={{ color: RED }}>.</span>
          </h2>
          <EnquiryForm />
          <p className="text-[13px] text-white/35 mt-4">
            Goes straight to the station's pipeline — or email <a href="mailto:admin@fm985.com.au" className="underline hover:text-white">admin@fm985.com.au</a> / call (03) 5831 3131.
          </p>
        </section>

        <div className="pb-32" />
      </div>
    </Layout>
  )
}
