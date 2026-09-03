/**
 * Fail the build if the Story page invents presenter tenure or a worldwide stream.
 * Run: npx vite-node scripts/verify-story-tenure.ts
 */
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/pages/Story.tsx', import.meta.url), 'utf8')

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-story-tenure FAIL: ${message}`)
    process.exit(1)
  }
}

const forbidden = [
  'On air since',
  'years at ONE FM',
  'Been on air for',
  'Has been on air',
  '19-20 years',
  '19–20 years',
  'tune in anywhere',
  'Valley and beyond',
]

for (const phrase of forbidden) {
  assert(!src.includes(phrase), `Story must not invent “${phrase}”`)
}

assert(
  src.includes('Published guide · fm985.com.au/guide'),
  'Story team cards must cite the published guide instead of tenure',
)
assert(
  src.includes('not a worldwide product'),
  'Story stream pillar must refuse a worldwide product claim',
)
assert(
  !/\byears:\s*['"]/.test(src),
  'Story team rows must not carry an invented years field',
)

console.log('verify-story-tenure OK')
console.log(
  JSON.stringify(
    {
      tenurePhrases: forbidden.filter((p) => src.includes(p)),
      guideCite: src.includes('Published guide · fm985.com.au/guide'),
      worldwideRefused: src.includes('not a worldwide product'),
    },
    null,
    2,
  ),
)
