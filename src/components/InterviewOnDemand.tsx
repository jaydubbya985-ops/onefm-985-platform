import { ExternalLink } from 'lucide-react'
import { FacebookPanel } from '@/components/social/FacebookPanel'
import { SoundCloudPanel } from '@/components/social/SoundCloudPanel'
import { WordReveal } from '@/components/WordReveal'
import { SOUNDCLOUD_PROFILE_URL, confirmedSocialNote } from '@/lib/socialLinks'

/**
 * One station SoundCloud — not three invented podcast products.
 * Interviews from fm985.com.au play here; there are no separate
 * GVL / community download counts.
 */
export function InterviewOnDemand() {
  return (
    <section className="section-padding section-bleed-top bg-surface-warm" data-cursor-label="ON DEMAND">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <WordReveal text="Interviews after broadcast" className="font-h2 text-one-white mb-3 block" as="h2" />
          <p className="font-body text-muted">
            {confirmedSocialNote()}. Local interviews live on one SoundCloud profile after they air —
            not three podcasts, and not invented episode counts.
          </p>
          <a
            href={SOUNDCLOUD_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-label="SOUNDCLOUD"
            className="inline-flex items-center gap-1.5 mt-4 font-label text-[11px] text-one-gold link-hover"
          >
            Open soundcloud.com/user-570295409
            <ExternalLink size={12} />
          </a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <SoundCloudPanel />
          </div>
          <div className="lg:col-span-5">
            <FacebookPanel compact />
          </div>
        </div>
      </div>
    </section>
  )
}
