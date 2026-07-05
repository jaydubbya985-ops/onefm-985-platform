import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'

/**
 * Broadcast sign-on — three lines arrive line by line, like a transmitter
 * locking onto frequency.
 *
 * Technique: direct DOM refs + GSAP timeline.
 * Overflow-hidden line masks + translateY per line.
 * Line 2 ("OF THE") uses per-word masks for word-stagger.
 * Gold rule scaleX 0→1 synced to end of line 2.
 *
 * Timeline (0.05s delay):
 *   0.05s  Line 1 "THE VOICE" begins  (0.9s, power3.out)
 *   0.17s  Line 2 "OF" begins         (0.75s, power3.out)
 *   0.17s  Gold rule begins drawing   (0.8s, power2.inOut)
 *   0.27s  Line 2 "THE" begins
 *   0.25s  Line 3 "VALLEY." begins    (0.85s)
 *   ~1.15s All settled
 *
 * FOUC: useLayoutEffect sets initial state before first paint.
 * Reduced motion: instant final state, no animation.
 */
export function HeroHeadline() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const l1   = el.querySelector<HTMLElement>('.hl-l1')
    const l2ws = el.querySelectorAll<HTMLElement>('.hl-l2w')
    const l3   = el.querySelector<HTMLElement>('.hl-l3')
    const rule = el.querySelector<HTMLElement>('.hl-rule')

    if (reduced) {
      gsap.set([l1, ...Array.from(l2ws), l3, rule].filter(Boolean), { clearProps: 'all' })
      return
    }

    // Set initial hidden state synchronously — before browser paint
    gsap.set([l1, l3], { yPercent: 110, filter: 'blur(5px)' })
    gsap.set(Array.from(l2ws), { yPercent: 110, filter: 'blur(5px)' })
    gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' })

    const tl = gsap.timeline({ delay: 0.05 })
    tl.to(l1,              { yPercent: 0, filter: 'blur(0px)', duration: 0.9,  ease: 'power3.out' }, 0)
    tl.to(Array.from(l2ws),{ yPercent: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out', stagger: 0.1 }, 0.12)
    tl.to(rule,            { scaleX: 1,   duration: 0.8,  ease: 'power2.inOut' }, 0.17)
    tl.to(l3,              { yPercent: 0, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out' }, 0.20)

    return () => { tl.kill() }
  }, [])

  return (
    <div ref={rootRef}>
      <h1 className="font-hero text-one-white text-shadow-hero mb-8">

        {/* Line 1: THE VOICE */}
        <span className="block overflow-hidden pb-[0.06em]">
          <span className="hl-l1 block will-change-transform">THE VOICE</span>
        </span>

        {/* Line 2: OF THE — gold, each word in its own overflow mask */}
        <span className="flex gap-[0.3em]">
          {(['OF', 'THE'] as const).map((word) => (
            <span key={word} className="block overflow-hidden pb-[0.06em]">
              <span className="hl-l2w block will-change-transform text-one-gold">
                {word}
              </span>
            </span>
          ))}
        </span>

        {/* Line 3: VALLEY. */}
        <span className="block overflow-hidden pb-[0.06em]">
          <span className="hl-l3 block will-change-transform">VALLEY.</span>
        </span>
      </h1>

      {/* Gold rule — scaleX 0→1, completes as "THE" lands */}
      <div
        className="hl-rule h-[2px] w-28 mb-8 origin-left will-change-transform"
        style={{
          background: 'linear-gradient(90deg, #F2F2F2 0%, rgba(212,175,55,0.35) 65%, transparent 100%)',
          borderRadius: 1,
        }}
      />
    </div>
  )
}
