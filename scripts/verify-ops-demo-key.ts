/**
 * Prove DEMO ops rows do not share leftover unprefixed localStorage keys,
 * and DEMO seed is cloned so the module export cannot be mutated.
 * Run: npx vite-node scripts/verify-ops-demo-key.ts
 */
import { readFileSync } from 'node:fs'
import { opsInitial, opsStorageKey } from '../src/lib/opsMode.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const source = readFileSync(new URL('../src/lib/opsMode.ts', import.meta.url), 'utf8')
assert(source.includes('__demo'), 'DEMO keys must use the __demo suffix')
assert(source.includes('__live'), 'LIVE keys must use the __live suffix')
assert(source.includes('structuredClone'), 'DEMO seed must be cloned')
assert(!source.includes("? `${base}__live` : base"), 'DEMO must not reuse the leftover bare key')

assert(opsStorageKey('onefm_payments', false) === 'onefm_payments__demo', 'DEMO payments key is namespaced')
assert(opsStorageKey('onefm_payments', true) === 'onefm_payments__live', 'LIVE payments key is namespaced')
assert(opsStorageKey('onefm_sponsors', false) === 'onefm_sponsors__demo', 'DEMO sponsors key is namespaced')
assert(opsStorageKey('onefm_sponsors', true) === 'onefm_sponsors__live', 'LIVE sponsors key is namespaced')
assert(!opsStorageKey('onefm_payments', false).includes('onefm_payments__live'), 'DEMO key is not the LIVE key')
assert(opsStorageKey('onefm_payments', false) !== 'onefm_payments', 'DEMO must not use the leftover bare key')

const seed = [{ id: 'pay_1', amount: 1240, note: 'DEMO' }]
const demo = opsInitial(seed, [], false)
assert(Array.isArray(demo) && demo.length === 1, 'DEMO initial is the seed')
assert(demo !== seed, 'DEMO initial must not be the module seed reference')
demo[0].amount = 1
assert(seed[0].amount === 1240, 'mutating DEMO state must not change the seed export')

const liveEmpty: typeof seed = []
const live = opsInitial(seed, liveEmpty, true)
assert(live === liveEmpty, 'LIVE initial is the empty value')
assert(live.length === 0, 'LIVE initial has no DEMO rows')

const paymentsSource = readFileSync(new URL('../src/components/ops/PaymentsModule.tsx', import.meta.url), 'utf8')
assert(paymentsSource.includes("opsStorageKey('onefm_payments')"), 'Payments tab still goes through opsStorageKey')
assert(!paymentsSource.includes("localStorage.getItem('onefm_payments')"), 'Payments tab must not read the leftover bare key')

const crmSource = readFileSync(new URL('../src/components/ops/SponsorCRM.tsx', import.meta.url), 'utf8')
assert(crmSource.includes('opsStorageKey(SPONSORS_STORAGE_KEY)'), 'CRM still goes through opsStorageKey')

if (fail.length) {
  console.error('verify-ops-demo-key FAILED')
  for (const msg of fail) console.error(' -', msg)
  process.exit(1)
}

console.log('verify-ops-demo-key OK')
console.log('  DEMO key onefm_payments__demo — not the leftover bare key')
console.log('  LIVE key onefm_payments__live')
console.log('  DEMO seed cloned — mutate does not change the export')
console.log('  LIVE initial stays empty')
