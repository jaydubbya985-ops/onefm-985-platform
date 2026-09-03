import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from '@/components/BrandLogo'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { formatCoverageShort, formatWeeklyListeners } from '@/lib/coverageCopy'
import { formatBreakfastChromeLabel } from '@/data/programGuide'
import { formatGuideHours } from '@/lib/guideHours'
import { confirmedSocialNote, FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'

const GVL_MATCH_HOURS = formatGuideHours('GVL Match of the Day') ?? 'Saturday'
const BREAKFAST_LINE = formatBreakfastChromeLabel()
const COVERAGE_LINE = `${formatCoverageShort()} · ${formatWeeklyListeners()}`

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

  if (hidden) return null

  /* ── Repeat-visit: near-instant fade ── */
  if (!isFirstVisit) {
    return (
      <div
        className={`fixed inset-0 z-[9999] bg-[#0A0A0A] transition-opacity duration-300 ${
          exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden
      />
    )
  }

  /* ── First-visit: ON AIR sign-on flash ── */
  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease }}
          className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex items-center justify-center overflow-hidden"
          role="status"
          aria-label={`ONE FM 98.5 on air. ${COVERAGE_LINE}. Weekday breakfast ${BREAKFAST_LINE}.`}
        >
          <TowerNightBackdrop />
          <div className="relative flex flex-col items-center select-none px-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease }}
              className="font-poster leading-none"
              style={{ fontSize: 'clamp(6rem, 22vw, 13rem)', color: '#E51636' }}
              aria-hidden
            >
              98.5
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease }}
              className="flex flex-col items-center gap-2 mt-2 max-w-xl text-center"
            >
              <span className="flex items-center gap-3">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                <span className="font-label text-[11px] tracking-[0.35em] text-white/60 uppercase">
                  ONE FM · SHEPPARTON · ON AIR
                </span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              <p className="font-label text-[9px] tracking-[0.16em] uppercase text-white/45 leading-relaxed">
                {COVERAGE_LINE}
                <span className="text-white/30"> · ABS 2021 via townData</span>
              </p>
              <p className="font-label text-[9px] tracking-[0.14em] uppercase text-white/40 leading-relaxed">
                Weekday breakfast · {BREAKFAST_LINE}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
        <p className="font-label text-[9px] tracking-[0.14em] uppercase text-white/40 text-center max-w-md leading-relaxed">
          {COVERAGE_LINE}
          <span className="text-white/30"> · ABS 2021 via townData</span>
        </p>
        <p className="font-label text-[9px] tracking-[0.14em] uppercase text-white/35 text-center max-w-lg leading-relaxed">
          Weekday breakfast · {BREAKFAST_LINE}
        </p>
        <p className="font-label text-[9px] tracking-[0.14em] uppercase text-white/35 text-center">
          GVL Match of the Day · {GVL_MATCH_HOURS} · premium, never the $25 floor
        </p>
        <p className="flex flex-wrap justify-center gap-3 font-label text-[10px] tracking-[0.12em] uppercase">
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white transition-colors"
          >
            Facebook
          </a>
          <a
            href={SOUNDCLOUD_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white transition-colors"
          >
            SoundCloud
          </a>
        </p>
        <p className="font-label text-[9px] tracking-[0.12em] uppercase text-white/30">
          {confirmedSocialNote()}
        </p>
      </div>
    </div>
  )
}
