import { motion } from 'framer-motion'

interface SignalDividerProps {
  className?: string
  variant?: 'freq' | 'dot'
}

const BARS = [6, 11, 8, 16, 9, 14, 7, 13, 10, 12, 8, 15, 7, 11, 9]

/** Animated section divider — gold rule draws from center outward, centered by freq bars */
export function SignalDivider({ className = '', variant = 'freq' }: SignalDividerProps) {
  return (
    <div
      aria-hidden
      className={`relative flex items-center justify-center px-6 sm:px-10 py-10 ${className}`}
    >
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 block h-px"
        style={{
          transformOrigin: 'right center',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.12) 40%, rgba(212,175,55,0.28) 100%)',
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
                  background: 'rgba(212,175,55,0.28)',
                  transformOrigin: 'bottom',
                  animation: `freq-bar ${0.85 + (i % 5) * 0.17}s ${(i * 0.11) % 1.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(212,175,55,0.38)' }}
          />
        )}
      </div>

      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 block h-px"
        style={{
          transformOrigin: 'left center',
          background:
            'linear-gradient(90deg, rgba(212,175,55,0.28) 0%, rgba(212,175,55,0.12) 60%, transparent 100%)',
        }}
      />
    </div>
  )
}
