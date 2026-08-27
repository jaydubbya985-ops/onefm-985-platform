/**
 * Fails if the living archive ever lists the same person twice.
 *
 * The featured record spells him "Kevin Francis Ryan" while the 2024 life-member
 * roll says "Kevin Ryan"; deduping on name let both through, which put the same
 * person on the public wall twice and gave React two children with one key.
 */
import { ARCHIVE_PEOPLE } from '../src/data/livingArchive/people'

const byId = new Map<string, string[]>()
for (const person of ARCHIVE_PEOPLE) {
  byId.set(person.id, [...(byId.get(person.id) ?? []), person.name])
}

const duplicates = [...byId.entries()].filter(([, names]) => names.length > 1)

console.log(`archive people: ${ARCHIVE_PEOPLE.length}`)
console.log(`unique ids:     ${byId.size}`)

if (duplicates.length > 0) {
  for (const [id, names] of duplicates) {
    console.error(`FAIL duplicate id "${id}": ${names.join(', ')}`)
  }
  process.exit(1)
}

const kevin = ARCHIVE_PEOPLE.filter((p) => p.id.includes('ryan'))
console.log(`OK   Ryan entries: ${kevin.map((p) => `${p.name} (${p.id})`).join(', ') || 'none'}`)
console.log('OK   no duplicate archive ids')
