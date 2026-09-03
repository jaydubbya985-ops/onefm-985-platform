import { useState, memo, useRef } from 'react'
import { TiltCard } from '@/components/TiltCard'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { WordReveal } from '@/components/WordReveal'
import { MagneticButton } from '@/components/MagneticButton'
import { Marquee } from '@/components/Marquee'
import { PageJobsBar, type PageJob } from '@/components/PageJobsBar'
import { WeeklySchedule } from '@/components/WeeklySchedule'
import { BRAND } from '@/lib/brand'
import { formatTowns } from '@/lib/coverageCopy'
import { HOST_PHOTOS } from '@/lib/stationPhotos'
import { presenterVisual, programScene } from '@/lib/presenterAssets'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  BREAKFAST_SHOW,
  getBreakfastScheduleLabel,
  getCurrentLiveShow,
} from '@/data/programGuide'
import { formatGuideHours, formatHostHours } from '@/lib/guideHours'
import { formatWithPresenter } from '@/lib/liveNow'
import { InterviewOnDemand } from '@/components/InterviewOnDemand'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import {
  Mic2,
  Clock,
  Music,
  Headphones,
  Send,
  CheckCircle2,
  Filter,
  Trophy,
  Play,
  Headset,
  ChevronRight,
  Wifi,
  MapPin,
  Radio,
} from 'lucide-react'

const PAGE_JOBS: PageJob[] = [
  { label: 'Listen Live', path: '/listen', description: BREAKFAST_SHOW, icon: Headphones, accent: '#E51636' },
  { label: 'Broadcast Grid', path: '/broadcast', description: 'Visual schedule', icon: Radio, accent: '#F2F2F2' },
  { label: 'Coverage Map', path: '/coverage', description: formatTowns(), icon: MapPin, accent: '#1B458F' },
  { label: 'GVL Football', path: '/football', description: 'Season sponsorship', icon: Trophy, accent: '#B6FF00' },
]

/* ────────────────────────────────────────────────────────── */
/*  RadioWaveBackground — isolated perpetual animation        */
/* ────────────────────────────────────────────────────────── */
// Deterministic pseudo-random heights/durations — fixed on load, no mount jitter
const WAVE_BARS = Array.from({ length: 40 }, (_, i) => ({
  height: 20 + ((i * 37 + 13) % 61),
  duration: 0.8 + ((i * 17 + 7) % 13) / 20,
}))

const RadioWaveBackground = memo(function RadioWaveBackground() {
  return (
    <div aria-hidden className="absolute inset-0 flex items-end justify-center gap-1 opacity-20 pointer-events-none overflow-hidden pb-12">
      {WAVE_BARS.map((bar, i) => (
        <div
          key={i}
          className="w-1.5 bg-gradient-to-t from-one-gold to-one-electric rounded-full animate-waveform motion-reduce:animate-none"
          style={{
            height: `${bar.height}%`,
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${bar.duration}s`,
          }}
        />
      ))}
    </div>
  )
})

/* ────────────────────────────────────────────────────────── */
/*  Mini waveform — 8 bars, on-hover reveal, category color   */
/* ────────────────────────────────────────────────────────── */
function MiniWaveform({ color, seed }: { color: string; seed: number }) {
  const bars = Array.from({ length: 8 }, (_, j) => ({
    h: 20 + (seed * 13 + j * 19 + 7) % 60,
    dur: (0.65 + ((seed * 7 + j * 11) % 9) * 0.07).toFixed(2),
    del: (j * 0.09).toFixed(2),
  }))
  return (
    <div aria-hidden className="flex items-end gap-[3px] h-5 opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none">
      {bars.map((bar, j) => (
        <div
          key={j}
          className="w-1 rounded-full animate-waveform motion-reduce:animate-none"
          style={{ backgroundColor: color, height: `${bar.h}%`, animationDuration: `${bar.dur}s`, animationDelay: `${bar.del}s` }}
        />
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  ON AIR NOW indicator                                      */
/* ────────────────────────────────────────────────────────── */
function OnAirNow() {
  const live = getCurrentLiveShow()
  const withHost = formatWithPresenter(live.host)

  return (
    <TiltCard maxTilt={4} className="max-w-md">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="glass-card px-6 py-4 flex items-center gap-4"
    >
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-one-red" />
      </span>
      <div className="text-left">
        <p className="font-label text-one-red mb-0.5">ON AIR NOW</p>
        <p className="font-h4 text-one-white">{live.name}</p>
        <p className="font-body-small text-muted">{withHost ? `${withHost} · ` : ''}{live.time}{live.remainingLabel ? ` · ${live.remainingLabel}` : ''}</p>
      </div>
      <Wifi size={20} className="text-one-gold ml-auto shrink-0" />
    </motion.div>
    </TiltCard>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  Section 2 — Featured Shows                                */
/* ────────────────────────────────────────────────────────── */
// Copy from fm985.com.au/guide/. Times resolved from FULL_SCHEDULE
// via formatGuideHours — do not keep a second handwritten hours list.
const shows = [
  {
    name: BREAKFAST_SHOW,
    time: "Mon–Fri, 6am–9am",
    host: getBreakfastScheduleLabel(),
    desc: "The Goulburn Valley's essential morning companion — community interviews, local news, weather, and music. Rotating hosts across the week.",
    tag: "Breakfast",
    icon: Mic2,
  },
  {
    name: "Dancing through the decades",
    time: "Mon–Fri, 9am–12pm",
    host: "Johnny P (John Painter)",
    desc: "Music from across the decades with Johnny P. Four years on air, playing the hits that span generations from Shepparton.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "The James Manley Show",
    time: "Mon–Tue, 4pm–5pm",
    host: "James Manley",
    desc: "Community-focused afternoon programming. Local interviews and the issues that matter to the Goulburn Murray.",
    tag: "Community",
    icon: Headphones,
  },
  {
    name: "The Afri-Connect Program",
    time: "Monday, 9pm–10pm",
    host: "Fikiri",
    desc: "Swahili language program connecting the African community across the Goulburn Valley. Music, news and culture.",
    tag: "Multicultural",
    icon: Headset,
  },
  {
    name: "Good Evening Country",
    time: "Monday, 8pm",
    host: "Timmy Ahmet",
    desc: "Country music showcase Monday evenings. The best country classics and new releases for the Valley.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "Classic Country",
    time: "Tuesday, 6pm",
    host: "Sue",
    desc: "Classic country music Tuesday evenings with Sue. The timeless sounds of country from across the decades.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "Viva Italia",
    time: "Tuesday, 9pm–10pm",
    host: "Carlo",
    desc: "Italian language program celebrating Italian culture, music and community life in the Goulburn Valley.",
    tag: "Multicultural",
    icon: Headset,
  },
  {
    name: "Winding Back",
    time: "Monday, 3pm–4pm",
    host: "Ken & Jill Gaffney",
    desc: "Nostalgic music and community memories with Ken and Jill Gaffney — a journey through the musical decades.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "NIRS AFL Friday Night Footy",
    time: "Friday, 7pm",
    host: "ONE FM",
    desc: "Live AFL coverage on Friday nights via NIRS — the national Indigenous radio sport network.",
    tag: "Sport",
    icon: Trophy,
  },
  {
    name: "Saturday Sport",
    time: "Saturday, 8am–12pm",
    host: "The Stats Man",
    desc: "Comprehensive local sports coverage — GVL Football & Netball, cricket, harness racing and community sport.",
    tag: "Sport",
    icon: Trophy,
  },
  {
    name: "GVL Match of the Day",
    time: "Saturday, 1pm–3pm",
    host: "ONE FM",
    desc: "Live GVL Football & Netball match of the day — full commentary from grounds across the Goulburn Valley.",
    tag: "Sport",
    icon: Trophy,
  },
  {
    name: "Planet of Sound",
    time: "Thursday, 11pm",
    host: "Carlos Rock",
    desc: "Rock music program — 19–20 years on air and still the definitive rock show for the Goulburn Valley.",
    tag: "Music",
    icon: Headset,
  },
  {
    name: "Samoan Music Program",
    time: "Wednesday, 9pm–10pm",
    host: "MK",
    desc: "Samoan language music and culture program connecting the Samoan community of the Goulburn Valley.",
    tag: "Multicultural",
    icon: Headset,
  },
  {
    name: "Filipino Music Program",
    time: "Tuesday, 10pm–11pm",
    host: "Edith",
    desc: "Filipino music and culture celebrating the Filipino community across the Goulburn Murray.",
    tag: "Multicultural",
    icon: Headset,
  },
  {
    name: "Mandarin Program",
    time: "Monday, 10pm",
    host: "Jimmy & Rainy",
    desc: "Mandarin language program and Her Quiet Strength segment — connecting the Chinese community of the Valley.",
    tag: "Multicultural",
    icon: Headset,
  },
  {
    name: "Sunday Night Country",
    time: "Sunday, 7pm",
    host: "Sue",
    desc: "Sunday evening country music with Sue — the perfect close to the weekend for country music lovers.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "NIRS Sunday Afternoon AFL",
    time: "Sunday, 1pm–3pm",
    host: "ONE FM",
    desc: "AFL Match of the Day via NIRS — live Sunday afternoon football coverage for the region.",
    tag: "Sport",
    icon: Trophy,
  },
  {
    name: "Songs of the Spirit",
    time: "Saturday, 6am–8am",
    host: "ONE FM",
    desc: "Uplifting Christian and inspirational music Saturday mornings — for community and reflection.",
    tag: "Community",
    icon: Headset,
  },
  {
    name: "Radio Netherlands",
    time: "Monday, 7pm–8pm",
    host: "Margaret & Josh",
    desc: "Dutch-language international community program with Margaret and Josh.",
    tag: "Multicultural",
    icon: Headset,
  },
  {
    name: "Monday Nights",
    time: "Monday, 6pm–7pm",
    host: "Josh Revens",
    desc: "Evening community program with Josh Revens — local interviews, community news and stories.",
    tag: "Community",
    icon: Headphones,
  },
  {
    name: "Punjabi Music Program",
    time: "Monday, 11pm",
    host: "ONE FM",
    desc: "Punjabi language music program celebrating the Punjabi community of the Goulburn Valley.",
    tag: "Multicultural",
    icon: Headset,
  },
  {
    name: "Arabic Music Program",
    time: "Wednesday, 11pm",
    host: "ONE FM",
    desc: "Arabic language music program for the Arabic-speaking community of the Goulburn Murray.",
    tag: "Multicultural",
    icon: Headset,
  },
  {
    name: "Rock 'n' Roll Fever",
    time: "Thursday, 9pm",
    host: "Carlo",
    desc: "Rock 'n' Roll classics Thursday nights with Carlo — the sounds that defined a generation.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "The Essential Hits",
    time: "Thu 6pm / Sun 12pm",
    host: "Tim Symonds",
    desc: "The essential hits from across the decades — Thursday evenings and Sunday afternoons with Tim Symonds.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "Country Requests & Open Spaces",
    time: "Saturday, 8am",
    host: "KT or Ralph",
    desc: "Country music by request on Saturday mornings — your favourite country tracks from across the decades.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "All Things Rock",
    time: "Wed–Thu, 3pm",
    host: "Steve Little",
    desc: "Rock music Wednesday and Thursday afternoons with Steve Little — the best of rock from all eras.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "Butterfly Favorites",
    time: "Tuesday, 3pm",
    host: "Judy",
    desc: "Tuesday afternoon favourites with Judy — music and community from the heart of the Valley.",
    tag: "Music",
    icon: Music,
  },
].map((show) => ({
  ...show,
  time: formatGuideHours(show.name) ?? show.time,
}))

/* ────────────────────────────────────────────────────────── */
/*  Section 3 — Host Roster                                   */
/* ────────────────────────────────────────────────────────── */
// Names from fm985.com.au/guide/. Times resolved from FULL_SCHEDULE
// via formatHostHours — Ralph's Friday Arvo is 3–4pm, not 3–6pm.
const hosts = [
  { name: "Tim Ahemt",        show: BREAKFAST_SHOW,             time: "Mon & Tue, 6am–9am",   type: "Breakfast",    social: { fb: true } },
  { name: "The Big G",        show: BREAKFAST_SHOW + " / Wed Mornings", time: "Wed, 6am–12pm", type: "Breakfast",   social: { fb: true } },
  { name: "Ralph Whitehead",  show: "Thu Mornings / Friday Arvo", time: "Thu 9am–12pm · Fri 3pm–6pm", type: "Breakfast", social: { fb: true } },
  { name: "Josh Revens",      show: "Fri Mornings / Mon Nights",  time: "Fri 9am–12pm · Mon 6pm", type: "Breakfast", social: { fb: true } },
  { name: "John Painter (Johnny P)", show: "Dancing through the decades", time: "Mon–Fri, 9am–12pm", type: "Music",  social: { fb: true } },
  { name: "Di Hunter",        show: "Monday Afternoon",          time: "Monday, 12pm–3pm",      type: "Music",       social: { fb: true } },
  { name: "Craig Stott",      show: "Tuesday Mornings",          time: "Tuesday, 9am–12pm",     type: "Music",       social: { fb: true } },
  { name: "James Manley",     show: "The James Manley Show",     time: "Mon–Tue, 4pm–5pm",      type: "Community",   social: { fb: true } },
  { name: "Tim Symonds",      show: "The Essential Hits",        time: "Thu 6pm / Sun 12pm",    type: "Music",       social: { fb: true } },
  { name: "Tym Jeffery",      show: "The Show for Everyone",     time: "Friday, 6pm–7pm",       type: "Community",   social: { fb: true } },
  { name: "Carlos Rock",      show: "Planet of Sound",           time: "Thu & Fri, 11pm",       type: "Music",       social: { fb: true } },
  { name: "Timmy Ahmet",      show: "Good Evening Country",      time: "Monday, 8pm",           type: "Country",     social: { fb: true } },
  { name: "Sue",              show: "Classic Country / Sunday Night Country", time: "Tue 6pm / Sun 7pm", type: "Country", social: { fb: true } },
  { name: "Carlo",            show: "Viva Italia / Rock 'n' Roll Fever", time: "Tue 9pm / Thu 9pm", type: "Music",   social: { fb: true } },
  { name: "Ken & Jill Gaffney", show: "Winding Back",           time: "Monday, 3pm–4pm",        type: "Music",       social: { fb: true } },
  { name: "Judy",             show: "Butterfly Favorites",       time: "Tuesday, 3pm",          type: "Music",       social: { fb: true } },
  { name: "Steve Little",     show: "All Things Rock",           time: "Wed–Thu, 3pm",          type: "Music",       social: { fb: true } },
  { name: "KT or Ralph",      show: "Country Requests & Open Spaces", time: "Saturday, 8am",    type: "Country",     social: { fb: true } },
  { name: "Les 'Harro' Harrison", show: "Rockin with Les Harrison", time: "Wednesday, 6pm",     type: "Community",   social: { fb: true } },
  { name: "Margaret & Josh",  show: "Radio Netherlands",        time: "Monday, 7pm",            type: "Multicultural", social: { fb: true } },
  { name: "Fikiri",           show: "The Afri-Connect Program (Swahili)", time: "Monday, 9pm–10pm", type: "Multicultural", social: { fb: true } },
  { name: "MK",               show: "Samoan Music Program",      time: "Wednesday, 9pm–10pm",   type: "Multicultural", social: { fb: true } },
  { name: "Edith",            show: "Filipino Music Program",    time: "Tuesday, 10pm–11pm",    type: "Multicultural", social: { fb: true } },
  { name: "Jimmy & Rainy",    show: "Mandarin Program",          time: "Monday, 10pm",          type: "Multicultural", social: { fb: true } },
].map((host) => ({
  ...host,
  time: formatHostHours(host.name) ?? host.time,
}))

const showFilters = ['All', 'Breakfast', 'Music', 'Country', 'Sport', 'Community', 'Multicultural']

const hostFilters = ["All", "Breakfast", "Sport", "Music", "Country", "Community", "Multicultural"]

const CATEGORY_COLORS: Record<string, string> = {
  Breakfast: '#F2F2F2',
  Music: '#9B5DE5',
  Country: '#F2F2F2',
  Community: '#B6FF00',
  Sport: '#E51636',
  Multicultural: '#FF6B6B',
}

/* Deterministic gradient avatar for host cards */
const HOST_PALETTES = [
  { from: '#1B458F', to: '#101010', accent: '#F2F2F2' },
  { from: '#F2F2F2', to: '#1B3A6F', accent: '#FFF8DC' },
  { from: '#E51636', to: '#1A0A20', accent: '#FF9BAA' },
  { from: '#B6FF00', to: '#0A2030', accent: '#7FFFD4' },
  { from: '#9B5DE5', to: '#1A0A30', accent: '#DDB3FF' },
  { from: '#FF6B6B', to: '#2A0A10', accent: '#FFB3B3' },
  { from: '#1B458F', to: '#0D2A18', accent: '#6EE7B7' },
]

function getHostAvatar(name: string): { from: string; to: string; accent: string; initials: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 37 + name.charCodeAt(i)) >>> 0
  const palette = HOST_PALETTES[hash % HOST_PALETTES.length]
  const words = name.trim().replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean)
  const initials = words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[words.length - 1][0]).toUpperCase()
  return { ...palette, initials }
}

/* GVL — link to football page; live fixtures vary by season */
const gvlSportBlocks = [
  {
    title: 'Saturday Sport',
    time: 'Sat 8am–12pm',
    desc: 'GVL Football & Netball, cricket, bowls, tennis and harness racing with The Stats Man.',
  },
  {
    title: 'GVL Match of the Day',
    time: 'Sat 1pm–3pm',
    desc: 'Live match commentary from grounds across the Goulburn Valley.',
  },
  {
    title: 'NIRS Friday Night Footy',
    time: 'Fri 7pm–10pm',
    desc: 'AFL coverage via the National Indigenous Radio Service network.',
  },
].map((block) => ({
  ...block,
  time: formatGuideHours(block.title) ?? block.time,
}))

/* ────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                 */
/* ────────────────────────────────────────────────────────── */
const SHOWS_INITIAL = 9
const HOSTS_INITIAL = 8

export default function Programs() {
  const [showFilter, setShowFilter] = useState('All')
  const [hostFilter, setHostFilter] = useState("All")
  const [showAllShows, setShowAllShows] = useState(false)
  const [showAllHosts, setShowAllHosts] = useState(false)
  const [requestName, setRequestName] = useState("")
  const [requestSong, setRequestSong] = useState("")
  const [requestMsg, setRequestMsg] = useState("")
  const [requestDraftOpened, setRequestDraftOpened] = useState(false)

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  const filteredShows = showFilter === 'All'
    ? shows
    : shows.filter((s) => s.tag === showFilter)

  const visibleShows = showAllShows ? filteredShows : filteredShows.slice(0, SHOWS_INITIAL)

  const filteredHosts = hostFilter === "All"
    ? hosts
    : hosts.filter((h) => h.type === hostFilter)

  const visibleHosts = showAllHosts ? filteredHosts : filteredHosts.slice(0, HOSTS_INITIAL)

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestName || !requestSong) return
    const body = encodeURIComponent(
      `Song request from ${requestName}\n\nSong: ${requestSong}\n\nMessage: ${requestMsg || '(none)'}`,
    )
    window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent('ONE FM Song Request')}&body=${body}`
    setRequestDraftOpened(true)
    setTimeout(() => {
      setRequestDraftOpened(false)
    }, 4000)
  }

  return (
    <Layout>
      <SEO title="Programs & Shows" description="ONE FM Breakfast, Dancing through the decades, The James Manley Show, GVL sport, multicultural programs, and more. Full guide from fm985.com.au." />
      {/* ═══════ Section 1 — Hero ═══════ */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-end overflow-hidden bg-[#101010]" data-cursor-label="ON AIR NOW">
        <div className="absolute inset-0 z-0">
          <motion.div
            style={{ y: heroImgY, position: 'absolute', top: '-28%', bottom: 0, left: 0, right: 0, willChange: 'transform' }}
          >
            {/* Presenter (the actual subject) sits in the left third of the
                source photo -- default center-crop shows the studio monitor
                behind him instead. Bias left. */}
            <img
              src={HOST_PHOTOS.studioControlRoom}
              alt=""
              aria-hidden
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover object-left"
              style={{ opacity: 0.55 }}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/60 via-transparent to-transparent" />
        </div>
        <div aria-hidden className="grain-overlay" />
        <RadioWaveBackground />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 pb-40">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-label text-[10px] tracking-[0.28em] text-gold-gradient uppercase block mb-3"
          >
            On Air · Shepparton · Victoria · 98.5 FM
          </motion.span>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex items-end gap-[1.5px] mb-5"
            aria-hidden
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-[1.5px] rounded-sm"
                style={{
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.61 + 0.4)) * 12 + 2),
                  backgroundColor: 'rgba(201,162,39,0.35)',
                  animation: `freq-bar ${0.7 + (i % 6) * 0.13}s ${(i * 0.086) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>

          <h1
            className="font-heading font-black leading-none mb-8"
            style={{ fontSize: 'clamp(3.2rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
          >
            <WordReveal text="Programs" as="span" className="block text-one-white" delay={0.15} stagger={0.12} />
            <WordReveal text="& Shows." as="span" className="block text-one-gold" delay={0.4} stagger={0.12} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-body text-one-white/50 max-w-xl mb-8 italic"
          >
            Local voices, local stories, local music — 24/7.
          </motion.p>

          <OnAirNow />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-wrap gap-3 mt-8"
          >
            <MagneticButton strength={10} cursorLabel="LISTEN">
              <Link to="/listen" className="btn-primary text-sm inline-flex items-center gap-2">
                <Play size={16} />
                Listen Live
              </Link>
            </MagneticButton>
            <MagneticButton strength={6} cursorLabel="EXPLORE">
              <Link to="/broadcast" className="btn-secondary text-sm">
                Broadcast Explorer
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="py-4 bg-[#101010] border-y border-one-gold/10 overflow-hidden">
        <Marquee
          speed={36}
          items={[
            <span className="mx-12 font-label text-[10px] tracking-[0.25em] uppercase text-one-gold/60">Breakfast Show · Mon–Fri 6am</span>,
            <span className="mx-12 font-label text-[10px] tracking-[0.25em] uppercase text-one-white/35">Dancing Through the Decades</span>,
            <span className="mx-12 font-label text-[10px] tracking-[0.25em] uppercase text-one-gold/60">GVL Football Coverage</span>,
            <span className="mx-12 font-label text-[10px] tracking-[0.25em] uppercase text-one-white/35">Multicultural Broadcasting</span>,
            <span className="mx-12 font-label text-[10px] tracking-[0.25em] uppercase text-one-gold/60">24/7 · 98.5 FM · Shepparton</span>,
            <span className="mx-12 font-label text-[10px] tracking-[0.25em] uppercase text-one-white/35">The James Manley Show</span>,
          ]}
        />
      </div>

      <PageJobsBar jobs={PAGE_JOBS} className="-mt-0 pb-8 relative z-20" />

      {/* Weekly guide from fm985.com.au */}
      <section className="section-padding bg-surface-mid border-b border-one-border/40" data-cursor-label="WEEK'S GUIDE">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <WordReveal text="This Week's Guide" className="font-h2 text-one-white mb-2 block" as="h2" />
          <p className="font-body text-muted max-w-2xl">
            Full schedule sourced from fm985.com.au — select a day to see what&apos;s on.
          </p>
        </motion.div>
        <WeeklySchedule />
        </div>
      </section>

      {/* Featured Shows */}
      <section className="section-padding section-bleed-top bg-surface-lift" data-cursor-label="EXPLORE SHOWS">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <WordReveal text="Featured Shows" className="font-h2 text-one-white mb-3 block" as="h2" />
              <p className="font-body text-one-white max-w-xl">
                From dawn till dark, our presenters keep the Valley informed, entertained and connected.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {showFilters.map((f) => {
                const color = CATEGORY_COLORS[f]
                const active = showFilter === f
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setShowFilter(f); setShowAllShows(false) }}
                    data-cursor-label={f.toUpperCase()}
                    className="font-label text-xs px-4 py-2 rounded-full border transition-all"
                    style={active && color
                      ? { backgroundColor: color, color: '#070707', borderColor: color }
                      : active
                        ? { backgroundColor: '#F2F2F2', color: '#070707', borderColor: '#F2F2F2' }
                        : { backgroundColor: 'transparent', color: 'white', borderColor: 'rgba(244,241,234,0.3)' }
                    }
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleShows.map((show, i) => (
            <TiltCard key={show.name} maxTilt={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: (i % SHOWS_INITIAL) * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                data-cursor-label={show.tag.toUpperCase()}
                className="glass-card p-6 flex flex-col gap-4 group cursor-pointer relative overflow-hidden h-full"
              >
                {/* Category accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-l"
                  style={{ width: '3px', backgroundColor: CATEGORY_COLORS[show.tag] ?? '#B6FF00' }}
                />
                <div className="relative -mx-6 -mt-6 aspect-[16/9] overflow-hidden">
                  <img
                    src={programScene(show.name)}
                    alt={`ONE FM ${show.tag.toLowerCase()} photography — ${show.name}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-one-navy via-transparent to-transparent" />
                </div>
                <div aria-hidden className="explore-tile-scan" />
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${CATEGORY_COLORS[show.tag] ?? '#B6FF00'}18` }}
                  >
                    <show.icon size={22} style={{ color: CATEGORY_COLORS[show.tag] ?? '#B6FF00' }} />
                  </div>
                  <span
                    className="font-label text-xs px-3 py-1 rounded-full border"
                    style={{
                      color: CATEGORY_COLORS[show.tag] ?? '#B6FF00',
                      backgroundColor: `${CATEGORY_COLORS[show.tag] ?? '#B6FF00'}18`,
                      borderColor: `${CATEGORY_COLORS[show.tag] ?? '#B6FF00'}30`,
                    }}
                  >
                    {show.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-h3 text-one-white group-hover:text-one-gold transition-colors duration-200">
                    {show.name}
                  </h3>
                  <p className="font-label text-muted mt-1 flex items-center gap-2">
                    <Clock size={12} />
                    {show.time}
                  </p>
                </div>
                <p className="font-body-small text-one-white flex-1">{show.desc}</p>
                <div className="pt-4 border-t border-one-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mic2 size={14} className="text-muted" />
                    <span className="font-body-small text-muted">{show.host}</span>
                  </div>
                  <MiniWaveform color={CATEGORY_COLORS[show.tag] ?? '#B6FF00'} seed={i} />
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>

        {filteredShows.length > SHOWS_INITIAL && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 flex justify-center"
          >
            <button
              type="button"
              onClick={() => setShowAllShows(v => !v)}
              data-cursor-label={showAllShows ? 'COLLAPSE' : 'EXPAND'}
              className="font-label text-xs px-8 py-3 rounded-full border border-one-gold/30 text-one-gold hover:bg-one-gold/10 transition-all flex items-center gap-2"
            >
              {showAllShows ? 'Show fewer shows' : `View all ${filteredShows.length} shows`}
              <ChevronRight size={14} className={`transition-transform ${showAllShows ? 'rotate-90' : ''}`} />
            </button>
          </motion.div>
        )}
        </div>
      </section>

      {/* ═══════ Section 3 — Host Roster ═══════ */}
      <section className="section-padding section-bleed-top bg-surface-deep" data-cursor-label="HOST ROSTER">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <WordReveal text="Host Roster" className="font-h2 text-one-white mb-3 block" as="h2" />
            <p className="font-body text-one-white max-w-xl">
              Meet the voices behind the mic. {hosts.length} presenters from the fm985.com.au program guide.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hostFilters.map((f) => {
              const color = CATEGORY_COLORS[f]
              const active = hostFilter === f
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => { setHostFilter(f); setShowAllHosts(false) }}
                  data-cursor-label={f.toUpperCase()}
                  className="font-label text-xs px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-2"
                  style={active && color
                    ? { backgroundColor: color, color: '#070707', borderColor: color }
                    : active
                      ? { backgroundColor: '#F2F2F2', color: '#070707', borderColor: '#F2F2F2' }
                      : { backgroundColor: 'transparent', color: 'white', borderColor: 'rgba(244,241,234,0.3)' }
                  }
                >
                  {f === "All" && <Filter size={12} />}
                  {f}
                </button>
              )
            })}
          </div>
        </motion.div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {visibleHosts.map((host, hi) => (
              <motion.div
                key={host.name + host.show}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
              <TiltCard maxTilt={7} className="h-full">
              <div className="glass-card p-5 group h-full" data-cursor-label="PRESENTER">
                {(() => {
                  const avatar = getHostAvatar(host.name)
                  const visual = presenterVisual(host.name, host.type, hi)
                  return (
                    <div className="relative mb-4 overflow-hidden rounded-lg aspect-[4/5] group-hover:scale-[1.02] transition-transform duration-500">
                      <img
                        src={visual.src}
                        alt={visual.alt}
                        className={`absolute inset-0 w-full h-full object-cover ${visual.isPortrait ? '' : 'grayscale-[25%]'}`}
                        loading="lazy"
                        decoding="async"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: visual.isPortrait
                          ? 'linear-gradient(to top, rgba(7,7,7,0.72), transparent 45%)'
                          : `linear-gradient(135deg, ${avatar.from}88 0%, ${avatar.to}99 100%)` }}
                      />
                      {!visual.isPortrait && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className="font-heading font-black select-none"
                            style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', color: avatar.accent, opacity: 0.85, letterSpacing: '-0.04em' }}
                          >
                            {avatar.initials}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-one-navy/75 via-transparent to-transparent" />
                      <div aria-hidden className="explore-tile-scan" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        <span className="font-label text-[10px] px-2 py-0.5 rounded bg-one-gold text-one-navy">
                          {host.type}
                        </span>
                        <span className="font-label text-[9px] tracking-[0.08em] uppercase text-white/70">
                          {visual.isPortrait ? 'Archive portrait' : 'Station photography'}
                        </span>
                      </div>
                    </div>
                  )
                })()}
                <h4 className="font-h4 text-one-white">{host.name}</h4>
                <p className="font-body-small text-one-gold mt-1">{host.show}</p>
                <p className="font-body-small text-muted mt-0.5 flex items-center gap-1.5">
                  <Clock size={12} />
                  {host.time}
                </p>
                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-one-border">
                  <div className="flex items-center gap-3">
                  {host.social.fb && (
                    <a
                      href={FACEBOOK_PAGE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-label="FACEBOOK"
                      className="text-muted hover:text-one-white transition-colors"
                      aria-label={`${host.name} on Facebook`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                  )}
                  {(host.social as Record<string, boolean>)['ig'] === true && (
                    <span className="text-muted hover:text-one-white transition-colors cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </span>
                  )}
                  {(host.social as Record<string, boolean>)['tw'] === true && (
                    <span className="text-muted hover:text-one-white transition-colors cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    </span>
                  )}
                  </div>
                  <MiniWaveform color="#F2F2F2" seed={hi} />
                </div>
              </div>
              </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredHosts.length > HOSTS_INITIAL && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 flex justify-center"
          >
            <button
              type="button"
              onClick={() => setShowAllHosts(v => !v)}
              data-cursor-label={showAllHosts ? 'COLLAPSE' : 'EXPAND'}
              className="font-label text-xs px-8 py-3 rounded-full border border-one-gold/30 text-one-gold hover:bg-one-gold/10 transition-all flex items-center gap-2"
            >
              {showAllHosts ? 'Show fewer presenters' : `See all ${filteredHosts.length} presenters`}
              <ChevronRight size={14} className={`transition-transform ${showAllHosts ? 'rotate-90' : ''}`} />
            </button>
          </motion.div>
        )}
        </div>
      </section>

      {/* ═══════ Section 4 — GVL Broadcast Schedule ═══════ */}
      <section className="section-padding section-bleed-top bg-surface-peak" data-cursor-label="GVL SPORT">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <Trophy size={28} className="text-one-gold" />
            <WordReveal text="GVL FOOTBALL & NETBALL BROADCASTS" className="font-h2 text-one-white block" as="h2" stagger={0.04} />
          </div>
          <p className="font-body text-one-white max-w-2xl">
            ONE FM 98.5 covers Goulburn Valley League football and netball on Saturdays, plus NIRS AFL on Friday nights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {gvlSportBlocks.map((block, ri) => (
            <TiltCard key={block.title} maxTilt={5}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: ri * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              data-cursor-label={block.title.toUpperCase()}
              className="glass-card p-6 relative overflow-hidden h-full group"
            >
              <div aria-hidden className="explore-tile-scan" />
              <div className="absolute left-0 top-0 bottom-0 rounded-l" style={{ width: '3px', backgroundColor: '#E51636' }} />
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={18} className="text-one-red" />
                <h3 className="font-h3 text-one-white">{block.title}</h3>
              </div>
              <p className="font-label text-one-red/80 text-xs mb-2 flex items-center gap-1.5">
                <Clock size={12} />
                {block.time}
              </p>
              <p className="font-body-small text-muted">{block.desc}</p>
            </motion.div>
            </TiltCard>
          ))}
        </div>

        <TiltCard maxTilt={3} className="mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-data-teal/10 flex items-center justify-center">
              <Trophy size={22} className="text-data-teal" />
            </div>
            <div>
              <p className="font-h4 text-one-white">GVL season sponsorship</p>
              <p className="font-body-small text-muted">Football partnership tiers and match-day packages.</p>
            </div>
          </div>
          <MagneticButton strength={6} cursorLabel="GVL PACKAGES">
            <Link to="/football" className="btn-primary text-xs shrink-0 inline-flex items-center gap-1">
              View GVL Packages
              <ChevronRight size={14} />
            </Link>
          </MagneticButton>
        </motion.div>
        </TiltCard>
        </div>
      </section>

      <InterviewOnDemand />

      {/* ═══════ Section 6 — Request a Song ═══════ */}
      <section className="section-padding section-bleed-top bg-surface-glow pb-32" data-cursor-label="REQUEST">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-12"
        >
          <WordReveal text="Request a Song / Shoutout" className="font-h2 text-one-white mb-3 block" as="h2" />
          <p className="font-body text-one-white">
            Want to hear your favourite track? Send a dedication to someone special? Drop your request below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 md:p-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            {requestDraftOpened ? (
              <motion.div
                key="success"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center text-center py-12"
              >
                <CheckCircle2 size={56} className="text-data-teal mb-4" />
                <h3 className="font-h3 text-one-white mb-2">Email Draft Opened</h3>
                <p className="font-body text-muted max-w-md">
                  Complete the send in your email app so the request reaches {BRAND.email}. You can also call the studio on {BRAND.phone}.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleRequestSubmit}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="req-name" className="font-label text-muted mb-2 block">Your Name</label>
                  <input
                    id="req-name"
                    type="text"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="e.g. Jamie from Tatura"
                    className="w-full bg-one-navy/60 border border-one-border rounded-lg px-4 py-3 font-body text-one-white placeholder:text-muted focus:outline-none focus:border-one-gold focus:ring-2 focus:ring-one-gold/15 transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="req-song" className="font-label text-muted mb-2 block">Song Request</label>
                  <input
                    id="req-song"
                    type="text"
                    value={requestSong}
                    onChange={(e) => setRequestSong(e.target.value)}
                    placeholder="Song title and artist"
                    className="w-full bg-one-navy/60 border border-one-border rounded-lg px-4 py-3 font-body text-one-white placeholder:text-muted focus:outline-none focus:border-one-gold focus:ring-2 focus:ring-one-gold/15 transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="req-message" className="font-label text-muted mb-2 block">Dedication Message</label>
                  <textarea
                    id="req-message"
                    value={requestMsg}
                    onChange={(e) => setRequestMsg(e.target.value)}
                    placeholder="Who is this for? Any special message?"
                    rows={4}
                    className="w-full bg-one-navy/60 border border-one-border rounded-lg px-4 py-3 font-body text-one-white placeholder:text-muted focus:outline-none focus:border-one-gold focus:ring-2 focus:ring-one-gold/15 transition-all resize-none"
                  />
                </div>
                <button type="submit" data-cursor-label="SEND" className="btn-primary w-full justify-center">
                  <Send size={16} />
                  Send Request
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
        </div>
      </section>
    </Layout>
  )
}
