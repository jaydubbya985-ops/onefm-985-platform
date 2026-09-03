import { Component, type ErrorInfo, type ReactNode } from 'react'
import { PublicCrashScreen } from '@/components/PublicCrashScreen'
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
      return this.props.fallback ?? <PublicCrashScreen scene={<CrashScenePhoto />} />
    }

    return this.props.children
  }
}
