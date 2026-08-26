import { useState } from 'react'
import type { DecadeId } from '@/types/livingArchive'
import { CONFIDENCE_LABELS } from '@/types/livingArchive'
import { ARCHIVE_CARDS, cardsForDecade, DECADES } from '@/data/livingArchive/decades'
import { LabelReveal, HeadlinePop } from '@/components/onair/kit'

const RED = '#E51636'

export function DecadeDial() {
  const [active, setActive] = useState<DecadeId>('1980s')
  const cards = cardsForDecade(active)
  const decade = DECADES.find((d) => d.id === active)!

  return (
    <section id="timeline" className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <LabelReveal className="mb-3">The Decade Dial</LabelReveal>
      <h2 className="font-poster uppercase text-[clamp(28px,4.5vw,48px)] text-white leading-[0.95] mb-8">
        <HeadlinePop>Tune through time</HeadlinePop>
      </h2>

      <div
        className="flex gap-2 overflow-x-auto pb-2 mb-10"
        role="tablist"
        aria-label="Select decade"
        style={{ scrollbarWidth: 'none' }}
      >
        {DECADES.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={active === d.id}
            onClick={() => setActive(d.id)}
            className={`shrink-0 px-6 py-3 rounded-full font-poster uppercase text-[clamp(18px,3vw,28px)] tracking-wide transition-all ${
              active === d.id ? 'text-white scale-105' : 'text-white/40 border border-white/15'
            }`}
            style={active === d.id ? { background: RED } : undefined}
          >
            {d.label}
          </button>
        ))}
      </div>

      <p className="text-[17px] text-white/55 max-w-[720px] mb-10 leading-relaxed">{decade.intro}</p>

      <div className="grid md:grid-cols-2 gap-5">
        {cards.length > 0 ? (
          cards.map((card) => (
            <article
              key={card.id}
              className="border border-white/12 rounded-xl p-6 hover:border-[#E51636] transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: RED }}>
                  {card.cardType.replace('-', ' ')}
                  {card.year ? ` · ${card.year}` : ''}
                </span>
                <span className="text-[10px] text-white/35 uppercase tracking-wider">
                  {CONFIDENCE_LABELS[card.confidence]}
                </span>
              </div>
              <h3 className="font-poster uppercase text-[22px] text-white leading-[1.1] mb-2">{card.title}</h3>
              <p className="text-[15px] leading-relaxed text-white/55">{card.body}</p>
              {card.image && (
                <img
                  src={card.image}
                  alt=""
                  className="mt-4 w-full h-40 object-cover rounded-lg grayscale-[25%]"
                  loading="lazy"
                />
              )}
              {card.sources[0] && (
                <p className="text-[11px] text-white/30 mt-3">Source: {card.sources[0].label}</p>
              )}
            </article>
          ))
        ) : (
          <p className="text-white/40 col-span-2">Evidence cards for this decade — archive hunt in progress.</p>
        )}
      </div>

      <p className="text-[12px] text-white/30 mt-8">
        {ARCHIVE_CARDS.length} curated cards · Wayback and newspaper archive expanding.
      </p>
    </section>
  )
}
