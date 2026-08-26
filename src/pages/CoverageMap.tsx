/// <reference types="google.maps" />
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import {
  Search,
  X,
  Play,
  Square,
  Download,
  Users,
  Radio,
  MapPin,
  Signal,
  TrendingUp,
  Briefcase,
  Globe,
  UserCircle,
  AlertTriangle,
  ChevronDown,
  Trophy,
  Sparkles,
  Satellite,
  Mountain,
  Map as MapIcon,
  Plus,
  Minus,
  Crosshair,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SEO } from '@/components/SEO'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Layout } from '@/components/Layout'
import { Link } from 'react-router-dom'
import { WeatherWidget } from '@/components/WeatherWidget'
import { SponsorCommercialCta } from '@/components/SponsorCommercialCta'
import { MagneticButton } from '@/components/MagneticButton'
import { towns, broadcastArea, type Town, type SizeCategory } from '@/data/townData'
import { coveragePins, coveragePinCounts, type CoveragePin } from '@/data/coverageMapPins'
import {
  mountCoverageGlow,
  pinMarkerIcon,
  combinedClusterRenderer,
  buildAdvertiserTour,
  fitMapToPins,
  flyTo,
} from '@/lib/coverageMapVisuals'
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer'
import type { CoverageGlowHandle } from '@/lib/coverageGlowCanvas'
import { BRAND, BRAND_COLORS } from '@/lib/brand'
import { HeadlinePop } from '@/components/motion/PosterReveal'
import { TiltCard } from '@/components/TiltCard'

/* ─────────────────────── helpers ─────────────────────── */

function getMarkerConfig(size: SizeCategory) {
  const { gold, blue, muted } = BRAND_COLORS
  switch (size) {
    case 'hub':
      return { fillColor: gold, scale: 14, strokeColor: BRAND_COLORS.white, strokeWeight: 2 }
    case 'major':
      return { fillColor: gold, scale: 10, strokeColor: gold, strokeWeight: 1 }
    case 'medium':
      return { fillColor: blue, scale: 8, strokeColor: blue, strokeWeight: 1 }
    case 'small':
      return { fillColor: '#0066CC', scale: 6, strokeColor: '#0066CC', strokeWeight: 1 }
    case 'village':
      return { fillColor: muted, scale: 6, strokeColor: muted, strokeWeight: 1 }
  }
}

function exportCSV() {
  const headers = [
    'Town',
    'Population 2021',
    'Population 2026 (est.)',
    'Median Age',
    'Median Income/week',
    'LGA',
    'Lat',
    'Lng',
    'Size Category',
    'Listeners Estimate',
    'Distance from Shepparton (km)',
    'Top Industry',
    'Born Overseas %',
    'Indigenous %',
    'Unemployment Rate %',
    'Growth Rate %',
    'Households Estimate',
  ]
  const rows = towns.map((t) => [
    t.name,
    t.population2021,
    t.population2026,
    t.medianAge,
    t.medianIncomePerWeek,
    t.lga,
    t.lat,
    t.lng,
    t.sizeCategory,
    t.listenersEstimate,
    t.distanceFromSheppartonKm,
    t.topIndustry,
    t.bornOverseasPercent,
    t.indigenousPercent,
    t.unemploymentRate,
    t.growthRate,
    t.householdsEstimate,
  ])
  const csv = [headers, ...rows].map((r) => r.map(String).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'one-fm-coverage-towns.csv'
  a.click()
  URL.revokeObjectURL(url)
}

type SortKey = 'name' | 'population' | 'distance'

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? 'AIzaSyDCWBY7YnPmk75dXdNKFoJKU-rUzbQe344'
const SHEPPARTON = { lat: -36.38, lng: 145.4 }

// Hides Google's own default point-of-interest icons/labels (real businesses,
// landmarks etc. near the towns we cover) so only our branded station/football/
// sponsor/town markers show. A Cloud-based Map ID would normally own this via
// the Cloud Console style editor, but that's an external dependency outside
// this codebase — a local style array gives the same result and is verifiable
// here. (Style arrays are ignored if a mapId is also set, so we don't use one.)
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
]

const LGA_COLORS: Record<string, string> = {
  'Greater Shepparton': BRAND_COLORS.gold,
  'Campaspe Shire': BRAND_COLORS.blue,
  'Benalla Rural City': '#0066CC',
  'Moira Shire': BRAND_COLORS.red,
  'Mitchell Shire': '#B6FF00',
  'Strathbogie Shire': '#9B5DE5',
  'Murray River Council': BRAND_COLORS.neonSky,
  'Greater Bendigo': '#FF6B6B',
  'Berrigan Shire': '#7A8B6E',
}

const SIZE_PIE_COLORS: Record<string, string> = {
  hub: BRAND_COLORS.gold,
  major: BRAND_COLORS.champagne,
  medium: BRAND_COLORS.blue,
  small: '#0066CC',
  village: BRAND_COLORS.muted,
}

/* ─────────────────────── component ─────────────────────── */

export default function CoverageMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const pinMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const stationMarkerRef = useRef<google.maps.Marker | null>(null)
  const hubTownMarkerRef = useRef<google.maps.Marker | null>(null)
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const glowHandleRef = useRef<CoverageGlowHandle | null>(null)
  const tourTimeoutsRef = useRef<number[]>([])
  const tourAbortRef = useRef(false)

  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [selectedTown, setSelectedTown] = useState<Town | null>(null)
  const [selectedPin, setSelectedPin] = useState<CoveragePin | null>(null)
  const [touring, setTouring] = useState(false)
  const [tourCaption, setTourCaption] = useState('')
  const [showFootballPins, setShowFootballPins] = useState(true)
  const [showSponsorPins, setShowSponsorPins] = useState(true)
  const [showCommunityPins, setShowCommunityPins] = useState(true)
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mapTypeId, setMapTypeIdState] = useState<'satellite' | 'terrain' | 'roadmap'>('satellite')

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  /* ── filtered / sorted towns ── */
  const filteredTowns = useMemo(() => {
    let list = towns.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.lga.toLowerCase().includes(search.toLowerCase())
    )
    switch (sortKey) {
      case 'name':
        list = list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'population':
        list = list.sort((a, b) => b.population2026 - a.population2026)
        break
      case 'distance':
        list = list.sort((a, b) => a.distanceFromSheppartonKm - b.distanceFromSheppartonKm)
        break
    }
    return list
  }, [search, sortKey])

  /* ── chart data ── */
  const lgaChartData = useMemo(() => {
    const map: Record<string, number> = {}
    towns.forEach((t) => {
      map[t.lga] = (map[t.lga] || 0) + t.population2026
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.value - b.value)
  }, [])

  const sizeChartData = useMemo(() => {
    const map: Record<string, number> = {}
    towns.forEach((t) => {
      map[t.sizeCategory] = (map[t.sizeCategory] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: SIZE_PIE_COLORS[name] || '#8A9199',
    }))
  }, [])

  const top10Data = useMemo(() => {
    return [...towns]
      .sort((a, b) => b.population2026 - a.population2026)
      .slice(0, 10)
      .map((t) => ({ name: t.name, population: t.population2026 }))
      .reverse()
  }, [])

  /* ── init Google Map ── */
  const initMap = useCallback(async () => {
    try {
      if (!window.google?.maps) {
        setOptions({
          key: GOOGLE_MAPS_API_KEY,
          v: 'weekly',
          libraries: ['geometry'],
        })
      }
      await importLibrary('maps')
      await importLibrary('geometry')

      if (!mapRef.current) return

      const map = new google.maps.Map(mapRef.current, {
        center: SHEPPARTON,
        zoom: 9,
        mapTypeId: 'satellite',
        // 45deg tilt imagery on satellite/hybrid maps was deprecated by
        // Google as of Maps JS API v3.65 — requesting it now returns
        // missing-tile checkerboard placeholders instead of real imagery.
        tilt: 0,
        styles: MAP_STYLES,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
        fullscreenControl: false,
      })
      mapInstanceRef.current = map

      const glow = mountCoverageGlow(map, SHEPPARTON)
      glowHandleRef.current = glow

      towns.forEach((town) => {
        const config = getMarkerConfig(town.sizeCategory)
        // A few towns sit only 2-5km apart in reality (Echuca/Moama,
        // Tocumwal/Picola, Shepparton/Mooroopna) \u2014 close enough to stack
        // directly on top of each other at this map's default zoom. Leave
        // off the map here and let the TownClusterer below own visibility,
        // same fix already proven for the football/sponsor pins.
        const marker = new google.maps.Marker({
          position: { lat: town.lat, lng: town.lng },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: config.fillColor,
            fillOpacity: 0.92,
            strokeColor: config.strokeColor,
            strokeWeight: config.strokeWeight,
            scale: config.scale,
          },
          title: `${town.name} \u2014 ${town.population2026.toLocaleString()} (2026 est.)`,
          zIndex: town.sizeCategory === 'hub' ? 200 : 100,
          animation: town.sizeCategory === 'hub' ? google.maps.Animation.DROP : undefined,
        })
        if (town.sizeCategory === 'hub') hubTownMarkerRef.current = marker
        marker.addListener('click', () => {
          setSelectedTown(town)
          setSelectedPin(null)
          setMobileListOpen(false)
          map.panTo({ lat: town.lat, lng: town.lng })
        })
        markersRef.current.push(marker)
      })

      coveragePins.forEach((pin) => {
        // Several sponsor pins are anchored within ~1km of the studio's true
        // coordinate, so a standalone "always on the map" station marker can
        // end up rendering almost exactly on top of a separate cluster badge.
        // Leave every pin (including the station) off the map here and let
        // the MarkerClusterer below own visibility — it merges close pins
        // into one badge, which is the only way to guarantee two circles
        // never visually overlap regardless of zoom or real-world proximity.
        const marker = new google.maps.Marker({
          position: { lat: pin.lat, lng: pin.lng },
          icon: pinMarkerIcon(pin.type),
          title: pin.name,
          zIndex: pin.type === 'station' ? 1000 : pin.type === 'sponsor' ? 500 : 400,
          animation: pin.type === 'station' ? google.maps.Animation.DROP : undefined,
        })
        if (pin.type === 'station') stationMarkerRef.current = marker
        marker.addListener('click', () => {
          setSelectedPin(pin)
          setSelectedTown(null)
          setMobileListOpen(false)
          map.panTo({ lat: pin.lat, lng: pin.lng })
          if (map.getZoom()! < 11) map.setZoom(12)
          if (pin.type === 'station') {
            marker.setAnimation(google.maps.Animation.BOUNCE)
            window.setTimeout(() => marker.setAnimation(null), 2000)
          }
        })
        pinMarkersRef.current.set(pin.id, marker)
      })

      const clusterablePins = coveragePins
        .map((p) => pinMarkersRef.current.get(p.id))
        .filter((m): m is google.maps.Marker => !!m)
      const townMarkerSet = new Set(markersRef.current)
      // Towns and pins used to run through two separate clusterers that had
      // no awareness of each other's rendered positions — close pairs like
      // Shepparton's hub badge and the station's "FM" badge (the studio is
      // physically inside Shepparton) could still land on top of one
      // another even though each layer was internally collision-free. One
      // shared clusterer makes that structurally impossible: anything close
      // enough on screen to collide gets merged into the same cluster.
      clustererRef.current = new MarkerClusterer({
        map,
        markers: [...markersRef.current, ...clusterablePins],
        // Default supercluster radius (40px) still left separate cluster
        // badges close enough to visually touch each other in some viewport/
        // zoom combinations. 60px was the smallest radius that measured
        // zero overlap across the full combined town+pin marker set at
        // 1280/1366/1920px viewports — kept low (vs. the 110 the pin-only
        // layer once used) so 25 towns don't collapse into a handful of
        // badges once merged with the larger pin set.
        algorithm: new SuperClusterAlgorithm({ radius: 60 }),
        renderer: combinedClusterRenderer(stationMarkerRef.current, hubTownMarkerRef.current, townMarkerSet),
      })

      // Fixed center/zoom left outlying pins (e.g. the Benalla GVL club,
      // ~56km east of Shepparton) sitting at or past the map div's edge on
      // narrower containers. Fit to every marker instead so nothing can ever
      // render outside the visible area, capped so we don't over-zoom past
      // the original framing on wide viewports.
      const bounds = new google.maps.LatLngBounds()
      towns.forEach((t) => bounds.extend({ lat: t.lat, lng: t.lng }))
      coveragePins.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))
      map.fitBounds(bounds, 56)
      google.maps.event.addListenerOnce(map, 'idle', () => {
        const z = map.getZoom()
        if (z && z > 9) map.setZoom(9)
      })

      setMapReady(true)
    } catch {
      setMapError(true)
    }
  }, [])

  useEffect(() => {
    // Defer map init past the first frame — keeps setState out of the sync effect body
    const frame = requestAnimationFrame(() => { void initMap() })
    return () => {
      cancelAnimationFrame(frame)
      tourAbortRef.current = true
      tourTimeoutsRef.current.forEach((id) => window.clearTimeout(id))
      tourTimeoutsRef.current = []
      glowHandleRef.current?.destroy()
      glowHandleRef.current = null
      clustererRef.current?.clearMarkers()
      clustererRef.current = null
      markersRef.current.forEach((m) => m.setMap(null))
      pinMarkersRef.current.forEach((m) => m.setMap(null))
      pinMarkersRef.current.clear()
    }
  }, [initMap])

  useEffect(() => {
    if (!mapReady || !clustererRef.current) return
    const activePins = coveragePins
      .filter(
        (pin) =>
          pin.type === 'station' ||
          (pin.type === 'football' && showFootballPins) ||
          (pin.type === 'sponsor' && showSponsorPins) ||
          (pin.type === 'community' && showCommunityPins),
      )
      .map((pin) => pinMarkersRef.current.get(pin.id))
      .filter((m): m is google.maps.Marker => !!m)
    clustererRef.current.clearMarkers()
    clustererRef.current.addMarkers([...markersRef.current, ...activePins])
  }, [mapReady, showFootballPins, showSponsorPins, showCommunityPins])

  const runTourStepRef = useRef<(index: number) => void>(() => {})

  const runTourStep = useCallback((index: number) => {
    if (tourAbortRef.current || !mapInstanceRef.current) return
    const map = mapInstanceRef.current
    const stops = buildAdvertiserTour(towns, coveragePins)
    if (index >= stops.length) {
      setTouring(false)
      setTourCaption('')
      return
    }

    const stop = stops[index]
    setTourCaption(stop.caption)

    const scheduleNext = () => {
      const id = window.setTimeout(() => runTourStepRef.current(index + 1), stop.dwellMs)
      tourTimeoutsRef.current.push(id)
    }

    if (stop.kind === 'fly') {
      flyTo(map, stop.lat, stop.lng, stop.zoom, () => {
        if (stop.pulseStation && stationMarkerRef.current) {
          stationMarkerRef.current.setAnimation(google.maps.Animation.BOUNCE)
          window.setTimeout(() => stationMarkerRef.current?.setAnimation(null), 2200)
        }
        scheduleNext()
      })
      return
    }

    if (stop.kind === 'town') {
      setSelectedTown(stop.town)
      setSelectedPin(null)
      const zoom =
        stop.town.sizeCategory === 'hub' ? 12 : stop.town.sizeCategory === 'major' ? 11 : 10
      flyTo(map, stop.town.lat, stop.town.lng, zoom, scheduleNext)
      return
    }

    setSelectedTown(null)
    setSelectedPin(null)
    fitMapToPins(map, stop.pins, stop.maxZoom ?? 11)
    scheduleNext()
  }, [])

  useEffect(() => {
    runTourStepRef.current = runTourStep
  }, [runTourStep])

  const startTour = useCallback(() => {
    if (!mapInstanceRef.current || touring) return
    tourAbortRef.current = false
    tourTimeoutsRef.current.forEach((id) => window.clearTimeout(id))
    tourTimeoutsRef.current = []
    setTouring(true)
    setSelectedPin(null)
    runTourStep(0)
  }, [touring, runTourStep])

  const stopTour = useCallback(() => {
    tourAbortRef.current = true
    tourTimeoutsRef.current.forEach((id) => window.clearTimeout(id))
    tourTimeoutsRef.current = []
    setTouring(false)
    setTourCaption('')
  }, [])

  /* ── custom branded map controls (replace native Google UI) ── */
  const handleSetMapType = useCallback((type: 'satellite' | 'terrain' | 'roadmap') => {
    mapInstanceRef.current?.setMapTypeId(type)
    setMapTypeIdState(type)
  }, [])

  const handleZoomBy = useCallback((delta: number) => {
    const map = mapInstanceRef.current
    if (!map) return
    map.setZoom((map.getZoom() ?? 9) + delta)
  }, [])

  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map) return
    const bounds = new google.maps.LatLngBounds()
    towns.forEach((t) => bounds.extend({ lat: t.lat, lng: t.lng }))
    coveragePins.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))
    map.fitBounds(bounds, 56)
    google.maps.event.addListenerOnce(map, 'idle', () => {
      const z = map.getZoom()
      if (z && z > 9) map.setZoom(9)
    })
  }, [])

  /* ── select town from sidebar ── */
  const handleSelectTown = useCallback(
    (town: Town) => {
      setSelectedTown(town)
      setSelectedPin(null)
      setMobileListOpen(false)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: town.lat, lng: town.lng })
        if (mapInstanceRef.current.getZoom()! < 11) {
          mapInstanceRef.current.setZoom(12)
        }
      }
    },
    []
  )

  /* ── render ── */
  return (
    <Layout>
      <SEO
        title="Coverage Map"
        description={`Interactive coverage map showing ${BRAND.fullName}'s ${broadcastArea.broadcastRadiusKm}km broadcast radius across ${broadcastArea.totalTowns} Goulburn Valley communities.`}
      />

      <div className="flex flex-col min-h-[calc(100dvh-72px)] bg-one-navy">
        {/* Hero intro */}
        <section className="relative shrink-0 overflow-hidden border-b border-one-border bg-[#101010] px-4 py-8 sm:px-6 sm:py-10 lg:px-8" data-cursor-label="COVERAGE MAP">
          <div aria-hidden className="grain-overlay" />
          <div className="absolute inset-x-0 top-0 h-[2px] bg-one-gold" aria-hidden />
          <div
            className="absolute right-0 top-0 h-px w-1/4 max-w-xs"
            style={{ backgroundColor: `${BRAND_COLORS.cyan}66` }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <motion.div
                className="max-w-2xl"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="section-label mb-4 block">Broadcast reach</span>
                <h1 className="font-hero text-one-white mb-4">
                  <span className="block">
                    <HeadlinePop>Goulburn Valley</HeadlinePop>
                  </span>
                  <span className="block text-gold-gradient">
                    <HeadlinePop delay={0.08}>Coverage</HeadlinePop>
                  </span>
                </h1>
                <p className="font-body text-one-white/55 leading-relaxed">
                  See where your brand lands — {broadcastArea.totalTowns} communities,{' '}
                  {broadcastArea.totalPopulation2026.toLocaleString()} people, and an estimated{' '}
                  {broadcastArea.weeklyListeners.toLocaleString()} weekly listeners across{' '}
                  {broadcastArea.broadcastRadiusKm}&nbsp;km from {BRAND.fullName}.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <MagneticButton strength={6} cursorLabel="MEDIA KIT">
                    <Link to="/media-kit" className="btn-secondary text-xs">Request media kit</Link>
                  </MagneticButton>
                  <Link to="/proposal" data-cursor-label="REQUEST" className="font-label text-[10px] text-one-gold hover:text-one-gold transition-colors link-hover">
                    Request a proposal →
                  </Link>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-wrap gap-2 sm:gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {[
                  { icon: Users, label: 'Population', value: broadcastArea.totalPopulation2026.toLocaleString() },
                  { icon: Radio, label: 'Listeners/wk', value: broadcastArea.weeklyListeners.toLocaleString() },
                  { icon: MapPin, label: 'Communities', value: String(broadcastArea.totalTowns) },
                  { icon: Signal, label: 'Radius', value: `${broadcastArea.broadcastRadiusKm} km` },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-md border border-one-border bg-one-midnight/40 px-3 py-2"
                  >
                    <Icon size={14} className="shrink-0 text-one-gold" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-one-muted">{label}</div>
                      <div className="text-sm font-semibold text-gold-gradient">{value}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Live conditions strip */}
            <motion.div
              className="mt-5 flex items-center gap-3 px-3 py-2 rounded-lg border border-one-border/60 bg-one-midnight/50 w-fit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="font-label text-[9px] tracking-[0.2em] text-one-muted/88 uppercase whitespace-nowrap">Live · Shepparton</span>
              <div className="flex items-end gap-[2px]" aria-hidden style={{ height: 16 }}>
                {[4, 8, 12, 16].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-sm bg-one-gold"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.35 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: h, originY: 1 }}
                  />
                ))}
              </div>
              <div className="h-3 w-px bg-one-border/60 shrink-0" />
              <WeatherWidget />
            </motion.div>

            <p className="relative mt-4 text-[10px] text-one-muted/80">
              Population: ABS Census 2021 with local projections · Listener estimates: regional reach model
            </p>
          </div>
        </section>

        <SponsorCommercialCta
          headline="Pin your brand on the map"
          subline="Sponsor pins highlight partners across the valley. Explore tiers or request the full media kit."
          className="shrink-0"
        />

        {/* Toolbar */}
        <div className="shrink-0 border-b border-one-border bg-one-midnight/60">
          <div className="flex items-center gap-3 overflow-x-auto px-4 py-2.5 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileListOpen((o) => !o)}
              data-cursor-label="TOWNS"
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-one-border px-3 py-1.5 text-xs font-medium text-one-white transition-colors hover:border-one-gold/50 md:hidden"
            >
              <MapPin size={14} className="text-one-gold" />
              {mobileListOpen ? 'Hide list' : `${broadcastArea.totalTowns} towns`}
            </button>

            <div className="hidden items-center gap-3 text-[11px] font-label md:flex">
              <Link to="/listen" data-cursor-label="LISTEN" className="text-one-gold transition-colors hover:text-one-white">
                Listen
              </Link>
              <Link to="/programs" data-cursor-label="PROGRAMS" className="text-one-muted transition-colors hover:text-one-gold">
                Programs
              </Link>
              <Link to="/broadcast" data-cursor-label="BROADCAST" className="text-one-muted transition-colors hover:text-one-gold">
                Broadcast
              </Link>
              <Link to="/media-kit" data-cursor-label="MEDIA KIT" className="text-one-muted transition-colors hover:text-one-gold">
                Media Kit
              </Link>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => setShowFootballPins((v) => !v)}
                data-cursor-label={showFootballPins ? 'HIDE GVL' : 'SHOW GVL'}
                className={cn(
                  'flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors',
                  showFootballPins
                    ? 'border-one-red/50 bg-one-red/10 text-one-white'
                    : 'border-one-border text-one-muted hover:text-one-white',
                )}
              >
                <Trophy size={12} className="text-one-red" />
                GVL ({coveragePinCounts.football})
              </button>
              <button
                type="button"
                onClick={() => setShowSponsorPins((v) => !v)}
                data-cursor-label={showSponsorPins ? 'HIDE SPONSORS' : 'SHOW SPONSORS'}
                className={cn(
                  'flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors',
                  showSponsorPins
                    ? 'border-one-gold/50 bg-one-gold/10 text-one-white'
                    : 'border-one-border text-one-muted hover:text-one-white',
                )}
              >
                <Sparkles size={12} className="text-one-gold" />
                Sponsors ({coveragePinCounts.sponsor})
              </button>
              <button
                type="button"
                onClick={() => setShowCommunityPins((v) => !v)}
                data-cursor-label={showCommunityPins ? 'HIDE ON AIR' : 'SHOW ON AIR'}
                className={cn(
                  'flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors',
                  showCommunityPins
                    ? 'border-one-blue/50 bg-one-blue/10 text-one-white'
                    : 'border-one-border text-one-muted hover:text-one-white',
                )}
              >
                <Radio size={12} className="text-one-blue" />
                On air ({coveragePinCounts.community})
              </button>
            </div>

            <div className="flex-1" />

            <div className="flex shrink-0 items-center gap-2">
              {!touring ? (
                <button
                  type="button"
                  onClick={startTour}
                  data-cursor-label="START TOUR"
                  className="flex items-center gap-1.5 rounded-md bg-one-gold px-3 py-1.5 text-xs font-medium text-one-navy transition-colors hover:bg-one-champagne"
                >
                  <Play size={14} /> <span className="hidden sm:inline">Start</span> Tour
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopTour}
                  data-cursor-label="STOP TOUR"
                  className="flex items-center gap-1.5 rounded-md bg-one-red px-3 py-1.5 text-xs font-medium text-one-white transition-colors hover:opacity-90"
                >
                  <Square size={14} /> Stop
                </button>
              )}
              <button
                type="button"
                onClick={exportCSV}
                data-cursor-label="EXPORT"
                className="flex items-center gap-1.5 rounded-md border border-one-border px-3 py-1.5 text-xs font-medium text-one-white transition-colors hover:bg-one-border/40"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map workspace */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row" data-cursor-label="EXPLORE MAP">
          {/* Town sidebar — drawer on mobile, column on desktop */}
          <div
            className={cn(
              'flex flex-col border-one-border bg-one-navy md:w-72 md:shrink-0 md:border-r',
              mobileListOpen
                ? 'max-md:absolute max-md:inset-x-0 max-md:top-0 max-md:z-30 max-md:max-h-[55vh] max-md:border-b max-md:shadow-2xl'
                : 'max-md:hidden',
            )}
          >
            {/* Search */}
            <div className="border-b border-one-border p-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-one-muted" />
                <input
                  type="text"
                  placeholder="Search town or LGA..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-one-border bg-one-navy py-2 pl-8 pr-8 text-xs text-one-white placeholder:text-one-muted focus:border-one-gold focus:outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    data-cursor-label="CLEAR"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-one-muted hover:text-one-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center justify-between border-b border-one-border px-3 py-2">
              <span className="text-xs text-one-muted">{filteredTowns.length} communities</span>
              <div className="flex items-center gap-1">
                <ChevronDown size={12} className="text-one-muted" />
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <SelectTrigger className="h-7 gap-1 border-0 bg-transparent p-0 text-xs text-one-white focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-one-border bg-one-midnight">
                    <SelectItem value="name" className="text-xs text-one-white">Name</SelectItem>
                    <SelectItem value="population" className="text-xs text-one-white">Population</SelectItem>
                    <SelectItem value="distance" className="text-xs text-one-white">Distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Town list */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredTowns.map((town) => {
                  const config = getMarkerConfig(town.sizeCategory)
                  return (
                    <button
                      key={town.name}
                      type="button"
                      onClick={() => handleSelectTown(town)}
                      data-cursor-label="VIEW"
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left transition-colors',
                        selectedTown?.name === town.name
                          ? 'bg-one-border/80 ring-1 ring-one-gold/30'
                          : 'hover:bg-one-border/40',
                      )}
                    >
                      <span
                        className="shrink-0 rounded-full"
                        style={{
                          width: 10,
                          height: 10,
                          backgroundColor: config.fillColor,
                          border: `1.5px solid ${config.fillColor}`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">{town.name}</div>
                        <div className="text-[10px] text-one-muted truncate">
                          {town.population2026.toLocaleString()} &middot; {town.distanceFromSheppartonKm} km &middot; {town.lga}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Map + detail panel */}
          <div className="relative min-h-[48dvh] flex-1 md:min-h-[420px]">
            {/* Mobile backdrop when town list open */}
            {mobileListOpen && (
              <button
                type="button"
                aria-label="Close town list"
                className="absolute inset-0 z-20 bg-black/50 md:hidden"
                onClick={() => setMobileListOpen(false)}
              />
            )}

            {mapError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-one-navy">
                <div className="max-w-md px-6 text-center">
                  <AlertTriangle size={40} className="mx-auto mb-4 text-one-gold" />
                  <h3 className="mb-2 font-heading text-lg text-one-white">Map unavailable</h3>
                  <p className="text-sm text-one-muted">
                    Google Maps could not load. Browse community data using the town list, or add{' '}
                    <code className="text-one-gold">VITE_GOOGLE_MAPS_API_KEY</code> for the interactive map.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMobileListOpen(true)}
                    className="mt-4 rounded-md bg-one-gold px-4 py-2 text-xs font-medium text-one-navy md:hidden"
                  >
                    Browse {broadcastArea.totalTowns} towns
                  </button>
                </div>
              </div>
            )}

            {!mapReady && !mapError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-one-navy">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-one-gold border-t-transparent" />
                  <p className="text-xs text-one-muted">Loading coverage map…</p>
                </div>
              </div>
            )}

            <div ref={mapRef} className="h-full w-full min-h-[48dvh]" />

            {/* Map legend — only shown once the map has its guaranteed 420px
                desktop height (lg breakpoint). Below that, min-h-[48dvh] can
                be too short to fit this box plus the top-left control stack
                without them overlapping. */}
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden rounded-lg border border-one-border/80 bg-one-navy/90 px-3 py-2 text-[10px] text-one-muted backdrop-blur-sm lg:block">
              <div className="mb-1 font-medium text-one-white">Map key</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border border-white" style={{ backgroundColor: BRAND_COLORS.gold }} /> Hub town</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND_COLORS.gold }} /> Major town</div>
              <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND_COLORS.blue }} /> Medium town</div>
              <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#0066CC]" /> Small town</div>
              <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-one-muted" /> Village</div>
              <div className="mt-1.5 space-y-0.5 border-t border-one-border/50 pt-1.5">
                <div className="flex items-center gap-2"><img src="/brand/favicon.svg" alt="" className="h-3 w-3" /> ONE FM studio</div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-one-red" /> GVL club</div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-one-gold" /> Local sponsor</div>
              </div>
              <div className="mt-1.5 space-y-0.5 border-t border-one-border/50 pt-1.5">
                <div className="text-one-gold/90">Gradient glow = broadcast reach</div>
                <div className="text-one-electric/80">Cyan ripples = live signal</div>
              </div>
            </div>

            {/* Custom branded map controls — replaces native Google UI chrome */}
            {mapReady && (
              <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-2">
                {/* Map type switcher */}
                <div className="flex items-center gap-0.5 rounded-full border border-one-border/80 bg-one-navy/90 p-1 backdrop-blur-md">
                  {([
                    { id: 'satellite', icon: Satellite, label: 'SATELLITE' },
                    { id: 'terrain', icon: Mountain, label: 'TERRAIN' },
                    { id: 'roadmap', icon: MapIcon, label: 'ROADMAP' },
                  ] as const).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSetMapType(id)}
                      data-cursor-label={label}
                      aria-label={label}
                      aria-pressed={mapTypeId === id}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                        mapTypeId === id
                          ? 'bg-one-gold text-one-navy'
                          : 'text-one-muted hover:bg-one-border/60 hover:text-one-white',
                      )}
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                </div>

                {/* Zoom stack */}
                <div className="flex flex-col overflow-hidden rounded-lg border border-one-border/80 bg-one-navy/90 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => handleZoomBy(1)}
                    data-cursor-label="ZOOM IN"
                    aria-label="Zoom in"
                    className="flex h-7 w-7 items-center justify-center text-one-muted transition-colors hover:bg-one-border/60 hover:text-one-white"
                  >
                    <Plus size={14} />
                  </button>
                  <span className="h-px bg-one-border/60" />
                  <button
                    type="button"
                    onClick={() => handleZoomBy(-1)}
                    data-cursor-label="ZOOM OUT"
                    aria-label="Zoom out"
                    className="flex h-7 w-7 items-center justify-center text-one-muted transition-colors hover:bg-one-border/60 hover:text-one-white"
                  >
                    <Minus size={14} />
                  </button>
                </div>

                {/* Recenter / fit all pins */}
                <button
                  type="button"
                  onClick={handleRecenter}
                  data-cursor-label="RECENTER"
                  aria-label="Recenter map"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-one-border/80 bg-one-navy/90 text-one-muted backdrop-blur-md transition-colors hover:bg-one-border/60 hover:text-one-gold"
                >
                  <Crosshair size={13} />
                </button>
              </div>
            )}

            {/* Tour caption */}
            <AnimatePresence>
              {touring && tourCaption && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-3 left-1/2 z-30 max-w-lg -translate-x-1/2 rounded-lg border border-one-gold/40 bg-one-navy/95 px-4 py-3 text-center shadow-xl backdrop-blur-md sm:bottom-6"
                >
                  <p className="text-xs leading-relaxed text-one-white sm:text-sm">{tourCaption}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedPin && (
                <>
                  <motion.button
                    type="button"
                    aria-label="Close pin details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-black/40 md:hidden"
                    onClick={() => setSelectedPin(null)}
                  />
                  <motion.div
                    initial={isMobile ? { y: '100%', opacity: 0 } : { x: 380, opacity: 0 }}
                    animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                    exit={isMobile ? { y: '100%', opacity: 0 } : { x: 380, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    className={cn(
                      'absolute z-30 overflow-y-auto border-one-border bg-one-navy/95 backdrop-blur-md',
                      'max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[50dvh] max-md:rounded-t-2xl max-md:border-t',
                      'md:bottom-3 md:right-3 md:top-auto md:w-[320px] md:rounded-xl md:border',
                    )}
                  >
                    <div className="flex justify-center pt-2 md:hidden" aria-hidden>
                      <div className="h-1 w-10 rounded-full bg-one-border" />
                    </div>
                    <div className="p-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'mb-2 text-[10px]',
                              selectedPin.type === 'station' && 'border-one-gold/50 text-one-gold',
                              selectedPin.type === 'football' && 'border-one-red/50 text-one-red',
                              selectedPin.type === 'sponsor' && 'border-one-gold/50 text-one-gold',
                              selectedPin.type === 'community' && 'border-one-blue/50 text-sky-300',
                            )}
                          >
                            {selectedPin.type === 'station'
                              ? 'Broadcast hub'
                              : selectedPin.type === 'football'
                                ? 'GVL club'
                                : selectedPin.type === 'community'
                                  ? 'On air recently'
                                  : 'Local sponsor'}
                          </Badge>
                          <h3 className="font-heading text-lg text-one-white">{selectedPin.name}</h3>
                          <p className="text-xs text-one-muted">{selectedPin.town}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPin(null)}
                          data-cursor-label="CLOSE"
                          className="rounded-md bg-one-border/60 p-1.5 text-one-white hover:bg-one-border"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {selectedPin.type === 'station' && (
                        <img
                          src="/brand/one-fm-logo-primary.png"
                          alt="ONE FM 98.5"
                          className="mb-3 h-10 w-auto"
                        />
                      )}
                      <p className="text-sm leading-relaxed text-one-muted">{selectedPin.blurb}</p>
                      {selectedPin.link && (
                        selectedPin.link.startsWith('http') ? (
                          <a
                            href={selectedPin.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor-label="STORY"
                            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-one-gold hover:text-one-white"
                          >
                            Read on fm985.com.au
                            <ChevronDown size={12} className="-rotate-90" />
                          </a>
                        ) : (
                          <Link
                            to={selectedPin.link}
                            data-cursor-label={selectedPin.type === 'football' ? 'GVL' : 'ADVERTISE'}
                            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-one-gold hover:text-one-white"
                          >
                            {selectedPin.type === 'football' ? 'View GVL packages' : 'Advertise with ONE FM'}
                            <ChevronDown size={12} className="-rotate-90" />
                          </Link>
                        )
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedTown && (
                <>
                  <motion.button
                    type="button"
                    aria-label="Close town details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-black/40 md:hidden"
                    onClick={() => setSelectedTown(null)}
                  />
                  <motion.div
                    initial={isMobile ? { y: '100%', opacity: 0 } : { x: 380, opacity: 0 }}
                    animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                    exit={isMobile ? { y: '100%', opacity: 0 } : { x: 380, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    className={cn(
                      'absolute z-30 overflow-y-auto border-one-border bg-one-navy/95 backdrop-blur-md',
                      'max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[72dvh] max-md:rounded-t-2xl max-md:border-t',
                      'md:bottom-3 md:right-3 md:top-3 md:w-[340px] md:rounded-xl md:border',
                      selectedPin && 'md:top-auto md:bottom-3',
                    )}
                  >
                    {/* Mobile sheet handle */}
                    <div className="flex justify-center pt-2 md:hidden" aria-hidden>
                      <div className="h-1 w-10 rounded-full bg-one-border" />
                    </div>

                    <div
                      className="relative h-24 sm:h-28"
                      style={{
                        background: `linear-gradient(135deg, ${getMarkerConfig(selectedTown.sizeCategory).fillColor}33, ${BRAND_COLORS.navy})`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedTown(null)}
                        data-cursor-label="CLOSE"
                        className="absolute right-2.5 top-2.5 rounded-md bg-black/40 p-1.5 text-one-white transition-colors hover:bg-black/60"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-heading text-xl text-one-white">{selectedTown.name}</h3>
                        <Badge
                          variant="outline"
                          className="mt-1 border-one-gold/40 bg-one-gold/10 text-[10px] text-one-gold"
                        >
                          {selectedTown.lga}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      {/* Listener highlight */}
                      <div className="rounded-lg border border-one-gold/30 bg-one-gold/5 p-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-one-muted">
                            <Radio size={12} className="text-one-gold" />
                            Est. weekly listeners
                          </span>
                          <span className="font-heading text-lg text-one-gold">
                            {selectedTown.listenersEstimate.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { label: 'Population (2026)', value: selectedTown.population2026.toLocaleString() },
                          { label: 'Median age', value: `${selectedTown.medianAge} yrs` },
                          { label: 'Income / week', value: `$${selectedTown.medianIncomePerWeek.toLocaleString()}` },
                          { label: 'Households', value: selectedTown.householdsEstimate.toLocaleString() },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-lg border border-one-border bg-one-midnight/30 p-3">
                            <div className="mb-1 text-[10px] uppercase tracking-wider text-one-muted">{label}</div>
                            <div className="text-sm font-semibold text-one-white">{value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-0">
                        {[
                          { icon: MapPin, label: 'Distance from Shepparton', value: `${selectedTown.distanceFromSheppartonKm} km` },
                          { icon: Globe, label: 'Born overseas', value: `${selectedTown.bornOverseasPercent}%` },
                          { icon: UserCircle, label: 'Indigenous', value: `${selectedTown.indigenousPercent}%` },
                          { icon: TrendingUp, label: 'Growth rate', value: `+${selectedTown.growthRate}%`, accent: true },
                          { icon: Users, label: 'Unemployment', value: `${selectedTown.unemploymentRate}%` },
                        ].map(({ icon: Icon, label, value, accent }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between border-b border-one-border py-2.5 last:border-0"
                          >
                            <span className="flex items-center gap-2 text-xs text-one-muted">
                              <Icon size={12} /> {label}
                            </span>
                            <span className={cn('text-xs font-medium', accent ? 'text-emerald-400' : 'text-one-white')}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border border-one-border bg-one-midnight/30 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <Briefcase size={12} className="text-one-gold" />
                          <span className="text-[10px] uppercase tracking-wider text-one-muted">Top industry</span>
                        </div>
                        <span className="text-xs font-medium text-one-gold">{selectedTown.topIndustry}</span>
                      </div>

                      <p className="text-xs leading-relaxed text-one-muted">{selectedTown.description}</p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="shrink-0 border-t border-one-border bg-one-midnight/40 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <p className="mb-2 font-label text-[11px] uppercase tracking-[0.2em] text-one-gold">Area analytics</p>
            <h2 className="font-heading text-2xl text-one-white sm:text-3xl">
              <HeadlinePop>Coverage by the numbers</HeadlinePop>
            </h2>
          </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <TiltCard maxTilt={4} className="h-full">
            <div className="glass-card p-5 h-full group relative overflow-hidden">
              <div aria-hidden className="explore-tile-scan" />
              <h3 className="mb-4 font-heading text-sm text-one-white">Population by LGA (2026 est.)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lgaChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A30" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#8A9199', fontSize: 11 }} stroke="#2A2A30" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#E5E7EB', fontSize: 10 }}
                      stroke="#2A2A30"
                      width={110}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1A1A1F',
                        border: '1px solid #2A2A30',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#E5E7EB',
                      }}
                      formatter={(value: number) => value.toLocaleString()}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {lgaChartData.map((entry) => (
                        <Cell key={entry.name} fill={LGA_COLORS[entry.name] || '#F2F2F2'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            </TiltCard>

            {/* Towns by Size */}
            <TiltCard maxTilt={4} className="h-full">
            <div className="glass-card p-5 h-full group relative overflow-hidden">
              <div aria-hidden className="explore-tile-scan" />
              <h3 className="font-heading text-sm text-one-white mb-4">Towns by Size Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sizeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                    >
                      {sizeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1A1A1F',
                        border: '1px solid #2A2A30',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#E5E7EB',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            </TiltCard>

            {/* Top 10 Towns */}
            <TiltCard maxTilt={4} className="h-full">
            <div className="glass-card p-5 h-full group relative overflow-hidden">
              <div aria-hidden className="explore-tile-scan" />
              <h3 className="font-heading text-sm text-one-white mb-4">Top 10 Towns by Population (2026)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top10Data} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A30" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#8A9199', fontSize: 11 }} stroke="#2A2A30" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#E5E7EB', fontSize: 10 }}
                      stroke="#2A2A30"
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1A1A1F',
                        border: '1px solid #2A2A30',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#E5E7EB',
                      }}
                      formatter={(value: number) => value.toLocaleString()}
                    />
                    <Bar dataKey="population" fill="#F2F2F2" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </Layout>
  )
}
