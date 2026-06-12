import { useState, useEffect, memo } from 'react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic2,
  Clock,
  Music,
  Headphones,
  Send,
  CheckCircle2,
  Filter,
  Calendar,
  Trophy,
  Smartphone,
  Play,
  Headset,
  ChevronRight,
  Wifi,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────── */
/*  RadioWaveBackground — isolated perpetual animation        */
/* ────────────────────────────────────────────────────────── */
const RadioWaveBackground = memo(function RadioWaveBackground() {
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-1 opacity-20 pointer-events-none overflow-hidden pb-12">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-gradient-to-t from-one-gold to-one-gold rounded-full animate-waveform"
          style={{
            height: `${Math.random() * 60 + 20}%`,
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${0.8 + Math.random() * 0.6}s`,
          }}
        />
      ))}
    </div>
  )
})

/* ────────────────────────────────────────────────────────── */
/*  ON AIR NOW indicator                                      */
/* ────────────────────────────────────────────────────────── */
function OnAirNow() {
  const [show, setShow] = useState("Breaky with Plemo")
  const [timeSlot, setTimeSlot] = useState("6:00AM — 9:00AM")
  const [host, setHost] = useState("Plemo")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 9) {
      setShow("Breaky with Plemo")
      setTimeSlot("6:00AM — 9:00AM")
      setHost("Plemo")
    } else if (hour >= 9 && hour < 12) {
      setShow("Dancing through the decades")
      setTimeSlot("9:00AM — 12:00PM")
      setHost("Johnny P")
    } else if (hour >= 12 && hour < 15) {
      setShow("The Regional Voice")
      setTimeSlot("12:00PM — 3:00PM")
      setHost("Rowan Farren-Parnell")
    } else if (hour >= 15 && hour < 18) {
      setShow("The Regional Voice")
      setTimeSlot("12:00PM — 3:00PM")
      setHost("Rowan Farren-Parnell")
    } else {
      setShow("Overnight Mix")
      setTimeSlot("12:00AM — 6:00AM")
      setHost("Auto")
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="glass-card px-6 py-4 flex items-center gap-4 max-w-md mx-auto mt-10"
    >
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-one-red" />
      </span>
      <div className="text-left">
        <p className="font-label text-one-red mb-0.5">ON AIR NOW</p>
        <p className="font-h4 text-one-white">{show}</p>
        <p className="font-body-small text-muted">with {host} &middot; {timeSlot}</p>
      </div>
      <Wifi size={20} className="text-one-gold ml-auto shrink-0" />
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  Section 2 — Featured Shows                                */
/* ────────────────────────────────────────────────────────── */
const shows = [
  {
    name: "Breaky with Plemo",
    time: "Mon–Fri, 6am–9am",
    host: "Plemo",
    desc: "Breakfast show with community interviews, local news, and music. The Valley's essential morning companion.",
    tag: "Breakfast",
    icon: Mic2,
  },
  {
    name: "Dancing through the decades",
    time: "Mon–Fri, 9am–12pm",
    host: "Johnny P",
    desc: "Music from across the decades with Johnny P. Four years on air, playing the hits that span generations.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "The Regional Voice",
    time: "Mon–Fri, 12pm–3pm",
    host: "Rowan Farren-Parnell",
    desc: "Community-focused programming with local interviews and advocacy. The issues that matter to the Valley.",
    tag: "Community",
    icon: Headphones,
  },
  {
    name: "Planet of Sound",
    time: "Thursday nights, 11pm",
    host: "Carlos Rock",
    desc: "Rock music program spanning 19-20 years on air. The definitive rock show for the Goulburn Valley.",
    tag: "Music",
    icon: Headset,
  },
  {
    name: "Good Evening Country",
    time: "Friday, 8pm",
    host: "Timmy Ahmet",
    desc: "Country music showcase Friday evenings. The best country classics and new releases.",
    tag: "Music",
    icon: Music,
  },
  {
    name: "Super Saturday Sports Show",
    time: "Saturday",
    host: "Craig Stott & Various",
    desc: "Comprehensive local sports coverage including GVL Football & Netball, cricket, bowls, tennis and harness racing.",
    tag: "Sport",
    icon: Trophy,
  },
]

/* ────────────────────────────────────────────────────────── */
/*  Section 3 — Host Roster                                   */
/* ────────────────────────────────────────────────────────── */
const hosts = [
  { name: "Plemo", show: "Breaky with Plemo", time: "Mon–Fri, 6am–9am", type: "Breakfast", img: "/on-air-host-1.jpg", social: { fb: true, tw: true } },
  { name: "Johnny P (John Painter)", show: "Dancing through the decades", time: "Mon–Fri, 9am–12pm", type: "Music", img: "/on-air-host-2.jpg", social: { fb: true, ig: true } },
  { name: "Rowan Farren-Parnell", show: "The Regional Voice / The Advocate", time: "Mon–Fri, 12pm–3pm", type: "Community", img: "/on-air-host-1.jpg", social: { fb: true } },
  { name: "Carlos Rock", show: "Planet of Sound", time: "Thursday nights, 11pm", type: "Music", img: "/on-air-host-3.jpg", social: { fb: true } },
  { name: "Ralph Whitehead", show: "Friday Arvo / Friday Morning", time: "Friday afternoons / mornings", type: "Music", img: "/on-air-host-2.jpg", social: { ig: true, tw: true } },
  { name: "Roman Koz", show: "Friday Mornings", time: "Friday mornings", type: "Music", img: "/on-air-host-3.jpg", social: { tw: true } },
  { name: "Timmy Ahmet", show: "Good Evening Country", time: "Friday, 8pm", type: "Music", img: "/on-air-host-2.jpg", social: { ig: true } },
  { name: "Ken & Jill Gaffney", show: "Winding Back", time: "[DATA_MISSING_FROM_SOURCE]", type: "Music", img: "/on-air-host-1.jpg", social: { fb: true, ig: true } },
  { name: "Les 'Harro' Harrison", show: "Various", time: "Various", type: "Community", img: "/on-air-host-3.jpg", social: { fb: true } },
  { name: "Michael Costello", show: "River Allsorts", time: "[DATA_MISSING_FROM_SOURCE]", type: "Community", img: "/on-air-host-1.jpg", social: { fb: true, ig: true } },
  { name: "Craig Stott", show: "Super Saturday Sports Show", time: "Saturday", type: "Sport", img: "/on-air-host-2.jpg", social: { fb: true } },
  { name: "Josh Revens", show: "Community Interviews / Various", time: "Various", type: "Community", img: "/on-air-host-3.jpg", social: { tw: true } },
  { name: "Fikiri", show: "Africonnect (Swahili)", time: "Monday, 9-10pm", type: "Multicultural", img: "/on-air-host-1.jpg", social: { fb: true } },
  { name: "MK (Muagutauti'a Faletoese Lemamea)", show: "Samoan Program", time: "Wednesday, 9-10pm", type: "Multicultural", img: "/on-air-host-2.jpg", social: { ig: true } },
  { name: "Edith", show: "Filipino Music Program", time: "Wednesday, 10-11pm", type: "Multicultural", img: "/on-air-host-3.jpg", social: { fb: true, ig: true } },
  { name: "Jimmy", show: "Mandarin Program / Her Quiet Strength", time: "Various", type: "Multicultural", img: "/on-air-host-1.jpg", social: { fb: true, ig: true } },
]

const hostFilters = ["All", "Breakfast", "Sport", "Music", "Community", "Multicultural"]

/* ────────────────────────────────────────────────────────── */
/*  Section 4 — GVL Broadcast Schedule                        */
/* ────────────────────────────────────────────────────────── */
const rounds = [
  {
    round: "Round 2",
    date: "April 11",
    fixtures: [
      { match: "Tatura Bulldogs vs Mooroopna Cats", time: "6:00PM", station: "SEN Goulburn Valley 1260AM", oneFm: false },
      { match: "Shepp Swans vs Kyabram", time: "2:00PM", station: "ONE FM 98.5", oneFm: true },
      { match: "Shepparton vs Seymour Lions", time: "2:00PM", station: "Seymour 103.9", oneFm: false },
    ],
  },
  {
    round: "Round 3",
    date: "April 18",
    fixtures: [
      { match: "Echuca vs Rochester", time: "2:00PM", station: "ONE FM 98.5", oneFm: true },
      { match: "Mansfield vs Benalla", time: "2:00PM", station: "SEN 1260AM", oneFm: false },
      { match: "Euroa vs Shepp United", time: "6:00PM", station: "ONE FM 98.5", oneFm: true },
    ],
  },
  {
    round: "Round 4",
    date: "April 25",
    fixtures: [
      { match: "ANZAC Day — Kyabram vs Mooroopna", time: "10:00AM", station: "ONE FM 98.5", oneFm: true },
      { match: "ANZAC Day — Shepparton vs Tatura", time: "2:00PM", station: "ONE FM 98.5", oneFm: true },
      { match: "ANZAC Day — Seymour vs Echuca", time: "2:00PM", station: "Seymour 103.9", oneFm: false },
    ],
  },
]

/* ────────────────────────────────────────────────────────── */
/*  Section 5 — Podcasts                                      */
/* ────────────────────────────────────────────────────────── */
const podcasts = [
  {
    title: "Holding Centre Court",
    hosts: "GVL Commentary Team",
    eps: 48,
    latest: "Ep 48 — Finals preview special",
    desc: "GVL footy and netball deep dives, player interviews and expert analysis every week during the season.",
  },
  {
    title: "The Stats Man",
    hosts: "The Stats Man",
    eps: 24,
    latest: "GVL Football & Netball season preview",
    desc: "GVL Football & Netball season previews and round-by-round analysis. Essential listening for GVL fans.",
  },
  {
    title: "Sport And Road",
    hosts: "Bill Winters & Various",
    eps: 36,
    latest: "Weekly sports coverage",
    desc: "Weekly sports coverage including local football, netball, cricket and racing with RoadSafe Goulburn Valley.",
  },
]

/* ────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                 */
/* ────────────────────────────────────────────────────────── */
export default function Programs() {
  const [hostFilter, setHostFilter] = useState("All")
  const [requestName, setRequestName] = useState("")
  const [requestSong, setRequestSong] = useState("")
  const [requestMsg, setRequestMsg] = useState("")
  const [requestSent, setRequestSent] = useState(false)

  const filteredHosts = hostFilter === "All"
    ? hosts
    : hosts.filter((h) => h.type === hostFilter)

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (requestName && requestSong) {
      setRequestSent(true)
      setTimeout(() => {
        setRequestSent(false)
        setRequestName("")
        setRequestSong("")
        setRequestMsg("")
      }, 4000)
    }
  }

  return (
    <Layout>
      <SEO title="Programs & Shows" description="Breaky with Plemo, Dancing through the decades, The Regional Voice, GVL Game Day, podcasts, and more. Explore ONE FM 98.5's program lineup with 16 real presenters." />
      {/* ═══════ Section 1 — Hero ═══════ */}
      <section className="relative min-h-[80dvh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <RadioWaveBackground />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative z-10"
        >
          <p className="font-label text-one-gold mb-4">SHEPPARTON • VICTORIA • 98.5 FM</p>
          <h1 className="font-h1 text-one-white mb-6">PROGRAMS & SHOWS</h1>
          <p className="font-body text-one-white max-w-2xl mx-auto">
            Local voices, local stories, local music — 24/7.
          </p>
        </motion.div>
        <OnAirNow />
      </section>

      {/* ═══════ Section 2 — Featured Shows ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-12"
        >
          <h2 className="font-h2 text-one-white mb-3">Featured Shows</h2>
          <p className="font-body text-one-white max-w-xl">
            From dawn till dark, our presenters keep the Valley informed, entertained and connected.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show, i) => (
            <motion.div
              key={show.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-6 flex flex-col gap-4 group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-full bg-one-gold/10 flex items-center justify-center">
                  <show.icon size={22} className="text-one-gold" />
                </div>
                <span className="font-label text-xs px-3 py-1 rounded-full bg-one-gold/10 text-one-gold border border-one-gold/20">
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
              <div className="pt-4 border-t border-one-border flex items-center gap-2">
                <Mic2 size={14} className="text-muted" />
                <span className="font-body-small text-muted">{show.host}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ Section 3 — Host Roster ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <h2 className="font-h2 text-one-white mb-3">Host Roster</h2>
            <p className="font-body text-one-white max-w-xl">
              Meet the voices behind the mic. 16 presenters keeping the Valley connected.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hostFilters.map((f) => (
              <button
                key={f}
                onClick={() => setHostFilter(f)}
                className={`font-label text-xs px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-2 ${
                  hostFilter === f
                    ? "bg-one-gold text-one-navy border-one-gold"
                    : "bg-transparent text-one-white border-ivory/30 hover:border-ivory hover:bg-ivory/5"
                }`}
              >
                {f === "All" && <Filter size={12} />}
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredHosts.map((host) => (
              <motion.div
                key={host.name + host.show}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="glass-card p-5 group"
              >
                <div className="relative mb-4 overflow-hidden rounded-lg aspect-[4/5]">
                  <img
                    src={host.img}
                    alt={host.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-one-navy/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="font-label text-[10px] px-2 py-0.5 rounded bg-one-gold text-one-navy">
                      {host.type}
                    </span>
                  </div>
                </div>
                <h4 className="font-h4 text-one-white">{host.name}</h4>
                <p className="font-body-small text-one-gold mt-1">{host.show}</p>
                <p className="font-body-small text-muted mt-0.5 flex items-center gap-1.5">
                  <Clock size={12} />
                  {host.time}
                </p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-one-border">
                  {host.social.fb && (
                    <span className="text-muted hover:text-one-white transition-colors cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </span>
                  )}
                  {host.social.ig && (
                    <span className="text-muted hover:text-one-white transition-colors cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </span>
                  )}
                  {host.social.tw && (
                    <span className="text-muted hover:text-one-white transition-colors cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ═══════ Section 4 — GVL Broadcast Schedule ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <Trophy size={28} className="text-one-gold" />
            <h2 className="font-h2 text-one-white">GVL FOOTBALL & NETBALL BROADCASTS</h2>
          </div>
          <p className="font-body text-one-white max-w-2xl">
            ONE FM 98.5 is the home of Goulburn Valley League coverage. Catch every big game live across our network of partner stations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {rounds.map((round, ri) => (
            <motion.div
              key={round.round}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: ri * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-one-border">
                <div>
                  <h3 className="font-h3 text-one-white">{round.round}</h3>
                  <p className="font-label text-muted flex items-center gap-2 mt-1">
                    <Calendar size={12} />
                    {round.date}
                  </p>
                </div>
                <span className="font-stat text-one-gold">{round.fixtures.length}</span>
              </div>
              <div className="space-y-4">
                {round.fixtures.map((fixture, fi) => (
                  <div
                    key={fi}
                    className={`p-4 rounded-lg border transition-colors ${
                      fixture.oneFm
                        ? "bg-one-gold/5 border-one-gold/20"
                        : "bg-one-navy/40 border-one-border"
                    }`}
                  >
                    <p className="font-body-small text-one-white font-medium">{fixture.match}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-label text-muted flex items-center gap-1.5">
                        <Clock size={11} />
                        {fixture.time}
                      </span>
                      <span className={`font-label text-[10px] px-2 py-0.5 rounded ${
                        fixture.oneFm
                          ? "bg-one-gold text-one-navy"
                          : "bg-one-navy text-muted border border-one-border"
                      }`}>
                        {fixture.station}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-data-teal/10 flex items-center justify-center">
              <Smartphone size={22} className="text-data-teal" />
            </div>
            <div>
              <p className="font-h4 text-one-white">Live Scoring on the GVL App</p>
              <p className="font-body-small text-one-white">Real-time scores, stats and match previews in your pocket.</p>
            </div>
          </div>
          <button className="btn-primary text-xs shrink-0">
            Download the GVL App Now
            <ChevronRight size={14} />
          </button>
        </motion.div>
      </section>

      {/* ═══════ Section 5 — Podcasts & On-Demand ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-12"
        >
          <h2 className="font-h2 text-one-white mb-3">Podcasts & On-Demand</h2>
          <p className="font-body text-one-white max-w-xl">
            Catch up on what you missed. Our podcasts are available everywhere you listen.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {podcasts.map((pod, i) => (
            <motion.div
              key={pod.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-6 flex flex-col gap-4 group cursor-pointer"
            >
              <div className="w-full aspect-square rounded-lg bg-one-navy/60 border border-one-border flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-one-gold/10 to-sage/10" />
                <Headphones size={48} className="text-one-gold/40 relative z-10" />
              </div>
              <div>
                <h3 className="font-h3 text-one-white group-hover:text-one-gold transition-colors">{pod.title}</h3>
                <p className="font-body-small text-muted mt-1">{pod.hosts}</p>
              </div>
              <p className="font-body-small text-one-white flex-1">{pod.desc}</p>
              <div className="pt-4 border-t border-one-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-label text-muted">{pod.eps} episodes</span>
                  <span className="font-label text-one-gold flex items-center gap-1">
                    <Play size={12} />
                    Listen
                  </span>
                </div>
                <p className="font-body-small text-one-white/80">Latest: {pod.latest}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ Section 6 — Request a Song ═══════ */}
      <section className="section-padding px-4 sm:px-6 max-w-3xl mx-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-12"
        >
          <h2 className="font-h2 text-one-white mb-3">Request a Song / Shoutout</h2>
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
          <AnimatePresence mode="wait">
            {requestSent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center py-12"
              >
                <CheckCircle2 size={56} className="text-data-teal mb-4" />
                <h3 className="font-h3 text-one-white mb-2">Request Received!</h3>
                <p className="font-body text-one-white max-w-md">
                  Thanks {requestName}, your request for "{requestSong}" has been sent to the studio. Keep listening!
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
                  <label className="font-label text-muted mb-2 block">Your Name</label>
                  <input
                    type="text"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="e.g. Jamie from Tatura"
                    className="w-full bg-one-navy/60 border border-one-border rounded-lg px-4 py-3 font-body text-one-white placeholder:text-muted focus:outline-none focus:border-one-gold focus:ring-2 focus:ring-amber/15 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="font-label text-muted mb-2 block">Song Request</label>
                  <input
                    type="text"
                    value={requestSong}
                    onChange={(e) => setRequestSong(e.target.value)}
                    placeholder="Song title and artist"
                    className="w-full bg-one-navy/60 border border-one-border rounded-lg px-4 py-3 font-body text-one-white placeholder:text-muted focus:outline-none focus:border-one-gold focus:ring-2 focus:ring-amber/15 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="font-label text-muted mb-2 block">Dedication Message</label>
                  <textarea
                    value={requestMsg}
                    onChange={(e) => setRequestMsg(e.target.value)}
                    placeholder="Who is this for? Any special message?"
                    rows={4}
                    className="w-full bg-one-navy/60 border border-one-border rounded-lg px-4 py-3 font-body text-one-white placeholder:text-muted focus:outline-none focus:border-one-gold focus:ring-2 focus:ring-amber/15 transition-all resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  <Send size={16} />
                  Send Request
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </Layout>
  )
}
