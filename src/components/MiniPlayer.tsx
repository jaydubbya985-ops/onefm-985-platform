import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Pause, Play, Radio, X } from 'lucide-react'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { WeatherMini } from '@/components/WeatherWidget'

const HIDE_ON = ['/listen', '/ops']

const BAR_DELAYS = ['0s', '0.2s', '0.1s', '0.35s', '0.15s']

function NowPlayingBars() {
  return (
    <span className="flex items-end gap-[2px] shrink-0" style={{ height: 16 }} aria-hidden>
      {BAR_DELAYS.map((delay, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: 2.5,
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

  const hidden = HIDE_ON.some((p) => location.pathname === p) || dismissed

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
          className="fixed bottom-0 inset-x-0 z-[200] pointer-events-none"
        >
          <div className="pointer-events-auto mx-auto max-w-3xl px-3 pb-3">
            <div role="region" aria-label="Mini audio player" className="rounded-2xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl shadow-[0_-4px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 px-4 py-3">

              {/* Live dot */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-one-red" />
              </span>

              {/* Animated bars when playing */}
              {playing && <NowPlayingBars />}

              {/* Station label */}
              <span className="font-label text-[10px] tracking-[0.2em] text-[#E51636] font-bold shrink-0 hidden sm:block">
                98.5 FM
              </span>

              <div className="w-px h-4 bg-one-border/60 shrink-0 hidden sm:block" />

              {/* Program info */}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-one-white truncate leading-tight">
                  {meta.program}
                </p>
                <p className="font-label text-[10px] text-muted truncate">
                  with {meta.presenter}
                </p>
              </div>

              {/* Live weather */}
              <div className="hidden lg:block shrink-0">
                <WeatherMini />
              </div>

              {/* Now playing pill */}
              {meta.nowPlaying && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/15 min-w-0 max-w-[200px]">
                  <Radio size={10} className="text-[#E51636] shrink-0" />
                  <span className="font-label text-[10px] text-white/80 truncate">{meta.nowPlaying}</span>
                </div>
              )}

              {/* Play/Pause */}
              <button
                type="button"
                onClick={() => void toggle()}
                disabled={loading}
                aria-label={playing ? 'Pause stream' : 'Play live stream'}
                aria-pressed={playing}
                data-cursor-label={playing ? 'PAUSE' : 'PLAY LIVE'}
                className="w-9 h-9 rounded-full bg-[#E51636] text-white flex items-center justify-center shrink-0 hover:bg-white hover:text-black transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : playing ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} className="translate-x-px" />
                )}
              </button>

              {/* Full player link */}
              <Link
                to="/listen"
                data-cursor-label="FULL PLAYER"
                className="font-label text-[10px] text-muted hover:text-white transition-colors shrink-0 hidden sm:block whitespace-nowrap"
              >
                Full player →
              </Link>

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss player"
                data-cursor-label="CLOSE"
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-one-white hover:bg-one-border/30 transition-colors shrink-0"
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
