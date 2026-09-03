/**
 * Fail if a failed LIVE ledger load is dressed as a hidden-DEMO zero week.
 * Run: npx vite-node scripts/verify-ops-load-status.ts
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LivePendingNote } from '../src/components/ops/LivePendingNote'
import {
  getOpsLoadStatus,
  opsLoadChartNote,
  opsLoadFromResults,
  recordOpsLoad,
  resetOpsLoadStatus,
} from '../src/lib/opsLoadStatus'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-ops-load-status FAIL: ${message}`)
    process.exit(1)
  }
}

resetOpsLoadStatus()
assert(getOpsLoadStatus().kind === 'idle', 'fresh status starts idle')
assert(opsLoadChartNote(getOpsLoadStatus()) === null, 'idle must keep the DEMO-hidden chart note')

const demo = opsLoadFromResults(false, [
  { table: 'ops_invoices', error: 'permission denied' },
])
assert(demo.kind === 'demo', 'unconfigured ops is DEMO, not a load error')
assert(demo.failedTables.length === 0, 'DEMO must not report failed tables')
assert(opsLoadChartNote(demo) === null, 'DEMO must keep the hidden-figures note')

const ok = opsLoadFromResults(true, [
  { table: 'contact_enquiries' },
  { table: 'ops_proposals', error: null },
  { table: 'ops_contracts', error: '' },
  { table: 'ops_invoices' },
])
assert(ok.kind === 'ok', 'configured + no errors is a successful load')
assert(opsLoadChartNote(ok) === null, 'a real empty ledger is not a load failure')

const failed = opsLoadFromResults(true, [
  { table: 'contact_enquiries' },
  { table: 'ops_proposals', error: 'JWT expired' },
  { table: 'ops_contracts' },
  { table: 'ops_invoices', error: 'permission denied for table ops_invoices' },
])
assert(failed.kind === 'error', 'any table error is a failed live load')
assert(
  failed.failedTables.join(',') === 'ops_proposals,ops_invoices',
  `failed tables: ${failed.failedTables.join(',')}`,
)

const note = opsLoadChartNote(failed)
assert(note !== null, 'failed load must replace the DEMO-hidden chart note')
assert(/did not load/i.test(note), `note must say the ledger did not load: ${note}`)
assert(/not a zero week/i.test(note), `note must refuse a fake zero week: ${note}`)
assert(!/DEMO figures are hidden/i.test(note), 'do not dress a failed load as hidden DEMO')
assert(!/39,375|ABS 2021|25 towns/i.test(note), 'do not stamp coverage over a failed load')
assert(!/JWT|permission denied/i.test(note), 'do not leak the raw Supabase error into the chart')

recordOpsLoad(failed)
assert(getOpsLoadStatus().kind === 'error', 'recordOpsLoad must stick for LivePendingNote')
assert(
  opsLoadChartNote(getOpsLoadStatus()) === note,
  'LivePendingNote reads the same failed-load note',
)

const api = readFileSync(new URL('../src/lib/opsApi.ts', import.meta.url), 'utf8')
assert(api.includes('opsLoadFromResults'), 'loadAll must classify table errors')
assert(api.includes('recordOpsLoad'), 'loadAll must publish the outcome for chart empty-states')
assert(api.includes('enqRes.error'), 'enquiries error must not be treated as an empty inbox')
assert(api.includes('invRes.error'), 'invoice error must not be treated as a zero ledger')

const noteSource = readFileSync(
  new URL('../src/components/ops/LivePendingNote.tsx', import.meta.url),
  'utf8',
)
assert(noteSource.includes('opsLoadChartNote'), 'billing empty-states must read the load outcome')
assert(noteSource.includes('getOpsLoadStatus'), 'LivePendingNote must not hard-code DEMO-hidden on LIVE fail')

const self = readFileSync(fileURLToPath(import.meta.url), 'utf8')
assert(self.includes('not a zero week'), 'keep the FOOTT-facing leftover in this script')

resetOpsLoadStatus()
const demoHtml = renderToStaticMarkup(
  createElement(LivePendingNote, { title: 'Monthly revenue trend' }),
)
assert(demoHtml.includes('Monthly revenue trend'), `demo chart title missing: ${demoHtml}`)
assert(
  /DEMO figures are hidden/i.test(demoHtml),
  `idle/DEMO empty-state must keep the hidden-figures note: ${demoHtml}`,
)
assert(
  !/did not load/i.test(demoHtml),
  `DEMO must not claim a failed live load: ${demoHtml}`,
)

recordOpsLoad(failed)
const failHtml = renderToStaticMarkup(
  createElement(LivePendingNote, { title: 'Monthly revenue trend' }),
)
assert(/did not load/i.test(failHtml), `failed LIVE chart must say the ledger did not load: ${failHtml}`)
assert(/not a zero week/i.test(failHtml), `failed LIVE chart must refuse a fake zero week: ${failHtml}`)
assert(
  !/DEMO figures are hidden/i.test(failHtml),
  `do not dress a failed load as hidden DEMO: ${failHtml}`,
)
assert(!/JWT|permission denied/i.test(failHtml), 'do not leak the raw Supabase error onto the chart')

console.log('verify-ops-load-status OK')
console.log('demo empty-state:', demoHtml.replace(/\s+/g, ' ').trim())
console.log('failed-load empty-state:', failHtml.replace(/\s+/g, ' ').trim())
