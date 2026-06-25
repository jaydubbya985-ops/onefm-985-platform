import { useRef, useEffect } from 'react'

/**
 * Hero background — GVL regional photo + CSS mist veils + canvas signal rings.
 * Signal rings: concentric gold pulses from bottom-center (broadcast origin),
 * creating the "transmitting" generative quality.
 * Mouse parallax: photo and mist layers shift at different rates on mousemove,
 * creating a genuine 3D depth effect.
 */

function SignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const electricRgb = useRef('0, 229, 255')

  useEffect(() => {
    const readColor = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--one-electric-rgb').trim()
      if (v) electricRgb.current = v
    }
    readColor()
    const mo = new MutationObserver(readColor)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-time'] })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    type Ring = { born: number; ox: number; oy: number; gold: boolean }
    const rings: Ring[] = []
    let animId: number
    let lastBorn = 0

    const spawnRing = (ox: number, oy: number, gold = true) => {
      rings.push({ born: performance.now(), ox, oy, gold })
    }

    const animate = (now: number) => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      // Auto-spawn from transmitter origin
      if (now - lastBorn > 1800) {
        spawnRing(W * 0.5, H * 0.82, true)
        lastBorn = now
      }

      const maxR = Math.hypot(W, H) * 0.78

      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i]
        const age = (now - ring.born) / 6000
        if (age >= 1) { rings.splice(i, 1); continue }
        const r = age * maxR
        const alpha = 0.22 * (1 - age) * (1 - age)
        ctx.beginPath()
        ctx.arc(ring.ox, ring.oy, r, 0, Math.PI * 2)
        ctx.strokeStyle = ring.gold
          ? `rgba(212,175,55,${alpha.toFixed(3)})`
          : `rgba(${electricRgb.current},${(alpha * 0.7).toFixed(3)})`
        ctx.lineWidth = ring.gold ? 1.5 : 1
        ctx.stroke()
      }

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)

    // Click anywhere on the hero spawns a ring at click position — themed electric color
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      spawnRing(e.clientX - rect.left, e.clientY - rect.top, false)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Canvas is pointer-events-none so we listen on the parent section instead
    const section = canvas.closest('section') ?? document.body
    section.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      section.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  )
}

export function HeroAtmosphere() {
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const mistWrapRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ nx: 0, ny: 0 })
  const lerped = useRef({ nx: 0, ny: 0 })

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e: MouseEvent) => {
      mousePos.current = {
        nx: (e.clientX / window.innerWidth - 0.5) * 2,
        ny: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }

    let rafId: number
    const lerpFn = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      lerped.current.nx = lerpFn(lerped.current.nx, mousePos.current.nx, 0.045)
      lerped.current.ny = lerpFn(lerped.current.ny, mousePos.current.ny, 0.045)
      const { nx, ny } = lerped.current
      if (imgWrapRef.current) {
        imgWrapRef.current.style.transform = `translate(${nx * -10}px, ${ny * -6}px)`
      }
      if (mistWrapRef.current) {
        mistWrapRef.current.style.transform = `translate(${nx * 16}px, ${ny * 10}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    document.addEventListener('mousemove', onMove, { passive: true })
    return () => { cancelAnimationFrame(rafId); document.removeEventListener('mousemove', onMove) }
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Layer 0: photo — slightly oversized so parallax has room to travel */}
      <div ref={imgWrapRef} className="absolute" style={{ inset: '-3%', zIndex: 0, willChange: 'transform' }}>
        <img
          src="/assets/images/event-lasers-crowd.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-[1.06] animate-ken-burns"
          style={{ animationDuration: '32s' }}
        />
      </div>

      {/* Layer 1: cinematic dark overlays — stay fixed */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(to bottom, rgba(5,13,26,0.72) 0%, rgba(5,13,26,0.38) 40%, rgba(4,11,20,0.94) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(to right, rgba(5,13,26,0.80) 0%, rgba(7,29,58,0.18) 50%, rgba(5,13,26,0.38) 100%)',
        }}
      />

      {/* Layer 2: broadcast signal rings */}
      <SignalCanvas />

      {/* Layer 3: mist veils — move in opposite direction for depth */}
      <div
        ref={mistWrapRef}
        aria-hidden
        className="hero-mist"
        style={{ zIndex: 3, willChange: 'transform' }}
      >
        <span className="hero-mist__veil hero-mist__veil--a" />
        <span className="hero-mist__veil hero-mist__veil--b" />
        <span className="hero-mist__veil hero-mist__veil--c" />
      </div>

      {/* Layer 4: warm amber pulse from bottom */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          background:
            'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(212,175,55,0.11) 0%, transparent 60%)',
          animation: 'hero-mist-drift-c 14s ease-in-out infinite',
        }}
      />
    </div>
  )
}
