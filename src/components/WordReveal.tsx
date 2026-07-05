import type React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface WordRevealProps {
  text: string
  className?: string
  style?: React.CSSProperties
  delay?: number
  stagger?: number
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p'
  variant?: 'word' | 'char'
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

/**
 * Mask-wipe text reveal.
 * variant="word" (default) — each word uncovers upward ("printing press").
 * variant="char" — each character uncovers individually, staggered across all words.
 * Works on any heading with whileInView.
 */
export function WordReveal({
  text,
  className,
  style,
  delay = 0,
  stagger,
  as: Tag = 'span',
  variant = 'word',
}: WordRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (variant === 'char') {
    const words = text.split(' ')
    // Pre-compute per-character global stagger indices before JSX render
    let gi = 0
    const wordChars = words.map(w => w.split('').map(c => ({ c, i: gi++ })))

    return (
      <Tag className={className} style={style} aria-label={text}>
        {wordChars.map((chars, wi) => (
          <span
            key={wi}
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              marginRight: wi < wordChars.length - 1 ? '0.28em' : 0,
            }}
          >
            {chars.map(({ c, i }) => (
              <span
                key={i}
                className="inline-block overflow-hidden"
                style={{ verticalAlign: 'bottom', paddingBottom: '0.08em', marginBottom: '-0.08em' }}
              >
                <motion.span
                  className="inline-block"
                  initial={prefersReducedMotion ? false : { y: '110%', opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={prefersReducedMotion ? { duration: 0 } : {
                    delay: delay + i * (stagger ?? 0.028),
                    duration: 0.52,
                    ease,
                  }}
                >
                  {c}
                </motion.span>
              </span>
            ))}
          </span>
        ))}
      </Tag>
    )
  }

  // Default (ON AIR silk): the whole line rises from a clipped baseline —
  // calmer than per-word stagger, the poster-type standard. `stagger` is
  // retained in the API but line reveals ignore it by design.
  return (
    <Tag className={className} style={style} aria-label={text}>
      <span
        className="inline-block overflow-hidden"
        style={{ verticalAlign: 'bottom', paddingBottom: '0.08em', marginBottom: '-0.08em', maxWidth: '100%' }}
      >
        <motion.span
          className="inline-block"
          initial={prefersReducedMotion ? false : { y: '110%' }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay, duration: 0.65, ease }}
        >
          {text}
        </motion.span>
      </span>
    </Tag>
  )
}
