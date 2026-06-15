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
import { towns, broadcastArea, type Town, type SizeCategory } from '@/data/townData'

/* ─────────────────────── helpers ─────────────────────── */

function getMarkerConfig(size: SizeCategory) {
  switch (size) {
    case 'hub':
      return { fillColor: '#D4A84B', scale: 14, strokeColor: '#FFFFFF', strokeWeight: 2 }
    case 'major':
      return { fillColor: '#D4A84B', scale: 10, strokeColor: '#D4A84B', strokeWeight: 1 }
    case 'medium':
      return { fillColor: '#1B4F8F', scale: 8, strokeColor: '#1B4F8F', strokeWeight: 1 }
    case 'small':
      return { fillColor: '#0066CC', scale: 6, strokeColor: '#0066CC', strokeWeight: 1 }
    case 'village':
      return { fillColor: '#8A9199', scale: 6, strokeColor: '#8A9199', strokeWeight: 1 }
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

const GOOGLE_MAPS_API_KEY = 'AIzaSyDCWBY7YnPmk75dXdNKFoJKU-rUzbQe344'
const MAP_ID = 'a0fa5e1a6343d400f9a9bb4a'
const SHEPPARTON = { lat: -36.38, lng: 145.4 }

const LGA_COLORS: Record<string, string> = {
  'Greater Shepparton': '#D4A84B',
  'Campaspe Shire': '#1B4F8F',
  'Benalla Rural City': '#0066CC',
  'Moira Shire': '#E31E24',
  'Mitchell Shire': '#2EC4B6',
  'Strathbogie Shire': '#9B5DE5',
  'Murray River Council': '#00BBF9',
  'Greater Bendigo': '#FF6B6B',
  'Berrigan Shire': '#7A8B6E',
}

const SIZE_PIE_COLORS: Record<string, string> = {
  hub: '#D4A84B',
  major: '#F0C75E',
  medium: '#1B4F8F',
  small: '#0066CC',
  village: '#8A9199',
}

/* ─────────────────────── component ─────────────────────── */

export default function CoverageMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const circlesRef = useRef<google.maps.Circle[]>([])
  const tourIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [selectedTown, setSelectedTown] = useState<Town | null>(null)
  const [touring, setTouring] = useState(false)

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
      setOptions({
        key: GOOGLE_MAPS_API_KEY,
        v: 'weekly',
        libraries: ['geometry'],
      })
      await importLibrary('maps')

      if (!mapRef.current) return

      const map = new google.maps.Map(mapRef.current, {
        center: SHEPPARTON,
        zoom: 9,
        mapTypeId: 'satellite',
        tilt: 45,
        mapId: MAP_ID,
        streetViewControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ['satellite', 'terrain', 'roadmap'],
        },
        fullscreenControl: false,
      })
      mapInstanceRef.current = map

      /* coverage circles */
      const circle100 = new google.maps.Circle({
        center: SHEPPARTON,
        radius: 100_000,
        strokeColor: '#D4A84B',
        strokeOpacity: 0.6,
        strokeWeight: 1.5,
        fillColor: '#D4A84B',
        fillOpacity: 0.08,
        map,
        clickable: false,
      })
      const circle50 = new google.maps.Circle({
        center: SHEPPARTON,
        radius: 50_000,
        strokeColor: '#D4A84B',
        strokeOpacity: 0.4,
        strokeWeight: 1,
        fillColor: '#D4A84B',
        fillOpacity: 0.04,
        map,
        clickable: false,
      })
      circlesRef.current = [circle100, circle50]

      /* town markers */
      towns.forEach((town) => {
        const config = getMarkerConfig(town.sizeCategory)
        const marker = new google.maps.Marker({
          position: { lat: town.lat, lng: town.lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: config.fillColor,
            fillOpacity: 0.92,
            strokeColor: config.strokeColor,
            strokeWeight: config.strokeWeight,
            scale: config.scale,
          },
          title: `${town.name} \u2014 ${town.population2026.toLocaleString()} (2026 est.)`,
          animation: town.sizeCategory === 'hub' ? google.maps.Animation.DROP : undefined,
        })
        marker.addListener('click', () => {
          setSelectedTown(town)
          map.panTo({ lat: town.lat, lng: town.lng })
        })
        markersRef.current.push(marker)
      })

      setMapReady(true)
    } catch {
      setMapError(true)
    }
  }, [])

  useEffect(() => {
    initMap()
    return () => {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current)
      markersRef.current.forEach((m) => m.setMap(null))
      circlesRef.current.forEach((c) => c.setMap(null))
    }
  }, [initMap])

  /* ── tour ── */
  const startTour = useCallback(() => {
    if (!mapInstanceRef.current || touring) return
    const map = mapInstanceRef.current
    const tourTowns = [...towns].sort((a, b) => a.distanceFromSheppartonKm - b.distanceFromSheppartonKm)
    let idx = 0
    setTouring(true)
    setSelectedTown(tourTowns[0])
    map.panTo({ lat: tourTowns[0].lat, lng: tourTowns[0].lng })
    tourIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % tourTowns.length
      const town = tourTowns[idx]
      setSelectedTown(town)
      map.panTo({ lat: town.lat, lng: town.lng })
    }, 3500)
  }, [touring])

  const stopTour = useCallback(() => {
    if (tourIntervalRef.current) {
      clearInterval(tourIntervalRef.current)
      tourIntervalRef.current = null
    }
    setTouring(false)
  }, [])

  /* ── select town from sidebar ── */
  const handleSelectTown = useCallback(
    (town: Town) => {
      setSelectedTown(town)
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
      <SEO title="Coverage Map" description="Interactive 3D coverage map showing ONE FM 98.5's 100km broadcast radius across 25 Goulburn Valley communities." />
      <div className="flex flex-col h-[calc(100dvh-72px)] bg-[#0A1628]">
        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-[#0D1B2A] border-b border-[#1A2A42]">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#D4A84B]" />
            <span className="text-xs text-[#E5E7EB]">
              <strong className="text-white">{broadcastArea.totalPopulation2026.toLocaleString()}</strong>{' '}
              people (2026 est.)
            </span>
          </div>
          <div className="w-px h-4 bg-[#1A2A42]" />
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-[#D4A84B]" />
            <span className="text-xs text-[#E5E7EB]">
              <strong className="text-white">{broadcastArea.weeklyListeners.toLocaleString()}</strong>{' '}
              weekly listeners
            </span>
          </div>
          <div className="w-px h-4 bg-[#1A2A42]" />
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#D4A84B]" />
            <span className="text-xs text-[#E5E7EB]">
              <strong className="text-white">{broadcastArea.totalTowns}</strong> communities
            </span>
          </div>
          <div className="w-px h-4 bg-[#1A2A42]" />
          <div className="flex items-center gap-2">
            <Signal size={16} className="text-[#D4A84B]" />
            <span className="text-xs text-[#E5E7EB]">
              <strong className="text-white">{broadcastArea.broadcastRadiusKm}</strong> km radius
            </span>
          </div>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-label">
            <Link to="/listen" className="text-[#D4A84B] hover:text-white transition-colors">Listen</Link>
            <Link to="/programs" className="text-[#8A9199] hover:text-[#D4A84B] transition-colors">Programs</Link>
            <Link to="/broadcast" className="text-[#8A9199] hover:text-[#D4A84B] transition-colors">Broadcast</Link>
            <Link to="/media-kit" className="text-[#8A9199] hover:text-[#D4A84B] transition-colors">Media Kit</Link>
          </div>
          <div className="flex items-center gap-2">
            {!touring ? (
              <button
                onClick={startTour}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#D4A84B] text-[#0A1628] rounded-md hover:bg-[#F0C75E] transition-colors"
              >
                <Play size={14} /> Start Tour
              </button>
            ) : (
              <button
                onClick={stopTour}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#E31E24] text-white rounded-md hover:bg-red-600 transition-colors"
              >
                <Square size={14} /> Stop Tour
              </button>
            )}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#1A2A42] text-[#E5E7EB] rounded-md hover:bg-[#1A2A42] transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Main area */}
        <div className="flex flex-1 overflow-hidden max-md:flex-col">
          {/* Left sidebar */}
          <div className="w-72 flex flex-col border-r border-[#1A2A42] bg-[#0D1B2A] max-md:w-full max-md:border-r-0 max-md:border-b">
            {/* Search */}
            <div className="p-3 border-b border-[#1A2A42]">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search town or LGA..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#0A1628] border border-[#1A2A42] rounded-md text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4A84B]"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="px-3 py-2 border-b border-[#1A2A42] flex items-center justify-between">
              <span className="text-xs text-[#8A9199]">
                {filteredTowns.length} communities
              </span>
              <div className="flex items-center gap-1">
                <ChevronDown size={12} className="text-[#8A9199]" />
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <SelectTrigger className="h-7 text-xs border-0 bg-transparent text-[#E5E7EB] focus:ring-0 p-0 gap-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1F] border-[#2A2A30]">
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
                      onClick={() => handleSelectTown(town)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors',
                        selectedTown?.name === town.name
                          ? 'bg-[#1A2A42]'
                          : 'hover:bg-[#152035]'
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
                        <div className="text-[10px] text-[#8A9199] truncate">
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
          <div className="flex-1 relative min-h-[300px]">
            {/* Error overlay */}
            {mapError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0A1628]">
                <div className="text-center max-w-md px-6">
                  <AlertTriangle size={40} className="mx-auto mb-4 text-[#D4A84B]" />
                  <h3 className="text-lg font-heading text-white mb-2">
                    Google Maps Not Available
                  </h3>
                  <p className="text-sm text-[#8A9199]">
                    The map requires the Google Maps JavaScript API. The sidebar data is still
                    available for browsing.
                  </p>
                </div>
              </div>
            )}

            {/* Loading overlay */}
            {!mapReady && !mapError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0A1628]">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#D4A84B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-[#8A9199]">Loading map...</p>
                </div>
              </div>
            )}

            {/* Google Map container */}
            <div ref={mapRef} className="w-full h-full" />

            {/* Right detail panel */}
            <AnimatePresence>
              {selectedTown && (
                <motion.div
                  initial={{ x: 380, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 380, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute top-3 right-3 bottom-3 w-[340px] bg-[#0D1B2A]/95 backdrop-blur-md border border-[#1A2A42] rounded-xl overflow-y-auto z-20 max-md:inset-x-0 max-md:top-auto max-md:bottom-0 max-md:w-full max-md:rounded-b-none max-md:max-h-[60vh]"
                >
                  {/* Hero gradient */}
                  <div
                    className="h-28 relative"
                    style={{
                      background: `linear-gradient(135deg, ${getMarkerConfig(selectedTown.sizeCategory).fillColor}22, #0A1628)`,
                    }}
                  >
                    <button
                      onClick={() => setSelectedTown(null)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md bg-black/40 text-white hover:bg-black/60 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-heading text-lg text-white">{selectedTown.name}</h3>
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] border-[#D4A84B]/40 text-[#D4A84B] bg-[#D4A84B]/10"
                      >
                        {selectedTown.lga}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A2A42]">
                        <div className="text-[10px] text-[#8A9199] uppercase tracking-wider mb-1">
                          Population (2026)
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {selectedTown.population2026.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A2A42]">
                        <div className="text-[10px] text-[#8A9199] uppercase tracking-wider mb-1">
                          Median Age
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {selectedTown.medianAge} yrs
                        </div>
                      </div>
                      <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A2A42]">
                        <div className="text-[10px] text-[#8A9199] uppercase tracking-wider mb-1">
                          Income / Week
                        </div>
                        <div className="text-sm font-semibold text-white">
                          ${selectedTown.medianIncomePerWeek.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A2A42]">
                        <div className="text-[10px] text-[#8A9199] uppercase tracking-wider mb-1">
                          Households
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {selectedTown.householdsEstimate.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Additional rows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-[#1A2A42]">
                        <span className="flex items-center gap-2 text-xs text-[#8A9199]">
                          <MapPin size={12} /> Distance from Shepparton
                        </span>
                        <span className="text-xs font-medium text-white">
                          {selectedTown.distanceFromSheppartonKm} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-[#1A2A42]">
                        <span className="flex items-center gap-2 text-xs text-[#8A9199]">
                          <Globe size={12} /> Born Overseas
                        </span>
                        <span className="text-xs font-medium text-white">
                          {selectedTown.bornOverseasPercent}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-[#1A2A42]">
                        <span className="flex items-center gap-2 text-xs text-[#8A9199]">
                          <UserCircle size={12} /> Indigenous
                        </span>
                        <span className="text-xs font-medium text-white">
                          {selectedTown.indigenousPercent}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-[#1A2A42]">
                        <span className="flex items-center gap-2 text-xs text-[#8A9199]">
                          <TrendingUp size={12} /> Growth Rate
                        </span>
                        <span className="text-xs font-medium text-emerald-400">
                          +{selectedTown.growthRate}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-[#1A2A42]">
                        <span className="flex items-center gap-2 text-xs text-[#8A9199]">
                          <Users size={12} /> Unemployment
                        </span>
                        <span className="text-xs font-medium text-white">
                          {selectedTown.unemploymentRate}%
                        </span>
                      </div>
                    </div>

                    {/* Top Industry */}
                    <div className="bg-[#0A1628] rounded-lg p-3 border border-[#1A2A42]">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase size={12} className="text-[#D4A84B]" />
                        <span className="text-[10px] text-[#8A9199] uppercase tracking-wider">
                          Top Industry
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#D4A84B]">
                        {selectedTown.topIndustry}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#8A9199] leading-relaxed">
                      {selectedTown.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-one-navy border-t border-one-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-2xl text-one-white mb-8 text-center">
            Coverage Area Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Population by LGA */}
            <div className="bg-one-navy rounded-xl border border-one-border p-5">
              <h3 className="font-heading text-sm text-one-white mb-4">Population by LGA (2026 est.)</h3>
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
                        <Cell key={entry.name} fill={LGA_COLORS[entry.name] || '#D4A84B'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Towns by Size */}
            <div className="bg-one-navy rounded-xl border border-one-border p-5">
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

            {/* Top 10 Towns */}
            <div className="bg-one-navy rounded-xl border border-one-border p-5">
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
                    <Bar dataKey="population" fill="#D4A84B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
