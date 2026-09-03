import { Volume1, Volume2, VolumeX } from 'lucide-react'
import { useLiveStream } from '@/hooks/useLiveStream'

/**
 * Shared live-stream gain. Same singleton as play/pause — Listen and the
 * mini player stay in lockstep. Does not invent a second Audio element.
 */
export function StreamVolume({ compact = false }: { compact?: boolean }) {
  const { muted, gain, setVolume, toggleMute } = useLiveStream()
  const pct = Math.round(gain * 100)
  const Icon = muted || gain === 0 ? VolumeX : gain < 0.4 ? Volume1 : Volume2

  return (
    <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-3'}`}>
      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={muted || gain === 0}
        aria-label={muted || gain === 0 ? 'Unmute the live stream' : 'Mute the live stream'}
        data-cursor-label={muted || gain === 0 ? 'UNMUTE' : 'MUTE'}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
      >
        <Icon size={compact ? 14 : 16} aria-hidden />
      </button>
      <label className="flex items-center gap-2 min-w-0">
        <span className="sr-only">Stream volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={gain}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={`${pct} percent`}
          className={`${compact ? 'w-16' : 'w-28'} h-1 cursor-pointer accent-[#E51636]`}
        />
        {compact ? null : (
          <span className="font-label text-[10px] tracking-[0.12em] uppercase text-white/40 tabular-nums w-8">
            {pct}
          </span>
        )}
      </label>
    </div>
  )
}
