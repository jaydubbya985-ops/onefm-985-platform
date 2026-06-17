import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { towns } from '@/data/townData'
import { motion, AnimatePresence } from 'framer-motion'
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

/* ─── Animated Grid Background (subtle CSS animation) ─── */
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

/* ─── Section 1: Hero ─── */
function CommunityHero() {
  const stats = [
    { label: 'NFPs Supported', value: '100+' },
    { label: 'People Reached', value: '185,791' },
    { label: 'Weekly Listeners', value: '39,375' },
    { label: 'Events Covered', value: '500+' },
  ]

  return (
    <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden bg-[#050D1A]">
      {/* Real photo bg */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/images/community-outdoor-market.jpg"
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          style={{ opacity: 0.25 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050D1A]/80 via-[#050D1A]/50 to-[#050D1A]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050D1A]/50 via-transparent to-[#050D1A]/50" />
      </div>
      {/* Subtle animated grid on top of photo */}
      <AnimatedGrid />
      <div aria-hidden className="grain-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <span className="section-label">Since 1989</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-hero text-one-white mb-5"
        >
          OUR COMMUNITY
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-body text-one-white/50 max-w-xl mx-auto mb-16 italic"
        >
          25 towns. One voice. 36 years of keeping the Valley connected.
        </motion.p>

        {/* Editorial stat row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-wrap md:flex-nowrap items-stretch justify-center gap-0 max-w-4xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-stretch flex-1 min-w-[140px]">
              <div className="flex flex-col items-center justify-center px-6 py-5 text-center flex-1">
                <div
                  className="text-one-gold font-heading font-black tabular-nums mb-1"
                  style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.03em', lineHeight: 1 }}
                >
                  {stat.value}
                </div>
                <div className="font-label text-one-white/40 uppercase tracking-widest text-[10px] leading-snug max-w-[90px]">
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
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#050D1A] to-transparent z-10 pointer-events-none" />
    </section>
  )
}

/* ─── Section 2: Town Directory ─── */
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
    <section className="section-padding bg-[#070F1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="font-h2 text-one-white mb-4">Town Directory</h2>
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
                  className={`block glass-card p-5 hover:scale-[1.02] hover:border-one-gold/30 transition-all duration-300 group border-l-4 ${sizeColor(town.sizeCategory)}`}
                >
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

/* ─── Section 3: NFP Impact Engine ─── */
function NFPImpact() {
  const categories = [
    {
      icon: Flame,
      title: 'Emergency Services',
      description:
        'Supporting CFA, SES, and local emergency responders with real-time broadcast coordination and community alerts.',
      examples: ['Country Fire Authority — Shepparton', 'Victoria State Emergency Service', 'RoadSafe Goulburn Valley'],
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
      examples: ['Greater Shepparton Secondary College', 'La Trobe University — Shepparton', 'Mooroopna Education & Activity Centre (MEAC)'],
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
      stat: 'GVL — 12 clubs, 500+ games covered',
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
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block font-label text-sage mb-4">IMPACT</span>
          <h2 className="font-h2 text-one-white mb-4">
            100+ Not-for-Profits Supported
          </h2>
          <p className="font-body text-one-muted max-w-2xl mx-auto">
            From emergency responders to arts festivals, ONE FM is the backbone of
            community communication across the Goulburn Valley.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card p-6 hover:border-sage/40 transition-all duration-300 group"
            >
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
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Section 4: Cultural Diversity ─── */
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
      program: 'Punjabi Music Program — Monday 11pm',
      description:
        'A vibrant and growing South Asian community, enriching the Valley with culture, business, and sport.',
    },
    {
      name: 'Samoan',
      towns: ['Shepparton'],
      program: 'Samoan Program — Wednesday 9-10pm',
      description:
        'Hosted by MK (Muagutauti\'a Faletoese Lemamea), connecting the Samoan community through language and music.',
    },
    {
      name: 'Filipino',
      towns: ['Shepparton'],
      program: 'Filipino Music Program — Wednesday 10-11pm',
      description:
        'Hosted by Edith, celebrating Filipino music and culture in the Goulburn Valley.',
    },
    {
      name: 'Swahili / African',
      towns: ['Shepparton'],
      program: 'Africonnect — Monday 9-10pm',
      description:
        'Hosted by Fikiri in Swahili, connecting the African community in the Goulburn Valley.',
    },
    {
      name: 'Chinese / Mandarin',
      towns: ['Shepparton'],
      program: 'Mandarin Program — Various times',
      description:
        'Hosted by Jimmy with co-host Ivy, featuring Mandarin language programming and "Her Quiet Strength" segment.',
    },
  ]

  return (
    <section className="section-padding bg-[#070F1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block font-label text-one-gold mb-4">
            MULTICULTURAL VALLEY
          </span>
          <h2 className="font-h2 text-one-white mb-4">Cultural Diversity</h2>
          <p className="font-body text-one-muted max-w-2xl mx-auto">
            The Goulburn Valley is home to rich multicultural communities that
            make our region unique. ONE FM proudly broadcasts programming in
            multiple languages.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((comm, i) => (
            <motion.div
              key={comm.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card p-6 hover:border-one-gold/30 transition-all duration-300"
            >
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
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Section 5: Ethnic Programming ─── */
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
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block font-label text-one-gold mb-4">
            ON AIR
          </span>
          <h2 className="font-h2 text-one-white mb-4">Ethnic & Multicultural Programming</h2>
          <p className="font-body text-one-muted max-w-2xl mx-auto">
            ONE FM broadcasts in 5+ languages, serving the diverse communities of the Goulburn Valley.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog, i) => (
            <motion.div
              key={`${prog.show}-${prog.presenter}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card p-6 hover:border-one-gold/30 transition-all duration-300 group"
            >
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
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Section 6: Events Calendar ─── */
function EventsCalendar() {
  const [view, setView] = useState<'month' | 'list'>('list')

  const events = [
    {
      date: '2026-05-11',
      month: 'MAY',
      day: '11',
      title: 'Shepparton Mother\'s Day Classic Fun Run',
      location: 'Shepparton',
      description:
        'Annual fun run supporting breast cancer research, with community participation across the Goulburn Valley.',
    },
    {
      date: '2026-03-14',
      month: 'MAR',
      day: '14',
      title: 'Shepparton Italian Festa 2026',
      location: 'Shepparton',
      description:
        'Annual celebration of Italian culture with food, music, and community performances.',
    },
    {
      date: '2026-03-10',
      month: 'MAR',
      day: '10',
      title: 'Shepparton Albanian Harvest Festival 2026',
      location: 'Shepparton',
      description:
        'Celebrating Albanian culture and the agricultural harvest with traditional food, dance, and music.',
    },
    {
      date: '2026-04-25',
      month: 'APR',
      day: '25',
      title: 'ANZAC Day Commemorations',
      location: 'Shepparton Cenotaph & GVL Grounds',
      description:
        'Dawn service and commemorative events across the Goulburn Valley, including special GVL matches.',
    },
    {
      date: '2026-05',
      month: 'MAY',
      day: 'TBC',
      title: 'Salvation Army Under the Same Stars VIP Sleepout',
      location: 'Shepparton',
      description:
        'Annual sleepout event raising awareness and funds for homelessness in the Goulburn Valley.',
    },
    {
      date: '2026-10',
      month: 'OCT',
      day: 'TBC',
      title: 'Fire Relief Festival Community Concert & Fun Day',
      location: 'Cobram',
      description:
        'Community concert and fun day supporting fire recovery efforts, featuring local performers.',
    },
  ]

  return (
    <section className="section-padding bg-[#070F1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block font-label text-one-gold mb-4">
              WHAT'S ON
            </span>
            <h2 className="font-h2 text-one-white">Events Calendar</h2>
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
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card p-5 md:p-6 flex flex-col md:flex-row gap-5 md:gap-8 hover:border-one-gold/30 transition-all duration-300 group"
            >
              <div className="flex items-center md:flex-col md:items-center md:justify-center gap-3 md:gap-1 md:w-20 shrink-0">
                <span className="font-label text-one-gold">{event.month}</span>
                <span className="font-stat text-one-white text-3xl">
                  {event.day}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-h4 text-one-white mb-1 group-hover:text-one-gold transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 font-body-small text-one-muted mb-3">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>
                <p className="font-body-small text-one-white mb-4">
                  {event.description}
                </p>
                <button className="inline-flex items-center gap-2 font-label text-one-gold hover:text-one-white transition-colors">
                  More Info
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Section 7: Get Involved CTA ─── */
function GetInvolvedCTA() {
  return (
    <section className="section-padding bg-[#070F1C]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-h2 text-one-white mb-6">Be Part of the Story</h2>
          <p className="font-body text-one-muted max-w-xl mx-auto mb-10">
            Whether you want to volunteer behind the mic, sponsor a local program,
            or help keep community radio alive — there is a place for you at ONE FM.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact" className="btn-primary w-full sm:w-auto">
              <HandHeart size={18} />
              Volunteer
            </Link>
            <Link to="/sponsorship" className="btn-secondary w-full sm:w-auto">
              <Heart size={18} />
              Sponsor
            </Link>
            <Link to="/support" className="btn-secondary w-full sm:w-auto">
              <ArrowRight size={18} />
              Donate
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Page ─── */
export default function Community() {
  return (
    <Layout>
      <SEO title="Community Directory" description="25 towns, 100+ NFPs, multicultural programming in 5+ languages, and community events across the Goulburn Valley. ONE FM 98.5's community hub." />
      <CommunityHero />
      <TownDirectory />
      <NFPImpact />
      <CulturalDiversity />
      <EthnicPrograms />
      <EventsCalendar />
      <GetInvolvedCTA />
    </Layout>
  )
}
