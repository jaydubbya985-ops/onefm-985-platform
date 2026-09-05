/**
 * Media kit leftover: do not invent a 10+ volume-discount ladder.
 * Sources: src/pages/MediaKit.tsx, src/lib/docxExport.ts
 *
 * Run: npx vite-node scripts/verify-kit-no-discount.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = ['src/pages/MediaKit.tsx', 'src/lib/docxExport.ts'] as const

const leftover = [
  'Volume discounts available',
  'packages of 10+ spots',
  'preferential rates',
]

for (const file of files) {
  const src = readFileSync(resolve(file), 'utf8')
  for (const phrase of leftover) {
    if (src.includes(phrase)) {
      throw new Error(`Media kit leftover invented discount: "${phrase}" in ${file}`)
    }
  }
}

const page = readFileSync(resolve('src/pages/MediaKit.tsx'), 'utf8')
if (!page.includes('does not publish a 10+ volume-discount ladder')) {
  throw new Error('MediaKit page must say the kit does not publish a volume-discount ladder.')
}

const word = readFileSync(resolve('src/lib/docxExport.ts'), 'utf8')
if (!word.includes('does not publish a 10+ volume-discount ladder')) {
  throw new Error('Media kit Word export must match the page: no volume-discount ladder.')
}

console.log('verify-kit-no-discount: Media kit does not invent a 10+ discount.')
