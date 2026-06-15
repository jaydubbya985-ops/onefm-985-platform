import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CookieConsent } from '@/components/CookieConsent'
import { OpsRouteGuard } from '@/components/OpsRouteGuard'
import { InitialPageLoader } from '@/components/PageLoader'
import { RouteGuard } from '@/components/RouteErrorBoundary'
import { SkeletonLoader } from '@/components/SkeletonLoader'
const Home = lazy(() => import('./pages/Home'))
const Listen = lazy(() => import('./pages/Listen'))
const Football = lazy(() => import('./pages/Football'))
const CoverageMap = lazy(() => import('./pages/CoverageMap'))
const SponsorshipKit = lazy(() => import('./pages/SponsorshipKit'))
const BroadcastExplorer = lazy(() => import('./pages/BroadcastExplorer'))
const AudienceAnalytics = lazy(() => import('./pages/AudienceAnalytics'))
const SocialHub = lazy(() => import('./pages/SocialHub'))
const SalesProposal = lazy(() => import('./pages/SalesProposal'))
const Heritage = lazy(() => import('./pages/Heritage'))
const Community = lazy(() => import('./pages/Community'))
const Programs = lazy(() => import('./pages/Programs'))
const Story = lazy(() => import('./pages/Story'))
const Support = lazy(() => import('./pages/Support'))
const Contact = lazy(() => import('./pages/Contact'))
const MediaKit = lazy(() => import('./pages/MediaKit'))
const Privacy = lazy(() => import('./pages/Privacy'))
const OpsPortal = lazy(() => import('./pages/OpsPortal'))

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

  useEffect(() => {
    // Dismiss splash as soon as the app has painted — no artificial delay
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <InitialPageLoader isReady={ready} />
      <Routes>
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
        <Route
          path="/broadcast"
          element={
            <LazyRoute variant="list" routeName="Broadcast Explorer">
              <BroadcastExplorer />
            </LazyRoute>
          }
        />
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
        <Route
          path="/programs"
          element={
            <LazyRoute variant="list" routeName="Programs">
              <Programs />
            </LazyRoute>
          }
        />
        <Route
          path="/story"
          element={
            <LazyRoute variant="text" routeName="Story">
              <Story />
            </LazyRoute>
          }
        />
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
      </Routes>
      <CookieConsent />
    </>
  )
}
