import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { WordReveal } from '@/components/WordReveal'
import { Marquee } from '@/components/Marquee'
import { LatestInterviews } from '@/components/LatestInterviews'
import { SignalDivider } from '@/components/SignalDivider'
import { towns } from '@/data/townData'
import { stationStats } from '@/data/pricing'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { MediaImage } from '@/components/MediaImage'
import { PHOTO_DEFAULTS, STATION_PHOTOS } from '@/lib/stationPhotos'
import { TiltCard } from '@/components/TiltCard'
import { MagneticButton } from '@/components/MagneticButton'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import {
  Heart,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Globe,
  HandHeart,
  Stethoscope,
  GraduationCap,
  Palette,
  Trophy,
  TreePine,
  ChevronRight,
  Flame,
  Music,
  Mic2,
} from 'lucide-react'

/* â”€â”€â”€ Animated Grid Background (subtle CSS animation) â”€â”€â”€ */
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,168,75,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,75,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(212,168,75,0.8), transparent 60%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* â”€â”€â”€ Section 1: Hero â”€â”€â”€ */
function CommunityHero() {
  const stats = [
    { label: 'NFPs Supported', value: stationStats.nfpsSupported, suffix: '+' },
    { label: 'People Reached', value: stationStats.broadcastPopulation, suffix: '' },
    { label: 'Weekly Listeners', value: stationStats.weeklyListeners, suffix: '' },
    { label: 'Events Covered', value: 500, suffix: '+' },
  ]

  const marqueeItems = [
    { text: `${stationStats.nfpsSupported}+ NFPs Supported`, cls: 'text-one-gold/60' },
    { text: `${stationStats.broadcastPopulation.toLocaleString()} People Reached`, cls: 'text-one-white/40' },
    { text: `${stationStats.weeklyListeners.toLocaleString()} Weekly Listeners`, cls: 'text-one-gold/60' },
    { text: '500+ Events Covered', cls: 'text-one-white/40' },
    { text: `${stationStats.totalTowns} Towns Across the Valley`, cls: 'text-one-gold/60' },
    { text: `${stationStats.yearsBroadcasting} Years of Community Radio`, cls: 'text-one-white/40' },
  ]

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  return (
    <>
      <section ref={heroRef} className="relative min-h-[82vh] flex items-end overflow-hidden bg-[#101010]" data-cursor-label="DISCOVER">
        <div className="absolute inset-0 z-0">
          <motion.div
            style={{ y: heroImgY, position: 'absolute', top: '-28%', bottom: 0, left: 0, right: 0, willChange: 'transform' }}
          >
            <img
              src="/assets/images/community-book-stall.jpg"
              alt=""
              aria-hidden
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover"
              style={{ opacity: 0.55 }}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/60 via-transparent to-transparent" />
        </div>
        <AnimatedGrid />
        <div aria-hidden className="grain-overlay" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 pb-40">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-label text-[10px] tracking-[0.28em] text-gold-gradient uppercase block mb-3"
          >
            Community Radio Since 1989 Â· 25 Towns Across the Valley
          </motion.span>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex items-end gap-[1.5px] mb-5"
            aria-hidden
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-[1.5px] rounded-sm"
                style={{
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.58 + 0.3)) * 11 + 2),
                  backgroundColor: 'rgba(201,162,39,0.33)',
                  animation: `freq-bar ${0.72 + (i % 5) * 0.14}s ${(i * 0.09) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>

          <h1
            className="font-heading font-black leading-none mb-8"
            style={{ fontSize: 'clamp(3.2rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
          >
            <WordReveal text="Our" as="span" className="block text-one-white" delay={0.15} stagger={0.12} />
            <WordReveal text="Community." as="span" className="block text-one-gold" delay={0.4} stagger={0.12} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-body text-one-white/50 max-w-xl mb-12 italic"
          >
            {stationStats.totalTowns} towns. One voice. {stationStats.yearsBroadcasting} years of keeping the Valley connected.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap md:flex-nowrap items-stretch gap-0"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-stretch min-w-[130px]">
                <div className="flex flex-col justify-center px-6 py-4">
                  <div
                    className="text-gold-gradient font-heading font-black tabular-nums mb-1"
                    style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1 }}
                  >
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="font-label text-one-white/40 uppercase tracking-widest text-[10px] leading-snug">
                    {stat.label}
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px self-stretch bg-gradient-to-b from-transparent via-one-gold/20 to-transparent shrink-0" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#101010] to-transparent z-10 pointer-events-none" />
      </section>

      <div className="py-4 bg-[#101010] border-y border-one-gold/10 overflow-hidden">
        <Marquee
          speed={35}
          items={marqueeItems.map((item) => (
            <span className={`mx-12 font-label text-[10px] tracking-[0.25em] uppercase ${item.cls}`}>
              {item.text}
            </span>
          ))}
        />
      </div>
    </>
  )
}

/* â”€â”€â”€ Section 1.5: Photo Mosaic â”€â”€â”€ */
const MOSAIC_PHOTOS = [
  {
    src: STATION_PHOTOS.eventLasersCrowd,
    alt: 'Community festival with laser lights',
    caption: 'Live Events',
    className: 'col-span-2 lg:col-span-2',
  },
  {
    // Only 300x168px source (no higher-res original exists) -- kept at
    // standard tile size instead of a featured double-height span, which
    // would stretch it well past native resolution.
    src: STATION_PHOTOS.cultureAlbanianDancers,
    alt: 'Albanian cultural dancers in traditional costume',
    caption: 'Cultural Celebrations',
    className: 'col-span-1',
  },
  {
    src: STATION_PHOTOS.communityBookStall,
    alt: 'Community book stall',
    caption: 'Grassroots Community',
    className: 'col-span-1',
  },
  {
    src: STATION_PHOTOS.eventOutdoorCinema,
    alt: 'Outdoor cinema event at dusk',
    caption: 'Valley Experiences',
    className: 'col-span-1',
  },
  {
    src: STATION_PHOTOS.eventFoodTrucks,
    alt: 'Local food trucks at a community event',
    caption: 'Local Flavours',
    className: 'col-span-1',
  },
  {
    // Only 259x194px source (no higher-res original exists) -- kept at
    // standard tile size instead of a featured wide span.
    src: STATION_PHOTOS.cultureSiloArtBirds,
    alt: 'Shepparton silo art mural with birds',
    caption: 'Valley Art',
    className: 'col-span-1',
  },
]

function CommunityPhotoMosaic() {
  return (
    <section className="py-16 bg-[#101010]" data-cursor-label="EXPLORE">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="font-label text-one-electric text-[10px] tracking-widest uppercase mb-2">Glimpse</p>
            <WordReveal text="Life in the Valley" className="font-h2 text-one-white block" as="h2" />
          </div>
          <span className="hidden sm:block font-label text-one-muted text-[10px] tracking-widest uppercase">
            {MOSAIC_PHOTOS.length} photos
          </span>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[200px] lg:auto-rows-[220px] gap-3">
          {MOSAIC_PHOTOS.map((photo, i) => (
            <motion.div
              key={photo.alt}
              className={`relative overflow-hidden rounded-xl group ${photo.className}`}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <MediaImage
                src={photo.src}
                fallbackSrc={PHOTO_DEFAULTS.community}
                alt={photo.alt}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div aria-hidden className="explore-tile-scan" />
              <div className="absolute bottom-0 inset-x-0 p-4 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="font-label text-[10px] tracking-[0.2em] text-one-white uppercase">
                  {photo.caption}
                </span>
              </div>
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-one-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* â”€â”€â”€ Section 2: Town Directory â”€â”€â”€ */
function TownDirectory() {
  const [search, setSearch] = useState('')
  const [lgaFilter, setLgaFilter] = useState('All')

  const lgas = useMemo(
    () => ['All', ...Array.from(new Set(towns.map((t) => t.lga)))],
    []
  )

  const filtered = useMemo(() => {
    return towns.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
      const matchesLga = lgaFilter === 'All' || t.lga === lgaFilter
      return matchesSearch && matchesLga
    })
  }, [search, lgaFilter])

  const sizeColor = (size: string) => {
    switch (size) {
      case 'hub':
        return 'border-one-gold text-one-gold'
      case 'major':
        return 'border-[#1B4F8F] text-[#4A9EFF]'
      case 'medium':
        return 'border-[#5BA3E0] text-[#7EC8FF]'
      case 'small':
        return 'border-[#8A9199] text-[#B0B8BF]'
      case 'village':
        return 'border-[#5A6570] text-[#8A9199]'
      default:
        return 'border-one-muted text-one-muted'
    }
  }

  const sizeBg = (size: string) => {
    switch (size) {
      case 'hub':
        return 'bg-one-gold/10'
      case 'major':
        return 'bg-[#1B4F8F]/10'
      case 'medium':
        return 'bg-[#5BA3E0]/10'
      case 'small':
        return 'bg-[#8A9199]/10'
      case 'village':
        return 'bg-[#5A6570]/10'
      default:
        return 'bg-one-muted/10'
    }
  }

  return (
    <section className="section-padding bg-surface-mid" data-cursor-label="TOWNS DIRECTORY">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <WordReveal text="Town Directory" className="font-h2 text-one-white mb-4 block" as="h2" />
          <p className="font-body text-one-muted max-w-xl">
            Every community we serve across the Goulburn Valley and beyond.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-one-muted"
            />
            <input
              type="text"
              placeholder="Search towns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-one-navy border border-one-border rounded-lg pl-10 pr-4 py-2.5 font-body text-sm text-one-white placeholder:text-one-muted focus:outline-none focus:border-one-gold focus:ring-1 focus:ring-one-gold/20 transition-all"
            />
          </div>
          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-one-muted"
            />
            <select
              value={lgaFilter}
              onChange={(e) => setLgaFilter(e.target.value)}
              className="bg-one-navy border border-one-border rounded-lg pl-10 pr-8 py-2.5 font-body text-sm text-one-white focus:outline-none focus:border-one-gold focus:ring-1 focus:ring-one-gold/20 transition-all appearance-none cursor-pointer"
            >
              {lgas.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((town) => (
              <motion.div
                key={town.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to={`/coverage?town=${encodeURIComponent(town.name)}`}
                  data-cursor-label="EXPLORE"
                  className={`block glass-card p-5 hover:scale-[1.02] hover:border-one-gold/30 transition-all duration-300 group border-l-4 relative overflow-hidden ${sizeColor(town.sizeCategory)}`}
                >
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-h4 text-one-white group-hover:text-one-gold transition-colors">
                      {town.name}
                    </h3>
                    <span
                      className={`font-micro px-2 py-1 rounded ${sizeBg(town.sizeCategory)} ${sizeColor(town.sizeCategory)}`}
                    >
                      {town.sizeCategory}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-body-small text-one-muted">
                      <span>Population 2026</span>
                      <span className="text-one-white font-medium">
                        {town.population2026.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-body-small text-one-muted">
                      <span>LGA</span>
                      <span className="text-one-white font-medium">
                        {town.lga}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-body-small text-one-muted">
                      <span>Distance</span>
                      <span className="text-one-white font-medium">
                        {town.distanceFromSheppartonKm} km
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 font-label text-one-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View on map</span>
                    <ChevronRight size={14} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <MapPin size={40} className="text-one-muted mx-auto mb-4" />
            <p className="font-body text-one-muted">No towns match your search.</p>
          </div>
        )}
      </div>
    </section>
  )
}

/* â”€â”€â”€ Section 3: NFP Impact Engine â”€â”€â”€ */
function NFPImpact() {
  const categories = [
    {
      icon: Flame,
      title: 'Emergency Services',
      description:
        'Supporting CFA, SES, and local emergency responders with real-time broadcast coordination and community alerts.',
      examples: ['Country Fire Authority â€” Shepparton', 'Victoria State Emergency Service', 'RoadSafe Goulburn Valley'],
      stat: '12,000+ emergency broadcasts annually',
    },
    {
      icon: Stethoscope,
      title: 'Health & Wellness',
      description:
        'Partnering with hospitals, mental health services, and allied health providers to keep the Valley healthy.',
      examples: ['Goulburn Valley Health', 'Primary Care Connect', 'We Listen Support Group'],
      stat: '45 health campaigns per year',
    },
    {
      icon: GraduationCap,
      title: 'Youth & Education',
      description:
        'Amplifying schools, TAFEs, and youth programs to inspire the next generation of Valley leaders.',
      examples: ['Greater Shepparton Secondary College', 'La Trobe University â€” Shepparton', 'Mooroopna Education & Activity Centre (MEAC)'],
      stat: '8,200+ young people engaged',
    },
    {
      icon: Palette,
      title: 'Arts & Culture',
      description:
        'Celebrating local galleries, theatre groups, and multicultural festivals that make the Valley vibrant.',
      examples: ['Shepparton Art Museum', 'Riverlinks Eastbank', 'Shepparton Italian Festa'],
      stat: '120 cultural events promoted',
    },
    {
      icon: Trophy,
      title: 'Sports & Recreation',
      description:
        'Live coverage, sponsorship, and promotion for grassroots clubs across football, netball, cricket, and more.',
      examples: ['Goulburn Valley League', 'Cricket Shepparton', 'Shepparton United Football Club'],
      stat: 'GVL â€” 12 clubs, 500+ games covered',
    },
    {
      icon: TreePine,
      title: 'Environment',
      description:
        'Working with conservation groups and Landcare networks to protect the region\'s natural heritage.',
      examples: ['Goulburn Broken CMA', 'Yorta Yorta Nation Aboriginal Corporation', 'Barmah National Park Friends'],
      stat: '35 environmental projects supported',
    },
  ]

  return (
    <section className="section-padding section-bleed-top bg-surface-lift" data-cursor-label="COMMUNITY IMPACT">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block font-label text-sage mb-4">IMPACT</span>
          <WordReveal text="100+ Not-for-Profits Supported" className="font-h2 text-one-white mb-4 block" as="h2" stagger={0.05} />
          <p className="font-body text-one-muted max-w-2xl mx-auto">
            From emergency responders to arts festivals, ONE FM is the backbone of
            community communication across the Goulburn Valley.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <TiltCard key={cat.title} maxTilt={5} className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card p-6 hover:border-sage/40 transition-all duration-300 group h-full relative overflow-hidden"
            >
              <div aria-hidden className="explore-tile-scan" />
              <div className="w-12 h-12 rounded-lg bg-sage/10 flex items-center justify-center mb-5 group-hover:bg-sage/20 transition-colors">
                <cat.icon size={24} className="text-sage" />
              </div>
              <h3 className="font-h4 text-one-white mb-2">{cat.title}</h3>
              <p className="font-body-small text-one-muted mb-4">
                {cat.description}
              </p>
              <div className="space-y-1.5 mb-4">
                {cat.examples.map((ex) => (
                  <div
                    key={ex}
                    className="flex items-center gap-2 font-body-small text-one-white"
                  >
                    <ChevronRight size={14} className="text-sage shrink-0" />
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-one-border">
                <span className="font-label text-sage">{cat.stat}</span>
              </div>
            </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

/* â”€â”€â”€ Section 4: Cultural Diversity â”€â”€â”€ */
function CulturalDiversity() {
  const communities = [
    {
      name: 'Italian',
      towns: ['Shepparton', 'Kyabram', 'Tatura'],
      program: 'Shepparton Italian Festa',
      description:
        'One of Victoria\'s oldest Italian-Australian communities, with roots in post-war migration and the fruit industry.',
    },
    {
      name: 'Punjabi',
      towns: ['Shepparton', 'Mooroopna', 'Cobram'],
      program: 'Punjabi Music Program â€” Monday 11pm',
      description:
        'A vibrant and growing South Asian community, enriching the Valley with culture, business, and sport.',
    },
    {
      name: 'Samoan',
      towns: ['Shepparton'],
      program: 'Samoan Program â€” Wednesday 9-10pm',
      description:
        'Hosted by MK (Muagutauti\'a Faletoese Lemamea), connecting the Samoan community through language and music.',
    },
    {
      name: 'Filipino',
      towns: ['Shepparton'],
      program: 'Filipino Music Program â€” Wednesday 10-11pm',
      description:
        'Hosted by Edith, celebrating Filipino music and culture in the Goulburn Valley.',
    },
    {
      name: 'Swahili / African',
      towns: ['Shepparton'],
      program: 'Africonnect â€” Monday 9-10pm',
      description:
        'Hosted by Fikiri in Swahili, connecting the African community in the Goulburn Valley.',
    },
    {
      name: 'Chinese / Mandarin',
      towns: ['Shepparton'],
      program: 'Mandarin Program â€” Various times',
      description:
        'Hosted by Jimmy with co-host Ivy, featuring Mandarin language programming and "Her Quiet Strength" segment.',
    },
  ]

  return (
    <section className="section-padding section-bleed-top bg-surface-deep" data-cursor-label="CULTURAL DIVERSITY">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block font-label text-one-electric mb-4">
            MULTICULTURAL VALLEY
          </span>
          <WordReveal text="Cultural Diversity" className="font-h2 text-one-white mb-4 block" as="h2" />
          <p className="font-body text-one-muted max-w-2xl mx-auto">
            The Goulburn Valley is home to rich multicultural communities that
            make our region unique. ONE FM proudly broadcasts programming in
            multiple languages.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((comm, i) => (
            <TiltCard key={comm.name} maxTilt={6} className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              data-cursor-label={comm.name.toUpperCase()}
              className="glass-card p-6 hover:border-one-gold/30 transition-all duration-300 h-full group relative overflow-hidden"
            >
              <div aria-hidden className="explore-tile-scan" />
              <div className="flex items-center gap-3 mb-4">
                <Globe size={22} className="text-one-gold" />
                <h3 className="font-h4 text-one-white">{comm.name} Community</h3>
              </div>
              <p className="font-body-small text-one-muted mb-4">
                {comm.description}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <Music size={14} className="text-one-gold" />
                <span className="font-label text-one-gold text-xs">{comm.program}</span>
              </div>
              <div className="flex items-center gap-2 font-body-small text-one-muted">
                <MapPin size={12} />
                <span>{comm.towns.join(', ')}</span>
              </div>
            </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

/* â”€â”€â”€ Section 5: Ethnic Programming â”€â”€â”€ */
function EthnicPrograms() {
  const programs = [
    {
      language: 'Swahili',
      show: 'Africonnect',
      presenter: 'Fikiri',
      time: 'Monday 9-10pm',
      description: 'Connecting the African community in the Goulburn Valley through Swahili language programming.',
    },
    {
      language: 'Samoan',
      show: 'Samoan Program',
      presenter: 'MK (Muagutauti\'a Faletoese Lemamea)',
      time: 'Wednesday 9-10pm',
      description: 'Samoan language program preserving culture and community connections.',
    },
    {
      language: 'Filipino',
      show: 'Filipino Music Program',
      presenter: 'Edith',
      time: 'Wednesday 10-11pm',
      description: 'Filipino music and culture showcasing the best of the Philippines.',
    },
    {
      language: 'Mandarin',
      show: 'Mandarin Program',
      presenter: 'Jimmy',
      time: 'Various',
      description: 'Chinese language programming with community news, music, and interviews.',
    },
    {
      language: 'Mandarin',
      show: 'Her Quiet Strength',
      presenter: 'Jimmy & Ivy',
      time: 'Various',
      description: 'A segment focused on empowering stories within the Chinese community.',
    },
    {
      language: 'Punjabi',
      show: 'Punjabi Music Program',
      presenter: 'Rai, Aanchal or Sahil',
      time: 'Monday 11pm',
      description: 'Punjabi music program featuring Bhangra, Bollywood, and traditional folk.',
    },
  ]

  return (
    <section className="section-padding section-bleed-top bg-surface-peak" data-cursor-label="MULTICULTURAL RADIO">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block font-label text-one-electric mb-4">
            ON AIR
          </span>
          <WordReveal text="Ethnic & Multicultural Programming" className="font-h2 text-one-white mb-4 block" as="h2" stagger={0.05} />
          <p className="font-body text-one-muted max-w-2xl mx-auto">
            ONE FM broadcasts in 5+ languages, serving the diverse communities of the Goulburn Valley.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog, i) => (
            <TiltCard key={`${prog.show}-${prog.presenter}`} maxTilt={5} className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card p-6 hover:border-one-gold/30 transition-all duration-300 group h-full relative overflow-hidden"
            >
              <div aria-hidden className="explore-tile-scan" />
              <div className="flex items-center gap-3 mb-4">
                <Mic2 size={22} className="text-one-gold" />
                <div>
                  <h3 className="font-h4 text-one-white">{prog.show}</h3>
                  <span className="font-label text-one-gold text-xs">{prog.language}</span>
                </div>
              </div>
              <p className="font-body-small text-one-muted mb-4">
                {prog.description}
              </p>
              <div className="space-y-2 pt-4 border-t border-one-border">
                <div className="flex items-center justify-between font-body-small">
                  <span className="text-one-muted">Presenter</span>
                  <span className="text-one-white text-right">{prog.presenter}</span>
                </div>
                <div className="flex items-center justify-between font-body-small">
                  <span className="text-one-muted">Time</span>
                  <span className="text-one-white">{prog.time}</span>
                </div>
              </div>
            </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

/* â”€â”€â”€ Section 6: Events Calendar â”€â”€â”€ */
function EventsCalendar() {
  const [view, setView] = useState<'month' | 'list'>('list')

  const events = [
    {
      date: '2026-06-28',
      month: 'JUN',
      day: '28',
      title: 'GVL Finals Series â€” Round 1',
      location: 'Shepparton Â· GVL Grounds',
      description:
        'Goulburn Valley League football and netball finals kick off â€” ONE FM broadcasts live from the ground all day.',
      upcoming: true,
    },
    {
      date: '2026-07-12',
      month: 'JUL',
      day: '12',
      title: 'Shepparton Community Multicultural Festival',
      location: 'Shepparton CBD',
      description:
        'Celebrating the diversity of the Goulburn Valley with food, live music, dance and cultural performances from 10+ communities.',
      upcoming: true,
    },
    {
      date: '2026-08-15',
      month: 'AUG',
      day: '15',
      title: 'GVL Grand Final Day',
      location: 'Shepparton Â· GVL Grounds',
      description:
        'The biggest day on the Goulburn Valley sporting calendar â€” ONE FM provides full live commentary from first bounce to the siren.',
      upcoming: true,
    },
    {
      date: '2026-09-20',
      month: 'SEP',
      day: '20',
      title: 'Deniliquin Ute Muster â€” ONE FM Broadcast',
      location: 'Deniliquin, NSW',
      description:
        'ONE FM heads south for the annual Deni Ute Muster â€” remote live crosses, community interviews, and non-stop country music.',
      upcoming: true,
    },
    {
      date: '2026-10',
      month: 'OCT',
      day: 'TBC',
      title: 'Fire Relief Festival Community Concert & Fun Day',
      location: 'Cobram',
      description:
        'Community concert and fun day supporting fire recovery efforts across the region, featuring local performers and ONE FM live.',
      upcoming: true,
    },
    {
      date: '2026-05-11',
      month: 'MAY',
      day: '11',
      title: "Shepparton Mother's Day Classic Fun Run",
      location: 'Shepparton',
      description:
        'Annual fun run supporting breast cancer research, with community participation across the Goulburn Valley.',
      upcoming: false,
    },
  ]

  return (
    <section className="section-padding section-bleed-top bg-surface-warm" data-cursor-label="EVENTS CALENDAR">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block font-label text-one-electric mb-4">
              WHAT'S ON
            </span>
            <WordReveal text="Events Calendar" className="font-h2 text-one-white block" as="h2" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex bg-one-navy border border-one-border rounded-lg p-1"
          >
            <button
              onClick={() => setView('month')}
              data-cursor-label="MONTH"
              className={`px-4 py-2 rounded-md font-label text-xs transition-all ${
                view === 'month'
                  ? 'bg-one-gold text-one-navy'
                  : 'text-one-muted hover:text-one-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('list')}
              data-cursor-label="LIST"
              className={`px-4 py-2 rounded-md font-label text-xs transition-all ${
                view === 'list'
                  ? 'bg-one-gold text-one-navy'
                  : 'text-one-muted hover:text-one-white'
              }`}
            >
              List
            </button>
          </motion.div>
        </div>

        <div className="space-y-4">
          {events.map((event, i) => (
            <motion.div
              key={event.date + event.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ x: 3 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              data-cursor-label={event.upcoming ? 'EVENT' : undefined}
              className={`glass-card p-5 md:p-6 flex flex-col md:flex-row gap-5 md:gap-8 transition-all duration-300 group relative overflow-hidden cursor-default ${
                event.upcoming
                  ? 'hover:border-one-gold/30'
                  : 'opacity-50 hover:opacity-70'
              }`}
            >
              {/* Left accent bar for upcoming events */}
              {event.upcoming && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-one-gold/60 rounded-l" />
              )}
              <div className="flex items-center md:flex-col md:items-center md:justify-center gap-3 md:gap-1 md:w-20 shrink-0 pl-2 md:pl-0">
                <span className={`font-label ${event.upcoming ? 'text-one-gold' : 'text-one-muted'}`}>{event.month}</span>
                <span className={`font-stat text-3xl ${event.upcoming ? 'text-gold-gradient' : 'text-one-muted'}`}>
                  {event.day}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="font-h4 text-one-white group-hover:text-one-gold transition-colors flex-1">
                    {event.title}
                  </h3>
                  {!event.upcoming && (
                    <span className="font-label text-[9px] px-2 py-0.5 rounded-full border border-one-muted/40 text-one-muted shrink-0">
                      PAST
                    </span>
                  )}
                  {event.upcoming && (
                    <span className="font-label text-[9px] px-2 py-0.5 rounded-full border border-one-gold/40 text-one-gold bg-one-gold/10 shrink-0">
                      UPCOMING
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-body-small text-one-muted mb-3">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>
                <p className="font-body-small text-one-muted mb-4">
                  {event.description}
                </p>
                {event.upcoming && (
                  <button data-cursor-label="INFO" className="inline-flex items-center gap-2 font-label text-one-gold hover:text-one-white transition-colors">
                    More Info
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* â”€â”€â”€ Section 7: Get Involved CTA â”€â”€â”€ */
function GetInvolvedCTA() {
  return (
    <section className="section-padding section-bleed-top bg-surface-glow" data-cursor-label="GET INVOLVED">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <WordReveal text="Be Part of the Story" className="font-h2 text-one-white mb-6 block" as="h2" />
          <p className="font-body text-one-muted max-w-xl mx-auto mb-10">
            Whether you want to volunteer behind the mic, sponsor a local program,
            or help keep community radio alive â€” there is a place for you at ONE FM.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton strength={10}>
              <Link to="/contact" data-cursor-label="VOLUNTEER" className="btn-primary w-full sm:w-auto">
                <HandHeart size={18} />
                Volunteer
              </Link>
            </MagneticButton>
            <MagneticButton strength={8}>
              <Link to="/sponsorship" data-cursor-label="SPONSOR" className="btn-secondary w-full sm:w-auto">
                <Heart size={18} />
                Sponsor
              </Link>
            </MagneticButton>
            <MagneticButton strength={8}>
              <Link to="/support" data-cursor-label="DONATE" className="btn-secondary w-full sm:w-auto">
                <ArrowRight size={18} />
                Donate
              </Link>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* â”€â”€â”€ Page â”€â”€â”€ */
export default function Community() {
  return (
    <Layout>
      <SEO title="Community Directory" description="25 towns, 100+ NFPs, multicultural programming in 5+ languages, and community events across the Goulburn Valley. ONE FM 98.5's community hub." />
      <CommunityHero />
      <CommunityPhotoMosaic />
      <SignalDivider className="bg-[#101010]" />
      <TownDirectory />
      <NFPImpact />
      <CulturalDiversity />
      <EthnicPrograms />
      <EventsCalendar />
      <LatestInterviews />
      <GetInvolvedCTA />
    </Layout>
  )
}

