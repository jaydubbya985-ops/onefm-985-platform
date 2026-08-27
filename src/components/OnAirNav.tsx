/**
 * ON AIR navigation — rockhall pattern, approved spec (2026-07-05).
 * The bar holds exactly three objects: logo + living lamp, LISTEN LIVE,
 * and the menu button. The menu is a full-screen destination: six poster
 * lines with photo bars, a quiet secondary row, stats along the bottom.
 * Identical at every viewport — one system, nothing to desync.
 */
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, Menu } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { stationStats } from '@/data/pricing'

const RED = '#E51636'
const EXPO = [0.16, 1, 0.3, 1] as const

const MENU: { label: string; to: string; img: string }[] = [
  { label: 'Home', to: '/', img: '/studio-control-room.jpg' },
  { label: 'Listen', to: '/listen', img: '/on-air-host-1.jpg' },
  { label: 'Our Community', to: '/community', img: '/assets/images/heritage-ob-mall-1989.jpg' },
  { label: 'History', to: '/heritage', img: '/assets/images/heritage-original-panel-1988.jpg' },
  { label: 'Sponsor', to: '/sponsorship', img: '/assets/images/gvl-action-sprint.jpg' },
  { label: 'Donate', to: '/support', img: '/assets/images/heritage-di-hunter-carols-2014.jpg' },
]

const SECONDARY: { label: string; to: string }[] = [
  { label: 'Programs', to: '/programs' },
  { label: 'GVL Footy', to: '/football' },
  { label: 'Coverage', to: '/coverage' },
  { label: 'Media Kit', to: '/media-kit' },
  { label: 'Request a proposal', to: '/proposal' },
  { label: 'Contact', to: '/contact' },
  { label: 'Ops', to: '/ops' },
]

export function OnAirNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const meta = usePlayerMetadata()
  const reduced = useReducedMotion()

  const [lastPath, setLastPath] = useState(location.pathname)

  // Close menu on navigation (render-phase adjustment)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* ── The bar: three objects ── */}
      <nav
        className={`fixed top-0 inset-x-0 z-[300] transition-colors duration-300 ${
          scrolled || open ? 'bg-one-navy/92 backdrop-blur-xl border-b border-white/8' : 'bg-transparent'
        }`}
        style={{ height: 68 }}
        aria-label="Main"
      >
        <div className="h-full px-5 md:px-10 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3 shrink-0" aria-label="ONE FM 98.5 — Home" data-cursor-label="HOME">
            <BrandLogo variant="white" className="logo-live h-10 w-auto object-contain max-w-[min(180px,40vw)]" />
            <span className="relative flex h-2.5 w-2.5" title={meta.isLive ? 'On air' : 'Automated'}>
              <span className="lamp-ring" aria-hidden />
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: RED }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: RED }} />
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/listen"
              data-cursor-label="LISTEN"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-[12px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.03] transition-transform"
              style={{ background: RED }}
            >
              ▶ Listen Live
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="onair-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              data-cursor-label={open ? 'CLOSE' : 'MENU'}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white/60 transition-colors"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── The menu: a destination ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="onair-menu"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[290] bg-one-navy overflow-y-auto"
          >
            <div className="min-h-full flex flex-col px-5 md:px-10 pt-24 pb-8">
              <div className="flex-1">
                {MENU.map((item, i) => {
                  const active = location.pathname === item.to
                  return (
                    <span key={item.to} className="block overflow-hidden">
                      <motion.span
                        className="block"
                        initial={reduced ? false : { y: '105%' }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.55, delay: 0.06 + i * 0.06, ease: EXPO }}
                      >
                        <Link
                          to={item.to}
                          data-cursor-label={item.label.toUpperCase()}
                          className="group flex items-center gap-5 py-1.5 border-b border-white/8"
                        >
                          <span
                            className={`font-poster uppercase leading-[1.05] text-[clamp(38px,7.5vh,76px)] ${active ? '' : 'poster-hover'}`}
                            style={{ color: active ? RED : '#fff' }}
                          >
                            {item.label}
                          </span>
                          <span
                            className="hidden md:block flex-1 max-w-[280px] h-[52px] rounded bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 grayscale-[30%]"
                            style={{ backgroundImage: `url('${item.img}')` }}
                            aria-hidden
                          />
                          {active && (
                            <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}>
                              ● You're here
                            </span>
                          )}
                        </Link>
                      </motion.span>
                    </span>
                  )
                })}
              </div>

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
              >
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6">
                  {SECONDARY.map((s) => (
                    <Link
                      key={s.to}
                      to={s.to}
                      className="text-[12px] font-bold tracking-[0.14em] uppercase text-white/45 hover:text-white transition-colors"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-white/8 text-[11px] tracking-[0.16em] uppercase text-white/30">
                  98.5 FM · Shepparton · Est. {stationStats.weeklyListeners.toLocaleString()} weekly listeners · Community radio since 1989
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
