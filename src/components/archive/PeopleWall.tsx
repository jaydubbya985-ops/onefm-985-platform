import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { ArchivePerson, PersonCategory, SourceConfidence } from '@/types/livingArchive'
import { CATEGORY_LABELS, CONFIDENCE_LABELS } from '@/types/livingArchive'
import { LabelReveal, HeadlinePop } from '@/components/onair/kit'

const RED = '#E51636'

const FILTER_ORDER: PersonCategory[] = [
  'life-member',
  'presenter',
  'breakfast-host',
  'sport-caller',
  'board',
  'multicultural',
  'technical',
  'ob-crew',
  'volunteer',
]

function ConfidenceBadge({ level }: { level: SourceConfidence }) {
  const muted = level === 'needs-verification' || level === 'oral-history'
  return (
    <span
      className={`text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded ${
        muted ? 'text-white/40 border border-white/15' : 'text-white/70 border border-white/25'
      }`}
    >
      {CONFIDENCE_LABELS[level]}
    </span>
  )
}

function PersonCard({ person }: { person: ArchivePerson }) {
  return (
    <article className="border border-white/12 rounded-xl p-5 hover:border-[#E51636] transition-colors">
      <div className="flex gap-4">
        {person.photo ? (
          <div
            className="shrink-0 w-14 h-14 rounded-lg bg-cover bg-center grayscale-[30%]"
            style={{ backgroundImage: `url('${person.photo}')` }}
            role="img"
            aria-label={person.name}
          />
        ) : (
          <div
            className="shrink-0 w-14 h-14 rounded-lg flex items-center justify-center font-poster text-[18px] text-white/80"
            style={{ background: '#161616' }}
            aria-hidden
          >
            {person.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-poster uppercase text-[18px] text-white leading-tight">{person.name}</h3>
          {person.roles?.[0] && (
            <p className="text-[13px] text-white/45 mt-0.5 truncate">{person.roles[0]}</p>
          )}
          {person.years && <p className="text-[12px] text-white/35 mt-0.5">{person.years}</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {person.categories.slice(0, 3).map((cat) => (
          <span key={cat} className="text-[10px] tracking-[0.08em] uppercase text-white/40">
            {CATEGORY_LABELS[cat]}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <ConfidenceBadge level={person.confidence} />
      </div>
    </article>
  )
}

export function PeopleWall({ people }: { people: ArchivePerson[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<PersonCategory | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return people.filter((p) => {
      const matchFilter = filter === 'all' || p.categories.includes(filter)
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.roles?.some((r) => r.toLowerCase().includes(q)) ||
        p.programs?.some((pr) => pr.toLowerCase().includes(q))
      return matchFilter && matchQuery
    })
  }, [people, query, filter])

  return (
    <section id="people" className="px-6 md:px-12 lg:px-20 py-16 border-t border-white/8">
      <LabelReveal className="mb-3">The Living Archive</LabelReveal>
      <h2 className="font-poster uppercase text-[clamp(28px,4.5vw,48px)] text-white leading-[0.95] mb-2">
        <HeadlinePop>People of ONE FM</HeadlinePop>
      </h2>
      <p className="text-[15px] text-white/50 max-w-[640px] mb-8 leading-relaxed">
        No volunteer disappears into a paragraph. Search and filter — each name carries a source
        confidence level.
      </p>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names, roles, programs…"
            aria-label="Search archive people"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111] border border-white/15 text-sm text-white placeholder-white/30 focus:border-[#E51636] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold tracking-[0.08em] uppercase transition-colors ${
              filter === 'all' ? 'text-white' : 'text-white/45 border border-white/15'
            }`}
            style={filter === 'all' ? { background: RED } : undefined}
          >
            All ({people.length})
          </button>
          {FILTER_ORDER.map((cat) => {
            const count = people.filter((p) => p.categories.includes(cat)).length
            if (count === 0) return null
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold tracking-[0.08em] uppercase transition-colors ${
                  filter === cat ? 'text-white' : 'text-white/45 border border-white/15'
                }`}
                style={filter === cat ? { background: RED } : undefined}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-[13px] text-white/35 mb-5">
        Showing {filtered.length} of {people.length}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>

      <p className="text-[12px] text-white/30 mt-8">
        <a href="#contribute" className="underline hover:text-white/60">
          Add your memory →
        </a>{' '}
        — archive grows with community contribution.
      </p>
    </section>
  )
}
