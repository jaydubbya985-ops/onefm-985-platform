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

export function formatInterviewClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

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

export function InterviewTrackRow({
  track,
  playing,
  paused,
  currentTime,
  duration,
  onToggle,
}: {
  track: Fm985Interview
  playing: boolean
  paused: boolean
  currentTime: number
  duration: number
  onToggle: () => void
}) {
  const active = playing || paused
  const remaining = duration > 0 ? Math.max(0, duration - currentTime) : 0
  const pct = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0
  const remainingLabel = duration > 0 ? `${formatInterviewClock(remaining)} left` : null

  return (
    <div className="group py-2.5 border-b border-one-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all',
            playing
              ? 'bg-one-gold/15 border-one-gold/50 text-one-gold'
              : 'bg-one-navy border-one-border text-one-muted group-hover:border-one-gold/40 group-hover:text-one-gold'
          )}
          aria-pressed={playing}
          aria-label={
            playing
              ? `Pause ${track.title}`
              : paused
                ? `Resume ${track.title}`
                : `Play ${track.title}`
          }
        >
          {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-body-small text-one-white text-sm truncate group-hover:text-one-gold transition-colors">
            {track.title}
          </p>
          <p className="font-label text-[9px] text-one-muted mt-0.5">
            {formatInterviewDate(track.date)}
            {remainingLabel ? ` · ${remainingLabel}` : ''}
            {paused ? ' · paused' : ''}
          </p>
        </div>
        <WaveBars active={playing} />
      </div>
      {active && (
        <div className="mt-2 ml-12" aria-hidden={!duration}>
          <div className="h-1 rounded-full bg-one-border/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-one-gold/80"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between font-label text-[9px] text-one-muted uppercase tracking-[0.08em]">
            <span>{formatInterviewClock(currentTime)}</span>
            <span>{duration > 0 ? formatInterviewClock(duration) : '—'}</span>
          </div>
        </div>
      )}
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
  const [paused, setPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playError, setPlayError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [prevProp, setPrevProp] = useState(interviewsProp)

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
  const storiesWithoutAudio = !loading && items.length > 0 && playable.length === 0

  const toggleTrack = async (track: Fm985Interview) => {
    if (!track.audioUrl) return
    const audio = audioRef.current
    if (!audio) return

    if (activeId === track.id) {
      if (audio.paused) {
        try {
          await audio.play()
          setPaused(false)
          setPlayError(null)
        } catch {
          setPlayError('Playback blocked — open the interview on SoundCloud or fm985.com.au.')
        }
      } else {
        audio.pause()
        setPaused(true)
      }
      return
    }

    setActiveId(track.id)
    setPaused(false)
    setCurrentTime(0)
    setDuration(0)
    setPlayError(null)
    audio.src = track.audioUrl
    try {
      await audio.play()
    } catch {
      setPlayError('This interview would not play here. Open SoundCloud or the story on fm985.com.au.')
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      setCurrentTime(audio.currentTime)
      if (Number.isFinite(audio.duration)) setDuration(audio.duration)
    }
    const onMeta = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration)
    }
    const onEnded = () => {
      setActiveId(null)
      setPaused(false)
      setCurrentTime(0)
    }
    const onError = () => {
      setPlayError('Stream file failed — open SoundCloud or the story on fm985.com.au.')
      setPaused(false)
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [])

  return (
    <SocialPlatformFrame
      compact={compact}
      className={className}
      eyebrow="ON DEMAND"
      title="Interview Archive"
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

      {playError && (
        <p className="mb-3 font-body-small text-sm text-one-red/90" role="alert">
          {playError}{' '}
          <a
            href={SOUNDCLOUD_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-one-gold underline"
          >
            Open SoundCloud
          </a>
        </p>
      )}

      {!loading && playable.length > 0 && (
        <div className="max-h-56 overflow-y-auto pr-1 -mr-1">
          {playable.slice(0, compact ? 3 : 5).map((track) => (
            <InterviewTrackRow
              key={track.id}
              track={track}
              playing={activeId === track.id && !paused}
              paused={activeId === track.id && paused}
              currentTime={activeId === track.id ? currentTime : 0}
              duration={activeId === track.id ? duration : 0}
              onToggle={() => void toggleTrack(track)}
            />
          ))}
        </div>
      )}

      {storiesWithoutAudio && (
        <p className="font-body-small text-one-muted text-sm">
          Latest interview headlines are on fm985.com.au — in-page audio is not attached to these posts yet.{' '}
          <a href={SOUNDCLOUD_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-one-gold link-hover">
            Open SoundCloud
          </a>{' '}
          for the recorded interviews.
        </p>
      )}

      {!loading && items.length === 0 && (
        <p className="font-body-small text-one-muted text-sm">
          No interview list loaded here. Check{' '}
          <a href="https://fm985.com.au/category/interview/" target="_blank" rel="noopener noreferrer" className="text-one-gold link-hover">
            fm985.com.au/category/interview
          </a>{' '}
          or{' '}
          <a href={SOUNDCLOUD_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-one-gold link-hover">
            SoundCloud
          </a>
          .
        </p>
      )}
    </SocialPlatformFrame>
  )
}
