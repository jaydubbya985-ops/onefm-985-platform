import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { CookieConsent } from '@/components/CookieConsent'
import { CustomCursor } from '@/components/CustomCursor'
import { RouteProgressBar } from '@/components/RouteProgressBar'
import { ScrollProgress } from '@/components/ScrollProgress'
import { OpsRouteGuard } from '@/components/OpsRouteGuard'
import { InitialPageLoader } from '@/components/PageLoader'
import { RouteGuard } from '@/components/RouteErrorBoundary'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerLenis } from '@/lib/scrollTop'

gsap.registerPlugin(ScrollTrigger)
const Home = lazy(() => import('./pages/Home'))
const Listen = lazy(() => import('./pages/Listen'))
const Football = lazy(() => import('./pages/Football'))
const CoverageMap = lazy(() => import('./pages/CoverageMap'))
const SponsorshipKit = lazy(() => import('./pages/SponsorshipKit'))
const AudienceAnalytics = lazy(() => import('./pages/AudienceAnalytics'))
const SalesProposal = lazy(() => import('./pages/SalesProposal'))
const Heritage = lazy(() => import('./pages/Heritage'))
const Community = lazy(() => import('./pages/Community'))
const SocialHub = lazy(() => import('./pages/SocialHub'))
const Support = lazy(() => import('./pages/Support'))
const Contact = lazy(() => import('./pages/Contact'))
const MediaKit = lazy(() => import('./pages/MediaKit'))
const Privacy = lazy(() => import('./pages/Privacy'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'))
const OpsPortal = lazy(() => import('./pages/OpsPortal'))
const NotFound = lazy(() => import('./pages/NotFound'))

function getSheppartonPeriod(): string {
  const h = parseInt(
    new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Melbourne',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  )
  if (h >= 22 || h < 5) return 'night'
  if (h < 9) return 'breakfast'
  if (h < 12) return 'default'
  if (h < 15) return 'midday'
  if (h < 18) return 'default'
  return 'drive'
}

function TimeOfDayTheme() {
  useEffect(() => {
    const apply = () => {
      const period = getSheppartonPeriod()
      if (period === 'default') {
        delete document.documentElement.dataset.time
      } else {
        document.documentElement.dataset.time = period
      }
    }
    apply()
    const id = window.setInterval(apply, 60_000)
    return () => window.clearInterval(id)
  }, [])
  return null
}

function ScanlineTransition() {
  const location = useLocation()
  const [animKey, setAnimKey] = useState(0)
  const [prevKey, setPrevKey] = useState(location.key)

  // New navigation → trigger the scanline sweep (render-phase adjustment)
  if (prevKey !== location.key) {
    setPrevKey(location.key)
    setAnimKey(k => k + 1)
  }

  if (animKey === 0) return null
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  return (
    <motion.div
      key={animKey}
      aria-hidden
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: '100vh', opacity: [1, 1, 0] }}
      transition={{ duration: 0.5, ease: 'linear' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background:
          'linear-gradient(90deg, transparent 0%, var(--one-scanline) 20%, var(--one-scanline) 50%, var(--one-scanline) 80%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 99991,
        mixBlendMode: 'screen',
        boxShadow: '0 0 12px var(--one-scanline-glow), 0 0 24px var(--one-scanline-glow2)',
      }}
    />
  )
}

function LazyRoute({
  variant,
  routeName,
  children,
}: {
  variant: 'card' | 'chart' | 'map' | 'table' | 'form' | 'text' | 'list'
  routeName: string
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<SkeletonLoader variant={variant} count={1} />}>
      <RouteGuard routeName={routeName}>{children}</RouteGuard>
    </Suspense>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Dismiss splash as soon as the app has painted — no artificial delay
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])


  // Lenis smooth scroll — wired once at root, RAF-synced with GSAP ticker
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ duration: 1.1 })
    registerLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)

    const rafFn = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(rafFn)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(rafFn)
      lenis.destroy()
      registerLenis(null)
    }
  }, [])

  return (
    <>
      <TimeOfDayTheme />
      <CustomCursor />
      <RouteProgressBar />
      <ScrollProgress />
      <InitialPageLoader isReady={ready} />
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.key}
        initial={{ opacity: 0, y: 20, scale: 0.984 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 1.016 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
      <Routes location={location}>
        <Route path="/" element={
          <Suspense fallback={<SkeletonLoader variant="card" count={1} />}>
            <RouteGuard routeName="Home"><Home /></RouteGuard>
          </Suspense>
        } />
        <Route
          path="/listen"
          element={
            <LazyRoute variant="card" routeName="Listen Live">
              <Listen />
            </LazyRoute>
          }
        />
        <Route
          path="/football"
          element={
            <LazyRoute variant="table" routeName="Football Sponsorship">
              <Football />
            </LazyRoute>
          }
        />
        <Route
          path="/coverage"
          element={
            <LazyRoute variant="map" routeName="Coverage Map">
              <CoverageMap />
            </LazyRoute>
          }
        />
        <Route
          path="/sponsorship"
          element={
            <LazyRoute variant="card" routeName="Sponsorship Packages">
              <SponsorshipKit />
            </LazyRoute>
          }
        />
        {/* Absorbed into /listen per REBUILD-SPEC.md */}
        <Route path="/broadcast" element={<Navigate to="/listen" replace />} />
        <Route
          path="/audience"
          element={
            <LazyRoute variant="chart" routeName="Audience Analytics">
              <AudienceAnalytics />
            </LazyRoute>
          }
        />
        <Route
          path="/social"
          element={
            <LazyRoute variant="card" routeName="Social Hub">
              <SocialHub />
            </LazyRoute>
          }
        />
        <Route
          path="/proposal"
          element={
            <LazyRoute variant="form" routeName="Sales Proposal">
              <SalesProposal />
            </LazyRoute>
          }
        />
        <Route
          path="/heritage"
          element={
            <LazyRoute variant="text" routeName="Heritage">
              <Heritage />
            </LazyRoute>
          }
        />
        <Route
          path="/community"
          element={
            <LazyRoute variant="card" routeName="Community">
              <Community />
            </LazyRoute>
          }
        />
        {/* Absorbed into /listen per REBUILD-SPEC.md */}
        <Route path="/programs" element={<Navigate to="/listen" replace />} />
        {/* Absorbed into /heritage per REBUILD-SPEC.md */}
        <Route path="/story" element={<Navigate to="/heritage" replace />} />
        <Route
          path="/support"
          element={
            <LazyRoute variant="form" routeName="Support">
              <Support />
            </LazyRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <LazyRoute variant="form" routeName="Contact">
              <Contact />
            </LazyRoute>
          }
        />
        <Route
          path="/media-kit"
          element={
            <LazyRoute variant="card" routeName="Media Kit">
              <MediaKit />
            </LazyRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <LazyRoute variant="text" routeName="Privacy">
              <Privacy />
            </LazyRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <LazyRoute variant="card" routeName="Payment Success">
              <PaymentSuccess />
            </LazyRoute>
          }
        />
        <Route
          path="/payment/cancel"
          element={
            <LazyRoute variant="card" routeName="Payment Cancelled">
              <PaymentCancel />
            </LazyRoute>
          }
        />
        <Route
          path="/ops"
          element={
            <OpsRouteGuard>
              <Suspense fallback={<SkeletonLoader variant="table" count={1} />}>
                <RouteGuard routeName="Operations Portal">
                  <OpsPortal />
                </RouteGuard>
              </Suspense>
            </OpsRouteGuard>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={null}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
      </motion.div>
      </AnimatePresence>
      <ScanlineTransition />
      <CookieConsent />
    </>
  )
}
