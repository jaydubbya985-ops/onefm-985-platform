import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Play } from 'lucide-react'
import {
  fetchInterviewFeed,
  formatInterviewDate,
  interviewFeedEyebrow,
  interviewFeedIntro,
  type Fm985Interview,
  type InterviewFeedSource,
} from '@/lib/fm985Feed'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'
import { SoundCloudPanel } from '@/components/social/SoundCloudPanel'
import { FacebookPanel } from '@/components/social/FacebookPanel'
import { WordReveal } from '@/components/WordReveal'
import { MagneticButton } from '@/components/MagneticButton'
import { TiltCard } from '@/components/TiltCard'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

/** Unused Shepparton landmark — no unnamed portraits. */
const LOCAL_ARCHIVE_PHOTO = STATION_PHOTOS.landmarkHowNowCow
const LOCAL_ARCHIVE_ALT = 'How Now cow sculpture, Shepparton — ONE FM station archive'

function InterviewCard({ item, index = 0 }: { item: Fm985Interview; index?: number }) {
  const [expanded, setExpanded] = useState(false)
  const thumbSrc = item.imageUrl || LOCAL_ARCHIVE_PHOTO
  const thumbAlt = item.imageUrl ? '' : LOCAL_ARCHIVE_ALT

  return (
    <TiltCard maxTilt={4}>
    <motion.article
      data-cursor-label={item.audioUrl ? 'LISTEN' : 'READ'}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-5 group">
      <div className="flex gap-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-one-border">
          <img
            src={thumbSrc}
            alt={thumbAlt}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div aria-hidden className="explore-tile-scan" />
        </div>
        <div className="flex-1 min-w-0">
          <time className="font-label text-[10px] text-one-gold">{formatInterviewDate(item.date)}</time>
          <h3 className="font-h4 text-one-white mt-1 line-clamp-2">{item.title}</h3>
          <p className="font-body-small text-muted mt-1 line-clamp-2">{item.excerpt}</p>
        </div>
      </div>

      {item.audioUrl && (
        <div className="mt-4 space-y-2">
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              data-cursor-label="PLAY"
              className="inline-flex items-center gap-2 text-sm text-one-gold hover:text-one-white transition-colors"
            >
              <Play size={14} /> Listen
            </button>
          ) : (
            <audio controls preload="none" className="w-full h-10 accent-one-gold" src={item.audioUrl}>
              <track kind="captions" />
            </audio>
          )}
        </div>
      )}

      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 mt-3 font-label text-[10px] text-muted hover:text-one-gold transition-colors link-hover"
      >
        Full story on fm985.com.au <ExternalLink size={12} />
      </a>
    </motion.article>
    </TiltCard>
  )
}

export function LatestInterviews() {
  const [items, setItems] = useState<Fm985Interview[]>([])
  const [source, setSource] = useState<InterviewFeedSource>('station-archive')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchInterviewFeed(6)
      .then((feed) => {
        if (cancelled) return
        setItems(feed.items)
        setSource(feed.source)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="section-padding bg-surface-lift section-bleed-top relative" data-cursor-label="LATEST INTERVIEWS">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-start min-w-0">
            <div className="relative w-full sm:w-48 h-32 sm:h-36 rounded-xl overflow-hidden shrink-0 border border-one-border">
              <img
                src={LOCAL_ARCHIVE_PHOTO}
                alt={LOCAL_ARCHIVE_ALT}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="font-label text-[10px] tracking-[0.22em] text-one-electric mb-3 block">
                {loading ? 'INTERVIEWS' : interviewFeedEyebrow(source)}
              </span>
              <WordReveal text="Latest Interviews" className="font-h2 text-one-white mt-2 block" as="h2" stagger={0.028} variant="char" />
              <p className="font-body text-muted mt-2 max-w-xl">
                {loading
                  ? 'Checking fm985.com.au for published interviews.'
                  : interviewFeedIntro(source)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <MagneticButton strength={6}>
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="FACEBOOK"
                className="btn-secondary text-xs inline-flex items-center gap-2"
              >
                Facebook <ExternalLink size={14} />
              </a>
            </MagneticButton>
            <MagneticButton strength={6}>
              <a
                href={SOUNDCLOUD_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="SOUNDCLOUD"
                className="btn-secondary text-xs inline-flex items-center gap-2"
              >
                SoundCloud <ExternalLink size={14} />
              </a>
            </MagneticButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-7 space-y-4">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl h-28 border border-one-border/40 animate-pulse bg-one-border/10" />
              ))}
            {!loading && items.length === 0 && (
              <div className="rounded-xl border border-one-border/40 bg-one-border/10 p-6 text-center">
                <p className="font-body-small text-one-muted">No interviews in this feed — check fm985.com.au or SoundCloud.</p>
              </div>
            )}
            {!loading && items.map((item, i) => <InterviewCard key={item.id} item={item} index={i} />)}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <SoundCloudPanel interviews={items} />
            <FacebookPanel />
          </div>
        </div>
      </div>
    </section>
  )
}
