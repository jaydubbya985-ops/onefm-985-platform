/**
 * Fail if ops mock contracts still invent digital signage as included inventory.
 * Used surface: ContractManager detail + sponsorship agreement PDF (store seeds MOCK_CONTRACTS).
 * Run: npx vite-node scripts/verify-sponsors-not-signage.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { MOCK_CONTRACTS } from '../src/components/ops/data/sponsors.ts'
import { generateContractPdf } from '../src/lib/contractDocument.ts'
import { BRAND } from '../src/lib/brand.ts'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-sponsors-not-signage FAIL: ${message}`)
    process.exit(1)
  }
}

const foott = MOCK_CONTRACTS.find((c) => c.id === 'c1')
const peppermill = MOCK_CONTRACTS.find((c) => c.id === 'c2')
assert(foott, 'FOOTT mock contract missing')
assert(peppermill, 'Peppermill mock contract missing')

for (const contract of [foott!, peppermill!]) {
  const text = contract.description
  assert(
    !/match-day announcements, digital signage/i.test(text),
    `${contract.id}: leftover invented digital signage still listed as included inventory`,
  )
  assert(
    !/player of the match awards, digital signage/i.test(text),
    `${contract.id}: leftover invented digital signage still listed as included inventory`,
  )
  assert(
    /Digital signage is not a quoted inventory line/i.test(text),
    `${contract.id}: sourced no-digital-signage line missing`,
  )
  assert(text.includes(BRAND.email), `${contract.id}: station email missing from description: ${text}`)
}

const outDir = '/tmp/onefm-sponsors-not-signage'
mkdirSync(outDir, { recursive: true })

for (const contract of [foott!, peppermill!]) {
  const pdf = await generateContractPdf(contract)
  const buf = Buffer.from(pdf.output('arraybuffer'))
  const raw = buf.toString('latin1')

  assert(
    !/match-day announcements, digital signage/i.test(raw),
    `${contract.id}: leftover invented digital signage still in sponsorship agreement PDF`,
  )
  assert(
    !/player of the match awards, digital signage/i.test(raw),
    `${contract.id}: leftover invented digital signage still in sponsorship agreement PDF`,
  )
  assert(
    /Digital signage is not a quoted inventory/i.test(raw),
    `${contract.id}: sourced no-digital-signage line missing from sponsorship agreement PDF`,
  )
  assert(raw.includes(BRAND.email), `${contract.id}: station email missing from sponsorship agreement PDF`)

  writeFileSync(`${outDir}/${contract.id}-agreement.pdf`, buf)
  writeFileSync(`${outDir}/${contract.id}-description.txt`, contract.description)
}

console.log(
  'verify-sponsors-not-signage: leftover digital signage gone; FOOTT and Peppermill name quoted inventory',
)
