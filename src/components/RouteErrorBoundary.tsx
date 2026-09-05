import { Component, type ErrorInfo, type ReactNode } from 'react'
import { PublicCrashScreen } from '@/components/PublicCrashScreen'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

interface Props {
  children: ReactNode
  routeName?: string
}

interface State {
  hasError: boolean
}

/** Unused Goulburn Valley solar-farm archive — not a presenter portrait. */
function ErrorScenePhoto() {
  return (
    <>
      <img
        src={STATION_PHOTOS.ecoSolarFarm}
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

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Route error (${this.props.routeName ?? 'unknown'}):`, error, info)
  }

  render() {
    if (this.state.hasError) {
      return <PublicCrashScreen scene={<ErrorScenePhoto />} routeName={this.props.routeName} />
    }

    return this.props.children
  }
}

export function RouteGuard({ children, routeName }: Props) {
  return <RouteErrorBoundary routeName={routeName}>{children}</RouteErrorBoundary>
}
