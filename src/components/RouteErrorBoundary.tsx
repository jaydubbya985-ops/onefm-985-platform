import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  routeName?: string
}

interface State {
  hasError: boolean
  error: Error | null
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
        <div className="min-h-[50vh] bg-one-navy flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-one-gold mx-auto" />
            <h2 className="font-heading text-2xl text-one-white">
              Something went wrong
            </h2>
            {this.props.routeName && (
              <p className="text-one-muted text-sm">Page: {this.props.routeName}</p>
            )}
            <p className="text-one-muted text-sm">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <Link to="/" data-cursor-label="HOME" className="btn-primary inline-block text-sm">
              Return Home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function RouteGuard({ children, routeName }: Props) {
  return <RouteErrorBoundary routeName={routeName}>{children}</RouteErrorBoundary>
}
