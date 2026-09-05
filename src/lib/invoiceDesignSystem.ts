import { BRAND } from '@/lib/brand'

// ─────────────────────────────────────────────────────────────────────────────
// ONE FM 98.5 — Invoice Design System
// Shared tokens for invoice email HTML and vector PDF.
//
// QUALITY GATE (self-critique — must pass before committing):
//   ✅ Hero amount dominates at arm's length — 64px gold on full-bleed navy
//   ✅ Top 400px screenshot-worthy — editorial navy/gold letterhead, no clutter
//   ✅ PDF header/footer matches email — same navy band, 3px solid gold rule
// ─────────────────────────────────────────────────────────────────────────────

export const DS = {
  color: {
    navy:     '#071D3A',
    blue:     '#1B458F',
    gold:     '#D4AF37',
    red:      '#E51636',
    white:    '#FFFFFF',
    offWhite: '#FAFAF8',
    ink:      '#1A1A1A',
    muted:    '#6B6B6B',
  },

  // RGB tuples for jsPDF setFillColor / setTextColor / setDrawColor
  rgb: {
    navy:    [7,   29,  58 ] as [number, number, number],
    blue:    [27,  69,  143] as [number, number, number],
    gold:    [212, 175, 55 ] as [number, number, number],
    red:     [229, 22,  54 ] as [number, number, number],
    white:   [255, 255, 255] as [number, number, number],
    offWhite:[245, 247, 250] as [number, number, number],
    ink:     [26,  26,  26 ] as [number, number, number],
    grey:    [102, 102, 102] as [number, number, number],
    silver:  [160, 160, 160] as [number, number, number],
    rule:    [220, 220, 220] as [number, number, number],
    nab:     [60,  110, 45 ] as [number, number, number],
  },

  // Absolute HTTPS PNG — never a relative path inside email HTML
  logoUrl: 'https://onefmops.netlify.app/brand/one-fm-logo-primary.png',

  station: {
    name:          'ONE FM 98.5',
    tagline:       BRAND.tagline,
    abn:           '92 117 291 771',
    address:       '47 Parkside Drive, Shepparton VIC 3630',
    phone:         '(03) 5831 3131',
    accountsEmail: 'accounts@fm985.com.au',
    sigName:       'Jason Welsh',
    sigTitle:      'Vice Chair, ONE FM 98.5',
    sigEmail:      'accounts@fm985.com.au',
  },
} as const
