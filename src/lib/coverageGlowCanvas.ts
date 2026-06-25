/// <reference types="google.maps" />
import { BRAND_COLORS } from '@/lib/brand'

const { gold, champagne, blue, navy, cyan } = BRAND_COLORS

export interface CoverageGlowOptions {
  center: google.maps.LatLngLiteral
  /** Broadcast radius in metres (default 100 km). */
  radiusMeters?: number
  /** ONE FM studio — draws a local beacon halo. */
  station?: google.maps.LatLngLiteral
}

/**
 * Canvas overlay: true radial gradient + sonar ripples + station halo.
 * Synced to map projection on every frame / pan / zoom.
 *
 * NOTE: the class body is wrapped in a factory to avoid evaluating
 * `google.maps.OverlayView` at module-import time (before the Maps API loads).
 */
function createGlowOverlayClass() {
  return class CoverageGlowOverlay extends google.maps.OverlayView {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private raf = 0
  private phase = 0
  private readonly center: google.maps.LatLngLiteral
  private readonly radiusMeters: number
  private readonly station?: google.maps.LatLngLiteral
  private listeners: google.maps.MapsEventListener[] = []

  constructor(options: CoverageGlowOptions) {
    super()
    this.center = options.center
    this.radiusMeters = options.radiusMeters ?? 100_000
    this.station = options.station
  }

  onAdd(): void {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.pointerEvents = 'none'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.setAttribute('aria-hidden', 'true')
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: true })

    this.getPanes()?.overlayLayer.appendChild(canvas)

    const map = this.getMap()
    if (map) {
      this.listeners.push(
        google.maps.event.addListener(map, 'bounds_changed', () => this.draw()),
        google.maps.event.addListener(map, 'resize', () => this.draw()),
      )
    }

    this.startAnimation()
  }

  draw(): void {
    if (!this.canvas || !this.ctx) return

    const projection = this.getProjection()
    const map = this.getMap()
    if (!projection || !map) return

    const div = (map as google.maps.Map).getDiv()
    const w = div.offsetWidth
    const h = div.offsetHeight
    if (w === 0 || h === 0) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.floor(w * dpr)
    this.canvas.height = Math.floor(h * dpr)
    this.canvas.style.width = `${w}px`
    this.canvas.style.height = `${h}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const centerLatLng = new google.maps.LatLng(this.center.lat, this.center.lng)
    const centerPx = projection.fromLatLngToDivPixel(centerLatLng)
    if (!centerPx) return

    // True geographic radius (100km from Shepparton) only looks right at one
    // specific zoom level — at every other zoom it's either a tiny dot or a
    // circle far bigger than the viewport, which renders as a giant arc
    // slicing across the screen with no visible center. Cap it so the whole
    // glow/ring effect always draws as a complete, contained circle instead.
    const radiusPx = Math.min(
      this.radiusInPixels(projection, centerLatLng, centerPx),
      Math.min(w, h) * 0.46,
    )
    if (radiusPx < 8) return

    this.ctx.clearRect(0, 0, w, h)

    this.drawVignette(w, h)
    this.drawRadialGlow(centerPx.x, centerPx.y, radiusPx)
    this.drawInnerHotspot(centerPx.x, centerPx.y, radiusPx * 0.12)
    this.drawSonarRings(centerPx.x, centerPx.y, radiusPx)
    this.drawRangeRings(centerPx.x, centerPx.y, radiusPx)

    if (this.station) {
      const stationPx = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(this.station.lat, this.station.lng),
      )
      if (stationPx) this.drawStationHalo(stationPx.x, stationPx.y)
    }
  }

  private radiusInPixels(
    projection: google.maps.MapCanvasProjection,
    centerLatLng: google.maps.LatLng,
    centerPx: google.maps.Point,
  ): number {
    if (!google.maps.geometry?.spherical) {
      return Math.min(projection.getWorldWidth() * 0.22, 400)
    }
    const edge = google.maps.geometry.spherical.computeOffset(centerLatLng, this.radiusMeters, 90)
    const edgePx = projection.fromLatLngToDivPixel(edge)
    if (!edgePx) return 200
    return Math.hypot(edgePx.x - centerPx.x, edgePx.y - centerPx.y)
  }

  private drawVignette(w: number, h: number): void {
    const ctx = this.ctx!
    const cx = w / 2
    const cy = h / 2
    const inner = Math.min(w, h) * 0.45
    const outer = Math.max(w, h) * 0.85
    const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(2, 10, 24, 0.22)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  private drawRadialGlow(cx: number, cy: number, r: number): void {
    const ctx = this.ctx!
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, hexA(gold, 0.28))
    grad.addColorStop(0.12, hexA(champagne, 0.18))
    grad.addColorStop(0.28, hexA(blue, 0.12))
    grad.addColorStop(0.5, hexA(navy, 0.08))
    grad.addColorStop(0.72, hexA(cyan, 0.05))
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  /** Bright core where signal originates. */
  private drawInnerHotspot(cx: number, cy: number, r: number): void {
    const ctx = this.ctx!
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, hexA(gold, 0.55))
    grad.addColorStop(0.4, hexA(champagne, 0.2))
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawSonarRings(cx: number, cy: number, maxR: number): void {
    const ctx = this.ctx!
    for (let i = 0; i < 3; i++) {
      const offset = (this.phase + i * 0.34) % 1
      const ringR = offset * maxR * 0.98
      const alpha = Math.pow(1 - offset, 1.6) * 0.5
      ctx.beginPath()
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
      ctx.strokeStyle = hexA(cyan, alpha)
      ctx.lineWidth = 2 + (1 - offset) * 1.5
      ctx.stroke()
    }
  }

  /** 50 km + 100 km reference rings. */
  private drawRangeRings(cx: number, cy: number, maxR: number): void {
    const ctx = this.ctx!
    const rings = [
      { scale: 0.5, color: gold, alpha: 0.28, width: 1 },
      { scale: 1, color: gold, alpha: 0.38, width: 1.5 },
    ]
    for (const ring of rings) {
      ctx.beginPath()
      ctx.arc(cx, cy, maxR * ring.scale, 0, Math.PI * 2)
      ctx.strokeStyle = hexA(ring.color, ring.alpha)
      ctx.lineWidth = ring.width
      ctx.stroke()
    }
  }

  private drawStationHalo(cx: number, cy: number): void {
    const ctx = this.ctx!
    const pulse = 0.5 + Math.sin(this.phase * Math.PI * 2) * 0.5
    const r = 34 + pulse * 18

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, hexA(gold, 0.45 + pulse * 0.25))
    grad.addColorStop(0.45, hexA(cyan, 0.15 + pulse * 0.1))
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, 14 + pulse * 4, 0, Math.PI * 2)
    ctx.strokeStyle = hexA(gold, 0.5 + pulse * 0.3)
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  private startAnimation(): void {
    const tick = () => {
      this.phase += 0.0055
      if (this.phase > 1) this.phase -= 1
      this.draw()
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)
  }

  onRemove(): void {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
    this.listeners.forEach((l) => google.maps.event.removeListener(l))
    this.listeners = []
    this.canvas?.remove()
    this.canvas = null
    this.ctx = null
  }
  }  // end class
} // end createGlowOverlayClass

// Memoised so the class is only built once per session.
let _GlowOverlayClass: ReturnType<typeof createGlowOverlayClass> | null = null
function getGlowOverlayClass() {
  if (!_GlowOverlayClass) _GlowOverlayClass = createGlowOverlayClass()
  return _GlowOverlayClass
}

export type CoverageGlowOverlay = InstanceType<ReturnType<typeof createGlowOverlayClass>>

function hexA(hex: string, alpha: number): string {
  const n = hex.replace('#', '')
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export interface CoverageGlowHandle {
  overlay: CoverageGlowOverlay
  destroy: () => void
}

export function mountCanvasCoverageGlow(
  map: google.maps.Map,
  options: CoverageGlowOptions,
): CoverageGlowHandle {
  const GlowClass = getGlowOverlayClass()
  const overlay = new GlowClass(options)
  overlay.setMap(map)
  return {
    overlay,
    destroy: () => overlay.setMap(null),
  }
}
