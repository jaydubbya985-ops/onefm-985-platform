/**
 * Fail the build if public/app source still contains invented claims.
 * Run: npm run truth
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('../src', import.meta.url).pathname
const INDEX_HTML = new URL('../index.html', import.meta.url).pathname

/** Phrases that must never ship in src/ (gov-truth). */
const FORBIDDEN = [
  { re: /Plemo/i, why: 'breakfast is ONE FM Breakfast, not Plemo' },
  { re: /unsplash\.com/i, why: 'no stock photography URLs' },
  { re: /AI-Enhanced/i, why: 'no AI-enhanced claims' },
  { re: /AI POWERED/i, why: 'no fake AI caption theatre' },
  { re: /fastest-growing segment/i, why: 'no invented age growth' },
  { re: /Updated 2s ago/i, why: 'no fake live listener pulse' },
  { re: /raised over \$120,000/i, why: 'no invented marathon total' },
  { re: /landmark agreement with the Goulburn Valley League/i, why: 'GVL rights are sourced in stationHistory, not this copy' },
  { re: /78% within 50km/i, why: 'no invented 50km coverage share' },
  { re: /Balanced gender split — 48\/52/i, why: 'gender split must match ABS LGA 49/51' },
  { re: /Real-time insights into who's listening/i, why: 'no fake live audience dashboard copy' },
  { re: /25\+ multicultural programs weekly/i, why: 'programGuide has 8 multicultural slots, not 25+' },
  { re: /reaching a total population of/i, why: 'population is in the broadcast area, not reached' },
  { re: /covering a projected population of/i, why: 'population is in the broadcast area, not covered as reach' },
  { re: /Mooroopna',\s*listeners:\s*3710/, why: '3710 is Echuca listener estimate, not Mooroopna' },
  { re: /12 345 678 901/, why: 'placeholder ABN — station ABN is 92 117 291 771' },
  { re: /registered as a Deductible Gift Recipient/i, why: 'DGR status is data pending — do not claim it' },
  { re: /185,?791/, why: 'stale OG population — use 189,680 from townData / stationStats' },
  { re: /36 years/, why: 'stale year count — licensed 1989 (37 in 2026) or omit years' },
  { re: /25\+ language communities/i, why: 'programGuide has 8 multicultural programs, not 25+ language communities' },
  { re: /8\+ languages/i, why: 'use the exact multicultural program count from programGuide' },
  { re: /never gone dark/i, why: 'unsourced transmitter uptime claim' },
  { re: /pay\.onefm985\.com\.au/i, why: 'hosted pay domain does not exist — use BSB 083-894' },
  { re: /api\.onefm985\.com\.au\/webhooks/i, why: 'webhook domain does not exist' },
  { re: /checkout\.stripe\.com\/pay\?/i, why: 'do not invent Stripe Checkout query URLs' },
  { re: /Request Received!/, why: 'mailto song request is a draft, not a received request' },
  { re: /Enquiry Sent!/, why: 'enquiry forms must not claim sent unless stored or emailed' },
  { re: /Sent via ONE FM Operations Portal/, why: 'invoice email footer must not claim the message was sent' },
  { re: /GVL Footy Sponsorship · From \$25/i, why: 'GVL is premium — never advertise from $25' },
  { re: /GVL Footy · From \$25/i, why: 'GVL is premium — never advertise from $25' },
  { re: /9 sponsorship tiers from \$25\/week/i, why: 'GVL is premium — never advertise from $25' },
  { re: /FROM \$25\/WEEK · NAMING RIGHTS/i, why: 'GVL is premium — never advertise from $25' },
  { re: /advertise on GVL.{0,40}from \$25/i, why: 'GVL must never be sold from $25' },
  { re: /~100km radius/, why: 'use formatRadius() from coverageCopy — do not hardcode ~100km' },
]

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(ts|tsx|js|jsx)$/.test(name)) out.push(p)
  }
  return out
}

const hits = []
const files = [
  ...walk(ROOT).map((p) => ({ label: relative(ROOT, p), text: readFileSync(p, 'utf8') })),
  { label: 'index.html', text: readFileSync(INDEX_HTML, 'utf8') },
]
for (const file of files) {
  for (const rule of FORBIDDEN) {
    if (rule.re.test(file.text)) {
      hits.push(`${file.label}: ${rule.why}`)
    }
  }
}

const listen = files.find((f) => f.label === 'pages/Listen.tsx')
if (
  !listen ||
  !listen.text.includes('Email draft opened') ||
  !listen.text.includes('Open email draft')
) {
  hits.push(
    'pages/Listen.tsx: routed song request must open a mailto draft and say so',
  )
}

const programs = files.find((f) => f.label === 'pages/Programs.tsx')
if (
  !programs ||
  !programs.text.includes('Email Draft Opened') ||
  /Request Received/i.test(programs.text)
) {
  hits.push(
    'pages/Programs.tsx: song request must say a draft opened — not that it was received',
  )
}

const coverageCopy = files.find((f) => f.label === 'lib/coverageCopy.ts')
if (!coverageCopy || !coverageCopy.text.includes('stationStats.weeklyListeners')) {
  hits.push('lib/coverageCopy.ts: coverage strings must read stationStats')
}
const presenterAssets = files.find((f) => f.label === 'lib/presenterAssets.ts')
if (
  !presenterAssets ||
  !presenterAssets.text.includes('heritage-di-hunter-carols-2014') ||
  !presenterAssets.text.includes('heritage-sally-nayler-90s')
) {
  hits.push('lib/presenterAssets.ts: only Di Hunter and Sally Nayler may be named portraits')
}

const app = files.find((f) => f.label === 'App.tsx')
if (
  !app ||
  !app.text.includes("path=\"/programs\"") ||
  /path=\"\/programs\" element=\{<Navigate to=\"\/listen\"/.test(app.text)
) {
  hits.push('App.tsx: /programs must mount Programs, not redirect to /listen')
}
if (
  !app ||
  !app.text.includes('BroadcastExplorer') ||
  /path=\"\/broadcast\" element=\{<Navigate to=\"\/listen\"/.test(app.text)
) {
  hits.push('App.tsx: /broadcast must mount BroadcastExplorer, not redirect to /listen')
}
if (
  !app ||
  !app.text.includes('SocialHub') ||
  /path=\"\/social\" element=\{<Navigate to=\"\/community\"/.test(app.text)
) {
  hits.push('App.tsx: /social must mount SocialHub, not redirect to /community')
}

if (hits.length) {
  console.error('verify-truth failed:\n' + hits.map((h) => `  ${h}`).join('\n'))
  process.exit(1)
}

console.log('verify-truth: ok')
