import { STANDARD_SPOT_PLUS_GST, PARTNERSHIP_FROM_WEEKLY, GVL_PREMIUM_INTRO } from '@/lib/inventoryCopy'
import { rateCard } from '@/data/pricing'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { formatGuideHours } from '@/lib/guideHours'

const GVL_GUIDE_HOURS = formatGuideHours('GVL Match of the Day')

const ROWS: { label: string; rate: string; note: string; premium?: boolean }[] = [
  {
    label: 'Standard 30-second spot',
    rate: STANDARD_SPOT_PLUS_GST,
    note: 'Valley-wide inventory. High availability. This is the floor — not GVL, breakfast, or live reads.',
  },
  {
    label: 'Premium 60-second spot',
    rate: `From $${rateCard.premiumSpot} plus GST`,
    note: 'Longer cut-through on 98.5 FM. Quoted above the standard 30-second floor.',
    premium: true,
  },
  {
    label: 'Live read',
    rate: `From $${rateCard.liveRead} plus GST`,
    note: 'Host voice on air. Limited inventory — never sold as a $25 spot.',
    premium: true,
  },
  {
    label: 'Weekly partnership',
    rate: PARTNERSHIP_FROM_WEEKLY,
    note: 'Spots plus Facebook mentions (facebook.com/onefmshepparton). Starts at Community Partner, not the $25 name-read.',
  },
  {
    label: 'GVL match-day / live call',
    rate: 'Premium — quoted separately',
    note: GVL_GUIDE_HOURS
      ? `${GVL_PREMIUM_INTRO} On the weekly guide: ${GVL_GUIDE_HOURS}.`
      : GVL_PREMIUM_INTRO,
    premium: true,
  },
]

/** Public inventory stack — premiums sit above the $25 standard spot. */
export function InventoryLadder({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="font-label text-[10px] tracking-[0.18em] uppercase text-one-gold mb-3">
        Where the premiums sit
      </p>
      <ul className="divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden">
        {ROWS.map((row) => (
          <li
            key={row.label}
            className={`px-4 py-3 sm:px-5 sm:py-4 ${row.premium ? 'bg-one-red/5' : 'bg-black/20'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <span className="font-body text-sm text-one-white">{row.label}</span>
              <span className={`font-label text-[11px] tracking-[0.08em] uppercase ${row.premium ? 'text-one-gold' : 'text-one-white/70'}`}>
                {row.rate}
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-one-white/50">{row.note}</p>
          </li>
        ))}
      </ul>
      <p className="font-label text-[9px] tracking-[0.14em] uppercase text-one-muted/80 mt-3">
        {formatCoverageShort()} · ABS 2021 via townData
      </p>
    </div>
  )
}
