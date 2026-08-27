/**
 * Fail the build if public/app source still contains invented claims.
 * Run: npm run truth
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('../src', import.meta.url).pathname

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
for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf8')
  for (const rule of FORBIDDEN) {
    if (rule.re.test(text)) {
      hits.push(`${relative(ROOT, file)}: ${rule.why}`)
    }
  }
}

if (hits.length) {
  console.error('verify-truth failed:\n' + hits.map((h) => `  ${h}`).join('\n'))
  process.exit(1)
}

console.log('verify-truth: ok')
