/**
 * LISTEN — rebuilt per REBUILD-SPEC.md (page 2 of 6).
 * Absorbs Programs + Broadcast Explorer. Assembled from the ON AIR kit.
 * Play/pause is the hero action. Program + host come from programGuide.
 */
import { Loader2, Pause, Play, Phone, Radio, Wifi } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { MediaImage } from '@/components/MediaImage'
import { WeeklySchedule } from '@/components/WeeklySchedule'
import { LatestInterviews } from '@/components/LatestInterviews'
import { OnAirTicker, NameWall, StatsStrip, LabelReveal, StrokeFill } from '@/components/onair/kit'
import { HeadlinePop } from '@/components/motion/PosterReveal'
import { wallRows } from '@/data/onAirPeople'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { presenterPhotoFallback, presenterPhotoPath } from '@/lib/presenterAssets'
import { stationStats } from '@/data/pricing'

const RED = '#E51636'
const LIME = '#B6FF00'

function ListenHero() {
  const { playing, loading, error, toggle } = useLiveStream()
  const meta = usePlayerMetadata()
  const presenterImg = presenterPhotoPath(meta.presenter)

  return (
    <section className="relative px-5 sm:px-6 md:px-12 lg:px-20 pt-16 sm:pt-24 pb-16 min-h-[85vh] flex flex-col justify-center">
      <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(52px,12vw,160px)]">
        <span className="block">
          <HeadlinePop>
            <span className="poster-hover">Listen</span>
          </HeadlinePop>
        </span>
        <span className="block">
          <HeadlinePop delay={0.08}>
            <StrokeFill delay={0.9}>Live</StrokeFill>
            <span style={{ color: RED }}>.</span>
          </HeadlinePop>
        </span>
      </h1>

      <div className="mt-10 flex flex-col sm:flex-row items-center sm:items-start gap-7 sm:gap-8">
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={loading}
          aria-pressed={playing}
          aria-label={playing ? 'Pause the live stream' : 'Play the live stream'}
          data-cursor-label={playing ? 'PAUSE' : 'PLAY'}
          className="w-[7.5rem] h-[7.5rem] sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-white bloom-red hover:scale-105 transition-transform disabled:opacity-60 shrink-0"
          style={{ background: RED }}
        >
          {loading ? (
            <Loader2 size={40} className="animate-spin" />
          ) : playing ? (
            <Pause size={40} />
          ) : (
            <Play size={44} className="translate-x-1" />
          )}
        </button>

        <div className="flex items-center gap-4 sm:gap-5 w-full min-w-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-white/15 shrink-0">
            <MediaImage
              src={presenterImg}
              alt={meta.presenter ? `${meta.presenter} on air` : meta.program}
              fallbackSrc={presenterPhotoFallback(meta.presenter)}
              className="absolute inset-0 w-full h-full"
              priority
            />
            {meta.isLive && (
              <div className="absolute bottom-0 inset-x-0 h-1" style={{ background: RED }} />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-bold tracking-[0.18em] uppercase" style={{ color: RED }}>
              {meta.isLive ? '● On Air Now' : '● 98.5 FM'}
            </div>
            <div className="font-poster uppercase text-[26px] sm:text-[28px] text-white leading-tight mt-1">
              {meta.program}
            </div>
            <div className="text-[14px] text-white/50">
              with {meta.presenter} · {meta.programTime}
            </div>
            {meta.nowPlaying && (
              <div className="text-[13px] font-bold mt-1.5 truncate" style={{ color: LIME }}>
                ♪ {meta.nowPlaying}{meta.artist ? ` — ${meta.artist}` : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-[13px] text-white/70">{error}</p>
      )}

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
        <NameWall label="On Air This Week" rows={wallRows()} />
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
