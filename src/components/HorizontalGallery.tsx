import { useRef, useState, useLayoutEffect } from 'react'
import { HeadlinePop } from '@/components/motion/PosterReveal'
import { stationStats } from '@/data/pricing'

interface Slide {
  img: string
  num: string
  ghost: string
  title: string
  caption: string
}

const SLIDES: Slide[] = [
  {
    img: '/assets/images/studio-presenter-mic.jpg',
    num: '01', ghost: 'ON AIR',
    title: 'Live. Every Day.',
    caption: 'Real presenters, real voices — ONE FM 98.5 has been live and local from Shepparton since 1989.',
  },
  {
    img: '/assets/images/ob-van-branded.jpg',
    num: '02', ghost: 'FIELD',
    title: 'We Come to You',
    caption: 'The ONE FM OB van takes the station wherever the story is — 25 towns, one broadcast team.',
  },
  {
    img: '/assets/images/commentary-box-action.jpg',
    num: '03', ghost: 'SPORT',
    title: 'Call of the Match',
    caption: 'GVL football and netball on the weekly guide — Saturday Sport, Match of the Day, The Final Siren. Fixture dates on the football page.',
  },
  {
    img: '/assets/images/gvl-championship-mcg.jpg',
    num: '04', ghost: 'GVL',
    title: 'The Big Stage',
    caption: 'GVL championship — station archive photo. Fixture dates live on the football page.',
  },
  {
    img: '/assets/images/tower-mount-major-day.png',
    num: '05', ghost: 'SIGNAL',
    title: 'On the Hill',
    caption: 'The transmitter on Mount Major — 98.5 FM across the Goulburn Valley.',
  },
  {
    img: '/assets/images/culture-indigenous-elders.jpg',
    num: '06', ghost: 'VOICES',
    title: 'Every Voice',
    caption: 'First Nations programming and multicultural shows listed on the fm985.com.au weekly guide.',
  },
  {
    img: '/assets/images/geo-lake-aerial.jpg',
    num: '07', ghost: 'HOME',
    title: 'The Region',
    caption: `${stationStats.broadcastPopulation.toLocaleString()} people. ${stationStats.broadcastRadiusKm}km broadcast radius. One station that belongs to all of them.`,
  },
  {
    img: '/assets/images/studio-exterior-rainbow.jpg',
    num: '08', ghost: 'BORN HERE',
    title: 'Born Here.',
    caption: 'Built here. Belongs here. Goulburn Valley Community Radio — Est. 1989.',
  },
]

/* ── Individual slide panel ── */
function SlidePanel({
  slide,
  total,
  isActive,
}: {
  slide: Slide
  index: number
  total: number
  isActive: boolean
}) {
  return (
    <div className="relative shrink-0 overflow-hidden" style={{ width: '100vw', height: '100%' }}>
      <img
        src={slide.img}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.82 }}
      />
      {/* Single bottom-only gradient so images stay vivid */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

      {/* Ghost watermark */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ opacity: 0.04 }}
      >
        <span
          className="font-heading font-black text-white whitespace-nowrap leading-none"
          style={{ fontSize: 'clamp(8rem, 22vw, 18rem)', letterSpacing: '-0.04em' }}
        >
          {slide.ghost}
        </span>
      </div>

      {/* Activation scan-sweep — fires when slide becomes active */}
      <div
        aria-hidden
        key={isActive ? 'on' : 'off'}
        style={{
          position: 'absolute',
          insetInline: 0,
          top: -2,
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(229,22,54,0.7) 20%, rgba(255,255,255,0.5) 50%, rgba(229,22,54,0.7) 80%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 10,
          animation: isActive ? 'scan-sweep 0.75s ease-in forwards' : 'none',
        }}
      />

      {/* Top-left: slide counter */}
      <div className="absolute top-8 left-10 z-10 flex items-center gap-3">
        <span className="font-mono text-[11px] text-white/40 tracking-[0.18em]">
          {slide.num} <span className="opacity-40">/</span> {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* Bottom: title + caption */}
      <div
        className="absolute bottom-12 left-10 z-10 max-w-lg"
        style={{
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <h3
          className="font-poster uppercase text-white mb-3 leading-none"
          style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
        >
          {slide.title}
        </h3>
        <p
          className="font-body"
          style={{ color: 'rgba(255,255,255,0.60)', maxWidth: 400, lineHeight: 1.5 }}
        >
          {slide.caption}
        </p>
      </div>
    </div>
  )
}

/* ── Main export ── */
export function HorizontalGallery() {
  // sectionRef: the tall scroll-space div that drives sticky progress
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  useLayoutEffect(() => {
    // Touch devices: use CSS snap scroll, skip JS
    if (window.matchMedia('(pointer: coarse)').matches) return

    const section = sectionRef.current!
    const track = trackRef.current!

    const updateTrack = () => {
      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      if (travel <= 0) return
      const raw = -rect.top / travel
      const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw
      const x = -(track.scrollWidth - window.innerWidth) * progress
      track.style.transform = `translateX(${x}px)`
      const next = Math.min(SLIDES.length - 1, Math.round(progress * (SLIDES.length - 1)))
      if (next !== activeRef.current) {
        activeRef.current = next
        setActive(next)
      }
    }

    // Fire in sync with Lenis: Lenis updates window.scrollY then fires the
    // native scroll event — reading getBoundingClientRect here always gets
    // the fresh post-Lenis position, no frame lag.
    updateTrack()
    window.addEventListener('scroll', updateTrack, { passive: true })
    return () => window.removeEventListener('scroll', updateTrack)
  }, [])

  return (
    <section aria-label="ONE FM photo archive">

      {/* Section header — ON AIR kit chrome */}
      <div className="bg-[#0A0A0A] pt-20 pb-10 px-6 text-center section-bleed-top">
        <span className="font-bold text-[12px] tracking-[0.14em] uppercase mb-4 block" style={{ color: '#E51636' }}>
          — Station Archive
        </span>
        <h2
          className="font-poster uppercase text-white block leading-[0.95]"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          <HeadlinePop>Across the Valley</HeadlinePop>
        </h2>
        <p className="text-[14px] text-white/45 mt-2 max-w-sm mx-auto">
          Scroll through the moments that made ONE FM 98.5
        </p>
      </div>

      {/* ── Desktop: CSS sticky + JS translateX ── */}
      {/* Tall outer div creates the scroll travel distance */}
      <div
        ref={sectionRef}
        className="hidden md:block"
        style={{ height: `${SLIDES.length * 100}vh` }}
        data-cursor-label="SCROLL"
      >
        {/* Sticky viewport — stays fixed while outer div scrolls */}
        <div className="sticky top-0 overflow-hidden bg-[#0A0A0A]" style={{ height: '100svh' }}>
          {/* Horizontal track — translateX driven by tick() */}
          <div
            ref={trackRef}
            className="flex h-full will-change-transform"
            style={{ width: `${SLIDES.length * 100}vw` }}
          >
            {SLIDES.map((slide, i) => (
              <SlidePanel
                key={slide.num}
                slide={slide}
                index={i}
                total={SLIDES.length}
                isActive={i === active}
              />
            ))}
          </div>

          {/* Dot-dash progress indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className="h-px rounded-full transition-all duration-500"
                style={{
                  width: i === active ? 32 : 8,
                  backgroundColor: i === active ? '#E51636' : 'rgba(255,255,255,0.22)',
                }}
              />
            ))}
          </div>

          {/* Scroll cue — visible on first slide only */}
          <div
            className="absolute right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none"
            style={{ opacity: active === 0 ? 0.5 : 0, transition: 'opacity 0.6s ease' }}
            aria-hidden
          >
            <div
              className="w-px"
              style={{ height: 64, background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)' }}
            />
            <span
              className="font-label text-[8px] text-white/40 tracking-[0.32em]"
              style={{ writingMode: 'vertical-rl' }}
            >
              SCROLL
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile: CSS snap scroll ── */}
      <div
        className="md:hidden flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.num}
            className="shrink-0 snap-center w-screen relative overflow-hidden"
            style={{ height: 'min(72vw, 400px)' }}
          >
            <img
              src={slide.img}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.55 }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(3,8,16,0.92) 0%, rgba(3,8,16,0.28) 55%, transparent 100%)' }}
            />
            <div className="absolute bottom-5 left-5 right-5 z-10">
              <span className="font-label text-[9px] tracking-[0.25em] text-one-electric block mb-1">{slide.ghost}</span>
              <h3 className="font-h4 text-white">{slide.title}</h3>
              <p className="font-body-small mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {slide.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
