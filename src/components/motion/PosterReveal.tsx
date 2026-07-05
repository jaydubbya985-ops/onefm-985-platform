/**
 * ON AIR motion system — "silk" primitives (Batch 4, Direction A).
 * Choreography rules baked in: expo ease, line stagger ~80ms, one-shot
 * reveals, reduced-motion renders instantly, nothing exceeds ~900ms
 * before content is readable.
 */
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

const EXPO = [0.16, 1, 0.3, 1] as const

/** Anton headline lines rise from a clipped baseline, one per line. */
export function PosterReveal({
  lines,
  delay = 0.1,
  stagger = 0.08,
  className = '',
}: {
  lines: ReactNode[]
  delay?: number
  stagger?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <>
        {lines.map((line, i) => (
          <span key={i} className={`block ${className}`}>{line}</span>
        ))}
      </>
    )
  }
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className={`block overflow-hidden ${className}`}>
          <motion.span
            className="block"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.65, delay: delay + i * stagger, ease: EXPO }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </>
  )
}

/** Outlined word that fills solid a beat after landing. Use sparingly. */
export function StrokeFill({
  children,
  delay = 0.9,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const stroke = { color: 'transparent', WebkitTextStroke: '2px #fff' } as const
  if (reduced) return <span className={className}>{children}</span>
  return (
    <span className={`relative inline-block ${className}`}>
      <span style={stroke} aria-hidden>{children}</span>
      <motion.span
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** Red section label: rule draws in, text slides on. One-shot on scroll. */
export function LabelReveal({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <div
      className={`flex items-center gap-3 font-bold text-[13px] tracking-[0.18em] uppercase ${className}`}
      style={{ color: '#E51636' }}
    >
      <motion.span
        className="inline-block h-px w-6 origin-left"
        style={{ background: '#E51636' }}
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: EXPO }}
      />
      <motion.span
        initial={reduced ? false : { opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, delay: 0.15, ease: EXPO }}
      >
        {children}
      </motion.span>
    </div>
  )
}
