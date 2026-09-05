/**
 * Public proposal request — not a DIY PDF generator.
 * Station staff send a tailored PDF from the ops portal.
 *
 * Stats on this page: coverageCopy.ts (ABS 2021 via townData).
 * Do not add age-band % or invented demographics.
 */
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import {
  OnAirTicker,
  FeatureFrame,
  StatsStrip,
  LabelReveal,
  PosterReveal,
  StrokeFill,
} from '@/components/onair/kit'
import { generalTiers, footballTiers } from '@/data/pricing'
import { submitEnquiry } from '@/lib/enquiries'
import {
  coverageStatsStrip,
  formatRadius,
  formatTowns,
  formatWeeklyListeners,
  tickerWeeklyListenersItem,
  weeklyListenersValue,
} from '@/lib/coverageCopy'
import { GVL_PREMIUM_BADGE, PARTNERSHIP_FROM_WEEKLY, STANDARD_SPOT_PLUS_GST } from '@/lib/inventoryCopy'
import { formatGuideHours } from '@/lib/guideHours'
import { InventoryLadder } from '@/components/InventoryLadder'
import { BRAND } from '@/lib/brand'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

const RED = '#E51636'
const GVL_MATCH_HOURS = formatGuideHours('GVL Match of the Day')

const GENERAL_PACKAGES = Object.entries(generalTiers).map(([id, t]) => ({
  id,
  name: t.name,
  weekly: t.weeklyPrice,
  range: `$${t.minPrice}–$${t.maxPrice}/week`,
  spots: t.spots,
  social: t.socialPosts,
  extra: 'exclusivity' in t && t.exclusivity ? 'Category exclusivity' : null,
  group: 'general' as const,
}))

const FOOTBALL_PACKAGES = footballTiers.map((t) => ({
  id: `fb-${t.id}`,
  name: t.id === 1 ? t.name : `GVL ${t.name}`,
  weekly: t.price,
  range: t.id === 1
    ? `$${t.price}/week · name-read (not a GVL commercial)`
    : `$${t.price}/week · GVL premium`,
  spots: null as number | null,
  social: null as number | null,
  extra: t.id === 1
    ? 'Match-day name-read and logo — not a GVL commercial spot'
    : 'GVL premium inventory — quoted above the $25 standard spot',
  group: 'football' as const,
}))

const ALL_PACKAGES = [...GENERAL_PACKAGES, ...FOOTBALL_PACKAGES]

function matchInterest(raw: string | null): string {
  if (!raw) return ''
  const needle = raw.trim().toLowerCase()
  const hit = ALL_PACKAGES.find(
    (p) =>
      p.id.toLowerCase() === needle ||
      p.name.toLowerCase() === needle ||
      p.name.toLowerCase().includes(needle) ||
      needle.includes(p.name.toLowerCase()),
  )
  return hit?.id ?? ''
}

function Hero() {
  const reduced = useReducedMotion()
  return (
    <section className="relative overflow-hidden px-6 md:px-12 lg:px-20 pt-24 pb-20 min-h-[72vh] flex flex-col justify-center">
      {reduced ? (
        <img
          src="/videos/heroes/hero-poster.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.45)' }}
        />
      ) : (
        <video
          src="/videos/heroes/hero-01-aerial-factory.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.45) saturate(0.9)' }}
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
        <p className="font-bold text-[12px] tracking-[0.18em] uppercase text-white/50 mb-5">
          Sponsorship · ONE FM 98.5
        </p>
        <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(44px,8.5vw,128px)]">
          <PosterReveal
            lines={[
              <span key="a" className="poster-hover">
                Request a
              </span>,
              <span key="b">
                <StrokeFill delay={0.9}>proposal</StrokeFill>
                <span style={{ color: RED }}>.</span>
              </span>,
            ]}
          />
        </h1>
        <p className="mt-7 max-w-[560px] text-[17px] leading-relaxed text-white/60">
          Tell us about your business. Station staff will send a tailored PDF using
          sourced reach figures — not a public generator, not invented demographics.
        </p>
        <a
          href="#enquire"
          className="inline-block mt-8 rounded-full px-7 py-3.5 font-bold text-[13px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.03] transition-transform"
          style={{ background: RED }}
          data-cursor-label="REQUEST"
        >
          Request a proposal →
        </a>
      </div>
    </section>
  )
}

function EnquiryForm({
  packageId,
  onPackageChange,
}: {
  packageId: string
  onPackageChange: (id: string) => void
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const selected = ALL_PACKAGES.find((p) => p.id === packageId)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const weeks = String(f.get('weeks') ?? '').trim()
    const body = String(f.get('message') ?? '').trim()
    const pkgLine = selected
      ? `Package of interest: ${selected.name} (${selected.range})`
      : 'Package of interest: not specified'
    const weekLine = weeks ? `Preferred duration: ${weeks} weeks` : 'Preferred duration: not specified'
    setState('sending')
    const isFootball = selected?.group === 'football'
    const result = await submitEnquiry({
      name: String(f.get('name') ?? ''),
      email: String(f.get('email') ?? ''),
      phone: String(f.get('phone') ?? '') || undefined,
      company: String(f.get('company') ?? '') || undefined,
      subject: selected ? `Proposal request — ${selected.name}` : 'Proposal request',
      message: [body, pkgLine, weekLine].filter(Boolean).join('\n\n'),
      source: isFootball ? 'football' : 'sponsorship',
      enquiryType: 'Sponsorship',
      priority: 'high',
    })
    if (result.success) {
      setState('done')
    } else {
      setError(result.error ?? `Something went wrong — email ${BRAND.email} instead.`)
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="border-2 rounded-2xl p-10 text-center" style={{ borderColor: RED }}>
        <div className="font-poster uppercase text-[34px] text-white">
          Request received<span style={{ color: RED }}>.</span>
        </div>
        <p className="text-white/55 mt-2 text-[15px]">
          We&apos;ll be in touch with a tailored proposal. — {BRAND.fullName}
        </p>
      </div>
    )
  }

  const input =
    'w-full bg-[#111] border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#E51636] focus:outline-none'

  return (
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4" id="enquire">
      <input name="name" required placeholder="Your name" aria-label="Your name" className={input} />
      <input name="company" placeholder="Business name" aria-label="Business name" className={input} />
      <input name="email" type="email" required placeholder="Email" aria-label="Email" className={input} />
      <input name="phone" placeholder="Phone (optional)" aria-label="Phone" className={input} />
      <label className="md:col-span-2 block">
        <span className="sr-only">Package of interest</span>
        <select
          value={packageId}
          onChange={(e) => onPackageChange(e.target.value)}
          aria-label="Package of interest"
          className={input}
        >
          <option value="">Package of interest (optional)</option>
          <optgroup label="Station packages">
            {GENERAL_PACKAGES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.range}
              </option>
            ))}
          </optgroup>
          <optgroup label="GVL football">
            {FOOTBALL_PACKAGES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.range}
              </option>
            ))}
          </optgroup>
        </select>
      </label>
      <input
        name="weeks"
        type="number"
        min={4}
        max={52}
        placeholder="Duration in weeks (optional)"
        aria-label="Duration in weeks"
        className={input}
      />
      <p className="text-[13px] text-white/40 self-center">Typical campaigns: 13, 26 or 52 weeks.</p>
      <textarea
        name="message"
        required
        placeholder="Tell us about your business, campaign dates, and what you want heard on air…"
        aria-label="Message"
        rows={4}
        className={`${input} md:col-span-2`}
      />
      {state === 'error' && (
        <p className="text-sm md:col-span-2" style={{ color: RED }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="md:col-span-2 rounded-full px-7 py-4 font-bold text-[13px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: RED }}
        data-cursor-label="SEND"
      >
        {state === 'sending' && <Loader2 size={16} className="animate-spin" />}
        Send proposal request →
      </button>
    </form>
  )
}

export default function SalesProposal() {
  const [searchParams] = useSearchParams()
  const [packageId, setPackageId] = useState('')

  useEffect(() => {
    const fromQuery = matchInterest(
      searchParams.get('interest') ?? searchParams.get('package'),
    )
    if (fromQuery) setPackageId(fromQuery)
  }, [searchParams])

  const pickPackage = (id: string) => {
    setPackageId(id)
    document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Layout>
      <SEO
        title="Request a Sponsorship Proposal"
        description={`Request a tailored ONE FM 98.5 sponsorship proposal. ${formatWeeklyListeners()} across ${formatTowns()} (ABS 2021). ${STANDARD_SPOT_PLUS_GST}. Station staff send the PDF.`}
      />
      <div style={{ background: '#0A0A0A' }} className="min-h-screen">
        <OnAirTicker
          items={[
            tickerWeeklyListenersItem(),
            `${formatTowns()} · ${formatRadius()} radius`,
            PARTNERSHIP_FROM_WEEKLY,
            STANDARD_SPOT_PLUS_GST,
            GVL_PREMIUM_BADGE,
            `GVL Match of the Day · ${GVL_MATCH_HOURS ?? 'Saturday'}`,
            'Staff-written PDF — not a public generator',
          ]}
          delay={0.4}
        />
        <Hero />

        <StatsStrip
          stats={[
            ...coverageStatsStrip(),
            { n: formatRadius(), t: 'Broadcast radius' },
          ]}
        />

        <section className="px-6 md:px-12 lg:px-20 pb-10">
          <InventoryLadder />
        </section>

        <section className="px-6 md:px-12 lg:px-20 pb-16">
          <LabelReveal className="mb-3">Station packages</LabelReveal>
          <p className="text-white/50 text-[15px] mb-8 max-w-2xl">
            Published rates from the station rate card. A staff member prices the final PDF
            — GST exclusive until invoiced.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {GENERAL_PACKAGES.map((p) => {
              const active = packageId === p.id
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => pickPackage(p.id)}
                  data-cursor-label="SELECT"
                  className="text-left border rounded-xl p-7 transition-colors"
                  style={{
                    borderColor: active ? RED : 'rgba(255,255,255,0.12)',
                    background: active ? 'rgba(229,22,54,0.08)' : 'transparent',
                  }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-poster uppercase text-[26px] text-white">{p.name}</h3>
                    <span className="font-bold text-[13px] tracking-[0.12em] uppercase" style={{ color: RED }}>
                      ${p.weekly}/wk
                    </span>
                  </div>
                  <p className="text-[15px] text-white/55 mt-2">
                    {p.spots} announcements a week · {p.social} social posts a month. Range {p.range}.
                    {p.extra ? ` ${p.extra}.` : ''}
                  </p>
                  <span className="inline-flex items-center gap-1.5 mt-4 font-bold text-[13px] tracking-[0.12em] uppercase text-white">
                    {active && <Check size={14} style={{ color: RED }} />}
                    {active ? 'Selected — complete the form' : 'Select & request →'}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <FeatureFrame
          to="/football"
          img={STATION_PHOTOS.gvlActionSprint}
          alt="GVL football — sponsor the live call on ONE FM 98.5"
          badge={GVL_PREMIUM_BADGE}
        />

        <section className="px-6 md:px-12 lg:px-20 pb-16">
          <LabelReveal className="mb-8">What we publish</LabelReveal>
          <div className="grid md:grid-cols-3 gap-5">
            <Link
              to="/audience"
              className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636] block"
              data-cursor-label="DATA"
            >
              <h3 className="font-poster uppercase text-[22px] text-white">Audience &amp; reach</h3>
              <p className="text-[15px] text-white/55 mt-2">
                Town-by-town census figures. No invented age-band splits.
              </p>
              <span
                className="inline-block mt-4 font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-0.5"
                style={{ borderColor: RED }}
              >
                See the data →
              </span>
            </Link>
            <Link
              to="/media-kit"
              className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636] block"
              data-cursor-label="KIT"
            >
              <h3 className="font-poster uppercase text-[22px] text-white">Media kit</h3>
              <p className="text-[15px] text-white/55 mt-2">
                Rate card, specs and station assets for agencies.
              </p>
              <span
                className="inline-block mt-4 font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-0.5"
                style={{ borderColor: RED }}
              >
                Open the kit →
              </span>
            </Link>
            <Link
              to="/coverage"
              className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636] block"
              data-cursor-label="MAP"
            >
              <h3 className="font-poster uppercase text-[22px] text-white">Coverage map</h3>
              <p className="text-[15px] text-white/55 mt-2">
                {formatTowns()} within a {formatRadius()} radius of Shepparton. {GVL_PREMIUM_BADGE}.
              </p>
              <span
                className="inline-block mt-4 font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-0.5"
                style={{ borderColor: RED }}
              >
                See the map →
              </span>
            </Link>
          </div>
          <p className="text-[13px] text-white/35 mt-6 max-w-2xl">
            Weekly listeners {weeklyListenersValue()} is an estimate from ABS 2021
            census populations in the broadcast area (source: townData). We do not publish a 25–34 age
            split — that figure is not in our research.
          </p>
        </section>

        <section className="px-6 md:px-12 lg:px-20 pb-16">
          <LabelReveal className="mb-3">Start here</LabelReveal>
          <h2 className="font-poster uppercase text-[clamp(30px,4.5vw,52px)] text-white mb-8">
            We write the PDF. You send the brief<span style={{ color: RED }}>.</span>
          </h2>
          <EnquiryForm packageId={packageId} onPackageChange={setPackageId} />
          <p className="text-[13px] text-white/35 mt-4">
            Goes to the station pipeline — or email{' '}
            <a href={`mailto:${BRAND.email}`} className="underline hover:text-white">
              {BRAND.email}
            </a>{' '}
            / call {BRAND.phone}.
          </p>
        </section>

        <div className="pb-32" />
      </div>
    </Layout>
  )
}
