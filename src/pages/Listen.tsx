/**
 * LISTEN — the stream. Play, remaining time, honest presenter, stream errors.
 * Weekly guide lives on /programs. Broadcast grid lives on /broadcast.
 */
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Loader2, Pause, Play, Phone, Radio, Wifi } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { LatestInterviews } from '@/components/LatestInterviews'
import { OnAirTicker, NameWall, StatsStrip, LabelReveal, PosterReveal, StrokeFill } from '@/components/onair/kit'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import {
  ON_AIR_WALL_PHOTO_NOTE,
  ON_AIR_WEEK,
} from '@/data/programGuide'
import { BRAND } from '@/lib/brand'
import { liveNowFromMetadata } from '@/lib/liveNow'
import { AUDIO_PLAYER_URL } from '@/lib/streamConfig'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import {
  formatCoverageShort,
  formatRadius,
  formatTowns,
  formatWeeklyListeners,
  formatWeeklyListenersPlain,
} from '@/lib/coverageCopy'

const RED = '#E51636'
const LIME = '#B6FF00'

/** Same wall as Home — programGuide.ts BREAKFAST_ROSTER. Named portraits: Di Hunter, Sally Nayler. */

function ListenHero() {
  const { playing, loading, error, toggle } = useLiveStream()
  const meta = usePlayerMetadata()
  const live = liveNowFromMetadata(meta)
  const { program, programTime } = live
  const progressPct = Math.round(live.elapsedRatio * 100)

  return (
    <section className="relative px-6 md:px-12 lg:px-20 pt-24 pb-16 min-h-[84vh] flex flex-col justify-center overflow-hidden">
      <img
        src={STATION_PHOTOS.studioPresenterMic}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.28) saturate(0.85)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,.25) 40%, #0A0A0A 100%)' }}
        aria-hidden
      />

      <div className="relative">
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
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: RED }}>
                {live.isLive ? '● On Air Now' : '● Overnight / automated'}
              </div>
              <div className="text-[11px] tracking-[0.14em] uppercase text-white/35">
                {meta.sourceLabel}
              </div>
            </div>
            <div className="font-poster uppercase text-[28px] md:text-[36px] text-white leading-tight mt-1">{program}</div>
            <div className="text-[14px] text-white/50 mt-1">
              {live.withLine ? `${live.withLine} · ` : ''}
              {programTime}
              {live.remainingLabel ? ` · ${live.remainingLabel}` : ''}
            </div>
            {live.breakfastOnAir && live.breakfastLabel && (
              <div className="text-[12px] text-white/40 mt-1.5">
                {live.breakfastLabel}
              </div>
            )}
            {meta.nowPlaying && (
              <div className="text-[13px] font-bold mt-2" style={{ color: LIME }}>
                ♪ {meta.nowPlaying}{meta.artist && !meta.nowPlaying.includes(meta.artist) ? ` — ${meta.artist}` : ''}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 max-w-xl" aria-hidden>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${progressPct}%`, background: RED }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] tracking-[0.12em] uppercase text-white/35">
            <span>This show on the guide</span>
            <span>{live.remainingLabel}</span>
          </div>
        </div>

        <div className="mt-6 text-[13px] tracking-[0.14em] uppercase text-white/40">
          Up next: {meta.upNext}
        </div>

        {error && (
          <p className="mt-5 text-[14px] text-white/70 max-w-xl" role="alert">
            {error}{' '}
            <a
              href={AUDIO_PLAYER_URL}
              className="underline"
              style={{ color: RED }}
              target="_blank"
              rel="noreferrer"
            >
              Open the fm985.com.au web player
            </a>
          </p>
        )}
      </div>
    </section>
  )
}

function WaysToListen() {
  const ways = [
    { icon: Radio, title: '98.5 FM', body: `On the dial across Shepparton and ${formatTowns()} of the Goulburn Valley — ${formatCoverageShort()} from Mt Major.` },
    { icon: Wifi, title: 'Stream anywhere', body: 'The live stream follows you — this site, any browser, anywhere in the world. Press play above.' },
    { icon: Phone, title: 'Studio line', body: `Requests, shout-outs, community notices: ${BRAND.phone}. Call while we are live — this page does not claim the studio is answered 24 hours.` },
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

function GuideCta() {
  return (
    <section className="px-6 md:px-12 lg:px-20 pb-6" id="guide">
      <LabelReveal className="mb-8">The weekly guide</LabelReveal>
      <div className="grid md:grid-cols-2 gap-5">
        <Link
          to="/programs"
          data-cursor-label="GUIDE"
          className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636]"
        >
          <CalendarDays size={22} style={{ color: RED }} />
          <h3 className="font-poster uppercase text-[26px] text-white mt-4 mb-2">
            Programs<span style={{ color: RED }}>.</span>
          </h3>
          <p className="text-[15px] leading-relaxed text-white/55">
            The weekly grid from fm985.com.au/guide lives on Programs — not on this stream page.
          </p>
          <span className="mt-4 inline-block text-[13px] font-bold tracking-[0.12em] uppercase" style={{ color: RED }}>
            Open the guide →
          </span>
        </Link>
        <Link
          to="/broadcast"
          data-cursor-label="GRID"
          className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636]"
        >
          <Radio size={22} style={{ color: RED }} />
          <h3 className="font-poster uppercase text-[26px] text-white mt-4 mb-2">
            Broadcast grid<span style={{ color: RED }}>.</span>
          </h3>
          <p className="text-[15px] leading-relaxed text-white/55">
            Visual schedule of the same weekly guide. Press play here; read the week there.
          </p>
          <span className="mt-4 inline-block text-[13px] font-bold tracking-[0.12em] uppercase" style={{ color: RED }}>
            Open the grid →
          </span>
        </Link>
      </div>
    </section>
  )
}

function SongRequest() {
  const [name, setName] = useState('')
  const [song, setSong] = useState('')
  const [message, setMessage] = useState('')
  const [draftOpened, setDraftOpened] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !song.trim()) return
    const body = encodeURIComponent(
      `Song request from ${name.trim()}\n\nSong: ${song.trim()}\n\nMessage: ${message.trim() || '(none)'}`,
    )
    window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent('ONE FM Song Request')}&body=${body}`
    setDraftOpened(true)
  }

  const field =
    'w-full bg-[#111] border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#E51636] focus:outline-none'

  return (
    <section className="px-6 md:px-12 lg:px-20 pb-6" aria-labelledby="song-request-heading">
      <LabelReveal className="mb-8">Request a song</LabelReveal>
      <div className="border border-white/12 rounded-xl p-7 md:p-10 max-w-2xl">
        <h2 id="song-request-heading" className="font-poster uppercase text-[32px] text-white leading-none">
          Studio request<span style={{ color: RED }}>.</span>
        </h2>
        <p className="text-[15px] leading-relaxed text-white/55 mt-3 mb-6">
          Opens an email draft to {BRAND.email}. Nothing is sent until you hit send in your email app.
          You can also call {BRAND.phone} while we&apos;re live.
        </p>
        {draftOpened && (
          <p className="mb-6 text-[15px] font-bold" style={{ color: LIME }} role="status">
            Email draft opened — complete the send in your email app so it reaches the studio.
          </p>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="sr-only">Your name</span>
            <input
              name="request-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              className={field}
            />
          </label>
          <label className="block">
            <span className="sr-only">Song title and artist</span>
            <input
              name="request-song"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              required
              placeholder="Song title and artist"
              className={field}
            />
          </label>
          <label className="block">
            <span className="sr-only">Dedication (optional)</span>
            <textarea
              name="request-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Dedication (optional)"
              className={`${field} resize-none`}
            />
          </label>
          <button
            type="submit"
            data-cursor-label="DRAFT"
            className="px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-sm text-white"
            style={{ background: RED }}
          >
            Open email draft
          </button>
        </form>
      </div>
    </section>
  )
}

export default function Listen() {
  const meta = usePlayerMetadata()
  const live = liveNowFromMetadata(meta)
  return (
    <Layout>
      <SEO
        title="Listen Live — ONE FM 98.5"
        description={`Stream ONE FM 98.5 live from Shepparton. ${formatCoverageShort()} (ABS 2021 via townData). This week's presenters. Weekly guide on Programs.`}
      />
      <div style={{ background: '#0A0A0A' }} className="min-h-screen">
        <OnAirTicker
          items={[
            live.isLive ? `● ON AIR — ${live.program}${live.withLine ? ` ${live.withLine}` : ''}` : `● ${live.program}`,
            meta.nowPlaying ? `Now playing: ${meta.nowPlaying}${meta.artist ? ` — ${meta.artist}` : ''}` : '98.5 FM · Shepparton · Goulburn Valley',
            formatWeeklyListeners(),
            formatCoverageShort(),
            'Community radio since 1989 · Callsign 3ONE',
          ]}
          delay={0.4}
        />
        <ListenHero />
        <NameWall
          label="On Air This Week"
          rows={ON_AIR_WEEK}
          photoNote={ON_AIR_WALL_PHOTO_NOTE}
          portraits={['Di Hunter', 'Sally Nayler']}
        />
        <GuideCta />
        <section className="px-6 md:px-12 lg:px-20 pb-6">
          <LatestInterviews />
        </section>
        <WaysToListen />
        <SongRequest />
        <StatsStrip
          stats={[
            { n: formatWeeklyListenersPlain(), t: 'Est. weekly listeners' },
            { n: '98.5', t: 'FM · Callsign 3ONE', red: true },
            { n: formatTowns(), t: `Within a ${formatRadius()} radius` },
            { n: String(BRAND.licensed), t: 'Community licence' },
          ]}
        />
        <div className="pb-32" />
      </div>
    </Layout>
  )
}
