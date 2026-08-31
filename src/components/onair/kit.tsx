/**
 * ON AIR component kit — assemble pages from these. See REBUILD-SPEC.md.
 * Home.tsx is the reference implementation; these are its modules
 * generalised with props. Design laws live in the spec, not in options:
 * the kit deliberately exposes few knobs.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LabelReveal } from '@/components/motion/PosterReveal'

const RED = '#E51636'
const INK = '#0A0A0A'
const BAR = '#161616'
const EXPO = [0.16, 1, 0.3, 1] as const

export { LabelReveal }
export { PosterReveal, StrokeFill } from '@/components/motion/PosterReveal'

/** Red marquee band. Pass real facts / live metadata as items. */
export function OnAirTicker({ items, delay = 0.75 }: { items: string[]; delay?: number }) {
  const line = items.join('   ·   ')
  return (
    <motion.div
      className="overflow-hidden"
      style={{ background: RED }}
      aria-hidden
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay, ease: EXPO }}
    >
      <div className="flex whitespace-nowrap py-2 font-bold text-[13px] tracking-[0.12em] uppercase text-white animate-marquee">
        {[0, 1].map((i) => (
          <span key={i} className="pr-12">{line}   ·   </span>
        ))}
      </div>
    </motion.div>
  )
}

export interface WallRow {
  name: string
  sub: string
  img: string
}

/** Alternating giant-name rows with photo bars. Real things only. */
export function NameWall({
  label,
  rows,
  photoNote,
  portraits = [],
}: {
  label: string
  rows: WallRow[]
  photoNote?: string
  /** Names whose img is a verified portrait of that person. */
  portraits?: string[]
}) {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16">
      <LabelReveal className="mb-8">{label}</LabelReveal>
      <div>
        {rows.map((p, i) => {
          const isPortrait = portraits.includes(p.name)
          return (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: i % 2 === 1 ? 48 : -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EXPO }}
            className={`flex items-stretch gap-5 mb-3.5 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}
          >
            <div className="font-poster uppercase leading-none whitespace-nowrap text-white text-[clamp(40px,7vw,104px)] poster-hover">
              {p.name}
              <span className="block font-body normal-case text-[13px] tracking-[0.14em] text-white/40 mt-1.5">
                {p.sub}
              </span>
            </div>
            <div
              className="flex-1 min-w-[60px] rounded bg-cover bg-center grayscale-[35%] hover:grayscale-0 transition-[filter] duration-300"
              style={{ backgroundColor: BAR, backgroundImage: `url('${p.img}')` }}
              role="img"
              aria-label={
                isPortrait
                  ? `${p.name} — ${p.sub}`
                  : `ONE FM station photography beside ${p.name} — not a presenter portrait`
              }
            />
          </motion.div>
          )
        })}
      </div>
      {photoNote ? (
        <p className="mt-6 font-body text-[12px] tracking-[0.08em] text-white/35">{photoNote}</p>
      ) : null}
    </section>
  )
}

/** Red-framed full-width photo link with badge. Border-beam on hover. */
export function FeatureFrame({ to, img, alt, badge }: { to: string; img: string; alt: string; badge: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-6 md:mx-12 lg:mx-20 my-10"
    >
      <Link
        to={to}
        className="block relative rounded-2xl overflow-hidden border-2 group border-beam"
        style={{ borderColor: RED }}
      >
        <img
          src={img}
          alt={alt}
          className="w-full h-[420px] md:h-[520px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute bottom-6 left-6 px-5 py-2.5 rounded font-bold text-[13px] tracking-[0.13em] uppercase text-white"
          style={{ background: RED }}
        >
          {badge}
        </div>
      </Link>
    </motion.div>
  )
}

export interface Stat {
  n: string
  t: string
  red?: boolean
}

/** 2–4 Anton numerals; exactly one red; whites hollow to lime on hover. */
export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(stats.length, 4)} gap-px my-20`} style={{ background: '#222' }}>
      {stats.map((s) => (
        <div key={s.t} className="px-8 py-11" style={{ background: INK }}>
          <div
            className={`font-poster text-[clamp(36px,5vw,68px)] leading-none ${s.red ? '' : 'stroke-hover'}`}
            style={s.red ? { color: RED } : undefined}
          >
            {s.n}
          </div>
          <div className="text-[13px] tracking-[0.14em] uppercase text-white/40 mt-2">{s.t}</div>
        </div>
      ))}
    </div>
  )
}

export interface EditorialItem {
  tag: string
  title: string
  body: string
  linkLabel?: string
  href?: string
  children?: ReactNode
}

/** Bordered editorial cards: red tag, Anton title, red hover border. */
export function EditorialCards({ label, items, columns = 2 }: { label?: string; items: EditorialItem[]; columns?: 2 | 3 }) {
  return (
    <section className="px-6 md:px-12 lg:px-20 pb-16">
      {label && <LabelReveal className="mb-8">{label}</LabelReveal>}
      <div className={`grid gap-5 ${columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {items.map((c) => (
          <div key={c.title} className="border border-white/12 rounded-xl p-7 transition-colors hover:border-[#E51636]">
            <div className="text-[12px] font-bold tracking-[0.14em] uppercase" style={{ color: RED }}>{c.tag}</div>
            <h3 className="font-poster uppercase text-[26px] leading-[1.1] text-white mt-3 mb-2.5">{c.title}</h3>
            <p className="text-[15px] leading-relaxed text-white/55">{c.body}</p>
            {c.children}
            {c.href && (
              <a
                href={c.href}
                className="inline-block mt-4 font-bold text-[13px] tracking-[0.12em] uppercase text-white border-b-2 pb-0.5 hover:opacity-80"
                style={{ borderColor: RED }}
              >
                {c.linkLabel ?? 'More'} →
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
