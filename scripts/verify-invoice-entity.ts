/**
 * Fail if invoice letterhead invents a tagline or staff title.
 * Run: npx vite-node scripts/verify-invoice-entity.ts
 */
import { BRAND } from '../src/lib/brand'
import { DS } from '../src/lib/invoiceDesignSystem'
import { INVOICE_STATION } from '../src/lib/invoiceDesignVariants'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-invoice-entity FAIL: ${message}`)
    process.exit(1)
  }
}

assert(DS.station.name === BRAND.fullName, `name must be ${BRAND.fullName}`)
assert(DS.station.tagline === BRAND.tagline, `tagline must be ${BRAND.tagline}, not a leftover lockup`)
assert(DS.station.abn === BRAND.abn, 'ABN must match BRAND')
assert(DS.station.address === BRAND.address, 'address must match BRAND')
assert(DS.station.phone === BRAND.phone, 'phone must match BRAND')
assert(DS.station.accountsEmail === BRAND.accountsEmail, 'accounts email must match BRAND')
assert(
  !/Goulburn Valley's Community Radio/.test(DS.station.tagline),
  'do not keep the leftover invoice tagline',
)
assert(
  !/Station Manager/.test(DS.station.sigTitle),
  'do not invent a station manager title on invoices',
)
assert(
  DS.station.sigTitle === 'Vice Chairperson, ONE FM 98.5',
  `board title must be Vice Chairperson, got ${DS.station.sigTitle}`,
)

assert(INVOICE_STATION.org === BRAND.org, 'invoice org must be the incorporated name')
assert(INVOICE_STATION.callsign === BRAND.callsign, 'callsign must be 3ONE from BRAND')
assert(INVOICE_STATION.licensed === String(BRAND.licensed), 'licensed year must be 1989 from BRAND')
assert(INVOICE_STATION.tagline === BRAND.tagline, 'variant station block must inherit Live and Local')
assert(
  INVOICE_STATION.communityLine.includes(BRAND.acma),
  `ACMA ${BRAND.acma} must appear on the community line`,
)

console.log('verify-invoice-entity OK')
