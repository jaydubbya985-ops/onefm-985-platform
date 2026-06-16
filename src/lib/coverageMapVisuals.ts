import { BRAND_COLORS, LOGO } from '@/lib/brand'
import type { CoveragePin, CoveragePinType } from '@/data/coverageMapPins'
import type { Town } from '@/data/townData'
import {
  mountCanvasCoverageGlow,
  type CoverageGlowHandle,
} from '@/lib/coverageGlowCanvas'

const SHEPPARTON = { lat: -36.38, lng: 145.4 }

/** Studio location — Parkside Drive, Shepparton. */
const ONE_FM_STUDIO = { lat: -36.3612, lng: 145.416 }

/** Canvas radial glow + sonar (Tier 2). Replaces flat Circle stack. */
export function mountCoverageGlow(
  map: google.maps.Map,
  center: google.maps.LatLngLiteral = SHEPPARTON,
): CoverageGlowHandle & { circles: google.maps.Circle[]; stopPulse: () => void } {
  const handle = mountCanvasCoverageGlow(map, {
    center,
    radiusMeters: 100_000,
    station: ONE_FM_STUDIO,
  })
  return {
    ...handle,
    circles: [],
    stopPulse: () => handle.destroy(),
  }
}

function svgIcon(svg: string, size: number): google.maps.Icon {
  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  return {
    url,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  }
}

export function pinMarkerIcon(type: CoveragePinType): google.maps.Icon | google.maps.Symbol {
  if (type === 'station') {
    return {
      url: LOGO.favicon,
      scaledSize: new google.maps.Size(44, 44),
      anchor: new google.maps.Point(22, 22),
    }
  }
  if (type === 'football') {
    return svgIcon(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="${BRAND_COLORS.red}" stroke="${BRAND_COLORS.white}" stroke-width="2"/>
        <ellipse cx="16" cy="16" rx="6" ry="9" fill="none" stroke="${BRAND_COLORS.white}" stroke-width="1.5"/>
        <line x1="16" y1="7" x2="16" y2="25" stroke="${BRAND_COLORS.white}" stroke-width="1"/>
      </svg>`,
      32,
    )
  }
  return svgIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="13" fill="${BRAND_COLORS.gold}" stroke="${BRAND_COLORS.navy}" stroke-width="2"/>
      <text x="15" y="20" text-anchor="middle" font-size="14" font-weight="700" fill="${BRAND_COLORS.navy}" font-family="Arial,sans-serif">S</text>
    </svg>`,
    30,
  )
}

export type TourStop =
  | { kind: 'fly'; lat: number; lng: number; zoom: number; caption: string; dwellMs: number; pulseStation?: boolean }
  | { kind: 'fit'; pins: CoveragePin[]; caption: string; dwellMs: number; maxZoom?: number }
  | { kind: 'town'; town: Town; caption: string; dwellMs: number }

export function buildAdvertiserTour(towns: Town[], pins: CoveragePin[]): TourStop[] {
  const station = pins.find((p) => p.type === 'station')!
  const football = pins.filter((p) => p.type === 'football')
  const sponsors = pins.filter((p) => p.type === 'sponsor')
  const majors = [...towns]
    .filter((t) => t.sizeCategory === 'hub' || t.sizeCategory === 'major')
    .sort((a, b) => b.population2026 - a.population2026)
    .slice(0, 5)

  return [
    {
      kind: 'fly',
      lat: SHEPPARTON.lat,
      lng: SHEPPARTON.lng,
      zoom: 8,
      caption: '100 km broadcast footprint — ~190k people across the Goulburn Valley',
      dwellMs: 4500,
    },
    {
      kind: 'fly',
      lat: station.lat,
      lng: station.lng,
      zoom: 13,
      caption: '98.5 FM from Shepparton — your brand radiates from here',
      dwellMs: 4000,
      pulseStation: true,
    },
    ...majors.map((town) => ({
      kind: 'town' as const,
      town,
      caption: `${town.name} — ${town.population2026.toLocaleString()} people · ~${town.listenersEstimate.toLocaleString()} weekly listeners`,
      dwellMs: 3200,
    })),
    {
      kind: 'fit',
      pins: football,
      caption: `GVL Saturday coverage — ${football.length} clubs in our broadcast heartland`,
      dwellMs: 5000,
      maxZoom: 10,
    },
    {
      kind: 'fit',
      pins: sponsors,
      caption: 'Local sponsors already on air — your brand alongside trusted Valley businesses',
      dwellMs: 5000,
      maxZoom: 11,
    },
    {
      kind: 'fly',
      lat: SHEPPARTON.lat,
      lng: SHEPPARTON.lng,
      zoom: 8,
      caption: 'Ready to reach the Valley? Explore towns or enquire about sponsorship.',
      dwellMs: 3500,
    },
  ]
}

export function fitMapToPins(
  map: google.maps.Map,
  pins: CoveragePin[],
  maxZoom = 11,
): void {
  if (pins.length === 0) return
  const bounds = new google.maps.LatLngBounds()
  pins.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))
  map.fitBounds(bounds, 48)
  const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
    const z = map.getZoom()
    if (z && z > maxZoom) map.setZoom(maxZoom)
  })
  void listener
}

/** Smooth-ish zoom: step toward target zoom then pan. */
export function flyTo(
  map: google.maps.Map,
  lat: number,
  lng: number,
  targetZoom: number,
  onDone?: () => void,
): void {
  const startZoom = map.getZoom() ?? 9
  const steps = Math.max(4, Math.abs(targetZoom - startZoom))
  let step = 0
  const interval = setInterval(() => {
    step += 1
    const t = step / steps
    const eased = 1 - Math.pow(1 - t, 3)
    const z = startZoom + (targetZoom - startZoom) * eased
    map.setZoom(Math.round(z * 10) / 10)
    if (step >= steps) {
      clearInterval(interval)
      map.panTo({ lat, lng })
      google.maps.event.addListenerOnce(map, 'idle', () => onDone?.())
    }
  }, 80)
}
