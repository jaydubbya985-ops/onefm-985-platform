import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Headphones, Lock, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from '@/components/BrandLogo'
import { useOpsAccess } from '@/hooks/useOpsAccess'
import { NAV_GROUPS, type NavGroup } from '@/lib/siteNav'
import { useWeatherCycle } from '@/hooks/useWeatherCycle'
import { gvWeatherTowns } from '@/data/weatherLocations'
import { formatTempC } from '@/lib/weather'

const SHEPPARTON_ONLY = gvWeatherTowns.slice(0, 1)

const ease = [0.16, 1, 0.3, 1] as const

function getSheppartonHHMMSS() {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
}

function SignalMeter() {
  return (
    <div
      aria-hidden
      style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 14 }}
    >
      {[4, 7, 10, 14].map((h, i) => (
        <div
          key={i}
          style={{
            width: 2.5,
            height: h,
            background: 'var(--one-electric)',
            borderRadius: 1,
            animation: `signal-flicker ${1.7 + i * 0.28}s ease-in-out ${i * 0.38}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function NavWeather() {
  const { weather } = useWeatherCycle(SHEPPARTON_ONLY)
  if (!weather) return null
  return (
    <span
      title={`Shepparton ${formatTempC(weather.tempC)}`}
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.6rem',
        letterSpacing: '0.04em',
        color: 'rgba(255,255,255,0.3)',
        userSelect: 'none',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      {formatTempC(weather.tempC)}
    </span>
  )
}

function BroadcastClock() {
  const [time, setTime] = useState(getSheppartonHHMMSS)
  const tick = useCallback(() => setTime(getSheppartonHHMMSS()), [])
  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])
  return (
    <span
      aria-label={`Shepparton local time: ${time}`}
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.6rem',
        letterSpacing: '0.06em',
        color: 'rgba(255,255,255,0.3)',
        userSelect: 'none',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {time}
    </span>
  )
}

function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  const [lastPath, setLastPath] = useState(location.pathname)

  // Close dropdown on navigation (render-phase adjustment)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const isActive = group.items.some((item) => location.pathname === item.path)

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        data-cursor-label={group.label.toUpperCase()}
        className={`relative flex items-center gap-1 px-3 py-2 font-label text-xs uppercase tracking-wider transition-colors duration-150 ${
          isActive || open ? 'text-[#E51636]' : 'text-one-white hover:text-white'
        }`}
      >
        {group.label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease }}
          className="inline-flex"
        >
          <ChevronDown className="w-3 h-3" />
        </motion.span>
        {(isActive || open) && (
          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#E51636] rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease }}
            className="absolute top-full left-0 mt-1 w-56 bg-[#0F0F0F]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
          >
            {group.items.map((item, i) => {
              const active = location.pathname === item.path
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.045, duration: 0.22, ease }}
                >
                  <Link
                    to={item.path}
                    className={`block px-4 py-3 transition-colors border-b border-white/10 last:border-0 ${
                      active
                        ? 'text-[#E51636] bg-white/10'
                        : 'text-[#F4F1EA]/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="font-body text-sm block">{item.label}</span>
                    {item.description && (
                      <span className="font-body-small text-muted text-[11px] block mt-0.5 leading-snug">
                        {item.description}
                      </span>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function OpsAccessModal({
  show,
  useAuthGate,
  onSubmitPassword,
  onSubmitLogin,
  onClose,
}: {
  show: boolean
  useAuthGate: boolean
  onSubmitPassword: (password: string) => boolean
  onSubmitLogin: (email: string, password: string) => Promise<boolean>
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [wasShown, setWasShown] = useState(false)

  // Reset form whenever the modal opens (render-phase adjustment)
  if (show && !wasShown) {
    setWasShown(true)
    setEmail('')
    setPassword('')
    setError(false)
  } else if (!show && wasShown) {
    setWasShown(false)
  }

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [show])

  if (!show) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (useAuthGate) {
      setSubmitting(true)
      const ok = await onSubmitLogin(email, password)
      if (!ok) setError(true)
      setSubmitting(false)
    } else if (!onSubmitPassword(password)) {
      setError(true)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#111111] border border-white/10 rounded-xl max-w-sm w-full mx-4 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#E51636]/12 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#E51636]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-one-white">Operations Portal</h3>
            <p className="text-xs text-one-muted">
              {useAuthGate ? 'Staff sign in required' : 'Authorised access only'}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {useAuthGate && (
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false) }}
              placeholder="you@fm985.com.au"
              required
              className="w-full bg-[#111111] border border-white/15 rounded-lg px-4 py-3 text-sm text-one-white placeholder-one-muted focus:border-[#E51636] focus:outline-none"
            />
          )}
          <input
            ref={useAuthGate ? undefined : inputRef}
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            placeholder="Enter password"
            required
            className="w-full bg-[#111111] border border-white/15 rounded-lg px-4 py-3 text-sm text-one-white placeholder-one-muted focus:border-[#E51636] focus:outline-none"
          />
          {error && (
            <p className="text-xs text-red-400">
              {useAuthGate ? 'Invalid email or password.' : 'Incorrect password. Try again.'}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              data-cursor-label="CANCEL"
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/15 text-one-white text-sm font-label hover:bg-one-slate transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              data-cursor-label={useAuthGate ? 'SIGN IN' : 'UNLOCK'}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#E51636] text-white text-sm font-label font-bold hover:bg-[#F4F1EA] transition-colors disabled:opacity-60"
            >
              {useAuthGate ? (submitting ? 'Signing in…' : 'Sign In') : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)
  const ops = useOpsAccess()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [lastMobilePath, setLastMobilePath] = useState(location.pathname)

  // Close mobile menu on navigation (render-phase adjustment)
  if (lastMobilePath !== location.pathname) {
    setLastMobilePath(location.pathname)
    setMobileOpen(false)
  }

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const goToOps = () => {
    if (ops.tryAccess()) window.location.hash = '#/ops'
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-nav' : 'bg-transparent'
        }`}
        style={{ height: 72 }}
      >
        {/* Scroll progress bar */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 h-[1.5px] transition-none pointer-events-none"
          style={{
            width: `${scrollPct * 100}%`,
            background: '#E51636',
            opacity: scrolled ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="ONE FM 98.5 — Home" data-cursor-label="HOME">
            <BrandLogo
              variant="white"
              className="h-11 sm:h-12 w-auto object-contain drop-shadow-lg max-w-[min(200px,42vw)]"
            />
            <span className="relative flex h-2.5 w-2.5 hidden sm:flex">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-[#E51636] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E51636]" />
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`relative px-3 py-2 font-label text-xs uppercase tracking-wider transition-colors ${
                location.pathname === '/'
                  ? 'text-[#E51636]'
                  : 'text-one-white hover:text-white'
              }`}
            >
              Home
              {location.pathname === '/' && (
                <span className="block h-0.5 bg-[#E51636] rounded-full mt-0.5" />
              )}
            </Link>
            {NAV_GROUPS.map((group) => (
              <NavDropdown key={group.label} group={group} />
            ))}
            <button
              type="button"
              onClick={goToOps}
              className={`relative flex items-center gap-1.5 px-3 py-2 font-label text-xs uppercase tracking-wider transition-colors border-l border-white/15 ml-1 pl-4 ${
                location.pathname === '/ops'
                  ? 'text-[#E51636]'
                  : 'text-one-muted hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" />
              Ops
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              to="/listen"
              className="btn-primary text-xs px-4 py-2.5 whitespace-nowrap inline-flex items-center gap-1.5"
              data-cursor-label="TUNE IN"
            >
              <Headphones size={14} />
              Listen Live
            </Link>
            <Link to="/proposal" className="btn-secondary text-xs px-4 py-2.5 whitespace-nowrap" data-cursor-label="REQUEST">
              Request Proposal
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-white/15" data-cursor-label="LIVE STATUS">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-one-red" />
              </span>
              <span className="font-label text-one-red text-xs">ON AIR</span>
              <span className="w-px h-3 bg-one-border/60" aria-hidden />
              <BroadcastClock />
              <span className="w-px h-3 bg-one-border/60" aria-hidden />
              <SignalMeter />
              <span className="w-px h-3 bg-one-border/60" aria-hidden />
              <NavWeather />
            </div>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 text-one-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-cursor-label={mobileOpen ? 'CLOSE' : 'MENU'}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18, ease }}
                className="inline-flex"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <OpsAccessModal
        show={ops.showGate}
        useAuthGate={ops.useAuthGate}
        onSubmitPassword={(pw) => {
          const ok = ops.submitPassword(pw)
          if (ok) window.location.hash = '#/ops'
          return ok
        }}
        onSubmitLogin={async (email, pw) => {
          const ok = await ops.submitLogin(email, pw)
          if (ok) window.location.hash = '#/ops'
          return ok
        }}
        onClose={ops.close}
      />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.38, ease }}
            className="fixed inset-0 z-40 bg-[#0A0A0A]/97 backdrop-blur-xl pt-20 px-6 pb-8 overflow-y-auto lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease }}
            >
              <Link
                to="/listen"
                data-cursor-label="LISTEN"
                className="btn-primary w-full text-center mb-6 inline-flex items-center justify-center gap-2"
              >
                <Headphones size={18} />
                Listen Live
              </Link>
              <Link
                to="/"
                className={`block py-3 font-heading text-xl ${location.pathname === '/' ? 'text-[#E51636]' : 'text-one-white hover:text-white'}`}
              >
                Home
                {location.pathname === '/' && (
                  <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-[#E51636] align-middle" />
                )}
              </Link>
              {NAV_GROUPS.map((group, gi) => (
                <div key={group.label} className="mt-4">
                  <p className="font-label text-xs text-[#E51636] uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                  {group.items.map((item, ii) => {
                    const active = location.pathname === item.path
                    return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + gi * 0.06 + ii * 0.04, duration: 0.3, ease }}
                    >
                      <Link
                        to={item.path}
                        className={`block py-2.5 pl-2 border-b border-white/10 ${active ? 'border-l-2 border-l-[#E51636] pl-3' : ''}`}
                      >
                        <span className={`font-body text-lg block ${active ? 'text-[#E51636]' : 'text-one-white hover:text-white'}`}>
                          {item.label}
                          {active && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-[#E51636] align-middle" />}
                        </span>
                        {item.description && (
                          <span className="font-body-small text-muted text-xs">{item.description}</span>
                        )}
                      </Link>
                    </motion.div>
                    )
                  })}
                </div>
              ))}
              <button
                type="button"
                onClick={goToOps}
                data-cursor-label="OPS"
                className="mt-6 flex items-center gap-2 font-heading text-xl text-one-muted hover:text-white"
              >
                <Lock className="w-4 h-4" />
                Ops Portal
              </button>
              <Link to="/proposal" data-cursor-label="REQUEST" className="btn-secondary mt-4 inline-block w-full text-center">
                Request Proposal
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
