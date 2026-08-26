import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Mic2, Play } from 'lucide-react'
import {
  fetchLatestInterviews,
  formatInterviewDate,
  resolveFeedImage,
  showTypePhoto,
  type Fm985Interview,
} from '@/lib/fm985Feed'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'
import { SoundCloudPanel } from '@/components/social/SoundCloudPanel'
import { FacebookPanel } from '@/components/social/FacebookPanel'
import { HeadlinePop } from '@/components/motion/PosterReveal'
import { MagneticButton } from '@/components/MagneticButton'
import { TiltCard } from '@/components/TiltCard'

function InterviewCard({ item, index = 0 }: { item: Fm985Interview; index?: number }) {
  const [expanded, setExpanded] = useState(false)
  const fallbackPhoto = showTypePhoto(item.kind ?? 'interview')
  const [imgSrc, setImgSrc] = useState(() => resolveFeedImage(item.imageUrl, item.kind ?? 'interview'))

  useEffect(() => {
    setImgSrc(resolveFeedImage(item.imageUrl, item.kind ?? 'interview'))
  }, [item.imageUrl, item.kind])

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
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 border border-one-border bg-one-navy">
          <img
            src={imgSrc}
            alt=""
            width={112}
            height={112}
            loading="lazy"
            decoding="async"
            onError={() => {
              if (imgSrc !== fallbackPhoto) setImgSrc(fallbackPhoto)
            }}
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchLatestInterviews(6)
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load interviews — try again shortly.')
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
          <div>
            <span className="font-label text-[10px] tracking-[0.22em] text-one-electric mb-3 block">LIVE &amp; LOCAL</span>
            <h2 className="font-h2 text-one-white mt-2">
              <HeadlinePop>Latest Interviews</HeadlinePop>
            </h2>
            <p className="font-body text-muted mt-2 max-w-xl">
              Fresh from ONE FM 98.5 — synced from fm985.com.au with on-demand audio on SoundCloud.
            </p>
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
            {error && (
              <div className="rounded-xl border border-one-border/40 bg-one-border/10 p-6 text-center">
                <Mic2 className="mx-auto mb-3 text-one-muted" size={28} />
                <p className="font-body-small text-one-muted">Interviews temporarily unavailable — check back soon or visit fm985.com.au</p>
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="rounded-xl border border-one-border/40 bg-one-border/10 p-6 text-center">
                <Mic2 className="mx-auto mb-3 text-one-muted" size={28} />
                <p className="font-body-small text-one-muted">No recent interviews — check back soon.</p>
              </div>
            )}
            {!loading && !error && items.map((item, i) => <InterviewCard key={item.id} item={item} index={i} />)}
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
