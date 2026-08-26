import { motion } from 'framer-motion'
import { ExternalLink, Loader2, Pause, Play, Radio, Signal } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { LISTEN_LINKS } from '@/lib/listenLinks'
import { STATION_TICKER } from '@/lib/playerMetadata'
import { PHOTO_DEFAULTS, STATION_PHOTOS } from '@/lib/stationPhotos'
import { presenterPhotoFallback, presenterPhotoPath } from '@/lib/presenterAssets'

function MetadataBadge({ live, label }: { live: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {live ? (
        <span className="inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider text-one-red bg-one-red/10 border border-one-red/30 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-one-red animate-pulse" />
          On Air
        </span>
      ) : (
        <span className="font-label text-[10px] uppercase tracking-wider text-muted border border-one-border px-2.5 py-1 rounded-full">
          Off Air
        </span>
      )}
      <span className="font-label text-[10px] text-muted flex items-center gap-1">
        <Signal size={10} className="text-one-gold" />
        {label}
      </span>
    </div>
  )
}

function Ticker() {
  const items = [...STATION_TICKER, ...STATION_TICKER]
  return (
      <div className="overflow-hidden border-t border-one-border/60 bg-one-navy/80">
      <div className="ticker-track py-2.5">
        {items.map((item, i) => (
          <span key={`${item.id}-${i}`} className="mx-8 font-label text-[11px] text-one-muted">
            {item.href ? (
              <a href={item.href} className="hover:text-one-gold transition-colors" target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                {item.text}
              </a>
            ) : (
              item.text
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

export function LivePlayerWidget({ className = '-mt-12' }: { className?: string }) {
  const meta = usePlayerMetadata()
  const { playing, loading, error, toggle } = useLiveStream()
  const presenterImg = presenterPhotoPath(meta.presenter)

  return (
    <section className={`relative z-20 px-4 sm:px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="rounded-2xl overflow-hidden border border-one-gold/20 shadow-[0_0_60px_rgba(212,168,75,0.08)]"
        >
          <div className="grid lg:grid-cols-[1fr_280px] bg-gradient-to-br from-[#0D1B2A] to-one-navy">
            <div className="p-6 sm:p-8 lg:p-10">
              <MetadataBadge live={meta.isLive} label={meta.sourceLabel} />

              <div className="mt-6 grid sm:grid-cols-[auto_1fr] gap-6 items-start">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-one-border shrink-0">
                  <MediaImage
                    src={presenterImg}
                    alt={meta.presenter || meta.program}
                    fallbackSrc={presenterPhotoFallback(meta.presenter)}
                    className="absolute inset-0 w-full h-full"
                  />
                  {meta.isLive && (
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-one-gold to-one-red" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-label text-one-gold text-[10px] uppercase tracking-widest mb-1">
                    {meta.category} · {meta.programTime}
                  </p>
                  <h2 className="font-h2 text-one-white text-xl sm:text-2xl mb-1 truncate">{meta.program}</h2>
                  <p className="font-body text-one-muted mb-4">with {meta.presenter}</p>

                  {meta.nowPlaying ? (
                    <div className="glass-card rounded-lg px-4 py-3 mb-4 border-one-gold/20">
                      <p className="font-label text-[10px] text-one-gold mb-1">NOW PLAYING</p>
                      <p className="font-body text-one-white text-sm truncate">{meta.nowPlaying}</p>
                    </div>
                  ) : (
                    <div className="glass-card rounded-lg px-4 py-3 mb-4 border-one-gold/10">
                      <p className="font-label text-[10px] text-one-gold/60 mb-1">LIVE ON AIR</p>
                      <p className="font-body text-one-muted text-sm">Tune in live on 98.5 FM</p>
                    </div>
                  )}

                  <p className="font-label text-[10px] text-muted">
                    Up next: <span className="text-one-white">{meta.upNext}</span>
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void toggle()}
                  disabled={loading}
                  data-cursor-label={loading ? 'CONNECTING' : playing ? 'PAUSE' : 'LISTEN LIVE'}
                  className="btn-primary inline-flex items-center gap-2 min-w-[140px] justify-center disabled:opacity-70"
                  aria-pressed={playing}
                  title="Play / pause (Space)"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : playing ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} />
                  )}
                  {loading ? 'Connecting…' : playing ? 'Pause' : 'Listen Live'}
                </button>
                <a
                  href={LISTEN_LINKS.web.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="WEB PLAYER"
                  className="btn-secondary inline-flex items-center gap-2 text-xs"
                >
                  <Radio size={14} />
                  Web player
                </a>
              </div>

              <p className="hidden sm:block mt-1 font-mono text-[9px] text-one-muted/85 select-none" aria-hidden>
                Press <kbd className="border border-one-border/40 rounded px-1 py-px bg-one-navy/40">Space</kbd> to play / pause
              </p>

              {error && (
                <p className="mt-3 font-body-small text-one-red">{error}</p>
              )}

              <div className="mt-6 flex flex-wrap gap-4 font-label text-[10px] text-muted">
                <span>{LISTEN_LINKS.fm.label}</span>
                <span className="text-one-border">|</span>
                <a href={LISTEN_LINKS.crp.href} target="_blank" rel="noopener noreferrer" className="hover:text-one-gold transition-colors inline-flex items-center gap-1">
                  {LISTEN_LINKS.crp.label} <ExternalLink size={10} />
                </a>
                <span className="text-one-border">|</span>
                <a href={LISTEN_LINKS.phone.href!} className="hover:text-one-gold transition-colors">
                  {LISTEN_LINKS.phone.description}
                </a>
              </div>
            </div>

            <div className="hidden lg:block relative min-h-[200px] border-l border-one-border/40">
              <MediaImage
                src={STATION_PHOTOS.studioCommentarySelfie}
                fallbackSrc={PHOTO_DEFAULTS.regional}
                alt="ONE FM studio"
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0D1B2A]/90" />
            </div>
          </div>

          <Ticker />
        </motion.div>
      </div>
    </section>
  )
}
