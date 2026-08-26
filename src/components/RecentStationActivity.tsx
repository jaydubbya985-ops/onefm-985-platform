import { useEffect, useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  inferActivityTown,
  RECENT_STATION_ACTIVITY,
  type StationActivity,
} from '@/data/recentStationActivity'
import {
  fetchLatestInterviews,
  fetchLatestSport,
  formatInterviewDate,
  showTypePhoto,
  type Fm985Interview,
} from '@/lib/fm985Feed'
import { HeadlinePop } from '@/components/motion/PosterReveal'
import { TiltCard } from '@/components/TiltCard'
import { MagneticButton } from '@/components/MagneticButton'

function canonUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase()
}

function fromFeed(post: Fm985Interview): StationActivity {
  const kind = post.kind ?? 'interview'
  return {
    id: `live-${post.id}`,
    date: post.date.slice(0, 10),
    title: post.title,
    town: inferActivityTown(post.title),
    kind,
    sourceUrl: post.link,
    contextImg: post.imageUrl || showTypePhoto(kind),
  }
}

const KIND_LABEL: Record<StationActivity['kind'], string> = {
  interview: 'Interview',
  sport: 'Sport',
  community: 'Community',
}

function ActivityCard({ item, index }: { item: StationActivity; index: number }) {
  const fallback = showTypePhoto(item.kind)
  const [imgSrc, setImgSrc] = useState(item.contextImg)

  useEffect(() => {
    setImgSrc(item.contextImg)
  }, [item.contextImg])

  return (
    <TiltCard maxTilt={4}>
      <motion.a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor-label="FM985"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card overflow-hidden group block h-full"
      >
        <div className="relative h-36 overflow-hidden bg-one-navy">
          <img
            src={imgSrc}
            alt=""
            width={640}
            height={288}
            loading="lazy"
            decoding="async"
            onError={() => {
              if (imgSrc !== fallback) setImgSrc(fallback)
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 font-label text-[10px] tracking-[0.16em] uppercase bg-one-navy/80 text-one-gold px-2 py-1 rounded">
            {KIND_LABEL[item.kind]}
          </span>
        </div>
        <div className="p-4">
          <time className="font-label text-[10px] text-one-gold">{formatInterviewDate(item.date)}</time>
          <h3 className="font-h4 text-one-white mt-1 line-clamp-3">{item.title}</h3>
          <p className="font-label text-[10px] text-muted mt-2 uppercase tracking-wider">
            {item.town} · fm985.com.au
          </p>
        </div>
      </motion.a>
    </TiltCard>
  )
}

export function RecentStationActivity({
  limit = 8,
  kinds,
}: {
  limit?: number
  kinds?: StationActivity['kind'][]
}) {
  const [liveExtra, setLiveExtra] = useState<StationActivity[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchLatestInterviews(8), fetchLatestSport(8)])
      .then(([interviews, sport]) => {
        if (cancelled) return
        const known = new Set(RECENT_STATION_ACTIVITY.map((item) => canonUrl(item.sourceUrl)))
        const extras = [...interviews, ...sport]
          .filter((post) => !known.has(canonUrl(post.link)))
          .map(fromFeed)
        setLiveExtra(extras)
      })
      .catch(() => {
        if (!cancelled) setLiveExtra([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const items = useMemo(() => {
    const merged = [...RECENT_STATION_ACTIVITY, ...liveExtra]
    const seen = new Set<string>()
    const unique: StationActivity[] = []
    for (const item of merged) {
      const key = canonUrl(item.sourceUrl)
      if (seen.has(key)) continue
      seen.add(key)
      if (kinds && !kinds.includes(item.kind)) continue
      unique.push(item)
    }
    unique.sort((a, b) => b.date.localeCompare(a.date))
    return unique.slice(0, limit)
  }, [liveExtra, limit, kinds])

  return (
    <section className="section-padding bg-surface-mid relative" data-cursor-label="STATION ACTIVITY">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-label text-[10px] tracking-[0.22em] text-one-electric mb-3 block">
              FROM FM985.COM.AU
            </span>
            <h2 className="font-h2 text-one-white mt-2">
              <HeadlinePop>Recent station activity</HeadlinePop>
            </h2>
            <p className="font-body text-muted mt-2 max-w-xl">
              Interviews, Super Saturday sport and community posts from ONE FM 98.5 — titles and
              dates as published. No invented crowd sizes.
            </p>
          </div>
          <MagneticButton strength={6}>
            <a
              href="https://fm985.com.au"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="FM985"
              className="btn-secondary text-xs inline-flex items-center gap-2"
            >
              fm985.com.au <ExternalLink size={14} />
            </a>
          </MagneticButton>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <ActivityCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
