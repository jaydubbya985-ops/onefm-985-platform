import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/** Unused Goulburn Valley canola-tree archive — not a presenter portrait. */
function CrashScenePhoto() {
  return (
    <>
      <img
        src={STATION_PHOTOS.geoCanolaTree}
        alt=""
        aria-hidden
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#071D3A]/72 via-[#071D3A]/86 to-[#071D3A]"
      />
    </>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="relative min-h-screen bg-one-navy flex items-center justify-center px-4 overflow-hidden">
            <CrashScenePhoto />
            <div className="relative z-10 max-w-md text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-one-gold mx-auto" />
              <h2 className="font-heading text-2xl text-one-white">
                Something went wrong
              </h2>
              <p className="text-one-muted text-sm">Please refresh the page.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                data-cursor-label="REFRESH"
                className="btn-primary inline-block text-sm"
              >
                Refresh
              </button>
              <p className="text-one-muted/80 text-[11px]">
                {formatCoverageShort()} — ABS 2021 via townData
              </p>
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
      )
    }

    return this.props.children
  }
}
