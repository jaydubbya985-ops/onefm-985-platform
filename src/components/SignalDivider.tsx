import { motion, useReducedMotion } from 'framer-motion'
import { BRAND_COLORS } from '@/lib/brand'

interface SignalDividerProps {
  className?: string
  variant?: 'freq' | 'dot'
}

const BARS = [6, 11, 8, 16, 9, 14, 7, 13, 10, 12, 8, 15, 7, 11, 9] as const

/** Heritage Gold / 98.5 Red — not leftover #D4AF37. */
const RULE = BRAND_COLORS.gold
const SIGNAL = 'rgba(229, 22, 54, 0.55)'
const SIGNAL_SOFT = 'rgba(229, 22, 54, 0.28)'

/** Animated section divider — rules draw from center; freq bars stay still when reduced motion is on. */
export function SignalDivider({ className = '', variant = 'freq' }: SignalDividerProps) {
  const reduced = useReducedMotion()

  return (
    <div
      aria-hidden
      className={`relative flex items-center justify-center px-6 sm:px-10 py-10 ${className}`}
    >
      <motion.span
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: reduced ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 block h-px"
        style={{
          transformOrigin: 'right center',
          background: `linear-gradient(90deg, transparent 0%, ${RULE}1f 40%, ${RULE}47 100%)`,
        }}
      />

      <div className="mx-5 shrink-0">
        {variant === 'freq' ? (
          <div className="flex items-end gap-[2.5px]" style={{ height: 16 }}>
            {BARS.map((h, i) => (
              <div
                key={i}
                style={{
                  width: 2,
                  height: h,
                  borderRadius: 1,
                  background: SIGNAL,
                  transformOrigin: 'bottom',
                  animation: reduced
                    ? 'none'
                    : `freq-bar ${0.85 + (i % 5) * 0.17}s ${(i * 0.11) % 1.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{ width: 4, height: 4, borderRadius: '50%', background: SIGNAL_SOFT }}
          />
        )}
      </div>

      <motion.span
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: reduced ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 block h-px"
        style={{
          transformOrigin: 'left center',
          background: `linear-gradient(90deg, ${RULE}47 0%, ${RULE}1f 60%, transparent 100%)`,
        }}
      />
    </div>
  )
}
