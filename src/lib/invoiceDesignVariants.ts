/**
 * ONE FM 98.5 — Invoice design variants (3 world-class options).
 * Community broadcaster invoices: trustworthy, distinctive, send-ready.
 */

import { formatCoverageShort } from '@/lib/coverageCopy'
import { DS } from '@/lib/invoiceDesignSystem'

export type InvoiceDesignVariantId = 'broadcast' | 'on-air' | 'valley'

export interface InvoiceDesignVariant {
  id: InvoiceDesignVariantId
  name: string
  tagline: string
  description: string
  /** InDesign-style mood board note */
  mood: string
  bestFor: string
  palette: {
    primary: string
    accent: string
    surface: string
    amount: string
  }
}

export const INVOICE_DESIGN_VARIANTS: InvoiceDesignVariant[] = [
  {
    id: 'broadcast',
    name: 'Broadcast Letter',
    tagline: 'Premium navy & gold — the corporate broadcast standard',
    description:
      `Full-bleed navy hero, 64px gold amount, solid gold rule. Feels like a letter from a major broadcaster — serious, trusted, partner-grade. Licensed community radio · ${formatCoverageShort()}.`,
    mood: 'ABC annual report × community radio board pack',
    bestFor: 'Major sponsors, councils, corporates (FOOTT, GVFL)',
    palette: {
      primary: DS.color.navy,
      accent: DS.color.gold,
      surface: DS.color.offWhite,
      amount: DS.color.gold,
    },
  },
  {
    id: 'on-air',
    name: 'ON AIR Poster',
    tagline: 'Ink, signal red, fluoro lime — matches the public site',
    description:
      `Black canvas, red poster amount block, lime reference accent. Same design language as onefmops.netlify.app — bold, contemporary, unmistakably ONE FM. Licensed community radio · ${formatCoverageShort()}.`,
    mood: 'Rock hall poster × live broadcast ticker',
    bestFor: 'Sport partners, GVL, brands that know the station already',
    palette: {
      primary: '#0A0A0A',
      accent: DS.color.red,
      surface: '#FAFAFA',
      amount: '#FFFFFF',
    },
  },
  {
    id: 'valley',
    name: 'Valley Partner',
    tagline: 'Warm editorial — community first, human touch',
    description:
      `Eucalypt green masthead, wheat-cream paper, ochre amount. Reads like a regional festival program or community annual — approachable, proud, local. Licensed community radio · ${formatCoverageShort()}.`,
    mood: 'Shepparton Art Museum × canola fields × local NFP annual',
    bestFor: 'Long-term locals, NFPs, family businesses, multicultural partners',
    palette: {
      primary: '#2D4A3E',
      accent: '#C4A265',
      surface: '#F5F0E8',
      amount: '#B8860B',
    },
  },
]

export const DEFAULT_INVOICE_DESIGN: InvoiceDesignVariantId = 'broadcast'

/** Jay confirmed Sep 2026 — A · Broadcast Letter for June batch sends. Change + EXE to switch. */
export const STATION_INVOICE_DESIGN_CHOICE: InvoiceDesignVariantId = 'broadcast'

const STORAGE_KEY = 'onefm_invoice_design_variant'

/** Active design for PDF/email/batch send — always the station choice, not lab preview. */
export function getInvoiceDesignVariant(): InvoiceDesignVariantId {
  return STATION_INVOICE_DESIGN_CHOICE
}

/** Lab preview only — does not affect batch send. */
export function getInvoiceDesignPreviewVariant(): InvoiceDesignVariantId {
  if (typeof window === 'undefined') return STATION_INVOICE_DESIGN_CHOICE
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'broadcast' || stored === 'on-air' || stored === 'valley') return stored
  return STATION_INVOICE_DESIGN_CHOICE
}

export function setInvoiceDesignPreviewVariant(id: InvoiceDesignVariantId): void {
  localStorage.setItem(STORAGE_KEY, id)
}

export function getVariantMeta(id: InvoiceDesignVariantId): InvoiceDesignVariant {
  return INVOICE_DESIGN_VARIANTS.find((v) => v.id === id) ?? INVOICE_DESIGN_VARIANTS[0]
}

/** Shared station facts for all variants */
export const INVOICE_STATION = {
  ...DS.station,
  callsign: '3ONE',
  licensed: '1989',
  tagline: "Goulburn Valley's Community Radio",
  communityLine: `Licensed community broadcaster · ACMA 1385226/1 · ${formatCoverageShort()}`,
  org: 'Goulburn Valley Community Radio Inc.',
} as const
