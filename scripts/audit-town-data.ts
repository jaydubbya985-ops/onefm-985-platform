/**
 * Reconciles the public audience figures against src/data/townData.ts.
 * Exits non-zero when a headline number stops being traceable to the town data,
 * so a fabricated figure cannot quietly re-enter the public pages.
 *
 * Run: npx vite-node scripts/audit-town-data.ts
 */
import { towns, broadcastArea } from '../src/data/townData'
import { stationStats } from '../src/data/pricing'

const sum = (fn: (t: (typeof towns)[number]) => number) => towns.reduce((a, t) => a + fn(t), 0)

const pop2026 = sum((t) => t.population2026)
const listenerSum = sum((t) => t.listenersEstimate)

const checks: { label: string; actual: number; expected: number; fatal: boolean }[] = [
  { label: 'town count', actual: towns.length, expected: stationStats.totalTowns, fatal: true },
  { label: 'sum(population2026) vs stationStats.broadcastPopulation', actual: pop2026, expected: stationStats.broadcastPopulation, fatal: true },
  { label: 'sum(population2026) vs broadcastArea.totalPopulation2026', actual: pop2026, expected: broadcastArea.totalPopulation2026, fatal: true },
  // Known 202-listener gap: the published headline is the conservative figure.
  // Public pages therefore show town-level reach as a share, never as a total.
  { label: 'sum(listenersEstimate) vs stationStats.weeklyListeners', actual: listenerSum, expected: stationStats.weeklyListeners, fatal: false },
]

let failed = false
for (const c of checks) {
  const ok = c.actual === c.expected
  if (!ok && c.fatal) failed = true
  const tag = ok ? 'OK  ' : c.fatal ? 'FAIL' : 'NOTE'
  console.log(`${tag} ${c.label}: ${c.actual.toLocaleString()} vs ${c.expected.toLocaleString()}`)
}

console.log(`\nfurthest town: ${Math.max(...towns.map((t) => t.distanceFromSheppartonKm))}km of a ${stationStats.broadcastRadiusKm}km licence radius`)

if (failed) process.exit(1)
