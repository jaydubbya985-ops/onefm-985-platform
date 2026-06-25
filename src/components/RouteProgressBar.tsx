import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function RouteProgressBar() {
  const location = useLocation()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)
  const prevKey = useRef(location.key)

  useEffect(() => {
    if (location.key === prevKey.current) return
    prevKey.current = location.key

    window.clearTimeout(timerRef.current)
    setVisible(true)
    setWidth(0)

    // Rapid sweep to 75%
    const t1 = window.setTimeout(() => setWidth(75), 30)
    // Slow crawl to 90%
    const t2 = window.setTimeout(() => setWidth(90), 400)
    // Complete and fade
    const t3 = window.setTimeout(() => setWidth(100), 700)
    const t4 = window.setTimeout(() => setVisible(false), 900)

    timerRef.current = t4
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); window.clearTimeout(t4) }
  }, [location.key])

  if (!visible && width === 0) return null

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 2,
        width: `${width}%`,
        zIndex: 99997,
        pointerEvents: 'none',
        backgroundImage: 'linear-gradient(90deg, #D4AF37 0%, var(--one-electric) 60%, #D4AF37 100%)',
        backgroundSize: '200% 100%',
        animation: width > 0 && width < 100 ? 'shimmerBar 1.2s linear infinite' : 'none',
        opacity: visible ? 1 : 0,
        transition: `width ${width === 0 ? '0ms' : width === 100 ? '250ms' : '600ms'} cubic-bezier(0.16,1,0.3,1), opacity 200ms ease`,
        boxShadow: '0 0 8px rgba(var(--one-electric-rgb), 0.4)',
      }}
    />
  )
}
