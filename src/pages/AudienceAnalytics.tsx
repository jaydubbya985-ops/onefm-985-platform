/**
 * Audience & Reach — public page for Goulburn Valley Community Radio Inc.
 *
 * Accountability rule: every number rendered here is computed at runtime from
 * src/data/townData.ts (ABS 2021 base, 2026 projection) or src/data/pricing.ts,
 * and carries its source on screen. ONE FM has no stream-level measurement, so
 * listening behaviour — sessions, dayparts, platform followers, trends over
 * time — is shown as pending rather than modelled. Do not add a chart here that
 * cannot be traced back to the town data.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Radio, Users, Clock } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { motion } from 'framer-motion'
import { Layout } from '@/components/Layout'
import { WordReveal } from '@/components/WordReveal'
import { TiltCard } from '@/components/TiltCard'
import { Marquee } from '@/components/Marquee'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { SEO } from '@/components/SEO'
import { BRAND_COLORS } from '@/lib/brand'
import { stationStats } from '@/data/pricing'
import { towns } from '@/data/townData'

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
}

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const cardStagger = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
}

const SOURCE = 'ABS 2021 via src/data/townData.ts'

/** Population-weighted mean of a per-town percentage or rate. */
function weightedMean(pick: (t: (typeof towns)[number]) => number): number {
  const pop = towns.reduce((a, t) => a + t.population2026, 0)
  return towns.reduce((a, t) => a + pick(t) * t.population2026, 0) / pop
}

const DISTANCE_RINGS = [
  { label: 'Within 25km', min: 0, max: 25 },
  { label: '25–50km', min: 25, max: 50 },
  { label: '50–75km', min: 50, max: 75 },
  { label: '75–100km', min: 75, max: Infinity },
]

function SourceNote({ children }: { children: React.ReactNode }) {
  return <p className="font-label text-[10px] text-muted/70 mt-3 leading-relaxed">{children}</p>
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <motion.div
      className="mb-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={fadeUp}
    >
      <WordReveal text={title} className="font-h2 text-one-white block" as="h2" stagger={0.05} />
      <p className="font-body-small text-muted mt-1">{sub}</p>
    </motion.div>
  )
}

export default function AudienceAnalytics() {
  /* Town reach expressed as a share of the town-level total. Shares are used
     rather than absolute counts because the per-town estimates total 39,577
     while the station publishes the more conservative 39,375 headline. */
  const townShare = useMemo(() => {
    const total = towns.reduce((a, t) => a + t.listenersEstimate, 0)
    const ranked = [...towns].sort((a, b) => b.listenersEstimate - a.listenersEstimate)
    const top = ranked.slice(0, 6)
    const restShare = ranked.slice(6).reduce((a, t) => a + t.listenersEstimate, 0) / total
    return [
      ...top.map((t) => ({ region: t.name, share: +((t.listenersEstimate / total) * 100).toFixed(1) })),
      { region: `Other ${ranked.length - 6} towns`, share: +(restShare * 100).toFixed(1) },
    ]
  }, [])

  const rings = useMemo(
    () =>
      DISTANCE_RINGS.map((r) => {
        const inRing = towns.filter(
          (t) => t.distanceFromSheppartonKm >= r.min && t.distanceFromSheppartonKm < r.max
        )
        return {
          label: r.label,
          towns: inRing.length,
          population: inRing.reduce((a, t) => a + t.population2026, 0),
        }
      }).filter((r) => r.towns > 0),
    []
  )

  const ageBands = useMemo(() => {
    const bands = [
      { label: 'Under 40', test: (n: number) => n < 40 },
      { label: '40–49', test: (n: number) => n >= 40 && n < 50 },
      { label: '50–59', test: (n: number) => n >= 50 && n < 60 },
      { label: '60 and over', test: (n: number) => n >= 60 },
    ]
    return bands
      .map((b) => ({ band: b.label, towns: towns.filter((t) => b.test(t.medianAge)).length }))
      .filter((b) => b.towns > 0)
  }, [])

  const profile = useMemo(
    () => [
      {
        label: 'Median age',
        value: `${weightedMean((t) => t.medianAge).toFixed(1)} yrs`,
        note: 'Population-weighted mean of the 25 town medians',
      },
      {
        label: 'Born overseas',
        value: `${weightedMean((t) => t.bornOverseasPercent).toFixed(1)}%`,
        note: 'Population-weighted across the broadcast area',
      },
      {
        label: 'Aboriginal & Torres Strait Islander',
        value: `${weightedMean((t) => t.indigenousPercent).toFixed(1)}%`,
        note: 'Population-weighted across the broadcast area',
      },
      {
        label: 'Median household income',
        value: `$${Math.round(weightedMean((t) => t.medianIncomePerWeek)).toLocaleString()}/wk`,
        note: 'Population-weighted across the broadcast area',
      },
    ],
    []
  )

  const kpis = [
    {
      label: 'Est. weekly listeners',
      value: stationStats.weeklyListeners,
      suffix: '',
      color: BRAND_COLORS.gold,
      note: 'Population-based estimate · ABS 2021',
    },
    {
      label: 'Towns in broadcast area',
      value: stationStats.totalTowns,
      suffix: '',
      color: BRAND_COLORS.neonSky,
      note: `~${stationStats.broadcastRadiusKm}km licence radius from Shepparton`,
    },
    {
      label: 'People in broadcast area',
      value: stationStats.broadcastPopulation,
      suffix: '',
      color: BRAND_COLORS.champagne,
      note: '2026 projection · sum of the 25 towns',
    },
    {
      label: 'Years broadcasting',
      value: stationStats.yearsBroadcasting,
      suffix: ' yrs',
      color: BRAND_COLORS.red,
      note: 'Licensed 1989 · callsign 3ONE',
    },
  ]

  return (
    <Layout>
      <SEO
        title="Audience & Reach — ONE FM 98.5"
        description={`ONE FM 98.5 reaches an estimated ${stationStats.weeklyListeners.toLocaleString()} weekly listeners across ${stationStats.totalTowns} towns within ~${stationStats.broadcastRadiusKm}km of Shepparton. Every figure is derived from ABS 2021 census data — stream-level analytics are not yet measured.`}
      />

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[40vh] bg-surface-deep overflow-hidden" data-cursor-label="AUDIENCE">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div aria-hidden className="grain-overlay" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-12 pt-8">
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
          >
            <WordReveal text="AUDIENCE & REACH" className="font-h1 text-one-white mb-3 block" as="h1" stagger={0.04} />
            <p className="font-body text-one-white/80 max-w-2xl">
              Who lives inside the ONE FM 98.5 broadcast area, and how our reach estimate is built.
            </p>
            <p className="font-body-small text-muted mt-3 max-w-2xl">
              Every figure on this page is calculated from the {stationStats.totalTowns} towns in our
              coverage data ({SOURCE}). ONE FM does not yet measure stream-level listening, so nothing
              here is presented as live or measured audience behaviour.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {kpis.map((stat) => (
              <TiltCard key={stat.label} maxTilt={5} className="flex flex-col min-h-[140px]">
                <motion.div
                  className="glass-card p-5 flex flex-col justify-between h-full group relative overflow-hidden"
                  variants={cardStagger}
                >
                  <div aria-hidden className="explore-tile-scan" />
                  <div>
                    <div className="font-label text-muted mb-2">{stat.label}</div>
                    <div className="font-stat" style={{ color: stat.color }}>
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                    </div>
                    <span className="font-label text-xs text-muted mt-1 block">{stat.note}</span>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="bg-one-deep-blue border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={30}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">GOULBURN VALLEY COMMUNITY RADIO INC.</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{stationStats.weeklyListeners.toLocaleString()} EST. WEEKLY LISTENERS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">CALLSIGN 3ONE · LICENSED 1989</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{stationStats.totalTowns} TOWNS · {stationStats.broadcastRadiusKm}KM RADIUS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">ALL FIGURES FROM ABS 2021 CENSUS DATA</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{stationStats.broadcastPopulation.toLocaleString()} PEOPLE IN THE BROADCAST AREA</span>,
          ]}
        />
      </div>

      {/* ═══════ WHERE THE REACH SITS ═══════ */}
      <section className="bg-surface-mid section-bleed-top section-padding" data-cursor-label="COVERAGE">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <SectionHead
            title="WHERE THE REACH SITS"
            sub="Share of the estimated weekly audience, by town"
          />

          <div className="grid grid-cols-1 lg:grid-cols-[62%_38%] gap-8">
            <TiltCard maxTilt={2}>
              <div className="glass-card p-4 sm:p-6 group relative overflow-hidden">
                <div aria-hidden className="explore-tile-scan" />
                <div className="w-full h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={townShare} layout="vertical" margin={{ top: 8, right: 24, left: 24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: '#9AA7B8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <YAxis
                        type="category"
                        dataKey="region"
                        width={110}
                        tick={{ fill: '#F2EFE9', fontSize: 11, fontFamily: 'Space Grotesk' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        contentStyle={{ background: BRAND_COLORS.navy, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 12 }}
                        itemStyle={{ color: '#F4F1EA' }}
                        formatter={(value: number) => [`${value}% of estimated reach`, '']}
                      />
                      <Bar dataKey="share" radius={[0, 4, 4, 0]} barSize={22}>
                        {townShare.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? BRAND_COLORS.red : BRAND_COLORS.blue} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <SourceNote>
                  Share of the town-level weekly listener estimates ({SOURCE}). Shown as a share
                  rather than a headcount: the town estimates total 39,577 against the station's
                  published {stationStats.weeklyListeners.toLocaleString()} headline, and we publish
                  the more conservative figure.
                </SourceNote>
              </div>
            </TiltCard>

            <motion.div
              className="flex flex-col gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <h3 className="font-h3 text-one-white mb-1">Distance from the studio</h3>
              {rings.map((r, i) => (
                <TiltCard key={r.label} maxTilt={4}>
                  <motion.div
                    className="glass-card p-5 border-l-[3px] group relative overflow-hidden"
                    style={{ borderLeftColor: i === 0 ? BRAND_COLORS.red : BRAND_COLORS.blue }}
                    variants={cardStagger}
                  >
                    <div aria-hidden className="explore-tile-scan" />
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} style={{ color: i === 0 ? BRAND_COLORS.red : BRAND_COLORS.neonSky }} />
                      <span className="font-label text-xs text-one-white">{r.label}</span>
                    </div>
                    <p className="font-h4 text-one-white mb-1">
                      {r.population.toLocaleString()} people
                    </p>
                    <p className="font-body-small text-muted">
                      {r.towns} {r.towns === 1 ? 'town' : 'towns'} · 2026 projection
                    </p>
                  </motion.div>
                </TiltCard>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ WHO LIVES HERE ═══════ */}
      <section className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="COMMUNITY PROFILE">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <SectionHead
            title="WHO LIVES HERE"
            sub="Census profile of the broadcast area — not a survey of our listeners"
          />

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {profile.map((p) => (
              <TiltCard key={p.label} maxTilt={4} className="h-full">
                <motion.div className="glass-card p-5 h-full group relative overflow-hidden" variants={cardStagger}>
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="font-label text-muted mb-2">{p.label}</div>
                  <div
                    className="font-stat leading-none whitespace-nowrap"
                    style={{ color: BRAND_COLORS.champagne, fontSize: 'clamp(1.6rem, 2.6vw, 2.4rem)' }}
                  >
                    {p.value}
                  </div>
                  <p className="font-body-small text-muted mt-2">{p.note}</p>
                </motion.div>
              </TiltCard>
            ))}
          </motion.div>

          <TiltCard maxTilt={3}>
            <motion.div
              className="glass-card p-5 sm:p-6 group relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
            >
              <div aria-hidden className="explore-tile-scan" />
              <h4 className="font-h4 text-one-white mb-4">Towns by median age</h4>
              <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageBands} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="band"
                      tick={{ fill: '#F2EFE9', fontSize: 11, fontFamily: 'Space Grotesk' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#9AA7B8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={{ background: BRAND_COLORS.navy, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 12 }}
                      itemStyle={{ color: '#F4F1EA' }}
                      formatter={(value: number) => [`${value} towns`, '']}
                    />
                    <Bar dataKey="towns" fill={BRAND_COLORS.blue} radius={[4, 4, 0, 0]} barSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <SourceNote>
                Count of towns in each median-age band ({SOURCE}). This describes the population we
                broadcast to; ONE FM holds no age data about its own listeners.
              </SourceNote>
            </motion.div>
          </TiltCard>
        </div>
      </section>

      {/* ═══════ WHAT WE DO NOT MEASURE ═══════ */}
      <section className="bg-surface-glow section-bleed-top section-padding" data-cursor-label="DATA PENDING">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
          <SectionHead
            title="WHAT WE DO NOT MEASURE"
            sub="Held back deliberately until the numbers are real"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Radio,
                title: 'Stream analytics',
                body: 'Session counts, listening duration and concurrent listeners need the Radio.co analytics integration. Until it is connected we publish no stream figures.',
              },
              {
                icon: Clock,
                title: 'Daypart listening',
                body: 'Breakfast, morning and drive audience splits require survey or stream measurement. We will not model them from programme times.',
              },
              {
                icon: Users,
                title: 'Social and podcast reach',
                body: 'Follower and download counts belong to the platforms that report them. They will appear here once pulled from source, not before.',
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  className="glass-card p-6 border-l-[3px]"
                  style={{ borderLeftColor: BRAND_COLORS.muted }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: easeOutExpo }}
                >
                  <Icon size={20} className="text-muted mb-3" />
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-h4 text-one-white">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded-full font-label text-[9px] tracking-[0.18em] text-one-navy" style={{ background: BRAND_COLORS.champagne }}>
                      PENDING
                    </span>
                  </div>
                  <p className="font-body-small text-muted leading-relaxed">{item.body}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════ NEXT STEPS ═══════ */}
      <section className="bg-surface-warm section-bleed-top section-padding" data-cursor-label="NEXT">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <WordReveal text="TALK TO US ABOUT REACH" className="font-h2 text-one-white mb-3 block" as="h2" />
            <p className="font-body text-one-white/80 mb-8">
              Station staff prepare every sponsorship proposal by hand, using these figures and their
              sources. Nothing is auto-generated.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/media-kit" className="btn-secondary text-sm">Media kit &amp; rate card</Link>
              <Link to="/coverage" className="btn-secondary text-sm">Coverage map</Link>
              <Link to="/proposal" className="btn-primary text-sm">Request a proposal</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
