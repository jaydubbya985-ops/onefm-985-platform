import { getTodayOnAir } from '@/lib/todayOnAir'

/**
 * Rest of today's guide for listener surfaces.
 * Source: FULL_SCHEDULE via getTodayOnAir — not a rate card.
 */
export function TodayOnAir({ className = '' }: { className?: string }) {
  const board = getTodayOnAir()
  const rows = [board.current, ...board.coming]

  return (
    <div className={className}>
      <p className="font-label text-[10px] tracking-[0.18em] uppercase text-white/45 mb-3">
        Still on today · {board.weekday}
      </p>
      <ol className="divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden">
        {rows.map((row) => (
          <li
            key={`${row.time}-${row.name}`}
            className={`px-4 py-3 sm:px-5 sm:py-4 ${row.onGuideNow ? 'bg-one-red/5' : 'bg-black/20'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <span className="font-body text-sm text-one-white">{row.name}</span>
              <span className="font-label text-[11px] tracking-[0.08em] uppercase text-white/55">
                {row.time}
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-white/50">
              {row.onGuideNow ? 'On the guide now' : row.category}
              {row.withLine ? ` · ${row.withLine}` : ''}
            </p>
          </li>
        ))}
      </ol>
      {board.coming.length === 0 && board.current.name === 'Overnight Mix' ? (
        <p className="mt-3 text-[12px] leading-relaxed text-white/45">
          Overnight is automated on the guide. Breakfast is listed from 6:00AM Melbourne time.
        </p>
      ) : null}
      <p className="mt-3 font-label text-[10px] tracking-[0.12em] uppercase text-white/35">
        {board.sourceLabel}
      </p>
    </div>
  )
}
