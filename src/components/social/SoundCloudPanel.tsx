import { useEffect, useRef, useState } from 'react'
import { Headphones, Pause, Play } from 'lucide-react'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { SOUNDCLOUD_PROFILE_URL, confirmedSocialNote } from '@/lib/socialLinks'
import { formatCoverageShort } from '@/lib/coverageCopy'
import {
  fetchLatestInterviews,
  formatInterviewDate,
  type Fm985Interview,
} from '@/lib/fm985Feed'
import { SocialPlatformFrame } from '@/components/social/SocialPlatformFrame'
import { cn } from '@/lib/utils'

const SOUNDCLOUD_ACCENT = '#FF5500'

function WaveBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-5 shrink-0" aria-hidden>
      {[0.35, 0.7, 0.5, 0.9, 0.45, 0.65, 0.4].map((h, i) => (
        <span
          key={i}
          className={cn(
            'w-0.5 rounded-full bg-one-gold/70 origin-bottom',
            active && 'animate-waveform'
          )}
          style={{
            height: `${h * 100}%`,
            animationDelay: active ? `${i * 0.08}s` : undefined,
          }}
        />
      ))}
    </div>
  )
}

function TrackRow({
  track,
  playing,
  onToggle,
}: {
  track: Fm985Interview
  playing: boolean
  onToggle: () => void
}) {
  return (
    <div className="group flex items-center gap-3 py-2.5 border-b border-one-border/50 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all',
          playing
            ? 'bg-one-gold/15 border-one-gold/50 text-one-gold'
            : 'bg-one-navy border-one-border text-one-muted group-hover:border-one-gold/40 group-hover:text-one-gold'
        )}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-body-small text-one-white text-sm truncate group-hover:text-one-gold transition-colors">
          {track.title}
        </p>
        <p className="font-label text-[9px] text-one-muted mt-0.5">{formatInterviewDate(track.date)}</p>
      </div>
      <WaveBars active={playing} />
    </div>
  )
}

export interface SoundCloudPanelProps {
  interviews?: Fm985Interview[]
  compact?: boolean
  className?: string
}

export function SoundCloudPanel({ interviews: interviewsProp, compact, className }: SoundCloudPanelProps) {
  const [items, setItems] = useState<Fm985Interview[]>(interviewsProp ?? [])
  const [loading, setLoading] = useState(!interviewsProp?.length)
  const [activeId, setActiveId] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [prevProp, setPrevProp] = useState(interviewsProp)

  // Sync incoming interviews prop (render-phase adjustment)
  if (prevProp !== interviewsProp) {
    setPrevProp(interviewsProp)
    if (interviewsProp?.length) {
      setItems(interviewsProp)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (interviewsProp?.length) return
    let cancelled = false
    fetchLatestInterviews(8)
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [interviewsProp])

  const playable = items.filter((t) => t.audioUrl)

  const toggleTrack = (track: Fm985Interview) => {
    if (!track.audioUrl) return
    if (activeId === track.id) {
      audioRef.current?.pause()
      setActiveId(null)
      return
    }
    setActiveId(track.id)
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl
      void audioRef.current.play()
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => setActiveId(null)
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [])

  return (
    <SocialPlatformFrame
      compact={compact}
      className={className}
      eyebrow="ON DEMAND"
      title="fm985.com.au interviews"
      description={`${confirmedSocialNote()}. Interviews from fm985.com.au · ${formatCoverageShort()}.`}
      href={SOUNDCLOUD_PROFILE_URL}
      hrefLabel="Open SoundCloud"
      image={STATION_PHOTOS.commentaryBoxAction}
      imageFallback={STATION_PHOTOS.studioCommentarySelfie}
      accent={SOUNDCLOUD_ACCENT}
      icon={<Headphones size={18} />}
    >
      <audio ref={audioRef} preload="none" className="hidden">
        <track kind="captions" />
      </audio>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-one-border/20 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && playable.length > 0 && (
        <div className="max-h-56 overflow-y-auto pr-1 -mr-1">
          {playable.slice(0, compact ? 3 : 5).map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              playing={activeId === track.id}
              onToggle={() => toggleTrack(track)}
            />
          ))}
        </div>
      )}

      {!loading && playable.length === 0 && (
        <p className="font-body-small text-one-muted text-sm">
          Latest interviews play on{' '}
          <a href={SOUNDCLOUD_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-one-gold link-hover">
            SoundCloud
          </a>{' '}
          and fm985.com.au — check back after the next broadcast.
        </p>
      )}
    </SocialPlatformFrame>
  )
}
