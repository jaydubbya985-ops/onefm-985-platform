import { BROADCAST_POPULATION_SOURCE, coverageNumbers, formatBroadcastPopulation, formatRadius } from '@/lib/coverageCopy'
import { formatGuideHours } from '@/lib/guideHours'
import { BRAND_COLORS } from '@/lib/brand'
import type { CoveragePin, CoveragePinType } from '@/data/coverageMapPins'
import type { Town } from '@/data/townData'
import {
  mountCanvasCoverageGlow,
  type CoverageGlowHandle,
} from '@/lib/coverageGlowCanvas'
import type { Renderer } from '@googlemaps/markerclusterer'

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
    radiusMeters: coverageNumbers.broadcastRadiusKm * 1000,
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
    // The brand favicon is a busy 4-element app-icon design (dark square +
    // thin ring + text + mic-stand graphic) — reads as a muddy blob at map-pin
    // size. Use the same solid-circle-plus-glyph language as the football/
    // sponsor pins instead, just larger since this is the single most
    // important marker on the map.
    return svgIcon(
      `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="17" fill="${BRAND_COLORS.gold}" stroke="${BRAND_COLORS.navy}" stroke-width="2.5"/>
        <text x="20" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="${BRAND_COLORS.navy}" font-family="Arial,sans-serif">FM</text>
      </svg>`,
      40,
    )
  }
  if (type === 'football') {
    return svgIcon(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="${BRAND_COLORS.red}" stroke="${BRAND_COLORS.white}" stroke-width="2"/>
        <text x="16" y="21" text-anchor="middle" font-size="14" font-weight="700" fill="${BRAND_COLORS.white}" font-family="Arial,sans-serif">F</text>
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

/**
 * Football + sponsor pins sit only ~1-2km from their town centroid (deliberately,
 * to anchor them visually), which means at almost every useful zoom level several
 * collide into an illegible stack of identical badges. Cluster them into a single
 * branded badge instead — same gold/navy language as the individual pins, sized by
 * count tier — and let the clusterer split them apart once there's room.
 */
function clusterBadgeSvg(count: number, size: number, fontSize: number): string {
  const half = size / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="clusterGrad" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="${BRAND_COLORS.champagne}"/>
        <stop offset="100%" stop-color="${BRAND_COLORS.gold}"/>
      </radialGradient>
    </defs>
    <circle cx="${half}" cy="${half}" r="${half - 2}" fill="url(#clusterGrad)" stroke="${BRAND_COLORS.navy}" stroke-width="2"/>
    <circle cx="${half}" cy="${half}" r="${half - 6}" fill="none" stroke="${BRAND_COLORS.white}" stroke-opacity="0.3" stroke-width="1"/>
    <text x="${half}" y="${half + fontSize * 0.36}" text-anchor="middle" font-size="${fontSize}" font-weight="800" fill="${BRAND_COLORS.navy}" font-family="Arial,sans-serif">${count}</text>
  </svg>`
}

/**
 * Towns and pins used to live in two independent MarkerClusterer instances.
 * Each was internally collision-free, but neither knew about the other's
 * rendered positions — so a town badge could still land on top of a pin
 * badge nearby (most visibly: Shepparton's hub badge on top of the
 * station's "FM" badge, since the studio is physically inside Shepparton).
 * A single shared clusterer, with one renderer that inspects cluster
 * membership, makes that overlap structurally impossible: if a town and a
 * pin are close enough to collide on screen, SuperCluster merges them into
 * the *same* cluster and only one badge is ever drawn for that group.
 */
export function combinedClusterRenderer(
  stationMarker: google.maps.Marker | null,
  hubMarker: google.maps.Marker | null,
  townMarkers: Set<google.maps.Marker>,
): Renderer {
  return {
    render: (cluster) => {
      const { count, position } = cluster
      const includesStation = !!stationMarker && cluster.markers.includes(stationMarker)
      const includesHub = !!hubMarker && cluster.markers.includes(hubMarker)

      if (includesStation) {
        const extra = count - 1
        const size = 46
        const half = size / 2
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${half}" cy="${half}" r="${half - 2}" fill="${BRAND_COLORS.gold}" stroke="${BRAND_COLORS.navy}" stroke-width="2.5"/>
          <text x="${half}" y="${extra > 0 ? half - 1 : half + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="${BRAND_COLORS.navy}" font-family="Arial,sans-serif">FM</text>
          ${extra > 0 ? `<text x="${half}" y="${half + 14}" text-anchor="middle" font-size="9" font-weight="700" fill="${BRAND_COLORS.navy}" font-family="Arial,sans-serif">+${extra}</text>` : ''}
        </svg>`
        const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
        return new google.maps.Marker({
          position,
          title: extra > 0 ? `ONE FM 98.5 + ${extra} nearby` : 'ONE FM 98.5',
          zIndex: 1000,
          icon: { url, scaledSize: new google.maps.Size(size, size), anchor: new google.maps.Point(half, half) },
        })
      }

      if (includesHub) {
        const extra = count - 1
        const size = 30
        const half = size / 2
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${half}" cy="${half}" r="${half - 2}" fill="${BRAND_COLORS.gold}" stroke="${BRAND_COLORS.white}" stroke-width="2"/>
          <text x="${half}" y="${half + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="${BRAND_COLORS.navy}" font-family="Arial,sans-serif">+${extra}</text>
        </svg>`
        const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
        return new google.maps.Marker({
          position,
          title: `Shepparton + ${extra} nearby`,
          zIndex: 250,
          icon: { url, scaledSize: new google.maps.Size(size, size), anchor: new google.maps.Point(half, half) },
        })
      }

      const allTowns = cluster.markers.every((m) => townMarkers.has(m as google.maps.Marker))
      const allPins = cluster.markers.every((m) => !townMarkers.has(m as google.maps.Marker))

      if (allTowns) {
        const size = count >= 6 ? 36 : count >= 3 ? 28 : 22
        const fontSize = count >= 6 ? 14 : count >= 3 ? 12 : 11
        const half = size / 2
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${half}" cy="${half}" r="${half - 1.5}" fill="${BRAND_COLORS.blue}" stroke="${BRAND_COLORS.white}" stroke-width="1.5"/>
          <text x="${half}" y="${half + fontSize * 0.36}" text-anchor="middle" font-size="${fontSize}" font-weight="800" fill="${BRAND_COLORS.white}" font-family="Arial,sans-serif">${count}</text>
        </svg>`
        const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
        return new google.maps.Marker({
          position,
          title: `${count} towns`,
          zIndex: 150,
          icon: { url, scaledSize: new google.maps.Size(size, size), anchor: new google.maps.Point(half, half) },
        })
      }

      if (allPins) {
        const size = count >= 8 ? 50 : count >= 4 ? 42 : 34
        const fontSize = count >= 8 ? 17 : count >= 4 ? 15 : 13
        const svg = clusterBadgeSvg(count, size, fontSize)
        const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
        return new google.maps.Marker({
          position,
          title: `${count} pins`,
          zIndex: 600,
          icon: { url, scaledSize: new google.maps.Size(size, size), anchor: new google.maps.Point(size / 2, size / 2) },
        })
      }

      // Mixed group: towns and pins close enough on screen to merge.
      // Distinct navy/gold split styling so it reads as neither a pure
      // town badge nor a pure pin badge, but honestly "both, here."
      const size = count >= 8 ? 48 : count >= 4 ? 40 : 32
      const fontSize = count >= 8 ? 16 : count >= 4 ? 14 : 12
      const half = size / 2
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${half}" cy="${half}" r="${half - 2}" fill="${BRAND_COLORS.navy}" stroke="${BRAND_COLORS.gold}" stroke-width="2.5"/>
        <text x="${half}" y="${half + fontSize * 0.36}" text-anchor="middle" font-size="${fontSize}" font-weight="800" fill="${BRAND_COLORS.gold}" font-family="Arial,sans-serif">${count}</text>
      </svg>`
      const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
      return new google.maps.Marker({
        position,
        title: `${count} towns + pins`,
        zIndex: 400,
        icon: { url, scaledSize: new google.maps.Size(size, size), anchor: new google.maps.Point(half, half) },
      })
    },
  }
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
      caption: `${formatRadius()} broadcast footprint — ${formatBroadcastPopulation()} people across the Goulburn Valley (${BROADCAST_POPULATION_SOURCE})`,
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
      caption: `GVL Match of the Day · ${formatGuideHours('GVL Match of the Day') ?? 'Saturday'} — ${football.length} clubs in our broadcast heartland`,
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
