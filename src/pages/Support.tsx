/**
 * DONATE — rebuilt per REBUILD-SPEC.md (page 6 of 6).
 * Honest bank transfer flow until Stripe keys arrive. No fake patron names.
 * Impact copy from programGuide / BRAND / bankDetails — no invented programs.
 */
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import {
  OnAirTicker,
  StatsStrip,
  LabelReveal,
  EditorialCards,
  PosterReveal,
  StrokeFill,
} from '@/components/onair/kit'
import { donationTiers } from '@/data/pricing'
import { BREAKFAST_SHOW, MULTICULTURAL_PROGRAM_COUNT, getBreakfastScheduleLabel } from '@/data/programGuide'
import { formatTowns, formatCoverageShort, formatWeeklyListeners, formatWeeklyListenersPlain, yearsBroadcastingValue } from '@/lib/coverageCopy'
import { PARTNERSHIP_FROM_WEEKLY } from '@/lib/inventoryCopy'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from '@/lib/bankDetails'
import { BRAND } from '@/lib/brand'

const RED = '#E51636'

const BANK = {
  name: BANK_ACCOUNT_NAME,
  bank: 'NAB',
  bsb: BANK_BSB,
  account: BANK_ACCOUNT,
} as const

const STRIPE_READY =
  typeof import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === 'string' &&
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')

const IMPACT = [
  {
    tag: 'Programming',
    title: 'Keep the Valley on air',
    body: `Volunteer-run community radio from Shepparton — overnight mix plus live local shifts on the weekly guide. Donations help cover transmission, studio and programming costs.`,
  },
  {
    tag: 'Community',
    title: 'Airtime for local NFPs',
    body: `Community notices, GVL sport and ${MULTICULTURAL_PROGRAM_COUNT} multicultural programs from the weekly guide (fm985.com.au/guide) — airtime for groups across the Goulburn Murray.`,
  },
  {
    tag: 'Resilience',
    title: 'Emergency information',
    body: 'When floods and storms isolate towns, local radio is part of the practical information network — community notices alongside sport and events.',
  },
  {
    tag: 'Breakfast',
    title: BREAKFAST_SHOW,
    body: `${getBreakfastScheduleLabel()} — volunteer weekday breakfast from the weekly guide (fm985.com.au/guide).`,
  },
]

function DonateHero() {
  const reduced = useReducedMotion()
  return (
    <section className="relative overflow-hidden px-6 md:px-12 lg:px-20 pt-24 pb-20 min-h-[82vh] flex flex-col justify-center">
      {reduced ? (
        <img
          src="/assets/images/heritage-di-hunter-carols-2014.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
        />
      ) : (
        <video
          src="/videos/heroes/hero-06-canola-finale.mp4"
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
        <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(52px,10vw,150px)]">
          <PosterReveal
            lines={[
              <span key="a" className="poster-hover">
                Keep the Valley
              </span>,
              <span key="b">
                <StrokeFill delay={0.9}>On Air</StrokeFill>
                <span style={{ color: RED }}>.</span>
              </span>,
            ]}
          />
        </h1>
        <p className="mt-7 max-w-[560px] text-[17px] leading-relaxed text-white/60">
          {BRAND.org} is a not-for-profit, volunteer-run station.
          Donations help keep 98.5 FM live and local for {formatTowns()}.
        </p>
        <a
          href="#give"
          className="inline-block mt-8 rounded-full px-7 py-3.5 font-bold text-[13px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.03] transition-transform"
          style={{ background: RED }}
          data-cursor-label="GIVE"
        >
          How to Give →
        </a>
      </div>
    </section>
  )
}

function BankDetails() {
  const reference = encodeURIComponent('ONE FM donation')
  const mailBody = encodeURIComponent(
    `Hi ONE FM,\n\nI would like to make a donation to support community radio in the Goulburn Valley.\n\nThank you.`
  )

  return (
    <section id="give" className="px-6 md:px-12 lg:px-20 pb-16">
      <LabelReveal className="mb-3">Give Now</LabelReveal>
      <h2 className="font-poster uppercase text-[clamp(28px,4.5vw,48px)] text-white leading-[0.95] mb-8">
        Bank transfer<span style={{ color: RED }}>.</span>
      </h2>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        <div className="border-2 rounded-2xl p-8" style={{ borderColor: RED }}>
          <dl className="space-y-4 text-[15px]">
            <div>
              <dt className="text-white/40 text-[11px] font-bold tracking-[0.12em] uppercase">Account name</dt>
              <dd className="font-poster text-[22px] text-white mt-1">{BANK.name}</dd>
            </div>
            <div>
              <dt className="text-white/40 text-[11px] font-bold tracking-[0.12em] uppercase">Bank</dt>
              <dd className="text-white/80 mt-1">{BANK.bank}</dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-white/40 text-[11px] font-bold tracking-[0.12em] uppercase">BSB</dt>
                <dd className="font-mono text-[20px] text-white mt-1">{BANK.bsb}</dd>
              </div>
              <div>
                <dt className="text-white/40 text-[11px] font-bold tracking-[0.12em] uppercase">Account</dt>
                <dd className="font-mono text-[20px] text-white mt-1">{BANK.account}</dd>
              </div>
            </div>
            <div>
              <dt className="text-white/40 text-[11px] font-bold tracking-[0.12em] uppercase">Reference</dt>
              <dd className="text-white/70 mt-1">{reference.replace(/%20/g, ' ')}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col justify-center gap-4">
          {STRIPE_READY ? (
            <p className="text-[15px] text-white/55 leading-relaxed">
              Online card payments via Stripe are being wired — use bank transfer below or contact
              the station for other options.
            </p>
          ) : (
            <p className="text-[15px] text-white/55 leading-relaxed">
              Card payments coming soon. For now, please use direct bank transfer or email the
              station.
            </p>
          )}
          <a
            href={`mailto:${BRAND.email}?subject=Donation%20to%20ONE%20FM%2098.5&body=${mailBody}`}
            className="inline-flex justify-center rounded-full px-7 py-4 font-bold text-[13px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.03] transition-transform"
            style={{ background: RED }}
          >
            Email {BRAND.email} →
          </a>
          <a
            href={`tel:+61358313131`}
            className="text-center text-[14px] text-white/45 hover:text-white/70 transition-colors"
          >
            Or call {BRAND.phone}
          </a>
        </div>
      </div>
    </section>
  )
}

export default function Support() {
  const tiers = donationTiers.map((t) => ({
    tag: t.period === 'month' ? `$${t.amount}/month` : 'One-off',
    title: t.name,
    body:
      t.period === 'month'
        ? `Suggested monthly amount of $${t.amount}. On-air thanks and recognition are arranged with the station — not automatic.`
        : `Suggested one-off amount of $${t.amount}.`,
  }))

  return (
    <Layout>
      <SEO
        title="Donate — Support ONE FM 98.5"
        description={`Support volunteer-run community radio across ${formatTowns()}. ${formatCoverageShort()} (ABS 2021 via townData). Bank transfer: NAB BSB ${BANK_BSB} · Acct ${BANK_ACCOUNT} · ${BANK_ACCOUNT_NAME}.`}
      />
      <div style={{ background: '#0A0A0A' }} className="min-h-screen">
        <OnAirTicker
          items={[
            'Volunteer-run · community-owned · not for profit',
            BRAND.org,
            formatCoverageShort(),
            formatWeeklyListeners(),
            `ABN ${BRAND.abn}`,
            'Every dollar stays local',
          ]}
          delay={0.4}
        />
        <DonateHero />

        <EditorialCards label="Your Impact" items={IMPACT} columns={2} />

        <EditorialCards label="Support Levels" items={tiers} columns={2} />

        <BankDetails />

        <section className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
          <LabelReveal className="mb-6">Other Ways to Help</LabelReveal>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
            <Link
              to="/contact"
              className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636] block"
            >
              <h3 className="font-poster uppercase text-[22px] text-white">Volunteer</h3>
              <p className="text-[15px] text-white/55 mt-2">
                Go behind the mic, join an OB crew, or help in the studio — membership required.
              </p>
              <span className="inline-block mt-4 font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-0.5" style={{ borderColor: RED }}>
                Get involved →
              </span>
            </Link>
            <Link
              to="/sponsorship"
              className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636] block"
            >
              <h3 className="font-poster uppercase text-[22px] text-white">Sponsor</h3>
              <p className="text-[15px] text-white/55 mt-2">
                Partner with the Valley on air — {PARTNERSHIP_FROM_WEEKLY} across {formatTowns()}.
              </p>
              <span className="inline-block mt-4 font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-0.5" style={{ borderColor: RED }}>
                View packages →
              </span>
            </Link>
          </div>
          <p className="text-[13px] text-white/35 mt-8 max-w-xl">
            Major donor and patron recognition is handled by the station directly —{' '}
            <a href={`mailto:${BRAND.email}`} className="underline hover:text-white/60">
              contact us
            </a>{' '}
            to discuss on-air thanks. We do not list unverified names publicly.
          </p>
        </section>

        <StatsStrip
          stats={[
            { n: yearsBroadcastingValue(), t: 'Years on air', red: true },
            { n: BRAND.frequency, t: `FM · Callsign ${BRAND.callsign}` },
            { n: formatWeeklyListenersPlain(), t: 'Est. weekly listeners' },
            { n: formatTowns(), t: 'Across the Goulburn Valley' },
          ]}
        />

        <section className="px-6 md:px-12 lg:px-20 pb-32 text-center">
          <h2 className="font-poster uppercase text-[clamp(26px,4vw,40px)] text-white mb-6">
            Thank you for backing community radio<span style={{ color: RED }}>.</span>
          </h2>
          <Link
            to="/listen"
            className="inline-block rounded-full px-8 py-4 font-bold text-[13px] tracking-[0.14em] uppercase text-white border border-white/25 hover:border-[#E51636] transition-colors"
          >
            Listen Live →
          </Link>
        </section>
      </div>
    </Layout>
  )
}
