import { AlertTriangle } from 'lucide-react'
import { BRAND } from '@/lib/brand'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'

const RED = '#E51636'

/**
 * Public crash chrome. Do not stamp coverage. Do not print the thrown
 * message on screen (that can leak internals). Console already has the stack.
 */
export function CrashFallback({
  photoSrc,
  photoNote,
  routeName,
  onRefresh,
}: {
  photoSrc: string
  photoNote: string
  routeName?: string
  onRefresh?: () => void
}) {
  return (
    <div className="relative min-h-screen bg-one-navy flex items-center justify-center px-4 overflow-hidden">
      <img
        src={photoSrc}
        alt=""
        aria-hidden
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#071D3A]/72 via-[#071D3A]/86 to-[#071D3A]"
      />
      <p className="sr-only">{photoNote}</p>
      <div className="relative z-10 max-w-md text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-one-red mx-auto" aria-hidden />
        <h1 className="font-heading text-2xl text-one-white">
          This page didn&apos;t load<span style={{ color: RED }}>.</span>
        </h1>
        {routeName ? (
          <p className="text-one-muted text-sm">Tried to open {routeName}.</p>
        ) : null}
        <p className="text-one-muted text-sm">
          Refresh or go home. Nothing was sent to the station from this screen.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              data-cursor-label="REFRESH"
              className="btn-primary inline-block text-sm"
            >
              Refresh
            </button>
          ) : null}
          <a href="#/" data-cursor-label="HOME" className="btn-primary inline-block text-sm">
            Home
          </a>
        </div>
        <p className="text-one-muted/80 text-[11px]">
          {BRAND.phone} · {BRAND.email}
        </p>
        <p className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-one-red hover:text-one-white transition-colors"
          >
            Facebook
          </a>
          <a
            href={SOUNDCLOUD_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-one-red hover:text-one-white transition-colors"
          >
            SoundCloud
          </a>
        </p>
      </div>
    </div>
  )
}
