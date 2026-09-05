/**
 * Fail if the weather cycle skips Tatura for a distant major.
 * Run: npx vite-node scripts/verify-weather-near.ts
 */
import { gvWeatherTowns } from '../src/data/weatherLocations'
import { towns } from '../src/data/townData'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-weather-near FAIL: ${message}`)
    process.exit(1)
  }
}

const names = gvWeatherTowns.map((t) => t.name)

assert(names[0] === 'Shepparton', `studio first, got ${names[0]}`)
assert(names.includes('Mooroopna'), 'twin city stays on the cycle')
assert(names.includes('Tatura'), 'Tatura is 16 km from the studio — must appear before Echuca is the only nearby reading')
assert(names.includes('Kyabram'), 'Kyabram is closer than Benalla')
assert(names.includes('Numurkah'), 'Numurkah is closer than Benalla')

const tatura = names.indexOf('Tatura')
const echuca = names.indexOf('Echuca')
assert(tatura >= 0 && echuca >= 0 && tatura < echuca, 'Tatura must cycle before Echuca')

assert(!names.includes('Murchison'), 'villages stay off')
assert(!names.includes('Toolamba'), 'villages stay off')
assert(!names.includes('Rushworth'), 'small towns stay off')
assert(!names.includes('Heathcote'), 'distant medium towns stay off')
assert(!names.includes('Seymour'), 'distant medium towns stay off')
assert(!names.includes('Broadford'), 'distant medium towns stay off')
assert(!names.includes('Moama'), 'NSW twin stays off this cycle')
assert(!names.includes('Tocumwal'), 'NSW border town stays off this cycle')
assert(
  names.every((n) => !/\(NSW\)/.test(n)),
  'do not print (NSW) on the chip',
)

for (const loc of gvWeatherTowns) {
  const row = towns.find((t) => t.name.replace(/\s*\(NSW\)$/, '') === loc.name)
  assert(row, `${loc.name} must come from townData`)
  assert(row && row.sizeCategory !== 'village' && row.sizeCategory !== 'small', `${loc.name} is not a village`)
}

console.log(`verify-weather-near OK — ${names.join(' → ')}`)
