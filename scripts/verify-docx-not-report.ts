/**
 * Lock: proposal Word terms name quoted reporting, not leftover invented
 * weekly campaign-report SLA.
 * Run: npx vite-node scripts/verify-docx-not-report.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/lib/docxExport.ts', import.meta.url), 'utf8')

if (/Weekly performance summaries/i.test(src)) {
  throw new Error('docxExport.ts: leftover Weekly performance summaries SLA is back')
}

if (/10 business days of campaign/i.test(src)) {
  throw new Error('docxExport.ts: leftover 10-business-day campaign-report SLA is back')
}

if (!src.includes('does not publish a weekly campaign-report SLA')) {
  throw new Error('docxExport.ts: reporting term must name that there is no leftover campaign-report SLA')
}

console.log('verify-docx-not-report: ok')
