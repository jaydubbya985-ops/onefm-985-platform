import { useState, useRef } from 'react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { motion, useScroll, useTransform } from 'framer-motion'
import { WordReveal } from '@/components/WordReveal'
import {
  coverageNumbers,
  formatBroadcastPopulation,
  formatCoverageShort,
  formatRadius,
  formatTowns,
  townsCount,
  yearsBroadcastingValue,
} from '@/lib/coverageCopy'
import { TiltCard } from '@/components/TiltCard'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { Marquee } from '@/components/Marquee'
import { LatestInterviews } from '@/components/LatestInterviews'
import {
  ACMA_FACTS,
  EMERGENCY_BROADCAST_NARRATIVE,
  HISTORY_MILESTONES,
  LIFE_MEMBER_NOTE,
} from '@/data/stationHistory'
import {
  Radio,
  Mic,
  Calendar,
  MapPin,
  Users,
  Heart,
  Globe,
  Award,
  Languages,
  ChevronRight,
  Quote,
  Wifi,
  Antenna,
  Building2,
  Layers,
} from 'lucide-react'

/**
 * Timeline rows come straight from HISTORY_MILESTONES in stationHistory.ts — the
 * ACMA register, the 2024 Annual Report, council grant papers and the Shepparton
 * News retrospective. This page only supplies an icon and an archive photo per
 * row; it must never add a claim the source record does not carry.
 */
const MILESTONE_ART: Record<string, { img: string; icon: typeof Radio }> = {
  '1970s':   { img: '/assets/images/geo-town-aerial.jpg',                 icon: MapPin },
  '1980':    { img: '/assets/images/heritage-original-panel-1988.jpg',    icon: Radio },
  'Apr 1989':{ img: '/assets/images/heritage-ob-mall-1989.jpg',           icon: Antenna },
  'May 1989':{ img: '/assets/images/commentary-box-action.jpg',           icon: Mic },
  '2014':    { img: '/assets/images/heritage-di-hunter-carols-2014.jpg',  icon: Award },
  '2019':    { img: '/assets/images/event-lasers-crowd.jpg',              icon: Award },
  '2022':    { img: '/assets/images/geo-lake-aerial.jpg',                 icon: Heart },
  '2024':    { img: '/assets/images/studio-sbs-visit.jpg',                icon: Building2 },
}

const milestones = HISTORY_MILESTONES.map((m) => ({
  year: m.year,
  title: m.title,
  desc: m.body,
  ...MILESTONE_ART[m.year],
}))

/* ─── Deterministic gradient avatars (same palette as Programs page) ─── */
const TEAM_PALETTES = [
  { from: '#1B458F', to: '#071D3A', accent: '#F2F2F2' },
  { from: '#F2F2F2', to: '#1B3A6F', accent: '#FFF8DC' },
  { from: '#E51636', to: '#1A0A20', accent: '#FF9BAA' },
  { from: '#B6FF00', to: '#0A2030', accent: '#7FFFD4' },
  { from: '#9B5DE5', to: '#1A0A30', accent: '#DDB3FF' },
  { from: '#FF6B6B', to: '#2A0A10', accent: '#FFB3B3' },
  { from: '#1B458F', to: '#0D2A18', accent: '#6EE7B7' },
]

function getTeamAvatar(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 37 + name.charCodeAt(i)) >>> 0
  const palette = TEAM_PALETTES[hash % TEAM_PALETTES.length]
  const words = name.trim().replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean)
  const initials = words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[words.length - 1][0]).toUpperCase()
  return { ...palette, initials }
}

/* ─── Team data ─── */
const team = [
  { name: "Tim Ahemt", role: "Breakfast Host (Mon–Tue)", years: "2026", cat: "On-Air", img: "/assets/images/commentary-box-action.jpg", quote: "Hosts ONE FM Breakfast Monday and Tuesday — community interviews and local news." },
  { name: "The Big G (Craig Stott)", role: "Breakfast (Wed) / Tuesday Mornings", years: "2026", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Wednesday breakfast and Tuesday morning music on ONE FM." },
  { name: "Ralph Whitehead", role: "Thu Breakfast / Friday Arvo / Friday Morning", years: "", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Married in 1966. Moved to Shepparton during the 1976 Christmas break. Long-time audio enthusiast and community radio presenter." },
  { name: "Josh Revens", role: "Fri Breakfast / Monday Nights / Community Interviews", years: "", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Friday breakfast, Monday night community programming, and community interviews covering local events, sports and initiatives." },
  { name: "Johnny P (John Painter)", role: "Host — Dancing through the decades", years: "4", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Been on air for 4 years. Married to Eryl, lives in Mooroopna. Has 6 kids between them. Enjoys playing music from across the decades." },
  { name: "James Manley", role: "Host — The James Manley Show", years: "", cat: "On-Air", img: "/assets/images/commentary-box-action.jpg", quote: "Community-focused afternoon programming Mon–Tue with local interviews and advocacy." },
  { name: "Carlos Rock", role: "Host — Planet of Sound", years: "19-20", cat: "On-Air", img: "/assets/images/studio-sbs-diversity.jpg", quote: "Has been on air for 19-20 years. Hosts the Planet of Sound program featuring rock music from across the decades." },
  { name: "Timmy Ahmet", role: "Host — Good Evening Country", years: "", cat: "On-Air", img: "/assets/images/studio-sbs-diversity.jpg", quote: "Hosts the Good Evening Country program featuring country music." },
  { name: "Les 'Harro' Harrison", role: "Community Host / Various", years: "", cat: "On-Air", img: "/assets/images/commentary-box-action.jpg", quote: "Spent working life in education, in charge of schools for over 35 years. Interests include cricket, cycling, fishing, golf and being an active member of his local Lions Club." },
  { name: "Fikiri", role: "Host — Africonnect (Swahili)", years: "", cat: "Multicultural", img: "/assets/images/studio-sbs-diversity.jpg", quote: "Hosts the Africonnect program in Swahili, connecting the African community in the Goulburn Valley." },
  { name: "MK (Muagutauti'a Faletoese Lemamea)", role: "Host — Samoan Program", years: "", cat: "Multicultural", img: "/assets/images/commentary-box-action.jpg", quote: "Hosts the Samoan language program connecting the Samoan community in the Goulburn Valley." },
  { name: "Edith", role: "Host — Filipino Music Program", years: "", cat: "Multicultural", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Hosts the Filipino music program celebrating Filipino culture and music." },
  { name: "Jimmy", role: "Host — Mandarin Program / Her Quiet Strength", years: "", cat: "Multicultural", img: "/assets/images/studio-presenter-mic.jpg", quote: "Hosts the Mandarin language program and 'Her Quiet Strength' segment. Interviews guests in Mandarin with co-host Ivy." },
]

const teamCategories = ["All", "On-Air", "Multicultural"]

/**
 * Facilities cards. Equipment inventories are not on the public record, so these
 * describe the licence and the programming we can evidence rather than listing
 * desks, software or room capacities.
 */
const studios = [
  {
    title: "The licence",
    desc: `Permanent community broadcasting service ${ACMA_FACTS.callsign}, licensed to ${ACMA_FACTS.licensee}.`,
    icon: Antenna,
    specs: [
      `${ACMA_FACTS.frequency} · ${ACMA_FACTS.power}`,
      `Commenced ${ACMA_FACTS.licenceCommenced}`,
      `Current to ${ACMA_FACTS.licenceExpiry}`,
    ],
  },
  {
    title: "Live from Shepparton",
    desc: "Volunteer presenters host the weekday desk from the station's Shepparton studios, with an automated overnight mix between shifts.",
    icon: Mic,
    specs: ["Breakfast 6AM–9AM weekdays", "Rotating volunteer roster", "Source: fm985.com.au/guide"],
  },
  {
    title: "Outside broadcast",
    desc: "Match Day Live takes the desk to the ground for GVL football and netball, alongside cricket, bowls and harness racing coverage.",
    icon: Wifi,
    specs: ["GVL match broadcasts", "NIRS AFL rebroadcasts", "2019 SCMA X-Awards finalist"],
  },
  {
    title: "Eight language strands",
    desc: "Africonnect, Arabic, Filipino, Mandarin, Persian, Punjabi, Samoan and Swahili/Congolese programs run alongside ONE Youth.",
    icon: Languages,
    specs: ["Monday–Wednesday evenings", "Volunteer-presented", "Source: Annual Report 2024"],
  },
]

/* ─── Forward pillars — factual station commitments only ─── */
const pillars = [
  {
    title: "Live & Local",
    desc: "Continuing community broadcasting from Shepparton, with local presenters, local news, and local music across the Goulburn Murray.",
    icon: Layers,
  },
  {
    title: "Online Streaming",
    desc: "FM 98.5 plus online streaming via fm985.com.au and Radio.co, so listeners across the Valley and beyond can tune in anywhere.",
    icon: Globe,
  },
  {
    title: "Community Partnership",
    desc: `GVL sports coverage, community notices and emergency broadcasting for ${formatTowns()} inside the ${formatRadius()} broadcast area.`,
    icon: Heart,
  },
]

export default function Story() {
  const [teamFilter, setTeamFilter] = useState("All")

  const filteredTeam = teamFilter === "All"
    ? team
    : team.filter((t) => t.cat === teamFilter)

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  return (
    <Layout>
      <SEO title="Our Story" description="The story of ONE FM 98.5 — from 1989 to today. Callsign 3ONE, ACMA License 1385226/1. Meet the real presenters behind the mic." />
      {/* ═══════ Section 1 — Hero ═══════ */}
      <section ref={heroRef} className="relative min-h-[85dvh] flex items-end overflow-hidden bg-[#071D3A]" data-cursor-label="THE STORY">
        <div aria-hidden className="grain-overlay" />
        <div className="absolute inset-0 z-0">
          <motion.div
            style={{ y: heroImgY, position: 'absolute', top: '-28%', bottom: 0, left: 0, right: 0, willChange: 'transform' }}
          >
            <img
              src="/assets/images/geo-lake-aerial.jpg"
              alt=""
              aria-hidden
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover animate-ken-burns"
              style={{ opacity: 0.60 }}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#071D3A] via-[#071D3A]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071D3A]/55 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-36 pb-40 w-full">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-label text-[10px] tracking-[0.28em] text-gold-gradient uppercase block mb-3"
          >
            Community Radio Since 1989
          </motion.span>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-end gap-[1.5px] mb-5"
            aria-hidden
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-[1.5px] rounded-sm"
                style={{
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.6)) * 12 + 2),
                  backgroundColor: 'rgba(201,162,39,0.35)',
                  animation: `freq-bar ${0.7 + (i % 6) * 0.13}s ${(i * 0.08) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>

          <h1
            className="font-heading font-black leading-none mb-8"
            style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '-0.03em' }}
          >
            <WordReveal text="Our" as="span" className="block text-one-white" delay={0.15} stagger={0.12} />
            <WordReveal text="Story." as="span" className="block text-one-gold" delay={0.4} stagger={0.12} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-body text-one-white/65 max-w-[520px] mb-10 italic leading-relaxed"
          >
            {yearsBroadcastingValue()} years of keeping the Valley connected — through flood, storm, footy finals and everything in between.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex items-center gap-5"
          >
            <span className="font-heading font-bold text-gold-gradient tabular-nums" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>1989</span>
            <div className="flex-1 max-w-24 h-px bg-gradient-to-r from-one-gold/60 to-one-gold/20" />
            <span className="font-heading font-bold text-one-white tabular-nums" style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>2026</span>
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-one-navy to-transparent z-10 pointer-events-none" />
      </section>

      {/* ── Story Marquee Strip ── */}
      <div className="bg-[#04101F] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={25}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">BORN 1989 · CALLSIGN: 3ONE</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">SHEPPARTON · GOULBURN VALLEY</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">{yearsBroadcastingValue()} YEARS ON AIR</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">THROUGH FLOOD · STORM · FOOTY</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">{formatBroadcastPopulation()} PEOPLE IN THE BROADCAST AREA</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{formatCoverageShort().toUpperCase()}</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">COMMUNITY RADIO · NON-PROFIT</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">ACMA LICENSED · 98.5 FM</span>,
          ]}
        />
      </div>

      {/* ═══════ Section 2 — Station Info ═══════ */}
      <section className="section-padding section-bleed-top px-4 sm:px-6 max-w-7xl mx-auto bg-surface-lift" data-cursor-label="STATION INFO">
        <TiltCard maxTilt={3} className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="glass-card p-8 group relative overflow-hidden"
        >
          <div aria-hidden className="explore-tile-scan" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-micro text-one-muted mb-1">Callsign</div>
              <div className="font-stat text-gold-gradient text-2xl">3ONE</div>
            </div>
            <div>
              <div className="font-micro text-one-muted mb-1">Frequency</div>
              <div className="font-stat text-gold-gradient text-2xl">98.5 FM</div>
            </div>
            <div>
              <div className="font-micro text-one-muted mb-1">ACMA License</div>
              <div className="font-stat text-gold-gradient text-2xl">1385226/1</div>
            </div>
            <div>
              <div className="font-micro text-one-muted mb-1">Organisation</div>
              <div className="font-label text-one-white text-sm">Goulburn Valley Community Radio Inc.</div>
              <div className="font-micro text-one-gold mt-1">APRA AMCOS Licensed</div>
            </div>
          </div>
        </motion.div>
        </TiltCard>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <WordReveal text="Our Heritage" className="font-h2 text-one-white mb-3 block" as="h2" />
          <p className="font-body text-one-white max-w-2xl mx-auto">
            Late-1970s organising, a 1980 association, and a licensed service on air from April 1989.
          </p>
          <p className="font-body-small text-muted max-w-2xl mx-auto mt-3">
            Every entry below is drawn from the ACMA community licence register, ONE FM's Annual
            Report 2024, Greater Shepparton council records, and the Shepparton News retrospective.
          </p>
        </motion.div>

        <div className="relative">
          {/* centre line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border-dark md:-translate-x-px" />

          {milestones.map((m, i) => {
            const isLeft = i % 2 === 0
            const Icon = m.icon
            return (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className={`relative flex items-start gap-6 md:gap-0 mb-16 last:mb-0 ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* timeline node */}
                <div className="absolute left-4 md:left-1/2 top-0 w-3 h-3 rounded-full bg-one-gold border-4 border-one-navy md:-translate-x-[5px] z-10" />

                {/* content card */}
                <div className={`pl-10 md:pl-0 md:w-1/2 ${isLeft ? "md:pr-12" : "md:pl-12"}`}>
                  <TiltCard maxTilt={4}>
                  <div className="glass-card p-6 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-one-gold/10 flex items-center justify-center">
                        <Icon size={18} className="text-one-gold" />
                      </div>
                      <span className="font-stat text-gold-gradient">{m.year}</span>
                    </div>
                    <h3 className="font-h3 text-one-white mb-2">{m.title}</h3>
                    <p className="font-body-small text-one-white mb-4">{m.desc}</p>
                    <div className="relative rounded-lg overflow-hidden border border-one-border aspect-video">
                      <img
                        src={m.img}
                        alt={m.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        loading="lazy"
                      />
                      <div aria-hidden className="explore-tile-scan" />
                    </div>
                  </div>
                  </TiltCard>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ═══════ Section 3 — The Team ═══════ */}
      <section className="section-padding section-bleed-top px-4 sm:px-6 max-w-7xl mx-auto bg-surface-deep" data-cursor-label="MEET THE TEAM">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <WordReveal text="Meet the Voices of the Valley" className="font-h2 text-one-white mb-3 block" as="h2" />
            <p className="font-body text-one-white max-w-xl">
              Our team is a mix of lifelong locals and passionate broadcasters who found their home at ONE FM.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {teamCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setTeamFilter(c)}
                className={`font-label text-xs px-4 py-2 rounded-full border transition-all duration-200 ${
                  teamFilter === c
                    ? "bg-one-gold text-one-navy border-one-gold"
                    : "bg-transparent text-one-white border-ivory/30 hover:border-ivory hover:bg-ivory/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTeam.map((member, i) => (
            <TiltCard key={member.name} maxTilt={6} className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              data-cursor-label="PRESENTER"
              className="glass-card overflow-hidden group h-full"
            >
              {(() => {
                const av = getTeamAvatar(member.name)
                return (
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${av.from} 0%, ${av.to} 100%)` }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="font-heading font-black select-none"
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', color: av.accent, opacity: 0.9, letterSpacing: '-0.04em' }}
                      >
                        {av.initials}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-one-navy/75 via-transparent to-transparent" />
                    <div aria-hidden className="explore-tile-scan" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="font-label text-[10px] px-2 py-0.5 rounded bg-one-gold text-one-navy mb-2 inline-block">
                        {member.cat}
                      </span>
                      <h4 className="font-h4 text-one-white">{member.name}</h4>
                      <p className="font-body-small text-one-muted">{member.role}</p>
                    </div>
                  </div>
                )
              })()}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={12} className="text-muted" />
                  <span className="font-label text-muted">
                    {member.years
                      ? /^\d{4}$/.test(member.years)
                        ? `On air since ${member.years}`
                        : `${member.years} years at ONE FM`
                      : 'Presenter at ONE FM'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Quote size={14} className="text-one-gold/50 shrink-0 mt-1" />
                  <p className="font-body-small text-one-white italic">{member.quote}</p>
                </div>
              </div>
            </motion.div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ═══════ Section 4 — Studio & Facilities ═══════ */}
      <section className="section-padding section-bleed-top px-4 sm:px-6 max-w-7xl mx-auto bg-surface-lift" data-cursor-label="THE STUDIO">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-12"
        >
          <WordReveal text="Behind the Scenes" className="font-h2 text-one-white mb-3 block" as="h2" />
          <p className="font-body text-one-white max-w-xl">
            What the licence covers, where the desk sits, and what goes out over it.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden border border-one-border aspect-video lg:aspect-auto lg:min-h-[400px] relative group"
          >
            <img
              src="/assets/images/studio-presenter-mic.jpg"
              alt="ONE FM presenter on air"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-one-navy/80 via-transparent to-transparent" />
            <div aria-hidden className="explore-tile-scan" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-h3 text-one-white mb-1">Live On Air</h3>
              <p className="font-body-small text-one-white">Where the magic happens, every single day.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studios.map((studio, i) => {
              const Icon = studio.icon
              return (
                <TiltCard key={studio.title} maxTilt={5}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="glass-card p-5 flex flex-col gap-3 group relative overflow-hidden"
                >
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="w-10 h-10 rounded-full bg-one-gold/10 flex items-center justify-center">
                    <Icon size={18} className="text-one-gold" />
                  </div>
                  <h4 className="font-h4 text-one-white">{studio.title}</h4>
                  <p className="font-body-small text-one-white flex-1">{studio.desc}</p>
                  <ul className="space-y-1 pt-2 border-t border-one-border">
                    {studio.specs.map((s) => (
                      <li key={s} className="font-body-small text-muted flex items-center gap-2">
                        <ChevronRight size={10} className="text-one-gold" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════ Section 5 — Community Impact ═══════ */}
      <section className="section-padding section-bleed-top px-4 sm:px-6 max-w-7xl mx-auto bg-surface-warm" data-cursor-label="COMMUNITY IMPACT">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <WordReveal text="Community Impact" className="font-h2 text-one-white mb-6 block" as="h2" />
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="font-stat text-gold-gradient"><AnimatedNumber value={coverageNumbers.yearsBroadcasting} suffix="" /></p>
                <p className="font-label text-muted mt-1">Years On Air</p>
              </div>
              <div>
                <p className="font-stat text-gold-gradient"><AnimatedNumber value={29} suffix="" /></p>
                <p className="font-label text-muted mt-1">Life Members</p>
              </div>
              <div>
                <p className="font-stat text-gold-gradient">{ACMA_FACTS.power}</p>
                <p className="font-label text-muted mt-1">Licensed Signal Power</p>
              </div>
              <div>
                <p className="font-stat text-gold-gradient"><AnimatedNumber value={townsCount()} suffix="" /></p>
                <p className="font-label text-muted mt-1">Towns Across the Valley</p>
              </div>
            </div>
            <p className="font-body-small text-muted mb-8">
              {LIFE_MEMBER_NOTE} Signal power and licence details from the ACMA community licence register.
            </p>
            <TiltCard maxTilt={4}>
            <div className="glass-card p-6 border-l-4 border-l-one-gold">
              <Quote size={24} className="text-one-gold/40 mb-3" />
              <p className="font-body text-one-white italic mb-4">
                {EMERGENCY_BROADCAST_NARRATIVE[3]}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-one-gold/20 flex items-center justify-center">
                  <Users size={16} className="text-one-gold" />
                </div>
              <div>
                <p className="font-body-small text-one-white font-medium">ONE FM emergency broadcast record</p>
                <p className="font-body-small text-muted">
                  Verified station account — we publish listener quotes only once they are on the record.
                </p>
              </div>
              </div>
            </div>
            </TiltCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden border border-one-border aspect-[4/3] relative"
          >
            <img
              src="/assets/images/community-book-stall.jpg"
              alt="ONE FM community event"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-one-navy/60 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ═══════ Section 6 — Looking Forward ═══════ */}
      <section className="section-padding section-bleed-top px-4 sm:px-6 max-w-7xl mx-auto pb-32 bg-surface-glow" data-cursor-label="LOOKING AHEAD">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <WordReveal text="Looking Forward" className="font-h2 text-one-white mb-3 block" as="h2" />
          <p className="font-body text-one-white max-w-2xl mx-auto">
            The next chapter of ONE FM blends our heritage values with tomorrow's technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <TiltCard key={pillar.title} maxTilt={4} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  data-cursor-label={pillar.title.toUpperCase()}
                  className="glass-card p-8 flex flex-col items-center text-center gap-5 group h-full relative overflow-hidden"
                >
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="w-16 h-16 rounded-full bg-one-gold/10 flex items-center justify-center group-hover:bg-one-gold/20 transition-colors duration-300">
                    <Icon size={28} className="text-one-gold" />
                  </div>
                  <div>
                    <h3 className="font-h3 text-one-white group-hover:text-one-gold transition-colors duration-200">
                      {pillar.title}
                    </h3>
                    <p className="font-body-small text-one-white mt-3">{pillar.desc}</p>
                  </div>
                </motion.div>
              </TiltCard>
            )
          })}
        </div>
      </section>

      <LatestInterviews />
    </Layout>
  )
}

