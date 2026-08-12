import { useEffect, useRef, useState, type ElementType, type Ref, type RefObject } from 'react'
import { useInView } from 'framer-motion'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$&'

interface TextScrambleProps {
  text: string
  className?: string
  /** ms delay before scramble starts */
  delay?: number
  /** total ms to reach final text */
  duration?: number
  /** trigger once when in view (default true) */
  once?: boolean
  as?: ElementType
}

export function TextScramble({
  text,
  className = '',
  delay = 0,
  duration = 900,
  once = true,
  as: Tag = 'span',
}: TextScrambleProps) {
  const ref = useRef<Element>(null)
  const isInView = useInView(ref as RefObject<Element>, { once, margin: '-80px' })
  const [display, setDisplay] = useState(text)
  const animRef = useRef<number | undefined>(undefined)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!isInView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (once && startedRef.current) return
    startedRef.current = true

    window.clearTimeout(animRef.current)

    animRef.current = window.setTimeout(() => {
      const chars = text.split('')
      const total = chars.length
      const frameMs = 40          // ~25fps
      const frames = Math.round(duration / frameMs)
      let frame = 0

      const tick = () => {
        const progress = frame / frames
        const resolved = Math.floor(progress * total)

        const next = chars.map((char, i) => {
          if (char === ' ') return ' '
          if (i < resolved) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')

        setDisplay(next)
        frame++

        if (frame <= frames) {
          animRef.current = window.setTimeout(tick, frameMs)
        } else {
          setDisplay(text)
        }
      }

      tick()
    }, delay)

    return () => window.clearTimeout(animRef.current)
  }, [isInView, text, delay, duration, once])

  return (
    <Tag ref={ref as Ref<HTMLElement>} className={`font-mono tabular-nums ${className}`}>
      {display}
    </Tag>
  )
}
