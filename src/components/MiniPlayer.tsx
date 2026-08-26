import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Pause, Play, Radio, X } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { isAppPath } from '@/lib/hashRoute'
import { presenterPhotoFallback, presenterPhotoPath } from '@/lib/presenterAssets'
import { WeatherMini } from '@/components/WeatherWidget'

function NowPlayingBars() {
  const delays = ['0s', '0.2s', '0.1s', '0.35s', '0.15s']
  return (
    <span className="flex items-end gap-[2px] shrink-0" style={{ height: 14 }} aria-hidden>
      {delays.map((delay, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: 2,
            background: '#E51636',
            borderRadius: 1,
            animation: `mini-bar ${0.7 + i * 0.07}s ease-in-out ${delay} infinite`,
          }}
        />
      ))}
    </span>
  )
}

export function MiniPlayer() {
  const location = useLocation()
  const [dismissed, setDismissed] = useState(false)
  const meta = usePlayerMetadata()
  const { playing, loading, toggle } = useLiveStream()
  const presenterImg = presenterPhotoPath(meta.presenter)

  // HashRouter: location.pathname is the hash path (`#/listen` → `/listen`).
  const hidden =
    isAppPath(location.pathname, '/listen', location.hash) ||
    isAppPath(location.pathname, '/ops', location.hash) ||
    dismissed

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="fixed bottom-0 inset-x-0 z-[200] pointer-events-none"
        >
          <div className="pointer-events-auto mx-auto max-w-3xl px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div role="region" aria-label="Mini audio player" className="rounded-2xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl shadow-[0_-4px_40px_rgba(0,0,0,0.6)] flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2">

              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-one-red" />
              </span>

              {playing && <NowPlayingBars />}

              <div className="relative w-9 h-9 rounded-md overflow-hidden border border-white/10 shrink-0 hidden sm:block">
                <MediaImage
                  src={presenterImg}
                  alt=""
                  fallbackSrc={presenterPhotoFallback(meta.presenter)}
                  className="absolute inset-0 w-full h-full"
                  skeleton={false}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-one-white truncate leading-tight">
                  {meta.program}
                </p>
                <p className="font-label text-[10px] text-muted truncate">
                  with {meta.presenter}
                </p>
              </div>

              <div className="hidden lg:block shrink-0">
                <WeatherMini />
              </div>

              {meta.nowPlaying && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black border border-[#B6FF00]/60 bloom-lime min-w-0 max-w-[180px]">
                  <Radio size={10} className="shrink-0" style={{ color: '#B6FF00' }} />
                  <span className="font-label text-[10px] truncate" style={{ color: '#B6FF00' }}>{meta.nowPlaying}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => void toggle()}
                disabled={loading}
                aria-label={playing ? 'Pause stream' : 'Play live stream'}
                aria-pressed={playing}
                data-cursor-label={playing ? 'PAUSE' : 'PLAY LIVE'}
                className="w-11 h-11 rounded-full bg-[#E51636] text-white flex items-center justify-center shrink-0 hover:bg-white hover:text-black transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : playing ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} className="translate-x-px" />
                )}
              </button>

              <Link
                to="/listen"
                data-cursor-label="FULL PLAYER"
                className="font-label text-[10px] text-muted hover:text-white transition-colors shrink-0 hidden sm:block whitespace-nowrap"
              >
                Full player →
              </Link>

              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss player"
                data-cursor-label="CLOSE"
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-one-white hover:bg-one-border/30 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
