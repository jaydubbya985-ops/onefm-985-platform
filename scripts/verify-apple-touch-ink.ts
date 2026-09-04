/**
 * Fail if /apple-touch-icon.png is missing or still leftover navy/gold.
 * Run: npx vite-node scripts/verify-apple-touch-ink.ts
 *
 * index.html already points at /brand/icon-192.png (#325). This file is the
 * default iOS /apple-touch-icon.png probe — do not edit claimed PWA PNGs.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

function fail(msg: string): never {
  console.error(`verify-apple-touch-ink FAIL: ${msg}`)
  process.exit(1)
}

if (!existsSync('public/apple-touch-icon.png')) {
  fail('public/apple-touch-icon.png must exist so iOS is not served SPA HTML')
}

const py = `
from PIL import Image
from collections import Counter
import sys

LEFTOVER_NAVY = (10, 22, 40)   # #0A1628
LEFTOVER_GOLD = {(212, 175, 55), (240, 199, 94), (212, 168, 75)}
INK = (16, 16, 16)             # #101010
RED = (229, 22, 54)            # #E51636

path = sys.argv[1]
rgb = Image.open(path).convert('RGB')
if rgb.size != (180, 180):
    print(f'{path}: expected 180x180, got {rgb.size}')
    sys.exit(1)
counts = Counter(list(rgb.getdata()))
if counts.get(LEFTOVER_NAVY, 0) > 0:
    print(f'{path}: leftover navy #0A1628')
    sys.exit(1)
if any(counts.get(c, 0) > 0 for c in LEFTOVER_GOLD):
    print(f'{path}: leftover gold')
    sys.exit(1)
if counts.get(INK, 0) < 180 * 180 * 0.5:
    print(f'{path}: Direction A ink #101010 is not the tile')
    sys.exit(1)
if counts.get(RED, 0) < 200:
    print(f'{path}: missing Direction A red FM mark ({counts.get(RED, 0)} px)')
    sys.exit(1)
if rgb.getpixel((2, 2)) != INK:
    print(f'{path}: corner {rgb.getpixel((2, 2))} is not ink')
    sys.exit(1)
print('ok')
`

const out = execFileSync('python3', ['-c', py, 'public/apple-touch-icon.png'], { encoding: 'utf8' })
if (!out.includes('ok')) fail(out.trim() || 'pixel check failed')
console.log('verify-apple-touch-ink: ok — iOS tile is Direction A ink, not leftover navy')
