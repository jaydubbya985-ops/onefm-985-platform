import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Search, ChevronDown, Download, Copy, Check, Facebook,
  Smartphone, Image, Palette, Type, Grid, ArrowRight,
  X, Eye, Hash, Shield,
  Mic, Clock, Plus, Radio
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { HeadlinePop } from '@/components/motion/PosterReveal'
import { FacebookPageEmbed } from '@/components/FacebookPageEmbed'
import { SoundCloudPanel } from '@/components/social/SoundCloudPanel'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'
import { MOCK_ENQUIRIES } from '@/components/ops/data/enquiries'
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
import { stationStats } from '@/data/pricing'

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
  { name: 'Host Portraits', format: 'JPG', category: 'Photography', preview: 'bg-one-navy' },
  { name: 'Event Coverage', format: 'JPG', category: 'Photography', preview: 'bg-one-navy' },
  { name: 'Social Media Kit', format: 'PSD, Canva', category: 'Patterns', preview: 'bg-data-violet' },
]

// V3 Brand System colours — source: ONE_FM_brand_system_v3
const BRAND_COLORS = [
  { name: 'ONE FM Blue', hex: '#1B458F', usage: 'Core identity — wordmark, headers' },
  { name: 'Deep Navy', hex: '#101010', usage: 'Backgrounds, email header band' },
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
  { name: 'First Nations Program', platform: 'Facebook', dimensions: '1200×630', format: 'Canva (Landscape)', tags: ['Multicultural', 'First Nations', 'Culture'], image: '/assets/images/culture-first-nations-dancer.png' },
  { name: 'Deni Ute Muster Country', platform: 'Instagram', dimensions: '1080×1080', format: 'Canva (Square)', tags: ['Country', 'Event', 'Music'], image: '/assets/images/event-deni-ute-muster.jpg' },
  { name: 'Goulburn River Region', platform: 'Instagram', dimensions: '1080×1350', format: 'Canva (Portrait)', tags: ['Regional', 'Landscape', 'Community'], image: '/assets/images/culture-riverboat-murray.jpg' },
  { name: 'TikTok Vertical — Now Playing', platform: 'TikTok', dimensions: '1080×1920', format: 'Canva (Reel)', tags: ['Video', 'Live', 'Stream'], image: '/assets/images/studio-exterior-rainbow.jpg' },
  { name: 'LinkedIn Community Partner', platform: 'Facebook', dimensions: '1200×627', format: 'Canva (Landscape)', tags: ['Partner', 'Sponsor', 'B2B'], image: '/assets/images/gvl-player-high-five.jpg' },
  { name: 'Threads Quote Card', platform: 'Twitter/X', dimensions: '1080×1350', format: 'Canva (Portrait)', tags: ['Quote', 'Community', 'Story'], image: '/assets/images/geo-pink-orchard.jpg' },
  { name: 'Carousel Slide 1 — Breakfast', platform: 'Instagram', dimensions: '1080×1080', format: 'Canva (Carousel)', tags: ['Carousel', 'Breakfast', 'Daily'], image: '/assets/images/commentary-box-action.jpg' },
  { name: 'GVL Scoreboard Story', platform: 'Instagram', dimensions: '1080×1920', format: 'Canva (Story)', tags: ['Sport', 'GVL', 'Scoreboard'], image: '/assets/images/gvl-night-panorama.jpg' },
  { name: 'Presenter Spotlight Reel', platform: 'Instagram', dimensions: '1080×1920', format: 'Canva (Reel)', tags: ['Reel', 'Presenter', 'BTS'], image: '/assets/images/studio-commentary-selfie.jpg' },
]

const PLATFORM_FILTERS = ['All', 'Instagram', 'TikTok', 'Twitter/X', 'Facebook', 'Stories', 'Reels']

const GUIDES = [
  { title: 'The ONE FM Voice', icon: <Mic size={40} />, color: 'text-one-gold', desc: 'Tone, language, and personality guidelines for all social content', pages: '12 pages', path: '/media-kit' },
  { title: 'When the Valley is listening', icon: <Clock size={40} />, color: 'text-data-teal', desc: 'Breakfast, Saturday sport, and event days — post when the station is live, not to a fabricated peak-hour chart', pages: 'Media kit', path: '/media-kit' },
  { title: 'Hashtag set', icon: <Hash size={40} />, color: 'text-data-violet', desc: '#OneFM985 #Shepparton #GoulburnValley #GVL — use what is true for the post', pages: 'This page', path: '/social' },
  { title: 'Crisis Communication', icon: <Shield size={40} />, color: 'text-one-red', desc: 'Protocols for sensitive situations and rapid response', pages: 'Contact', path: '/contact' },
]

/** Real station photos — not a scraped feed. No invented likes, views, or dates. */
const STUDIO_STILLS = [
  { image: '/assets/images/commentary-box-action.jpg', caption: 'GVL coverage from the box — called live on 98.5 FM.', place: 'Commentary box' },
  { image: '/assets/images/studio-commentary-selfie.jpg', caption: 'Crew in the box. Interviews replay on SoundCloud after broadcast.', place: 'Studio' },
  { image: '/assets/images/event-food-trucks.jpg', caption: 'On site at a Shepparton food festival — come say g’day.', place: 'Community event' },
  { image: '/assets/images/culture-first-nations-dancer.png', caption: 'Culture and community nights across the Goulburn Valley.', place: 'Community' },
  { image: '/assets/images/gvl-night-panorama.jpg', caption: 'Under the lights at the GVL — local footy on a Friday night.', place: 'GVL' },
  { image: '/assets/images/geo-pink-orchard.jpg', caption: 'Orchards in bloom — this is why we call it home.', place: 'Goulburn Valley' },
  { image: '/assets/images/studio-presenter-mic.jpg', caption: 'Behind the mic. Faces and BTS clips beat a link dump.', place: 'Studio' },
  { image: '/assets/images/culture-riverboat-murray.jpg', caption: 'The Murray — stream ONE FM from anywhere at fm985.com.au.', place: 'Region' },
]

// Content calendar — GVL events & ONE FM programming (update monthly)
const CALENDAR_EVENTS = [
  { day: 1,  type: 'Live',    color: '#E51636', name: 'GVL Round Broadcast' },
  { day: 5,  type: 'Content', color: '#9B5DE5', name: 'Multicultural Program Spotlight' },
  { day: 8,  type: 'Live',    color: '#E51636', name: 'GVL Round Broadcast' },
  { day: 10, type: 'Partner', color: '#B6FF00', name: 'Sponsor Shoutout' },
  { day: 12, type: 'Content', color: '#9B5DE5', name: 'Breakfast Behind the Scenes' },
  { day: 15, type: 'Live',    color: '#E51636', name: 'GVL Round Broadcast' },
  { day: 18, type: 'Content', color: '#1B458F', name: 'Goulburn Valley Heritage Post' },
  { day: 20, type: 'Partner', color: '#B6FF00', name: 'Community Org Feature' },
  { day: 22, type: 'Live',    color: '#E51636', name: 'GVL Round Broadcast' },
  { day: 25, type: 'Content', color: '#9B5DE5', name: 'Regional Feature — Town of the Week' },
  { day: 27, type: 'Partner', color: '#B6FF00', name: 'Sponsor Spotlight' },
  { day: 29, type: 'Live',    color: '#E51636', name: 'GVL Final / Major Event' },
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
    { value: 'Facebook', label: 'Community page' },
    { value: 'SoundCloud', label: 'Interview archive' },
    { value: String(TEMPLATES.length), label: 'Canva templates' },
  ]

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])

  return (
    <>
      <section ref={heroRef} className="relative min-h-[78vh] flex items-end overflow-hidden bg-[#101010]" data-cursor-label="SOCIAL HUB">
        <motion.img
          src={STATION_PHOTOS.eventLasersBuilding}
          alt=""
          aria-hidden
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.50, y: heroImgY, top: '-28%', height: '156%', willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/60 via-transparent to-transparent" />
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
            <span className="block text-one-white">
              <HeadlinePop>Social</HeadlinePop>
            </span>
            <span className="block text-one-gold">
              <HeadlinePop delay={0.08}>Hub.</HeadlinePop>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5, ease: easeOutExpo }}
            className="font-body text-one-white/70 max-w-[500px] mb-10"
          >
            Brand assets, Canva templates, and the two channels we actually run: Facebook and SoundCloud. Faces and behind-the-scenes stills — not invented follower counts.
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
                  <div className="font-heading font-bold text-gold-gradient leading-tight" style={{ fontSize: 'clamp(1.35rem, 3vw, 2rem)' }}>{s.value}</div>
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
      <div className="bg-[#070707] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={28}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">FACEBOOK · SOUNDCLOUD</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">{TEMPLATES.length} CONTENT TEMPLATES</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">FACES BEAT LINK DUMPS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/85">98.5 FM · SHEPPARTON</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">NO FAKE FOLLOWER COUNTS</span>,
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
          <h2 className="font-h2 text-one-white">
            <HeadlinePop>Follow ONE FM 98.5</HeadlinePop>
          </h2>
          <p className="font-body text-muted mt-2 max-w-xl">
            Two live channels — Facebook for news and events, SoundCloud for interviews. Follower counts are data pending; we do not invent them.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs inline-flex items-center gap-2"
            >
              <Facebook size={14} /> facebook.com/onefmshepparton
            </a>
            <a
              href={SOUNDCLOUD_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs inline-flex items-center gap-2"
            >
              Open SoundCloud
            </a>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <FacebookPageEmbed />
        <SoundCloudPanel />
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
            <h2 className="font-h2 text-one-white mb-2">
              <HeadlinePop>BRAND ASSETS</HeadlinePop>
            </h2>
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
            <h2 className="font-h2 text-one-white mb-2">
              <HeadlinePop>CONTENT TEMPLATES</HeadlinePop>
            </h2>
            <p className="font-body-small text-muted">Ready-made designs for every platform</p>
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
            <h2 className="font-h2 text-one-white mb-2">
              <HeadlinePop>CAMPAIGN CALENDAR</HeadlinePop>
            </h2>
            <p className="font-body-small text-muted">Planning sketch for the month — not a live engagement dashboard.</p>
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
                key={event.name}
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

        <p className="mt-8 font-label text-[10px] tracking-[0.16em] uppercase text-muted">
          Planning sketch only — no AI engagement scores, no invented reach.
        </p>
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
          <h2 className="font-h2 text-one-white mb-2">
            <HeadlinePop>POSTING TOOLKIT</HeadlinePop>
          </h2>
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

        <div className="flex flex-wrap justify-center gap-3">
          {['Hashtag picker', 'Image resizer', 'Studio stills'].map((tool) => (
            <span key={tool} className="btn-secondary text-xs pointer-events-none">{tool}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Faces & behind the scenes — real station photos, no fake stats ─── */
function SocialFeedPreview() {
  const [visibleCount, setVisibleCount] = useState(4)
  const visible = STUDIO_STILLS.slice(0, visibleCount)

  return (
    <section className="bg-surface-mid section-bleed-top section-padding" data-cursor-label="STUDIO STILLS">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h2 className="font-h2 text-one-white mb-2">
            <HeadlinePop>FACES & BEHIND THE SCENES</HeadlinePop>
          </h2>
          <p className="font-body-small text-muted max-w-xl">
            Real station photos. No hearts, views, or follower numbers — those counts are data pending until we publish a verified figure.
          </p>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {visible.map((still, i) => (
              <motion.div
                key={still.image}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: easeOutExpo }}
                whileHover={{ y: -4 }}
                className="glass-card overflow-hidden group"
              >
                <div className="relative h-[200px] overflow-hidden">
                  <img src={still.image} alt={still.caption} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-one-navy/70 text-one-white font-label text-[9px]">
                    {still.place}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-body-small text-one-white text-xs line-clamp-3">{still.caption}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {visibleCount < STUDIO_STILLS.length && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + 4)}
              data-cursor-label="MORE"
              className="btn-secondary text-xs"
            >
              More stills
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
    downloadMailchimpLeadsCsv(MOCK_ENQUIRIES)
    toast.success('Mailchimp CSV downloaded — import to One FM Sales audience')
  }

  const handleCopySnippet = async () => {
    const snippet = buildMailchimpNewsletterSnippet({
      headline: 'Your brand across the Goulburn Valley',
      body: `ONE FM 98.5 reaches an estimated ${stationStats.weeklyListeners.toLocaleString()} weekly listeners across ${stationStats.totalTowns} communities. Explore sponsorship packages tailored to regional businesses.`,
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
          <h2 className="font-h2 text-one-white mb-2">
            <HeadlinePop>EXPORT FOR MAILCHIMP</HeadlinePop>
          </h2>
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
            <h4 className="font-h4 text-one-white mb-1">Export leads CSV</h4>
            <p className="font-body-small text-muted text-sm">Download ops enquiries formatted for Mailchimp import.</p>
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
      <SEO
        title="Social Hub — ONE FM 98.5"
        description="ONE FM 98.5 on Facebook and SoundCloud. Brand assets, Canva templates, and real studio stills — no invented follower counts."
      />
      <HeroSection />
      <LiveFacebookSection />
      <AssetLibrary />
      <TemplatesSection />
      <CampaignCalendar />
      <PostingToolkit />
      <MailchimpExportSection />
      <SocialFeedPreview />
    </Layout>
  )
}

