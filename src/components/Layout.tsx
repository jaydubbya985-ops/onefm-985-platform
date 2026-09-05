import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, Radio } from 'lucide-react'
import { OnAirNav } from './OnAirNav'
import { Footer } from './Footer'
import { MiniPlayer } from './MiniPlayer'
import { useLiveStream } from '@/hooks/useLiveStream'
import { scrollToTop } from '@/lib/scrollTop'

interface LayoutProps {
  children: ReactNode
  hideFooter?: boolean
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  const { toggle } = useLiveStream()
  const [toast, setToast] = useState<'playing' | 'paused' | 'error' | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      void (async () => {
        const result = await toggle()
        if (toastTimer.current) clearTimeout(toastTimer.current)
        if (result.error && !result.playing) {
          setToast('error')
        } else {
          setToast(result.playing ? 'playing' : 'paused')
        }
        toastTimer.current = setTimeout(() => setToast(null), 2200)
      })()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

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
            pointerEvents: 'none',
          }}
        >
          <motion.div
            key="kbd-toast"
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 bg-one-navy/95 border border-one-gold/25 backdrop-blur-md rounded-full pl-3 pr-3.5 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              {toast === 'playing' ? (
                <Play size={11} fill="currentColor" className="text-one-gold shrink-0" />
              ) : toast === 'paused' ? (
                <Pause size={11} fill="currentColor" className="text-one-gold/70 shrink-0" />
              ) : (
                <Radio size={11} className="text-one-red shrink-0" />
              )}
              <span className="font-label text-[11px] text-one-white">
                {toast === 'playing' ? 'Playing' : toast === 'paused' ? 'Paused' : 'Stream unavailable'}
              </span>
              <span className="font-mono text-[9px] text-one-muted border border-one-border/50 px-1.5 py-0.5 rounded bg-black/30 leading-none">
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
