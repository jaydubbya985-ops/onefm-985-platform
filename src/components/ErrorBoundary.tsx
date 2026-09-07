import { Component, type ErrorInfo, type ReactNode } from 'react'
import { CrashFallback } from '@/components/CrashFallback'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
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
          <CrashFallback
            photoSrc={STATION_PHOTOS.geoCanolaTree}
            photoNote="Unused Goulburn Valley canola-tree archive — not a presenter portrait."
            onRefresh={() => window.location.reload()}
          />
        )
      )
    }

    return this.props.children
  }
}
