import { useRef, type CSSProperties, type ReactNode, type MouseEvent } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** max tilt angle in degrees (default 8) */
  maxTilt?: number
  /** scale on hover (default 1.015) */
  hoverScale?: number
}

/**
 * 3D perspective tilt on mouse move.
 * CSS transform only — no GSAP needed. Spring-back via transition.
 */
export function TiltCard({ children, className = '', style, maxTilt = 8, hoverScale = 1.015 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5  // -0.5 → 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    const rx =  y * -maxTilt * 2
    const ry =  x *  maxTilt * 2
    el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${hoverScale})`
    el.style.transition = 'transform 0.08s linear'
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)'
    el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)'
  }

  return (
    <div
      ref={ref}
      className={`${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: 'transform', transformStyle: 'preserve-3d', ...style }}
    >
      {children}
    </div>
  )
}
