import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { isMiniPlayerHidden, MINI_PLAYER_CLEARANCE_CLASS } from '@/lib/bottomChrome'

const CONSENT_KEY = 'onefm_cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    if (typeof localStorage === 'undefined') return false
    return !localStorage.getItem(CONSENT_KEY)
  })
  const location = useLocation()
  const sitAboveMini = !isMiniPlayerHidden(location.pathname)

  useEffect(() => {
    setVisible(!localStorage.getItem(CONSENT_KEY))
  }, [location.pathname])

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
          className={`fixed left-0 right-0 z-[180] bg-one-navy/95 backdrop-blur-xl border-t border-one-border ${
            sitAboveMini ? MINI_PLAYER_CLEARANCE_CLASS : 'bottom-0'
          }`}
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-one-gold/15 shrink-0 mt-0.5">
                  <Cookie size={18} className="text-one-gold" />
                </div>
                <div className="space-y-1">
                  <p className="font-body-small text-one-white">
                    No third-party analytics. A consent preference stays on this device.
                  </p>
                  <Link
                    to="/privacy"
                    className="inline-flex items-center gap-1 text-xs text-one-gold link-hover"
                  >
                    Privacy Policy
                  </Link>
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
