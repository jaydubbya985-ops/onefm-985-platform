import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/BrandLogo'

interface PageLoaderProps {
  isReady?: boolean
}

export function InitialPageLoader({ isReady = true }: PageLoaderProps) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (isReady) {
      const t = setTimeout(() => setHidden(true), 300)
      return () => clearTimeout(t)
    }
  }, [isReady])

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-one-navy flex items-center justify-center transition-opacity duration-500 ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-one-border animate-spin">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
              <div className="w-2.5 h-2.5 rounded-full bg-one-gold" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BrandLogo variant="mark" className="h-10 w-10" />
          </div>
        </div>
        <BrandLogo variant="primary" className="h-14 w-auto max-w-[220px]" />
      </div>
    </div>
  )
}

export function RouteFallback() {
  return (
    <div className="min-h-screen bg-one-navy flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo variant="primary" className="h-16 w-auto animate-pulse" />
        <div className="h-1 w-32 bg-one-border rounded-full overflow-hidden">
          <div className="h-full bg-one-gold animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  )
}
