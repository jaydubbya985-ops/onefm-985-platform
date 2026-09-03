import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { formatCoverageShort, formatWeeklyListeners } from '@/lib/coverageCopy'
import { formatBreakfastChromeLabel } from '@/data/programGuide'
import { formatGuideHours } from '@/lib/guideHours'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import {
  FACEBOOK_PAGE_URL,
  SOUNDCLOUD_PROFILE_URL,
  confirmedSocialNote,
} from '@/lib/socialLinks'

const CONSENT_KEY = 'onefm_cookie_consent'
const GVL_MATCH_HOURS = formatGuideHours('GVL Match of the Day') ?? 'Saturday'
const BREAKFAST_CHROME = formatBreakfastChromeLabel()

/**
 * Unused Murray riverboat still — mark size only, not a hero.
 * Landmark, not a presenter portrait.
 */
function RiverboatArchiveMark() {
  return (
    <img
      src={STATION_PHOTOS.cultureRiverboatMurray}
      alt=""
      aria-hidden
      width={40}
      height={40}
      decoding="async"
      className="hidden sm:block shrink-0 mt-0.5 rounded-full object-cover object-center border border-white/14"
      style={{ width: 40, height: 40 }}
    />
  )
}

export function CookieConsent() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(CONSENT_KEY))

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-one-navy/95 backdrop-blur-xl border-t border-one-border"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <RiverboatArchiveMark />
                <div className="space-y-1.5">
                  <p className="font-label text-[11px] tracking-[0.12em] uppercase text-one-white/55">
                    Volunteer-run · {formatCoverageShort()}
                  </p>
                  <p className="font-body-small text-one-white">
                    No third-party analytics. A consent preference stays on this device.{' '}
                    {formatWeeklyListeners()} across {formatCoverageShort()} (ABS 2021 via
                    townData).
                  </p>
                  <p className="font-label text-[11px] tracking-[0.12em] uppercase text-one-white/50 leading-relaxed">
                    Weekday breakfast · {BREAKFAST_CHROME}
                    <br />
                    GVL Match of the Day · {GVL_MATCH_HOURS}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                    <Link
                      to="/privacy"
                      className="inline-flex items-center text-xs text-one-gold link-hover"
                    >
                      Privacy Policy
                    </Link>
                    <a
                      href={FACEBOOK_PAGE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-one-white/50 hover:text-one-gold transition-colors"
                    >
                      Facebook
                    </a>
                    <a
                      href={SOUNDCLOUD_PROFILE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-one-white/50 hover:text-one-gold transition-colors"
                    >
                      SoundCloud
                    </a>
                    <span className="font-label text-[10px] tracking-[0.1em] uppercase text-one-white/35">
                      {confirmedSocialNote()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={accept}
                  data-cursor-label="ACCEPT"
                  className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
