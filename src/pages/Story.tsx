import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { motion } from 'framer-motion'
import {
  Radio,
  Mic,
  Calendar,
  MapPin,
  Users,
  Heart,
  Zap,
  Globe,
  Award,
  TrendingUp,
  ChevronRight,
  Quote,
  Wifi,
  Speaker,
  Monitor,
  Building2,
  Layers,
} from 'lucide-react'

/* ─── Ken Burns keyframes (scoped style block) ─── */
function KenBurnsStyle() {
  return (
    <style>{`
      @keyframes ken-burns {
        0% { transform: scale(1) translate(0, 0); }
        50% { transform: scale(1.08) translate(-1%, -1%); }
        100% { transform: scale(1) translate(0, 0); }
      }
      .animate-ken-burns {
        animation: ken-burns 20s ease-in-out infinite;
      }
    `}</style>
  )
}

/* ─── Timeline data ─── */
const milestones = [
  {
    year: "1989",
    title: "ONE FM Founded",
    desc: "A small group of passionate volunteers launched 98.5 FM in Shepparton, giving the Goulburn Valley its first true community voice. Broadcasting from studios in Shepparton as 3ONE.",
    img: "/assets/images/studio-exterior-rainbow.jpg",
    icon: Radio,
  },
  {
    year: "1995",
    title: "First GVL Broadcast Partnership",
    desc: "Signed a landmark agreement with the Goulburn Valley League to broadcast live football and netball matches. The partnership continues strong three decades later, making ONE FM the trusted voice of local sport.",
    img: "/assets/images/community-outdoor-market.jpg",
    icon: Mic,
  },
  {
    year: "2001",
    title: "Community Radio Plus App Launched",
    desc: "Pioneered digital streaming for regional community radio in Australia. Listeners could suddenly tune in from anywhere in the world, expanding the station's reach far beyond the broadcast tower.",
    img: "/assets/images/studio-exterior-rainbow.jpg",
    icon: Wifi,
  },
  {
    year: "2008",
    title: "Moved to New Studios",
    desc: "Relocated to purpose-built studios with digital mixing desks, soundproofed broadcast booths and a dedicated production suite. The new home set the standard for regional radio infrastructure.",
    img: "/assets/images/studio-exterior-rainbow.jpg",
    icon: Building2,
  },
  {
    year: "2014",
    title: "25th Anniversary — 25 Towns",
    desc: "Celebrated a quarter-century by visiting 25 towns across the Goulburn Valley in 25 days. A convoy of broadcast gear, live music and giveaways brought the party to every corner of the listening area.",
    img: "/assets/images/geo-lake-aerial.jpg",
    icon: MapPin,
  },
  {
    year: "2019",
    title: "30th Anniversary Special Broadcast",
    desc: "A 30-hour non-stop broadcast marathon featuring every host in the station's history, live music from 30 local acts, and a fundraising drive that raised over $120,000 for regional mental health services.",
    img: "/assets/images/community-outdoor-market.jpg",
    icon: Award,
  },
  {
    year: "2020",
    title: "Emergency Broadcasting",
    desc: "When bushfires raged and COVID-19 swept the nation, ONE FM became a critical information lifeline. Provided 24/7 emergency updates, relief coordination messages and community support hotlines.",
    img: "/assets/images/geo-lake-aerial.jpg",
    icon: Zap,
  },
  {
    year: "2025",
    title: "36th Year — Modern Digital Expansion",
    desc: "36th year of community broadcasting — expanded online streaming via fm985.com.au and Radio.co, growing podcast presence, and continued GVL sports coverage for the Goulburn Murray.",
    img: "/assets/images/studio-exterior-rainbow.jpg",
    icon: TrendingUp,
  },
]

/* ─── Team data ─── */
const team = [
  { name: "Tim Ahemt", role: "Breakfast Host (Mon–Tue)", years: "2026", cat: "On-Air", img: "/assets/images/commentary-box-action.jpg", quote: "Hosts ONE FM Breakfast Monday and Tuesday — community interviews and local news." },
  { name: "The Big G (Craig Stott)", role: "Breakfast (Wed) / Tuesday Mornings", years: "2026", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Wednesday breakfast and Tuesday morning music on ONE FM." },
  { name: "Ralph Whitehead", role: "Breakfast (Thu) / Friday Arvo", years: "", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Thursday breakfast and Friday afternoon music. Long-time community radio presenter in Shepparton." },
  { name: "Josh Revens", role: "Breakfast (Fri) / Monday Nights", years: "", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Friday breakfast and Monday night community programming." },
  { name: "Johnny P (John Painter)", role: "Host — Dancing through the decades", years: "4", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Been on air for 4 years. Married to Eryl, lives in Mooroopna. Has 6 kids between them. Enjoys playing music from across the decades." },
  { name: "James Manley", role: "Host — The James Manley Show", years: "", cat: "On-Air", img: "/assets/images/commentary-box-action.jpg", quote: "Community-focused afternoon programming Mon–Tue with local interviews and advocacy." },
  { name: "Carlos Rock", role: "Host — Planet of Sound", years: "19-20", cat: "On-Air", img: "/assets/images/studio-sbs-diversity.jpg", quote: "Has been on air for 19-20 years. Hosts the Planet of Sound program featuring rock music from across the decades." },
  { name: "Ralph Whitehead", role: "Host — Friday Arvo / Friday Morning", years: "", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Married in 1966. Moved to Shepparton during the 1976 Christmas break. Long-time audio enthusiast and community radio presenter." },
  { name: "Timmy Ahmet", role: "Host — Good Evening Country", years: "", cat: "On-Air", img: "/assets/images/studio-sbs-diversity.jpg", quote: "Hosts the Good Evening Country program featuring country music." },
  { name: "Les 'Harro' Harrison", role: "Community Host / Various", years: "", cat: "On-Air", img: "/assets/images/commentary-box-action.jpg", quote: "Spent working life in education, in charge of schools for over 35 years. Interests include cricket, cycling, fishing, golf and being an active member of his local Lions Club." },
  { name: "Josh Revens", role: "Community Interviews / Various", years: "", cat: "On-Air", img: "/assets/images/studio-commentary-selfie.jpg", quote: "ONE FM announcer who conducts community interviews covering local events, sports, and community initiatives." },
  { name: "Fikiri", role: "Host — Africonnect (Swahili)", years: "", cat: "Multicultural", img: "/assets/images/studio-sbs-diversity.jpg", quote: "Hosts the Africonnect program in Swahili, connecting the African community in the Goulburn Valley." },
  { name: "MK (Muagutauti'a Faletoese Lemamea)", role: "Host — Samoan Program", years: "", cat: "Multicultural", img: "/assets/images/commentary-box-action.jpg", quote: "Hosts the Samoan language program connecting the Samoan community in the Goulburn Valley." },
  { name: "Edith", role: "Host — Filipino Music Program", years: "", cat: "Multicultural", img: "/assets/images/studio-commentary-selfie.jpg", quote: "Hosts the Filipino music program celebrating Filipino culture and music." },
  { name: "Jimmy", role: "Host — Mandarin Program / Her Quiet Strength", years: "", cat: "Multicultural", img: "/assets/images/studio-sbs-diversity.jpg", quote: "Hosts the Mandarin language program and 'Her Quiet Strength' segment. Interviews guests in Mandarin with co-host Ivy." },
]

const teamCategories = ["All", "On-Air", "Multicultural"]

/* ─── Studio cards ─── */
const studios = [
  {
    title: "Main Studio",
    desc: "Flagship broadcast suite with digital mixing console, multi-channel routing and live-to-air monitoring.",
    icon: Speaker,
    specs: ["24ch digital mixer", "ON-AIR / MIC LIVE switch", "Program & preview bus"],
  },
  {
    title: "Production Suite",
    desc: "Dedicated editing and pre-production room for commercials, podcasts and promotional content.",
    icon: Monitor,
    specs: ["Adobe Audition + Pro Tools", "Acoustic treatment", "ISDN & remote link"],
  },
  {
    title: "Broadcast Equipment",
    desc: "100km broadcast radius covering the entire Goulburn Valley and beyond into northern Victoria.",
    icon: Wifi,
    specs: ["100km radius", "Digital streaming", "HD simulcast ready"],
  },
  {
    title: "Community Space",
    desc: "Open-plan area for live performances, interview panels and community group recordings.",
    icon: Users,
    specs: ["40 person capacity", "Live band setup", "Video capture"],
  },
]

/* ─── Forward pillars — factual station commitments only ─── */
const pillars = [
  {
    title: "Live & Local",
    desc: "Continuing 24/7 community broadcasting from Shepparton, with local presenters, local news, and local music across the Goulburn Murray.",
    icon: Layers,
  },
  {
    title: "Online Streaming",
    desc: "FM 98.5 plus online streaming via fm985.com.au and Radio.co, so listeners across the Valley and beyond can tune in anywhere.",
    icon: Globe,
  },
  {
    title: "Community Partnership",
    desc: "Supporting 100+ local NFPs on-air, GVL sports coverage, and emergency broadcasting for the 25 towns in our 100km broadcast area.",
    icon: Heart,
  },
]

export default function Story() {
  const [teamFilter, setTeamFilter] = useState("All")

  const filteredTeam = teamFilter === "All"
    ? team
    : team.filter((t) => t.cat === teamFilter)

  return (
    <Layout>
      <SEO title="Our Story" description="The story of ONE FM 98.5 — from 1989 to today. Callsign 3ONE, ACMA License 1385226/1. Meet the real presenters behind the mic." />
      <KenBurnsStyle />

      {/* ═══════ Section 1 — Hero ═══════ */}
      <section className="relative min-h-[85dvh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/images/geo-lake-aerial.jpg"
            alt="Goulburn Valley landscape"
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-one-navy/70" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <span className="inline-block font-label text-one-gold mb-6 px-4 py-2 rounded-full border border-one-gold/30 bg-one-gold/10">
              COMMUNITY RADIO SINCE 1989
            </span>
            <h1 className="font-h1 text-one-white mb-6">OUR STORY</h1>
            <p className="font-body text-one-white text-lg md:text-xl max-w-2xl mx-auto mb-8">
              36 years of keeping the Valley connected — through flood, fire, footy finals and everything in between.
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="font-stat text-one-gold">1989</span>
              <span className="w-16 h-px bg-one-gold/40" />
              <span className="font-stat text-one-white">2025</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ Section 2 — Station Info ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="glass-card p-8 mb-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-micro text-one-muted mb-1">Callsign</div>
              <div className="font-stat text-one-gold text-2xl">3ONE</div>
            </div>
            <div>
              <div className="font-micro text-one-muted mb-1">Frequency</div>
              <div className="font-stat text-one-gold text-2xl">98.5 FM</div>
            </div>
            <div>
              <div className="font-micro text-one-muted mb-1">ACMA License</div>
              <div className="font-stat text-one-gold text-2xl">1385226/1</div>
            </div>
            <div>
              <div className="font-micro text-one-muted mb-1">Organisation</div>
              <div className="font-label text-one-white text-sm">Goulburn Valley Community Radio Inc.</div>
              <div className="font-micro text-one-gold mt-1">APRA AMCOS Licensed</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <h2 className="font-h2 text-one-white mb-3">Our Heritage</h2>
          <p className="font-body text-one-white max-w-2xl mx-auto">
            From a single studio above a shop to the region's most trusted broadcaster — the journey of ONE FM 98.5.
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
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className={`relative flex items-start gap-6 md:gap-0 mb-16 last:mb-0 ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* timeline node */}
                <div className="absolute left-4 md:left-1/2 top-0 w-3 h-3 rounded-full bg-one-gold border-4 border-one-navy md:-translate-x-[5px] z-10" />

                {/* content card */}
                <div className={`pl-10 md:pl-0 md:w-1/2 ${isLeft ? "md:pr-12" : "md:pl-12"}`}>
                  <div className="glass-card p-6 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-one-gold/10 flex items-center justify-center">
                        <Icon size={18} className="text-one-gold" />
                      </div>
                      <span className="font-stat text-one-gold">{m.year}</span>
                    </div>
                    <h3 className="font-h3 text-one-white mb-2">{m.title}</h3>
                    <p className="font-body-small text-one-white mb-4">{m.desc}</p>
                    <div className="rounded-lg overflow-hidden border border-one-border aspect-video">
                      <img
                        src={m.img}
                        alt={m.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ═══════ Section 3 — The Team ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <h2 className="font-h2 text-one-white mb-3">Meet the Voices of the Valley</h2>
            <p className="font-body text-one-white max-w-xl">
              Our team is a mix of lifelong locals and passionate broadcasters who found their home at ONE FM.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {teamCategories.map((c) => (
              <button
                key={c}
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
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass-card overflow-hidden group"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-one-navy via-one-navy/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="font-label text-[10px] px-2 py-0.5 rounded bg-one-gold text-one-navy mb-2 inline-block">
                    {member.cat}
                  </span>
                  <h4 className="font-h4 text-one-white">{member.name}</h4>
                  <p className="font-body-small text-one-gold">{member.role}</p>
                </div>
              </div>
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
          ))}
        </div>
      </section>

      {/* ═══════ Section 4 — Studio & Facilities ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-12"
        >
          <h2 className="font-h2 text-one-white mb-3">Behind the Scenes</h2>
          <p className="font-body text-one-white max-w-xl">
            Our facilities combine heritage warmth with modern broadcast technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden border border-one-border aspect-video lg:aspect-auto lg:min-h-[400px] relative"
          >
            <img
              src="/assets/images/studio-exterior-rainbow.jpg"
              alt="ONE FM studio control room"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-one-navy/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-h3 text-one-white mb-1">Studio Control Room</h3>
              <p className="font-body-small text-one-white">Where the magic happens, every single day.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studios.map((studio, i) => {
              const Icon = studio.icon
              return (
                <motion.div
                  key={studio.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="glass-card p-5 flex flex-col gap-3"
                >
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
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════ Section 5 — Community Impact ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-h2 text-one-white mb-6">Community Impact</h2>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="font-stat text-one-gold">500+</p>
                <p className="font-label text-muted mt-1">Events Covered</p>
              </div>
              <div>
                <p className="font-stat text-one-gold">100+</p>
                <p className="font-label text-muted mt-1">NFPs Supported On-Air</p>
              </div>
              <div>
                <p className="font-stat text-one-gold">24/7</p>
                <p className="font-label text-muted mt-1">Emergency Alerts</p>
              </div>
              <div>
                <p className="font-stat text-one-gold">12,000+</p>
                <p className="font-label text-muted mt-1">Youth Engaged</p>
              </div>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-amber">
              <Quote size={24} className="text-one-gold/40 mb-3" />
              <p className="font-body text-one-white italic mb-4">
                "When the 2022 floods cut our town off, ONE FM was the only way we knew what was happening. They saved lives, simple as that."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-one-gold/20 flex items-center justify-center">
                  <Users size={16} className="text-one-gold" />
                </div>
                <div>
                  <p className="font-body-small text-one-white font-medium">Margaret Tresize</p>
                  <p className="font-body-small text-muted">Community Leader, Rochester</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden border border-one-border aspect-[4/3] relative"
          >
            <img
              src="/community-outdoor-market.jpg"
              alt="ONE FM community event"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-one-navy/60 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ═══════ Section 6 — Looking Forward ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-7xl mx-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <h2 className="font-h2 text-one-white mb-3">Looking Forward</h2>
          <p className="font-body text-one-white max-w-2xl mx-auto">
            The next chapter of ONE FM blends our heritage values with tomorrow's technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                whileHover={{ y: -6 }}
                className="glass-card p-8 flex flex-col items-center text-center gap-5 group cursor-default"
              >
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
            )
          })}
        </div>
      </section>
    </Layout>
  )
}
