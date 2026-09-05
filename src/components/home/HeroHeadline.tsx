import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'

/**
 * Broadcast sign-on — licensed name arrives line by line.
 * Middle words use 98.5 Red, not leftover old gold (token gold is now off-white).
 */

export function HeroHeadline() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const l1 = el.querySelector<HTMLElement>('.hl-l1')
    const l2ws = el.querySelectorAll<HTMLElement>('.hl-l2w')
    const l3 = el.querySelector<HTMLElement>('.hl-l3')
    const rule = el.querySelector<HTMLElement>('.hl-rule')

    if (reduced) {
      gsap.set([l1, ...Array.from(l2ws), l3, rule].filter(Boolean), { clearProps: 'all' })
      return
    }

    gsap.set([l1, l3], { yPercent: 110, filter: 'blur(5px)' })
    gsap.set(Array.from(l2ws), { yPercent: 110, filter: 'blur(5px)' })
    gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' })

    const tl = gsap.timeline({ delay: 0.05 })
    tl.to(l1, { yPercent: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }, 0)
    tl.to(Array.from(l2ws), { yPercent: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out', stagger: 0.08 }, 0.12)
    tl.to(rule, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 0.17)
    tl.to(l3, { yPercent: 0, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out' }, 0.22)

    return () => { tl.kill() }
  }, [])

  return (
    <div ref={rootRef}>
      <h1 className="font-poster uppercase leading-[0.92] text-white text-[clamp(56px,11vw,170px)] mb-8">
        <span className="block overflow-hidden pb-[0.06em]">
          <span className="hl-l1 block will-change-transform">The Voice</span>
        </span>

        <span className="flex flex-wrap gap-[0.28em]">
          {(['of', 'the', 'Goulburn'] as const).map((word) => (
            <span key={word} className="block overflow-hidden pb-[0.06em]">
              <span className="hl-l2w block will-change-transform" style={{ color: '#E51636' }}>
                {word}
              </span>
            </span>
          ))}
        </span>

        <span className="block overflow-hidden pb-[0.06em]">
          <span className="hl-l3 block will-change-transform">
            Valley<span style={{ color: '#E51636' }}>.</span>
          </span>
        </span>
      </h1>

      <div
        className="hl-rule h-[2px] w-28 mb-8 origin-left will-change-transform"
        style={{
          background: 'linear-gradient(90deg, #E51636 0%, rgba(229,22,54,0.35) 65%, transparent 100%)',
          borderRadius: 1,
        }}
      />
    </div>
  )
}
