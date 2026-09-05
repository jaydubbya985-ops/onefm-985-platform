import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LabelReveal } from '@/components/onair/kit'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { BRAND } from '@/lib/brand'

const RED = '#E51636'

const CONTRIBUTION_TYPES = [
  'I was a presenter',
  'I volunteered',
  'I have a photo or program guide',
  'I remember an outside broadcast',
  'I played in a game ONE FM covered',
  'I remember emergency broadcasts',
] as const

function archiveMailto(kind: string | null): string {
  const lines = [
    'Hi ONE FM,',
    '',
    'I have something for the Living Archive.',
    '',
    `I was / I have: ${kind ?? ''}`,
    'Year / decade:',
    'What I can share (photo, program guide, clipping, memory):',
    '',
    'Thanks,',
    '',
  ]
  return `mailto:${BRAND.email}?subject=${encodeURIComponent('Living Archive contribution')}&body=${encodeURIComponent(lines.join('\n'))}`
}

export function ContributePortal() {
  const [kind, setKind] = useState<string | null>(null)
  const [draftOpened, setDraftOpened] = useState(false)

  return (
    <section id="contribute" className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <LabelReveal className="mb-3">Growing the Archive</LabelReveal>
          <h2 className="font-poster uppercase text-[clamp(28px,4.5vw,44px)] text-white leading-[0.95] mb-4">
            Were you part of ONE FM history?
          </h2>
          <p className="text-[17px] text-white/55 max-w-[600px] mb-6 leading-relaxed">
            The Living Archive is an active preservation project — not a finished monument. Photos,
            program guides, clippings and memories help fill the drawers.
          </p>
          <p className="text-[14px] text-white/45 max-w-[600px] mb-8 leading-relaxed">
            Opens an email draft to {BRAND.email}. Nothing is sent until you press send in your
            email app. The contact form does not receive a pre-filled archive subject.
          </p>

          <p className="font-label text-[10px] tracking-[0.16em] uppercase text-white/35 mb-3">
            Optional — pick what you remember
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 mb-10 max-w-2xl">
            {CONTRIBUTION_TYPES.map((item) => {
              const selected = kind === item
              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => setKind(selected ? null : item)}
                    aria-pressed={selected}
                    data-cursor-label={selected ? 'CLEAR' : 'PICK'}
                    className={`w-full text-left text-[14px] flex items-start gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      selected
                        ? 'text-white border-white/35 bg-white/8'
                        : 'text-white/50 border-white/10 hover:border-white/25 hover:text-white/70'
                    }`}
                  >
                    <span style={{ color: RED }} aria-hidden>
                      {selected ? '●' : '—'}
                    </span>
                    {item}
                  </button>
                </li>
              )
            })}
          </ul>

          {draftOpened && (
            <p className="mb-6 text-[15px] font-bold" style={{ color: '#B6FF00' }} role="status">
              Email draft opened — complete the send in your email app so it reaches {BRAND.email}.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={archiveMailto(kind)}
              onClick={() => setDraftOpened(true)}
              className="inline-block rounded-full px-8 py-4 font-bold text-[13px] tracking-[0.14em] uppercase text-white bloom-red hover:scale-[1.03] transition-transform"
              style={{ background: RED }}
              data-cursor-label="DRAFT"
            >
              Email a memory →
            </a>
            <Link
              to="/contact"
              className="font-bold text-[12px] tracking-[0.12em] uppercase text-white/45 hover:text-white border-b border-white/20 pb-0.5 transition-colors"
              data-cursor-label="CONTACT"
            >
              Or use the contact form
            </Link>
          </div>
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
