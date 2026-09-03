import { generalTiers, rateCard } from '@/data/pricing'
import { formatGuideHours } from '@/lib/guideHours'

/**
 * Public rate language. Jay (Aug 2026):
 * - Standard 30-second spots start at $25 plus GST.
 * - GVL / breakfast / live-call inventory is premium — never “from $25”.
 */

export const STANDARD_SPOT_PLUS_GST = `Standard 30-second spots from $${rateCard.standardSpot30s} plus GST`

export const PARTNERSHIP_FROM_WEEKLY = `Weekly partnership packages from $${generalTiers.communityPartner.minPrice}/week plus GST`

const GVL_GUIDE_HOURS = formatGuideHours('GVL Match of the Day')

/** Badge / SEO for GVL pages — no dollar floor. Hours from FULL_SCHEDULE. */
export const GVL_PREMIUM_BADGE = GVL_GUIDE_HOURS
  ? `GVL Footy · Premium inventory · ${GVL_GUIDE_HOURS}`
  : 'GVL Footy · Premium inventory'

/** Melbourne civil quarter — never a leftover “Q1 2026” default. */
export function currentRatePeriod(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(now)
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  if (!year || !month) return 'Data pending'
  return `Q${Math.ceil(month / 3)} ${year}`
}

export function gstExclusiveNote(period = currentRatePeriod()): string {
  return `Effective ${period} — rates plus GST`
}

export const GVL_PREMIUM_INTRO =
  `GVL match-day commercials and live calls are premium inventory — not the $25 standard spot. A community name-read supporter package exists; match-day spots are quoted separately. ${gstExclusiveNote()}`

export const GVL_PREMIUM_SEO = GVL_GUIDE_HOURS
  ? `Partner with ONE FM 98.5 for Goulburn Valley Football & Netball. GVL Match of the Day is ${GVL_GUIDE_HOURS}. Match-day spots are premium inventory. Standard 30-second spots start at $25 plus GST. ${gstExclusiveNote()}`
  : `Partner with ONE FM 98.5 for Goulburn Valley Football & Netball. Match-day spots are premium inventory. Standard 30-second spots start at $25 plus GST. ${gstExclusiveNote()}`

export function inventoryKindLabel(kind: 'standardSpot' | 'premiumSpot' | 'liveRead' | 'gvlSeason' | 'partnership'): string {
  switch (kind) {
    case 'standardSpot':
      return STANDARD_SPOT_PLUS_GST
    case 'premiumSpot':
      return `Premium 60-second spots from $${rateCard.premiumSpot} plus GST`
    case 'liveRead':
      return `Live reads from $${rateCard.liveRead} plus GST`
    case 'gvlSeason':
      return GVL_PREMIUM_INTRO
    case 'partnership':
      return PARTNERSHIP_FROM_WEEKLY
  }
}
