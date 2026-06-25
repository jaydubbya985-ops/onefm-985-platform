import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from '@/components/BrandLogo'

const FIRST_VISIT_KEY = 'one-fm-session-intro'
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

interface PageLoaderProps {
  isReady?: boolean
}

export function InitialPageLoader({ isReady = true }: PageLoaderProps) {
  const isFirstVisit =
    typeof window !== 'undefined' && !sessionStorage.getItem(FIRST_VISIT_KEY)

  const [exiting, setExiting] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!isReady) return
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(FIRST_VISIT_KEY, '1')
    }
    // First visit: hold for full cinematic sequence; repeat visits: brief flash
    const holdMs = isFirstVisit ? 2000 : 400
    const t1 = setTimeout(() => setExiting(true), holdMs)
    const t2 = setTimeout(() => setHidden(true), holdMs + 650)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isReady]) // eslint-disable-line react-hooks/exhaustive-deps

  if (hidden) return null

  /* ── Repeat-visit: simple fade ── */
  if (!isFirstVisit) {
    return (
      <div
        className={`fixed inset-0 z-[9999] bg-[#040B14] flex items-center justify-center transition-opacity duration-500 ${
          exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden
      >
        <BrandLogo variant="primary" className="h-12 w-auto opacity-60" />
      </div>
    )
  }

  /* ── First-visit: cinematic station sign-on ── */
  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease }}
          className="fixed inset-0 z-[9999] bg-[#040B14] flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          {/* Subtle radial glow behind the number */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)',
            }}
          />

          <div className="relative flex flex-col items-center select-none">
            {/* Frequency number — the hero element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.7, delay: 0.12, ease }}
              className="font-heading font-black text-one-gold leading-none tabular-nums"
              style={{
                fontSize: 'clamp(6rem, 22vw, 14rem)',
                letterSpacing: '-0.04em',
                textShadow: '0 0 80px rgba(212,175,55,0.25)',
              }}
            >
              98.5
            </motion.div>

            {/* Live badge row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, delay: 0.45, ease }}
              className="flex items-center gap-3 mt-3"
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-one-red" />
              </span>
              <span className="font-label text-[10px] tracking-[0.35em] text-one-white/50 uppercase">
                ONE FM · SHEPPARTON · ON AIR
              </span>
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" style={{ animationDelay: '0.5s' }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-one-red" />
              </span>
            </motion.div>

            {/* Gold rule sweep */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="mt-6 h-px w-56 origin-left"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #F4E89A 50%, #D4AF37 80%, transparent 100%)',
              }}
            />

            {/* Station logo — appears after rule */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, delay: 1.1, ease }}
              className="mt-6"
            >
              <BrandLogo variant="primary" className="h-8 w-auto opacity-40" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
