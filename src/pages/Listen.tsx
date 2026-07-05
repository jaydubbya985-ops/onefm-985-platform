/**
 * LISTEN — rebuilt per REBUILD-SPEC.md (page 2 of 6).
 * Absorbs Programs + Broadcast Explorer. Assembled from the ON AIR kit.
 * Old 604-line page retired; real content and hooks preserved.
 */
import { Loader2, Pause, Play, Phone, Radio, Wifi } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { WeeklySchedule } from '@/components/WeeklySchedule'
import { LatestInterviews } from '@/components/LatestInterviews'
import { OnAirTicker, NameWall, StatsStrip, LabelReveal, PosterReveal, StrokeFill } from '@/components/onair/kit'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { stationStats } from '@/data/pricing'

const RED = '#E51636'
const LIME = '#B6FF00'

/** Real weekly presenters — source: programGuide.ts (fm985.com.au/guide). */
const WEEK_WALL = [
  { name: 'Tim Ahemt', sub: 'ONE FM Breakfast · Mon & Tue', img: '/on-air-host-1.jpg' },
  { name: 'The Big G', sub: 'Craig Stott · Wednesday Breakfast', img: '/studio-control-room.jpg' },
  { name: 'Ralph Whitehead', sub: 'Thursday Breakfast', img: '/assets/images/studio-presenter-mic.jpg' },
  { name: 'Josh Revens', sub: 'Friday Breakfast · Live Music', img: '/assets/images/ob-van-branded.jpg' },
  { name: 'Tim Symonds', sub: 'The Essential Hits', img: '/assets/images/heritage-truck-2005.jpg' },
  { name: 'Di Hunter', sub: 'On Air Since the Early Days', img: '/assets/images/heritage-di-hunter-carols-2014.jpg' },
]

function ListenHero() {
  const { playing, loading, toggle } = useLiveStream()
  const meta = usePlayerMetadata()
  return (
    <section className="relative px-6 md:px-12 lg:px-20 pt-24 pb-16 min-h-[80vh] flex flex-col justify-center">
      <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(56px,11vw,160px)]">
        <PosterReveal lines={[
          <span key="a" className="poster-hover">Listen</span>,
          <span key="b"><StrokeFill delay={0.9}>Live</StrokeFill><span style={{ color: RED }}>.</span></span>,
        ]} />
      </h1>

      <div className="mt-10 flex items-center gap-6 flex-wrap">
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={loading}
          aria-pressed={playing}
          aria-label={playing ? 'Pause the live stream' : 'Play the live stream'}
          data-cursor-label={playing ? 'PAUSE' : 'PLAY'}
          className="w-24 h-24 rounded-full flex items-center justify-center text-white bloom-red hover:scale-105 transition-transform disabled:opacity-60"
          style={{ background: RED }}
        >
          {loading ? <Loader2 size={34} className="animate-spin" /> : playing ? <Pause size={34} /> : <Play size={36} className="translate-x-0.5" />}
        </button>
        <div>
          <div className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: RED }}>
            ● On Air Now
          </div>
          <div className="font-poster uppercase text-[28px] text-white leading-tight mt-1">{meta.program}</div>
          <div className="text-[14px] text-white/50">
            with {meta.presenter} · {meta.programTime}
          </div>
          {meta.nowPlaying && (
            <div className="text-[13px] font-bold mt-1.5" style={{ color: LIME }}>
              ♪ {meta.nowPlaying}{meta.artist ? ` — ${meta.artist}` : ''}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-[13px] tracking-[0.14em] uppercase text-white/40">
        Up next: {meta.upNext}
      </div>
    </section>
  )
}

function WaysToListen() {
  const ways = [
    { icon: Radio, title: '98.5 FM', body: 'On the dial across Shepparton and 25 towns of the Goulburn Valley — 100km of signal from Mt Major.' },
    { icon: Wifi, title: 'Stream anywhere', body: 'The live stream follows you — this site, any browser, anywhere in the world. Press play above.' },
    { icon: Phone, title: 'Studio line', body: 'Requests, shout-outs, community notices: (03) 5831 3131 — the studio answers when we’re live.' },
  ]
  return (
    <section className="px-6 md:px-12 lg:px-20 pb-6">
      <LabelReveal className="mb-8">Ways to Listen</LabelReveal>
      <div className="grid md:grid-cols-3 gap-5">
        {ways.map((w) => (
          <div key={w.title} className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636]">
            <w.icon size={22} style={{ color: RED }} />
            <h3 className="font-poster uppercase text-[26px] text-white mt-4 mb-2">{w.title}</h3>
            <p className="text-[15px] leading-relaxed text-white/55">{w.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Listen() {
  const meta = usePlayerMetadata()
  return (
    <Layout>
      <SEO
        title="Listen Live — ONE FM 98.5"
        description="Stream ONE FM 98.5 live from Shepparton. Full program guide, this week's presenters, and the latest from the studio."
      />
      <div style={{ background: '#0A0A0A' }} className="min-h-screen">
        <OnAirTicker
          items={[
            meta.isLive ? `● ON AIR — ${meta.program}${meta.presenter ? ` with ${meta.presenter}` : ''}` : `● ${meta.program}`,
            meta.nowPlaying ? `Now playing: ${meta.nowPlaying}${meta.artist ? ` — ${meta.artist}` : ''}` : '98.5 FM · Shepparton · Goulburn Valley',
            'Community radio since 1989 · Callsign 3ONE',
          ]}
          delay={0.4}
        />
        <ListenHero />
        <NameWall label="On Air This Week" rows={WEEK_WALL} />
        <section className="px-6 md:px-12 lg:px-20 pb-6" id="guide">
          <LabelReveal className="mb-8">Full Program Guide</LabelReveal>
          <WeeklySchedule />
        </section>
        <section className="px-6 md:px-12 lg:px-20 pb-6">
          <LatestInterviews />
        </section>
        <WaysToListen />
        <StatsStrip
          stats={[
            { n: stationStats.weeklyListeners.toLocaleString(), t: 'Est. weekly listeners' },
            { n: '98.5', t: 'FM · Callsign 3ONE', red: true },
            { n: '24/7', t: 'On air, every day' },
            { n: '1989', t: 'Broadcasting ever since' },
          ]}
        />
        <div className="pb-32" />
      </div>
    </Layout>
  )
}
