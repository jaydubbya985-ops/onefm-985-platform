import { Link } from 'react-router-dom'
import { LabelReveal } from '@/components/onair/kit'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

const RED = '#E51636'

const CONTRIBUTION_TYPES = [
  'I was a presenter',
  'I volunteered',
  'I have a photo or program guide',
  'I remember an outside broadcast',
  'I played in a game ONE FM covered',
  'I remember emergency broadcasts',
]

export function ContributePortal() {
  return (
    <section id="contribute" className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <LabelReveal className="mb-3">Growing the Archive</LabelReveal>
          <h2 className="font-poster uppercase text-[clamp(28px,4.5vw,44px)] text-white leading-[0.95] mb-4">
            Were you part of ONE FM history?
          </h2>
          <p className="text-[17px] text-white/55 max-w-[600px] mb-8 leading-relaxed">
            The Living Archive is an active preservation project — not a finished monument. Photos,
            program guides, clippings and memories help fill the drawers.
          </p>

          <ul className="grid sm:grid-cols-2 gap-3 mb-10 max-w-2xl">
            {CONTRIBUTION_TYPES.map((item) => (
              <li key={item} className="text-[14px] text-white/50 flex items-start gap-2">
                <span style={{ color: RED }} aria-hidden>
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>

          <Link
            to="/contact?subject=Living%20Archive%20contribution"
            className="inline-block rounded-full px-8 py-4 font-bold text-[13px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.03] transition-transform"
            style={{ background: RED }}
            data-cursor-label="CONTRIBUTE"
          >
            Add Your Memory →
          </Link>
        </div>

        <figure className="relative overflow-hidden rounded-xl border border-white/12 aspect-[4/3] bg-[#111]">
          <img
            src={STATION_PHOTOS.towerTallMast}
            alt="ONE FM broadcast mast — station archive"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <figcaption className="absolute inset-x-0 bottom-0 px-4 py-3 text-[11px] tracking-[0.08em] uppercase text-white/70 bg-gradient-to-t from-black/70 to-transparent">
            Station archive · broadcast mast
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
