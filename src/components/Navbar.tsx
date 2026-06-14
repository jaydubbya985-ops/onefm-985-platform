import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Lock, Menu, X } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { useOpsAccess } from '@/hooks/useOpsAccess'

const NAV_GROUPS = [
  {
    label: 'Listen',
    items: [
      { label: 'Programs', path: '/programs' },
      { label: 'Broadcast', path: '/broadcast' },
      { label: 'Coverage', path: '/coverage' },
    ],
  },
  {
    label: 'Sponsor',
    items: [
      { label: 'Sponsorship', path: '/sponsorship' },
      { label: 'Media Kit', path: '/media-kit' },
      { label: 'Audience', path: '/audience' },
      { label: 'Social', path: '/social' },
      { label: 'Proposal', path: '/proposal' },
    ],
  },
  {
    label: 'About',
    items: [
      { label: 'Heritage', path: '/heritage' },
      { label: 'Community', path: '/community' },
      { label: 'Story', path: '/story' },
      { label: 'Football', path: '/football' },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Support Us', path: '/support' },
      { label: 'Contact', path: '/contact' },
    ],
  },
]

function NavDropdown({ group }: { group: (typeof NAV_GROUPS)[0] }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const isActive = group.items.some((item) => location.pathname === item.path)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-2 font-label text-xs uppercase tracking-wider transition-colors duration-150 ${
          isActive || open ? 'text-one-gold' : 'text-one-white hover:text-one-gold'
        }`}
      >
        {group.label}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        {(isActive || open) && (
          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-one-gold rounded-full" />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-[#0F1D30]/95 backdrop-blur-xl border border-[#1E3A5F]/40 rounded-lg shadow-2xl overflow-hidden z-50">
          {group.items.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2.5 font-body text-sm transition-colors ${
                  active
                    ? 'text-one-gold bg-[#1E3A5F]/30'
                    : 'text-[#F4F1EA]/80 hover:text-one-gold hover:bg-[#1E3A5F]/20'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
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

  useEffect(() => {
    if (show) {
      setEmail('')
      setPassword('')
      setError(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
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
        className="bg-[#0F1D32] border border-[#1E3A5F]/40 rounded-xl max-w-sm w-full mx-4 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-one-gold/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-one-gold" />
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
              onChange={(e) => {
                setEmail(e.target.value)
                setError(false)
              }}
              placeholder="you@fm985.com.au"
              required
              className="w-full bg-one-navy border border-one-border rounded-lg px-4 py-3 text-sm text-one-white placeholder-one-muted focus:border-one-gold focus:outline-none"
            />
          )}
          <input
            ref={useAuthGate ? undefined : inputRef}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            placeholder="Enter password"
            required
            className="w-full bg-one-navy border border-one-border rounded-lg px-4 py-3 text-sm text-one-white placeholder-one-muted focus:border-one-gold focus:outline-none"
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
              className="flex-1 px-4 py-2.5 rounded-lg border border-one-border text-one-white text-sm font-label hover:bg-one-slate transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-one-gold text-one-navy text-sm font-label font-bold hover:bg-[#F4F1EA] transition-colors disabled:opacity-60"
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
  const ops = useOpsAccess()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const goToOps = () => {
    if (ops.tryAccess()) {
      window.location.hash = '#/ops'
    }
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-nav' : 'bg-transparent'
        }`}
        style={{ height: 72 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="ONE FM 98.5 — Home">
            <BrandLogo
              variant="primary"
              className="h-11 sm:h-12 w-auto object-contain drop-shadow-lg max-w-[min(200px,42vw)]"
            />
            <span className="relative flex h-2.5 w-2.5 hidden sm:flex">
              <span className="animate-signal-pulse absolute inline-flex h-full w-full rounded-full bg-one-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-one-gold" />
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 font-label text-xs uppercase tracking-wider transition-colors ${
                location.pathname === '/'
                  ? 'text-one-gold'
                  : 'text-one-white hover:text-one-gold'
              }`}
            >
              Home
              {location.pathname === '/' && (
                <span className="block h-0.5 bg-one-gold rounded-full mt-0.5" />
              )}
            </Link>
            {NAV_GROUPS.map((group) => (
              <NavDropdown key={group.label} group={group} />
            ))}
            <button
              onClick={goToOps}
              className={`relative flex items-center gap-1.5 px-3 py-2 font-label text-xs uppercase tracking-wider transition-colors border-l border-one-border ml-1 pl-4 ${
                location.pathname === '/ops'
                  ? 'text-one-gold'
                  : 'text-one-muted hover:text-one-gold'
              }`}
            >
              <Lock className="w-3 h-3" />
              Ops
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <Link to="/proposal" className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap">
              Build Proposal
            </Link>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-one-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-one-red" />
              </span>
              <span className="font-label text-one-red text-xs">ON AIR</span>
            </div>
          </div>

          <button
            className="lg:hidden p-2 text-one-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
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

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A1628]/98 backdrop-blur-xl pt-20 px-6 pb-8 overflow-y-auto lg:hidden">
          <Link
            to="/"
            className="block py-3 font-heading text-xl text-one-white hover:text-one-gold"
          >
            Home
          </Link>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mt-4">
              <p className="font-label text-xs text-one-gold uppercase tracking-wider mb-2">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block py-2 pl-2 font-body text-lg text-one-white hover:text-one-gold"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          <button
            onClick={goToOps}
            className="mt-6 flex items-center gap-2 font-heading text-xl text-one-muted hover:text-one-gold"
          >
            <Lock className="w-4 h-4" />
            Ops Portal
          </button>
          <Link to="/proposal" className="btn-primary mt-6 inline-block">
            Build Proposal
          </Link>
        </div>
      )}
    </>
  )
}
