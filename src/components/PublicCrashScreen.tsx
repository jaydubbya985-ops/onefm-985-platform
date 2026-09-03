import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'

interface PublicCrashScreenProps {
  scene: ReactNode
  /** Human route name only — never a stack or exception string. */
  routeName?: string
}

/**
 * Public crash chrome. The page failed; 98.5 FM did not.
 * Never print the exception string. No coverage stamp.
 * Listen is a hash link — this screen can render outside HashRouter.
 */
export function PublicCrashScreen({ scene, routeName }: PublicCrashScreenProps) {
  return (
    <div className="relative min-h-screen bg-one-navy flex items-center justify-center px-4 overflow-hidden">
      {scene}
      <div className="relative z-10 max-w-md text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-one-gold mx-auto" />
        <h1 className="font-heading text-2xl text-one-white">This view failed</h1>
        {routeName ? (
          <p className="text-one-muted text-sm">On: {routeName}</p>
        ) : null}
        <p className="text-one-muted text-sm leading-relaxed">
          The page stopped working. 98.5 FM is still on air — refresh this tab, go
          home, or open Listen.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            data-cursor-label="REFRESH"
            className="btn-primary inline-block text-sm"
          >
            Refresh
          </button>
          <a href="/#/" data-cursor-label="HOME" className="btn-secondary inline-block text-sm">
            Home
          </a>
          <a href="/#/listen" data-cursor-label="LISTEN" className="btn-secondary inline-block text-sm">
            Listen Live
          </a>
        </div>
        <p className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-one-gold hover:text-one-white transition-colors"
          >
            Facebook
          </a>
          <a
            href={SOUNDCLOUD_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-one-gold hover:text-one-white transition-colors"
          >
            SoundCloud
          </a>
        </p>
      </div>
    </div>
  )
}
