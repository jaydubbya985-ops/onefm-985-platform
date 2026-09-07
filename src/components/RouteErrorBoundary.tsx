import { Component, type ErrorInfo, type ReactNode } from 'react'
import { CrashFallback } from '@/components/CrashFallback'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

interface Props {
  children: ReactNode
  routeName?: string
}

interface State {
  hasError: boolean
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
      return (
        <CrashFallback
          photoSrc={STATION_PHOTOS.ecoSolarFarm}
          photoNote="Unused Goulburn Valley solar-farm archive — not a presenter portrait."
          routeName={this.props.routeName}
        />
      )
    }

    return this.props.children
  }
}

export function RouteGuard({ children, routeName }: Props) {
  return <RouteErrorBoundary routeName={routeName}>{children}</RouteErrorBoundary>
}
