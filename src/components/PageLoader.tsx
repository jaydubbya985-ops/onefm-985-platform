import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from '@/components/BrandLogo'
import { OfflineListenBanner } from '@/components/OfflineListenBanner'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

const FIRST_VISIT_KEY = 'one-fm-session-intro'
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

/** Unused station archive still — transmitter tower at night. Not a live listener count. */
function TowerNightBackdrop() {
  return (
    <>
      <img
        src={STATION_PHOTOS.towerStarsNight}
        alt=""
        aria-hidden
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/72 via-[#0A0A0A]/50 to-[#0A0A0A]/88"
      />
    </>
  )
}

interface PageLoaderProps {
  isReady?: boolean
}

/**
 * ON AIR sign-on — a fast red flash of the frequency, not a cinematic hold.
 * Content must be visible in under a second (Awwwards usability + honesty:
 * the old 2s gold sequence was the single biggest dead-time on the site).
 */
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
    const holdMs = isFirstVisit ? 700 : 120
    const t1 = setTimeout(() => setExiting(true), holdMs)
    const t2 = setTimeout(() => setHidden(true), holdMs + 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isReady]) // eslint-disable-line react-hooks/exhaustive-deps

  if (hidden) return <OfflineListenBanner />

  /* ── Repeat-visit: near-instant fade ── */
  if (!isFirstVisit) {
    return (
      <>
        <OfflineListenBanner />
        <div
          className={`fixed inset-0 z-[9999] bg-[#0A0A0A] transition-opacity duration-300 ${
            exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-hidden
        />
      </>
    )
  }

  /* ── First-visit: ON AIR sign-on flash ── */
  return (
    <>
      <OfflineListenBanner />
      <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease }}
          className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <TowerNightBackdrop />
          <div className="relative flex flex-col items-center select-none">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease }}
              className="font-poster leading-none"
              style={{ fontSize: 'clamp(6rem, 22vw, 13rem)', color: '#E51636' }}
            >
              98.5
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease }}
              className="flex items-center gap-3 mt-2"
            >
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              <span className="font-label text-[11px] tracking-[0.35em] text-white/60 uppercase">
                ONE FM · SHEPPARTON · ON AIR
              </span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </motion.div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}

export function RouteFallback() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
      <TowerNightBackdrop />
      <div className="relative flex flex-col items-center gap-4">
        <BrandLogo variant="white" className="h-14 w-auto animate-pulse" />
        <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#E51636] animate-[shimmer_1.5s_infinite]" />
        </div>
        <p className="font-label text-[10px] tracking-[0.22em] text-white/40 uppercase">
          Station archive · transmitter at night
        </p>
      </div>
    </div>
  )
}
