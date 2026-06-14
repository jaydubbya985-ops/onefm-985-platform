import { ExternalLink } from 'lucide-react'
import { FACEBOOK_PAGE_URL, facebookPageEmbedUrl } from '@/lib/socialLinks'

export function FacebookPageEmbed({ height = 400 }: { height?: number }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden border-one-border/60">
      <div className="p-4 border-b border-one-border/60 flex items-center justify-between gap-2">
        <div>
          <p className="font-label text-one-gold text-[10px]">FOLLOW US</p>
          <h3 className="font-h4 text-one-white">Facebook</h3>
        </div>
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label text-[10px] text-muted hover:text-one-gold inline-flex items-center gap-1 shrink-0"
        >
          Open <ExternalLink size={12} />
        </a>
      </div>
      <iframe
        title="ONE FM 98.5 on Facebook"
        src={facebookPageEmbedUrl(500, height)}
        width="100%"
        height={height}
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder="0"
        allow="encrypted-media"
        allowFullScreen
        className="w-full bg-white"
      />
    </div>
  )
}
