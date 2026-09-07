import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Pause, Play } from 'lucide-react'
import { OnAirNav } from './OnAirNav'
import { Footer } from './Footer'
import { MiniPlayer } from './MiniPlayer'
import { useLiveStream } from '@/hooks/useLiveStream'
import { usePlayerMetadata } from '@/hooks/usePlayerMetadata'
import { liveNowFromMetadata } from '@/lib/liveNow'
import { AUDIO_PLAYER_URL } from '@/lib/streamConfig'
import { scrollToTop } from '@/lib/scrollTop'

interface LayoutProps {
  children: ReactNode
  hideFooter?: boolean
}

type SpaceToast =
  | { kind: 'connecting' }
  | { kind: 'playing'; program: string; detail: string }
  | { kind: 'paused'; program: string }
  | { kind: 'error'; message: string }

function spacebarDetail(withLine: string | null, remainingLabel: string) {
  return [withLine, remainingLabel].filter(Boolean).join(' · ')
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  const { toggle, playing, loading, error } = useLiveStream()
  const meta = usePlayerMetadata()
  const [toast, setToast] = useState<SpaceToast | null>(null)
  const [armed, setArmed] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const holdToast = useCallback((next: SpaceToast, ms: number) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(next)
    if (ms > 0) {
      toastTimer.current = setTimeout(() => setToast(null), ms)
    }
  }, [])

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement).isContentEditable) return
      e.preventDefault()
      setArmed(true)
      void toggle()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  useEffect(() => {
    if (!armed) return
    if (loading) {
      holdToast({ kind: 'connecting' }, 0)
      return
    }
    setArmed(false)
    const live = liveNowFromMetadata(meta)
    const detail = spacebarDetail(live.withLine, live.remainingLabel)
    if (error && !playing) {
      holdToast({ kind: 'error', message: error }, 4200)
      return
    }
    if (playing) {
      holdToast({ kind: 'playing', program: live.program, detail }, 2400)
      return
    }
    holdToast({ kind: 'paused', program: live.program }, 1800)
  }, [armed, loading, playing, error, meta, holdToast])

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  // Outer container handles fixed centering — Framer Motion handles only opacity/y/scale
  // (Framer Motion overrides CSS transform, so centering must live in a parent element)
  const toastPortal = createPortal(
    <AnimatePresence>
      {toast && (
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'fixed',
            bottom: 80,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: toast.kind === 'error' ? 'auto' : 'none',
          }}
        >
          <motion.div
            key={toast.kind}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2.5 bg-one-navy/95 border border-one-gold/25 backdrop-blur-md rounded-2xl pl-3 pr-3.5 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.4)] max-w-[min(92vw,28rem)]">
              {toast.kind === 'connecting' && (
                <>
                  <Loader2 size={12} className="animate-spin text-one-gold shrink-0" />
                  <span className="font-label text-[11px] text-one-white">Connecting to 98.5…</span>
                </>
              )}
              {toast.kind === 'playing' && (
                <>
                  <Play size={11} fill="currentColor" className="text-one-gold shrink-0" />
                  <span className="min-w-0">
                    <span className="font-label text-[11px] text-one-white block truncate">
                      {toast.program}
                    </span>
                    {toast.detail ? (
                      <span className="font-body-small text-[10px] text-one-muted block truncate">
                        {toast.detail}
                      </span>
                    ) : null}
                  </span>
                </>
              )}
              {toast.kind === 'paused' && (
                <>
                  <Pause size={11} fill="currentColor" className="text-one-gold/70 shrink-0" />
                  <span className="min-w-0">
                    <span className="font-label text-[11px] text-one-white block">Paused</span>
                    <span className="font-body-small text-[10px] text-one-muted block truncate">
                      {toast.program}
                    </span>
                  </span>
                </>
              )}
              {toast.kind === 'error' && (
                <span className="min-w-0">
                  <span className="font-label text-[11px] text-one-white block" role="alert">
                    {toast.message}
                  </span>
                  <a
                    href={AUDIO_PLAYER_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-body-small text-[10px] text-one-gold underline"
                  >
                    Open the fm985.com.au web player
                  </a>
                </span>
              )}
              <span className="font-mono text-[9px] text-one-muted border border-one-border/50 px-1.5 py-0.5 rounded bg-black/30 leading-none shrink-0">
                Space
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )

  return (
    <>
      <div className="min-h-[100dvh] bg-surface-deep text-one-white">
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <OnAirNav />
        <motion.main
          id="main-content"
          className="pt-[72px]"
          initial={{ opacity: 0, clipPath: 'inset(0 0 6% 0 round 0px)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0 round 0px)' }}
          exit={{ opacity: 0, clipPath: 'inset(8% 0 0 0 round 0px)' }}
          transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.main>
        {!hideFooter && <Footer />}
        <MiniPlayer />
      </div>
      {toastPortal}
    </>
  )
}
