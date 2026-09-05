import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Search, ChevronDown, Download, Copy, Check, Instagram, Facebook,
  Smartphone, Globe, Image, Palette, Type, Grid, ArrowRight,
  Sparkles, X, Eye, Hash, Shield,
  Mic, Clock, Plus, Wand2, Radio
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { WordReveal } from '@/components/WordReveal'
import { FacebookPageEmbed } from '@/components/FacebookPageEmbed'
import {
  downloadMailchimpLeadsCsv,
  buildMailchimpNewsletterSnippet,
  copyMailchimpSnippetToClipboard,
  sampleMailchimpCsv,
} from '@/lib/mailchimpBridge'
import { toast } from 'sonner'
import { Marquee } from '@/components/Marquee'
import { MagneticButton } from '@/components/MagneticButton'
import { TiltCard } from '@/components/TiltCard'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { formatTowns, formatWeeklyListeners } from '@/lib/coverageCopy'
import { STANDARD_SPOT_PLUS_GST } from '@/lib/inventoryCopy'
import { SOCIAL_LINKS } from '@/lib/socialLinks'

/** Confirmed public profiles only — twitter, instagram, tiktok, youtube stay null. */
const LIVE_PROFILE_LABELS = (Object.entries(SOCIAL_LINKS) as [string, string | null][])
  .filter(([, href]) => Boolean(href))
  .map(([name]) => (name === 'facebook' ? 'Facebook' : name === 'soundcloud' ? 'SoundCloud' : name))
import { InventoryLadder } from '@/components/InventoryLadder'
import {
  BREAKFAST_SHOW,
  BREAKFAST_TIME,
  FULL_SCHEDULE,
  MULTICULTURAL_PROGRAM_COUNT,
} from '@/data/programGuide'

/** programGuide day 0=Sunday … 6=Saturday */
const GUIDE_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

function formatGuideHour(h: number): string {
  if (h === 0 || h === 24) return '12:00am'
  if (h === 12) return '12:00pm'
  return h < 12 ? `${h}:00am` : `${h - 12}:00pm`
}

function guideSlot(name: string) {
  const slot = FULL_SCHEDULE.find((s) => s.name === name)
  if (!slot) return null
  return {
    name: slot.name,
    dayName: GUIDE_DAYS[slot.day],
    time: `${formatGuideHour(slot.startHour)}–${formatGuideHour(slot.endHour)}`,
  }
}

const GVL_MATCH = guideSlot('GVL Match of the Day')
const NIRS_AFL_FRIDAY = guideSlot('NIRS AFL Friday Night Footy')
const GVL_WHEN = GVL_MATCH ? `${GVL_MATCH.dayName} ${GVL_MATCH.time}` : 'Saturday'
const NIRS_WHEN = NIRS_AFL_FRIDAY
  ? `${NIRS_AFL_FRIDAY.dayName} ${NIRS_AFL_FRIDAY.time}`
  : 'Friday night'

/* ─── Easing helpers ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ─── Data ─── */
const ASSET_CATEGORIES = ['All', 'Logos', 'Colors', 'Typography', 'Patterns', 'Photography']

const ASSETS = [
  { name: 'ONE FM Logo (Dark)', format: 'SVG, PNG', category: 'Logos', preview: 'bg-one-navy' },
  { name: 'ONE FM Logo (Light)', format: 'SVG, PNG', category: 'Logos', preview: 'bg-ivory' },
  { name: 'Signal Wave Icon', format: 'SVG', category: 'Logos', preview: 'bg-one-navy' },
  { name: 'Primary Palette', format: 'HEX, RGB', category: 'Colors', preview: 'bg-one-gold' },
  { name: 'Accent Palette', format: 'HEX, RGB', category: 'Colors', preview: 'bg-data-teal' },
  { name: 'Bebas Neue Specimen', format: 'OTF, WOFF', category: 'Typography', preview: 'bg-one-navy' },
  { name: 'Space Grotesk Specimen', format: 'OTF, WOFF', category: 'Typography', preview: 'bg-one-navy' },
  { name: 'Waveform Pattern', format: 'SVG, PNG', category: 'Patterns', preview: 'bg-one-navy' },
  { name: 'Studio Photos Pack', format: 'JPG', category: 'Photography', preview: 'bg-one-navy' },
  { name: 'Station photography (no presenter portraits pack)', format: 'JPG', category: 'Photography', preview: 'bg-one-navy' },
  { name: 'Event Coverage', format: 'JPG', category: 'Photography', preview: 'bg-one-navy' },
  { name: 'Social Media Kit', format: 'PSD, Canva', category: 'Patterns', preview: 'bg-data-violet' },
]

// V3 Brand System colours — source: ONE_FM_brand_system_v3
const BRAND_COLORS = [
  { name: 'ONE FM Blue', hex: '#1B458F', usage: 'Core identity — wordmark, headers' },
  { name: 'Deep Navy', hex: '#071D3A', usage: 'Backgrounds, email header band' },
  { name: '98.5 Red', hex: '#E51636', usage: 'Core identity — frequency, accents' },
  { name: 'Broadcast White', hex: '#FFFFFF', usage: 'Core identity — reversed lockup' },
  { name: 'Heritage Gold', hex: '#F2F2F2', usage: 'Premium accent — totals, highlights' },
  { name: 'Champagne', hex: '#F2F2F2', usage: 'Gold light — hover, decorative' },
  { name: 'Electric Cyan', hex: '#00E5FF', usage: 'Digital glow — stream, live signal' },
  { name: 'Neon Sky Blue', hex: '#38BDF8', usage: 'Safe daily UI accent' },
  { name: 'Neon Orange', hex: '#FF6A00', usage: 'Sport & event alerts only' },
]

// 2026 on-trend template formats — square, vertical story, horizontal, reel cover
const TEMPLATES = [
  { name: 'Breakfast Live Card', platform: 'Instagram', dimensions: '1080×1080', format: 'Canva (Square)', tags: ['Live', 'Breakfast', 'Daily'], image: '/assets/images/commentary-box-action.jpg' },
  { name: 'GVL Match Day Story', platform: 'Instagram', dimensions: '1080×1920', format: 'Canva (Story)', tags: ['Sport', 'GVL', 'Matchday'], image: '/assets/images/gvl-night-panorama.jpg' },
  { name: 'Community Event Reel Cover', platform: 'Instagram', dimensions: '1080×1920', format: 'Canva (Reel)', tags: ['Event', 'Community', 'Reel'], image: '/assets/images/community-book-stall.jpg' },
  { name: 'Multicultural Program Tile', platform: 'Facebook', dimensions: '1200×630', format: 'Canva (Landscape)', tags: ['Multicultural', 'Program', 'Community'], image: '/assets/images/culture-first-nations-dancer.png' },
  { name: 'Studio Behind the Mic', platform: 'Facebook', dimensions: '1200×630', format: 'Canva (Landscape)', tags: ['BTS', 'Studio', 'Presenter'], image: '/assets/images/studio-commentary-selfie.jpg' },
  { name: 'Goulburn Valley Heritage', platform: 'Instagram', dimensions: '1080×1350', format: 'Canva (Portrait)', tags: ['Heritage', 'Regional', 'Story'], image: '/assets/images/geo-pink-orchard.jpg' },
  { name: 'Live Stream Now Playing', platform: 'Instagram', dimensions: '1080×1080', format: 'Canva (Square)', tags: ['Live', 'Stream', 'NowPlaying'], image: '/assets/images/studio-exterior-rainbow.jpg' },
  { name: 'Sponsor Thank You', platform: 'Facebook', dimensions: '1200×630', format: 'Canva (Landscape)', tags: ['Sponsor', 'Community', 'Thank You'], image: '/assets/images/gvl-player-high-five.jpg' },
  { name: 'Laser & Festival Nights', platform: 'Instagram', dimensions: '1080×1920', format: 'Canva (Story)', tags: ['Events', 'Festival', 'Night'], image: '/assets/images/event-lasers-crowd.jpg' },
  { name: 'First Nations in the Valley', platform: 'Facebook', dimensions: '1200×630', format: 'Canva (Landscape)', tags: ['Community', 'First Nations', 'Culture'], image: '/assets/images/culture-first-nations-dancer.png' },
  { name: 'Deni Ute Muster Country', platform: 'Instagram', dimensions: '1080×1080', format: 'Canva (Square)', tags: ['Country', 'Event', 'Music'], image: '/assets/images/event-deni-ute-muster.jpg' },
  { name: 'Goulburn River Region', platform: 'Instagram', dimensions: '1080×1350', format: 'Canva (Portrait)', tags: ['Regional', 'Landscape', 'Community'], image: '/assets/images/culture-riverboat-murray.jpg' },
  { name: 'Vertical Now Playing', platform: 'Instagram', dimensions: '1080×1920', format: 'Canva (Reel)', tags: ['Video', 'Live', 'Stream'], image: '/assets/images/studio-exterior-rainbow.jpg' },
  { name: 'Community Partner Landscape', platform: 'Facebook', dimensions: '1200×627', format: 'Canva (Landscape)', tags: ['Partner', 'Sponsor', 'B2B'], image: '/assets/images/gvl-player-high-five.jpg' },
  { name: 'Quote Card', platform: 'Facebook', dimensions: '1080×1350', format: 'Canva (Portrait)', tags: ['Quote', 'Community', 'Story'], image: '/assets/images/geo-pink-orchard.jpg' },
  { name: 'Carousel Slide 1 — Breakfast', platform: 'Instagram', dimensions: '1080×1080', format: 'Canva (Carousel)', tags: ['Carousel', 'Breakfast', 'Daily'], image: '/assets/images/commentary-box-action.jpg' },
  { name: 'GVL Scoreboard Story', platform: 'Instagram', dimensions: '1080×1920', format: 'Canva (Story)', tags: ['Sport', 'GVL', 'Scoreboard'], image: '/assets/images/gvl-night-panorama.jpg' },
  { name: 'Presenter Spotlight Reel', platform: 'Instagram', dimensions: '1080×1920', format: 'Canva (Reel)', tags: ['Reel', 'Presenter', 'BTS'], image: '/assets/images/studio-commentary-selfie.jpg' },
]

/** Canva size buckets — not a claim we post on Twitter/TikTok (those URLs are null). */
const PLATFORM_FILTERS = ['All', 'Instagram', 'Facebook', 'Stories', 'Reels']

// Page counts were invented, so the cards link to the live page instead of
// claiming a document length we cannot produce.
const GUIDES = [
  { title: 'The ONE FM Voice', icon: <Mic size={40} />, color: 'text-one-gold', desc: 'Tone, language, and personality guidelines for all social content', pages: 'Media kit', path: '/media-kit' },
  { title: 'Who We Reach', icon: <Clock size={40} />, color: 'text-data-teal', desc: 'The broadcast-area population behind every post — and what we do not measure', pages: 'Audience & reach', path: '/audience' },
  { title: 'Hashtag Sets', icon: <Hash size={40} />, color: 'text-data-violet', desc: 'The station hashtags to use across GVL, community and program posts', pages: 'This page', path: '/social' },
  { title: 'Crisis Communication', icon: <Shield size={40} />, color: 'text-one-red', desc: 'Protocols for sensitive situations and rapid response', pages: 'Contact the station', path: '/contact' },
]

/**
 * Caption examples for the station's own feed. Like and comment counts were
 * invented and used to sit on each card; ONE FM does not export platform
 * metrics into this repo, so the cards show the copy and the artwork only.
 */
const FEED_POSTS = [
  { platform: 'Facebook', image: '/assets/images/commentary-box-action.jpg', caption: `${GVL_MATCH?.name ?? 'GVL Match of the Day'} is ${GVL_WHEN} on ONE FM 98.5. Follow the local call on 98.5 FM or stream at fm985.com.au 📻 #GVL #OneFM` },
  { platform: 'Facebook', image: '/assets/images/studio-commentary-selfie.jpg', caption: 'Great morning with the crew in the box. Thanks for tuning in — catch the replay on SoundCloud. #OneFM985 #Shepparton' },
  { platform: 'Facebook', image: '/assets/images/event-food-trucks.jpg', caption: 'Shepparton\'s food festival is on! ONE FM is live on site — come say g\'day. 🌮 #Shepparton #GoulburnValley' },
  { platform: 'Facebook', image: '/assets/images/culture-first-nations-dancer.png', caption: 'Celebrating culture and community in the Goulburn Valley. Thank you to all who joined us. #OneFM985 #Community' },
  { platform: 'Facebook', image: '/assets/images/gvl-night-panorama.jpg', caption: `Under the lights at the GVL — ${GVL_MATCH?.name ?? 'GVL Match of the Day'} is ${GVL_WHEN} on ONE FM 98.5. Friday night on the guide is ${NIRS_AFL_FRIDAY?.name ?? 'NIRS AFL Friday Night Footy'}. Catch us on 98.5 FM 🔴 #GVL #LocalFooty` },
  { platform: 'Facebook', image: '/assets/images/geo-pink-orchard.jpg', caption: 'The orchards are in bloom across the Goulburn Valley — this is why we call it home 🌸 #GoulburnValley #OneFM' },
  { platform: 'Facebook', image: '/assets/images/studio-presenter-mic.jpg', caption: `Live and local — ${MULTICULTURAL_PROGRAM_COUNT} multicultural programs from the weekly guide keeping every corner of the Goulburn Valley connected. #OneFM985 #Community` },
  { platform: 'Facebook', image: '/assets/images/culture-riverboat-murray.jpg', caption: 'The Murray River — heart of our region. Stream ONE FM anywhere in the world at fm985.com.au 🎙️' },
]

// Cadence reminders, not a fixture list. Sport labels match programGuide.ts.
const CALENDAR_EVENTS = [
  { day: 1,  type: 'Live',    color: '#E51636', name: `Saturday · ${GVL_MATCH?.name ?? 'GVL Match of the Day'}` },
  { day: 5,  type: 'Live',    color: '#E51636', name: `Friday · ${NIRS_AFL_FRIDAY?.name ?? 'NIRS AFL Friday Night Footy'}` },
  { day: 8,  type: 'Live',    color: '#E51636', name: `Saturday · ${GVL_MATCH?.name ?? 'GVL Match of the Day'}` },
  { day: 10, type: 'Partner', color: '#B6FF00', name: 'Sponsor Shoutout' },
  { day: 12, type: 'Content', color: '#9B5DE5', name: `${BREAKFAST_SHOW} behind the scenes` },
  { day: 15, type: 'Live',    color: '#E51636', name: `Saturday · ${GVL_MATCH?.name ?? 'GVL Match of the Day'}` },
  { day: 18, type: 'Content', color: '#1B458F', name: 'Goulburn Valley Heritage Post' },
  { day: 20, type: 'Partner', color: '#B6FF00', name: 'Community Org Feature' },
  { day: 22, type: 'Live',    color: '#E51636', name: `Saturday · ${GVL_MATCH?.name ?? 'GVL Match of the Day'}` },
  { day: 25, type: 'Content', color: '#9B5DE5', name: 'Regional Feature — Town of the Week' },
  { day: 27, type: 'Partner', color: '#B6FF00', name: 'Sponsor Spotlight' },
  { day: 29, type: 'Content', color: '#9B5DE5', name: 'Multicultural Program Spotlight' },
]

/* ─── Animated Grid Pattern Background ─── */
const GridPattern = memo(function GridPattern() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      t += 0.0005
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cellSize = 40
      const cols = Math.ceil(canvas.width / cellSize)
      const rows = Math.ceil(canvas.height / cellSize)

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const offset = Math.sin(c * 0.1 + t * 5) * Math.cos(r * 0.1 + t * 3) * 3
          const alpha = 0.02 + Math.abs(Math.sin(c * 0.2 + r * 0.15 + t * 2)) * 0.04
          ctx.fillStyle = `rgba(42, 42, 48, ${alpha})`
          ctx.fillRect(c * cellSize + offset, r * cellSize + offset, cellSize - 4, cellSize - 4)
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
})

/* ─── Section 1: Hero ─── */
function HeroSection() {
  const stats = [
    { value: '18', label: 'Templates' },
    { value: '120+', label: 'Images' },
    { value: '4', label: 'Platforms' },
  ]

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])

  return (
    <>
      <section ref={heroRef} className="relative min-h-[78vh] flex items-end overflow-hidden bg-[#071D3A]" data-cursor-label="SOCIAL HUB">
        <motion.img
          src={STATION_PHOTOS.eventLasersBuilding}
          alt=""
          aria-hidden
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.50, y: heroImgY, top: '-28%', height: '156%', willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071D3A] via-[#071D3A]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071D3A]/60 via-transparent to-transparent" />
        <GridPattern />
        <div aria-hidden className="grain-overlay" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-32 pb-40 w-full">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="font-label text-[10px] tracking-[0.28em] text-gold-gradient uppercase block mb-3"
          >
            Brand Assets · Content Tools · Campaign Templates
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
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.65 + 0.2)) * 11 + 2),
                  backgroundColor: 'rgba(201,162,39,0.34)',
                  animation: `freq-bar ${0.71 + (i % 6) * 0.13}s ${(i * 0.087) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>

          <h1
            className="font-heading font-black leading-none mb-8"
            style={{ fontSize: 'clamp(3.2rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
          >
            <WordReveal text="Social" as="span" className="block text-one-white" delay={0.15} stagger={0.12} />
            <WordReveal text="Hub." as="span" className="block text-one-gold" delay={0.4} stagger={0.12} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5, ease: easeOutExpo }}
            className="font-body text-one-white/70 max-w-[500px] mb-10"
          >
            Brand assets, content templates, and campaign tools. Everything you need to amplify ONE FM across every platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5, ease: easeOutExpo }}
            className="flex flex-wrap gap-8 mb-10"
          >
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
                <div>
                  <div className="font-stat text-gold-gradient" style={{ fontSize: '2.5rem' }}>{s.value}</div>
                  <div className="font-label text-muted text-[10px]">{s.label}</div>
                </div>
                {i < stats.length - 1 && <div className="hidden sm:block w-px h-10 bg-one-border/40" />}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5, ease: easeOutExpo }}
            className="flex gap-3"
          >
            <MagneticButton strength={10}>
              <a href="#templates" data-cursor-label="TEMPLATES" className="btn-primary text-xs">Browse Templates</a>
            </MagneticButton>
            <MagneticButton strength={8}>
              <a href="#assets" data-cursor-label="DOWNLOAD" className="btn-secondary text-xs">Download Brand Kit</a>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* ── Social Hub Marquee ── */}
      <div className="bg-[#04101F] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={28}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">FACEBOOK · INSTAGRAM · X · SOUNDCLOUD</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">24 CONTENT TEMPLATES</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">120+ BRAND IMAGES</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">98.5 FM · SHEPPARTON</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">CAPTION TEMPLATES</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">CAMPAIGN CALENDAR TOOLS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">BRAND KIT DOWNLOAD</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">GOULBURN VALLEY · COMMUNITY RADIO</span>,
          ]}
        />
      </div>
    </>
  )
}

/* ─── Live Facebook feed ─── */
function LiveFacebookSection() {
  return (
    <section className="bg-surface-mid section-bleed-top section-padding px-4 sm:px-6 max-w-7xl mx-auto" data-cursor-label="FOLLOW US">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="font-label text-one-electric text-[10px] mb-2">COMMUNITY</p>
          <WordReveal text="Follow ONE FM 98.5" className="font-h2 text-one-white block" as="h2" stagger={0.05} />
          <p className="font-body text-muted mt-2 max-w-xl">
            News, events, and Goulburn Valley updates — no clunky embeds, just our real community channels.
          </p>
        </div>
      </div>
      <div className="max-w-3xl">
        <FacebookPageEmbed />
      </div>
    </section>
  )
}

/* ─── Section 2: Brand Asset Library ─── */
function AssetLibrary() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const filteredAssets = ASSETS.filter((a) => {
    const matchesFilter = filter === 'All' || a.category === filter
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex).catch(() => {})
    setCopiedColor(hex)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  return (
    <section id="assets" className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="BRAND ASSETS">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <WordReveal text="BRAND ASSETS" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted">Logos, colors, and guidelines for partners</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card font-label text-[11px] text-muted hover:text-one-white transition-colors"
              >
                {filter}
                <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: easeOutBack }}
                    className="absolute top-full right-0 mt-1 glass-card z-40 min-w-[160px] py-2"
                  >
                    {ASSET_CATEGORIES.map((f) => (
                      <button
                        key={f}
                        onClick={() => { setFilter(f); setDropdownOpen(false) }}
                        className={`block w-full text-left px-4 py-2 font-label text-[11px] transition-colors ${
                          filter === f ? 'text-one-gold' : 'text-muted hover:text-one-white hover:bg-one-gold/10'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-lg bg-one-navy border border-one-border font-body-small text-one-white placeholder:text-muted focus:outline-none focus:border-one-gold text-sm w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Asset Grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          <AnimatePresence mode="popLayout">
            {filteredAssets.map((asset, i) => (
              <motion.div
                key={asset.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: easeOutExpo }}
                whileHover={{ y: -4 }}
                className="glass-card overflow-hidden cursor-pointer group hover:border-one-gold/30 transition-colors"
              >
                <div className={`h-[120px] ${asset.preview} flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
                  {asset.category === 'Logos' && <Radio size={32} className={asset.preview === 'bg-ivory' ? 'text-one-navy' : 'text-one-gold'} />}
                  {asset.category === 'Colors' && <Palette size={32} className="text-one-white" />}
                  {asset.category === 'Typography' && <Type size={32} className="text-one-white" />}
                  {asset.category === 'Patterns' && <Grid size={32} className="text-one-white" />}
                  {asset.category === 'Photography' && <Image size={32} className="text-one-white" />}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={16} className="text-one-gold" />
                  </div>
                  <div aria-hidden className="explore-tile-scan" />
                </div>
                <div className="p-3">
                  <h4 className="font-h4 text-one-white text-sm truncate">{asset.name}</h4>
                  <div className="font-label text-muted text-[10px] mt-1">{asset.format}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Color Palette */}
        <TiltCard maxTilt={4} className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="font-h3 text-one-white mb-4">Color Palette</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BRAND_COLORS.map((color) => (
              <div key={color.hex} className="group cursor-pointer" role="button" tabIndex={0} aria-label={`Copy ${color.name} — ${color.hex}`} onClick={() => copyHex(color.hex)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && copyHex(color.hex)}>
                <div
                  className="h-16 rounded-lg mb-2 relative overflow-hidden"
                  style={{ backgroundColor: color.hex }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    {copiedColor === color.hex ? <Check size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-one-white text-center">{color.hex}</div>
                <div className="font-label text-[9px] text-muted text-center">{color.name}</div>
              </div>
            ))}
          </div>
          {copiedColor && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 px-3 py-1.5 rounded-md bg-one-gold/20 text-one-gold font-label text-[11px] inline-flex items-center gap-1"
            >
              <Check size={12} /> Copied to clipboard
            </motion.div>
          )}
        </motion.div>
        </TiltCard>

        {/* Typography Card */}
        <TiltCard maxTilt={4}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-h3 text-one-white">Typography</h3>
            <button data-cursor-label="DOWNLOAD" className="btn-secondary text-xs">Download Font Package</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="font-display text-3xl text-one-white mb-1">Bebas Neue</div>
              <div className="font-label text-muted text-[10px]">DISPLAY — HERO HEADLINES</div>
            </div>
            <div>
              <div className="font-heading text-2xl text-one-white mb-1" style={{ fontWeight: 700 }}>Space Grotesk</div>
              <div className="font-label text-muted text-[10px]">HEADING — SECTION TITLES</div>
            </div>
            <div>
              <div className="font-body text-xl text-one-white mb-1">Inter</div>
              <div className="font-label text-muted text-[10px]">BODY — PARAGRAPHS</div>
            </div>
            <div>
              <div className="font-mono text-lg text-one-white mb-1">JetBrains Mono</div>
              <div className="font-label text-muted text-[10px]">MONO — DATA &amp; LABELS</div>
            </div>
          </div>
        </motion.div>
        </TiltCard>
      </div>
    </section>
  )
}

/* ─── Section 3: Content Templates ─── */
function TemplatesSection() {
  const [platformFilter, setPlatformFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTemplate, setModalTemplate] = useState<(typeof TEMPLATES)[0] | null>(null)

  const filteredTemplates = platformFilter === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.platform === platformFilter || (platformFilter === 'Stories' && t.tags.includes('Story')) || (platformFilter === 'Reels' && t.tags.includes('Video')))

  const openModal = (template: (typeof TEMPLATES)[0]) => {
    setModalTemplate(template)
    setModalOpen(true)
  }

  return (
    <section id="templates" className="bg-surface-deep section-bleed-top section-padding" data-cursor-label="TEMPLATES">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <WordReveal text="CONTENT TEMPLATES" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted">
              Canva-sized layouts for story/reel formats. Live station profiles:{' '}
              {LIVE_PROFILE_LABELS.join(' and ')}.
            </p>
          </div>

          <div className="flex gap-1 flex-wrap">
            {PLATFORM_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setPlatformFilter(f)}
                data-cursor-label={f.toUpperCase().split('/')[0]}
                className={`px-3 py-1.5 rounded-full font-label text-[11px] transition-all duration-200 ${
                  platformFilter === f ? 'bg-one-gold text-one-navy' : 'border border-one-border text-muted hover:text-one-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Featured template */}
        <TiltCard maxTilt={3} className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          data-cursor-label="PREVIEW"
          className="glass-card overflow-hidden relative group cursor-pointer"
          style={{ minHeight: 400 }}
          onClick={() => openModal(TEMPLATES[0])}
        >
          <img
            src="/social-template-mockup.jpg"
            alt="Featured Template"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            style={{ maxHeight: 500 }}
          />
          <div aria-hidden className="explore-tile-scan" />
          <div className="absolute inset-0 bg-one-navy/60 flex flex-col justify-end p-6 md:p-8">
            <h3 className="font-h3 text-one-white mb-3">Event Promo — Instagram Post</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {['1080×1080', 'PSD + Canva', 'Event'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full border border-one-border font-label text-muted text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <button data-cursor-label="PREVIEW" className="btn-primary text-xs" onClick={(e) => { e.stopPropagation(); openModal(TEMPLATES[0]) }}>
                <Eye size={14} /> Preview
              </button>
              <button data-cursor-label="DOWNLOAD" className="btn-secondary text-xs" onClick={(e) => e.stopPropagation()}>Download</button>
            </div>
          </div>
        </motion.div>
        </TiltCard>

        {/* Template grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, i) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: easeOutExpo }}
                whileHover={{ y: -4 }}
                data-cursor-label="PREVIEW"
                className="glass-card overflow-hidden cursor-pointer group"
                onClick={() => openModal(template)}
              >
                <div className="relative h-[280px] overflow-hidden">
                  <img src={template.image} alt={template.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="font-label text-one-white text-xs">Quick Preview</span>
                  </div>
                  <div aria-hidden className="explore-tile-scan" />
                </div>
                <div className="p-4">
                  <h4 className="font-h4 text-one-white text-sm mb-2">{template.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone size={12} className="text-muted" />
                    <span className="font-label text-muted text-[10px]">{template.platform}</span>
                  </div>
                  <div className="font-label text-muted text-[10px] mb-2">{template.dimensions} · {template.format}</div>
                  <div className="flex gap-1 flex-wrap">
                    {template.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full border border-one-border font-label text-muted text-[9px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && modalTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-one-navy/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, ease: easeOutExpo }}
              className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-h3 text-one-white">{modalTemplate.name}</h3>
                <button onClick={() => setModalOpen(false)} className="p-2 text-muted hover:text-one-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl overflow-hidden">
                  <img src={modalTemplate.image} alt={modalTemplate.name} className="w-full h-auto" />
                </div>
                <div>
                  <div className="font-label text-muted text-[11px] mb-1">PLATFORM</div>
                  <div className="font-body text-one-white mb-4">{modalTemplate.platform}</div>
                  <div className="font-label text-muted text-[11px] mb-1">DIMENSIONS</div>
                  <div className="font-body text-one-white mb-4">{modalTemplate.dimensions}</div>
                  <div className="font-label text-muted text-[11px] mb-1">FORMAT</div>
                  <div className="font-body text-one-white mb-4">{modalTemplate.format}</div>
                  <div className="font-label text-muted text-[11px] mb-1">TAGS</div>
                  <div className="flex gap-2 mb-6">
                    {modalTemplate.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full border border-one-border font-label text-muted text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="font-label text-muted text-[11px] mb-1">CUSTOMIZATION</div>
                  <p className="font-body-small text-one-white text-sm mb-6">
                    Easy to customize with your own images, colors, and text. All layers are clearly labeled and organized.
                  </p>
                  <div className="flex gap-3">
                    <button data-cursor-label="DOWNLOAD" className="btn-primary text-xs">Download</button>
                    <button data-cursor-label="CANVA" className="btn-secondary text-xs">Open in Canva</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ─── Section 4: Campaign Calendar ─── */
function CampaignCalendar() {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'list'>('month')
  const [currentMonth] = useState(() => new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, () => null)
  const allCells = [...emptyDays, ...calendarDays]

  const getEventsForDay = (day: number) => CALENDAR_EVENTS.filter((e) => e.day === day)

  return (
    <section className="bg-surface-peak section-bleed-top section-padding" data-cursor-label="CAMPAIGN PLAN">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <WordReveal text="CAMPAIGN CALENDAR" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted">
              Posting cadence reminders — sport labels from the station guide (GVL Saturday, NIRS AFL Friday), not a fixture list.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {(['month', 'week', 'list'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setCalendarView(v)}
                  className={`px-3 py-1.5 rounded-md font-label text-[11px] transition-all duration-200 ${
                    calendarView === v ? 'bg-one-gold text-one-navy' : 'border border-one-border text-muted hover:text-one-white'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <button data-cursor-label="NEW" className="btn-primary text-xs">
              <Plus size={14} /> New Campaign
            </button>
          </div>
        </div>

        {calendarView === 'month' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="font-label text-[10px] text-muted text-center py-2">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {allCells.map((day, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  className={`relative bg-one-navy border border-one-border rounded-lg p-2 min-h-[100px] hover:bg-one-navy/80 transition-colors ${
                    day === new Date().getDate() ? 'ring-1 ring-one-gold' : ''
                  }`}
                >
                  {day && (
                    <>
                      <div className={`font-label text-[11px] mb-1 ${day === new Date().getDate() ? 'text-one-gold' : 'text-muted'}`}>{day}</div>
                      <div className="space-y-1">
                        {getEventsForDay(day).map((event) => (
                          <div
                            key={event.name}
                            className="px-1.5 py-0.5 rounded font-label text-[9px] truncate cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: event.color + '33', color: event.color }}
                          >
                            {event.name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {calendarView === 'week' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex gap-4 overflow-x-auto">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="min-w-[140px] flex-1">
                  <div className="font-label text-[11px] text-muted text-center mb-3">{day}</div>
                  <div className="space-y-2">
                    {getEventsForDay(i + 1).map((event) => (
                      <div
                        key={event.name}
                        className="p-2 rounded-lg font-label text-[10px]"
                        style={{ backgroundColor: event.color + '22', color: event.color, borderLeft: `2px solid ${event.color}` }}
                      >
                        {event.name}
                      </div>
                    ))}
                    {getEventsForDay(i + 1).length === 0 && (
                      <div className="h-12 rounded-lg border border-one-border border-dashed flex items-center justify-center">
                        <span className="font-label text-[10px] text-muted">—</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {calendarView === 'list' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            {CALENDAR_EVENTS.map((event, i) => (
              <motion.div
                key={`${event.day}-${event.name}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center gap-4 px-4 py-3 rounded-lg border border-one-border hover:border-one-gold/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-label text-[11px] shrink-0" style={{ backgroundColor: event.color + '22', color: event.color }}>
                  {event.day}
                </div>
                <div className="flex-1">
                  <div className="font-h4 text-one-white text-sm">{event.name}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full font-label text-[10px] border shrink-0" style={{ borderColor: event.color + '44', color: event.color }}>
                  {event.type}
                </span>
                <ArrowRight size={14} className="text-muted shrink-0" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Planning note */}
        <TiltCard maxTilt={3} className="mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5, ease: easeOutBack }}
          className="glass-card p-5 border-l-2 border-l-one-gold"
        >
          <div className="flex flex-wrap items-center gap-4">
            <Wand2 size={20} className="text-one-gold shrink-0" />
            <div className="flex-1">
              <div className="font-body-small text-one-white text-sm">
                Planning note: this calendar is a posting plan, not a performance report. ONE FM does
                not measure social engagement, so nothing here is ranked by reach.
              </div>
            </div>
          </div>
        </motion.div>
        </TiltCard>
      </div>
    </section>
  )
}

/* ─── Section 5: Posting Toolkit ─── */
function PostingToolkit() {
  return (
    <section className="bg-surface-warm section-bleed-top section-padding" data-cursor-label="POSTING TIPS">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="text-center mb-10"
        >
          <WordReveal text="POSTING TOOLKIT" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
          <p className="font-body-small text-muted">Best practices and quick-start guides</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {GUIDES.map((guide, i) => (
            <TiltCard key={guide.title} maxTilt={5} className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: easeOutExpo }}
                className="glass-card p-6 cursor-pointer group hover:border-one-gold/30 transition-colors h-full relative overflow-hidden"
              >
                <div aria-hidden className="explore-tile-scan" />
                <div className={`mb-4 group-hover:rotate-[10deg] transition-transform duration-200 ${guide.color}`}>
                  {guide.icon}
                </div>
                <h4 className="font-h4 text-one-white mb-2">{guide.title}</h4>
                <p className="font-body-small text-one-white text-sm mb-4">{guide.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-label text-muted text-[10px]">{guide.pages}</span>
                  <Link to={guide.path} data-cursor-label="READ" className="font-label text-one-gold text-[10px] hover:text-one-gold transition-colors link-hover">Read Guide →</Link>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>

        <p className="text-center font-body-small text-muted">
          Caption starters are below. A hashtag picker, image resizer and posting-time tool are not
          built yet, so they are not listed here.
        </p>
      </div>
    </section>
  )
}

/**
 * Section 6: caption starter templates.
 *
 * A fixed library, not a model. It was previously badged as AI-powered behind a
 * two-second fake spinner, with tone/topic/length controls that never touched
 * the output. A licensed broadcaster cannot advertise a capability it does not
 * have, so it now says what it is and every control shown does something.
 */
const CAPTION_TEMPLATES: Record<string, string[]> = {
  Facebook: [
    `${BREAKFAST_SHOW} is ${BREAKFAST_TIME} weekdays — news, music, and community from your local station. 🎙️`,
    `Catch ${GVL_MATCH?.name ?? 'GVL Match of the Day'} ${GVL_WHEN} on ONE FM 98.5, or stream anywhere at fm985.com.au. Friday night is ${NIRS_AFL_FRIDAY?.name ?? 'NIRS AFL'}. 🎉`,
  ],
  SoundCloud: [
    'Catch the latest interviews and replays on the ONE FM SoundCloud. Search the station from the Listen page.',
    `${BREAKFAST_SHOW} is ${BREAKFAST_TIME} weekdays on ONE FM 98.5 — then find the conversation again on SoundCloud.`,
  ],
}

function CaptionGenerator() {
  const [platform, setPlatform] = useState('Facebook')
  const [variant, setVariant] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const options = CAPTION_TEMPLATES[platform] ?? CAPTION_TEMPLATES.Facebook

  const generate = () => setResult(options[variant % options.length])

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(result).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="bg-surface-glow section-bleed-top section-padding" data-cursor-label="CAPTION TEMPLATES">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-one-gold/20 text-one-gold font-label text-[10px] mb-4">
            <Sparkles size={12} /> TEMPLATE LIBRARY
          </div>
          <WordReveal text="CAPTION TEMPLATES" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
          <p className="font-body-small text-muted">
            Starter captions for {LIVE_PROFILE_LABELS.join(' and ')}. Written by the station — no
            generated copy.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 md:p-8"
        >
          <div className="space-y-4 mb-6">
            {/* Platform */}
            <div>
              <label className="font-label text-muted text-[10px] mb-1 block">PLATFORM</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-one-navy border border-one-border font-body-small text-one-white focus:outline-none focus:border-one-gold text-sm"
              >
                {Object.keys(CAPTION_TEMPLATES).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Variant */}
            <div>
              <label className="font-label text-muted text-[10px] mb-2 block">TEMPLATE</label>
              <div className="flex gap-2 flex-wrap">
                {options.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setVariant(i)}
                    className={`px-3 py-1.5 rounded-full border font-label text-[10px] transition-colors ${
                      variant % options.length === i
                        ? 'border-one-gold text-one-gold'
                        : 'border-one-border text-muted hover:border-one-gold/50'
                    }`}
                  >
                    Option {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generate}
            data-cursor-label="COPY TEMPLATE"
            className="btn-primary text-xs w-full justify-center"
          >
            <Sparkles size={14} /> Show Caption
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              className="mt-6 glass-card p-6"
            >
              <h4 className="font-h4 text-one-white mb-3">Starter Caption</h4>
              <div className="bg-one-navy rounded-lg p-4 mb-4">
                <p className="font-body text-one-white whitespace-pre-wrap">{result}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {['#OneFM', '#RadioLife', '#ONEFMBreakfast', '#LiveMusic'].map((tag) => (
                  <button key={tag} className="px-2 py-1 rounded-full border border-one-border font-label text-[10px] text-muted hover:border-one-gold hover:text-one-gold transition-colors">
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-label text-[10px] text-data-teal">
                  Character count: {result.length} / 2200
                </div>
                <div className="flex gap-2">
                  <button onClick={copyResult} data-cursor-label={copied ? 'COPIED' : 'COPY'} className="btn-secondary text-xs">
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                  <button onClick={generate} data-cursor-label="REGENERATE" className="btn-secondary text-xs">
                    <Sparkles size={14} /> Regenerate
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ─── Section 7: Social Feed Preview ─── */
function SocialFeedPreview() {
  const [feedFilter, setFeedFilter] = useState('All')
  const [visibleCount, setVisibleCount] = useState(4)

  const filteredPosts = feedFilter === 'All'
    ? FEED_POSTS
    : FEED_POSTS.filter((p) => p.platform === feedFilter)

  const visiblePosts = filteredPosts.slice(0, visibleCount)

  const platformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return <Instagram size={14} />
      case 'Facebook': return <Facebook size={14} />
      default: return <Globe size={14} />
    }
  }

  return (
    <section className="bg-surface-mid section-bleed-top section-padding" data-cursor-label="SOCIAL FEED">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <WordReveal text="LATEST FROM THE FEED" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted">
              Recent posts from the Facebook page.
            </p>
          </div>

          <div className="flex gap-1 flex-wrap">
            {['All', 'Facebook'].map((f) => (
              <button
                key={f}
                onClick={() => { setFeedFilter(f); setVisibleCount(4) }}
                className={`px-3 py-1.5 rounded-full font-label text-[11px] transition-all duration-200 ${
                  feedFilter === f ? 'bg-one-gold text-one-navy' : 'border border-one-border text-muted hover:text-one-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {visiblePosts.map((post, i) => (
              <motion.div
                key={`${post.caption}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: easeOutExpo }}
                whileHover={{ y: -4 }}
                className="glass-card overflow-hidden group cursor-pointer"
              >
                <div className="relative h-[200px] overflow-hidden">
                  <img src={post.image} alt="Post" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-one-navy/70 text-one-white flex items-center gap-1 font-label text-[9px]">
                    {platformIcon(post.platform)}
                    {post.platform}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-body-small text-one-white text-xs line-clamp-2">{post.caption}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {visibleCount < filteredPosts.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount((c) => c + 4)}
              data-cursor-label="MORE"
              className="btn-secondary text-xs"
            >
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Section: Mailchimp Export ─── */
function MailchimpExportSection() {
  const handleExport = () => {
    downloadMailchimpLeadsCsv([], 'one-fm-sales-leads-template.csv')
    toast.success('Template CSV downloaded — headers only. Real leads live in #/ops, not this public page.')
  }

  const handleCopySnippet = async () => {
    const snippet = buildMailchimpNewsletterSnippet({
      headline: 'Your brand across the Goulburn Valley',
      body: `ONE FM 98.5: ${formatWeeklyListeners()} across ${formatTowns()} (ABS 2021 via townData). ${STANDARD_SPOT_PLUS_GST}. GVL match-day and live reads are premium inventory — never sold as the $25 floor.`,
      ctaLabel: 'View Media Kit',
      ctaUrl: 'https://fm985.com.au/#/media-kit',
    })
    const ok = await copyMailchimpSnippetToClipboard(snippet)
    toast[ok ? 'success' : 'error'](ok ? 'HTML snippet copied — paste into Mailchimp' : 'Copy failed — check browser permissions')
  }

  return (
    <section className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="MAILCHIMP">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="mb-8"
        >
          <span className="section-label mb-4 block">Marketing workflow</span>
          <WordReveal text="EXPORT FOR MAILCHIMP" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
          <InventoryLadder className="mb-10" />
          <p className="font-body-small text-muted max-w-2xl">
            Resend handles transactional invoice and enquiry emails. Use these tools to export sponsor
            leads and copy branded HTML into Mailchimp campaigns (audience: <strong className="text-one-white">One FM Sales</strong>).
            See <code className="text-one-gold text-xs">MAILCHIMP-WORKFLOW.md</code> in the repo for the full step-by-step.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TiltCard maxTilt={5} className="h-full">
          <button type="button" onClick={handleExport} data-cursor-label="EXPORT" className="glass-card p-6 text-left hover:border-one-gold/30 transition-colors group w-full h-full relative overflow-hidden">
            <div aria-hidden className="explore-tile-scan" />
            <Download size={24} className="text-one-gold mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-h4 text-one-white mb-1">Export CSV template</h4>
            <p className="font-body-small text-muted text-sm">Headers only — real sponsor leads are in the operations portal, not this public page.</p>
          </button>
          </TiltCard>
          <TiltCard maxTilt={5} className="h-full">
          <button type="button" onClick={handleCopySnippet} data-cursor-label="COPY" className="glass-card p-6 text-left hover:border-one-gold/30 transition-colors group w-full h-full relative overflow-hidden">
            <div aria-hidden className="explore-tile-scan" />
            <Copy size={24} className="text-one-gold mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-h4 text-one-white mb-1">Copy HTML snippet</h4>
            <p className="font-body-small text-muted text-sm">Brand V3 newsletter block — paste into Mailchimp drag-and-drop editor.</p>
          </button>
          </TiltCard>
        </div>

        <details className="mt-6 glass-card p-4">
          <summary className="font-label text-xs text-one-gold cursor-pointer">Sample CSV format</summary>
          <pre className="mt-3 text-[10px] text-muted overflow-x-auto whitespace-pre-wrap">{sampleMailchimpCsv()}</pre>
        </details>
      </div>
    </section>
  )
}

/* ─── Main Page ─── */
export default function SocialHub() {
  return (
    <Layout>
      <SEO title="Social Media Hub" description={`ONE FM 98.5 brand assets and caption starters from the station guide: ${BREAKFAST_SHOW} weekdays, GVL Match of the Day ${GVL_WHEN}, NIRS AFL ${NIRS_WHEN}.`} />
      <HeroSection />
      <LiveFacebookSection />
      <AssetLibrary />
      <TemplatesSection />
      <CampaignCalendar />
      <PostingToolkit />
      <CaptionGenerator />
      <MailchimpExportSection />
      <SocialFeedPreview />
    </Layout>
  )
}

