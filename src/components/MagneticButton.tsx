import { useRef, type MouseEvent, type ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  strength?: number   // how many px it pulls at the edge (default 12)
  className?: string
  as?: 'div' | 'span'
  cursorLabel?: string
}

/**
 * Wraps a button/link in a magnetic hover zone.
 * The inner element slides up to `strength` px toward the cursor,
 * then springs back on leave via CSS transition.
 *
 * Usage: wrap any <Link> or <button> — the wrapper is transparent.
 *   <MagneticButton><Link to="/listen" className="btn-primary">Listen</Link></MagneticButton>
 */
export function MagneticButton({
  children,
  strength = 12,
  className = '',
  as: Tag = 'div',
  cursorLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement & HTMLSpanElement>(null)

  const handleMouseMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
    el.style.transition = 'transform 0.1s cubic-bezier(0.16,1,0.3,1)'
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0px, 0px)'
    el.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)'
  }

  return (
    <Tag
      ref={ref as any}
      className={`inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...(cursorLabel ? { 'data-cursor-label': cursorLabel } : {})}
    >
      {children}
    </Tag>
  )
}
