import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BRAND } from '@/lib/brand'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { formatGuideHours } from '@/lib/guideHours'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

interface Props {
  children: ReactNode
  routeName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

const COVERAGE = formatCoverageShort()
const GVL_HOURS = formatGuideHours('GVL Match of the Day')
export const SOLAR_ARCHIVE_ALT = `Goulburn Valley solar farm — ${BRAND.fullName} station archive · ${COVERAGE}`

/** Unused Goulburn Valley solar-farm archive — not a presenter portrait. */
function ErrorScenePhoto() {
  return (
    <>
      <img
        src={STATION_PHOTOS.ecoSolarFarm}
        alt={SOLAR_ARCHIVE_ALT}
        title={SOLAR_ARCHIVE_ALT}
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

/** Per-route crash screen — sourced coverage + GVL hours, no empty decorative alt. */
export function RouteErrorFallback({
  routeName,
  message,
}: {
  routeName?: string
  message?: string
}) {
  return (
    <div className="relative min-h-screen bg-one-navy flex items-center justify-center px-4 overflow-hidden">
      <ErrorScenePhoto />
      <div className="relative z-10 max-w-md text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-one-gold mx-auto" />
        <h2 className="font-heading text-2xl text-one-white">
          Something went wrong
        </h2>
        {routeName && (
          <p className="text-one-muted text-sm">Page: {routeName}</p>
        )}
        <p className="text-one-muted text-sm">
          {message ?? 'An unexpected error occurred.'}
        </p>
        <Link to="/" data-cursor-label="HOME" className="btn-primary inline-block text-sm">
          Return Home
        </Link>
        <p className="text-one-muted/80 text-[11px]">
          {COVERAGE} — ABS 2021 via townData
          {GVL_HOURS ? ` · GVL Match of the Day · ${GVL_HOURS}` : ''}
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
}

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Route error (${this.props.routeName ?? 'unknown'}):`, error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <RouteErrorFallback
          routeName={this.props.routeName}
          message={this.state.error?.message}
        />
      )
    }

    return this.props.children
  }
}

export function RouteGuard({ children, routeName }: Props) {
  return <RouteErrorBoundary routeName={routeName}>{children}</RouteErrorBoundary>
}
