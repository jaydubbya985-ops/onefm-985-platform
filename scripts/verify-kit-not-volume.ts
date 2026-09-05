/**
 * Lock: Media kit rate card names a written quote, not leftover volume discounts.
 * Run: npx vite-node scripts/verify-kit-not-volume.ts
 */
import { readFileSync } from 'node:fs'

const kit = readFileSync(new URL('../src/pages/MediaKit.tsx', import.meta.url), 'utf8')
const docx = readFileSync(new URL('../src/lib/docxExport.ts', import.meta.url), 'utf8')

if (/Volume discounts available/.test(kit) || /Volume discounts available/.test(docx)) {
  throw new Error('leftover Volume discounts available is back')
}
if (/preferential rates/.test(kit) || /preferential rates/.test(docx)) {
  throw new Error('leftover preferential rates is back')
}
if (!kit.includes('does not invent volume discounts')) {
  throw new Error('MediaKit.tsx: rate-card note must name no invented volume discounts')
}
if (!docx.includes('does not invent volume discounts')) {
  throw new Error('docxExport.ts: rate-card note must name no invented volume discounts')
}

// Other desks own these leftovers — do not steal their remaps.
if (!kit.includes('READY TO AMPLIFY?')) {
  throw new Error('MediaKit.tsx: leftover READY TO AMPLIFY? must stay for #520')
}
if (!kit.includes('From stats to signed campaign')) {
  throw new Error('MediaKit.tsx: leftover signed campaign must stay for #522')
}
if (!kit.includes('Everything you need to know')) {
  throw new Error('MediaKit.tsx: leftover Everything you need must stay')
}
if (!docx.includes('Ready to amplify your brand?')) {
  throw new Error('docxExport.ts: leftover amplify closer must stay for #520')
}
if (!docx.includes('Partnerships Team')) {
  throw new Error('docxExport.ts: leftover Partnerships Team must stay')
}
if (!docx.includes('50% deposit')) {
  throw new Error('docxExport.ts: leftover 50% deposit must stay for #493')
}
if (!docx.includes('Full campaign report')) {
  throw new Error('docxExport.ts: leftover campaign-report SLA must stay for #487')
}

console.log('verify-kit-not-volume: Media kit rate card names a written quote, not leftover volume discounts.')
