/**
 * Fail if PWA / apple-touch icons are still leftover navy.
 * Run: npx vite-node scripts/verify-pwa-icon-ink.ts
 *
 * #301 remapped favicon.svg. These PNGs are what index.html and manifest
 * already point at — do not edit those claimed files.
 */
import { execFileSync } from 'node:child_process'

function fail(msg: string): never {
  console.error(`verify-pwa-icon-ink FAIL: ${msg}`)
  process.exit(1)
}

const py = `
from PIL import Image
from collections import Counter
import sys

LEFTOVER_NAVY = (10, 22, 40)   # #0A1628
LEFTOVER_GOLD = {(212, 175, 55), (240, 199, 94), (212, 168, 75)}
INK = (16, 16, 16)             # #101010
RED = (229, 22, 54)            # #E51636

for path in sys.argv[1:]:
    im = Image.open(path).convert('RGB')
    counts = Counter(list(im.getdata()))
    if counts.get(LEFTOVER_NAVY, 0) > 0:
        print(f'{path}: leftover navy #0A1628 still present')
        sys.exit(1)
    if any(counts.get(c, 0) > 0 for c in LEFTOVER_GOLD):
        print(f'{path}: leftover gold still present')
        sys.exit(1)
    if counts.get(INK, 0) < im.size[0] * im.size[1] * 0.5:
        print(f'{path}: Direction A ink #101010 is not the tile')
        sys.exit(1)
    if counts.get(RED, 0) < 80:
        print(f'{path}: missing Direction A red FM mark')
        sys.exit(1)
    corner = im.getpixel((2, 2))
    if corner != INK:
        print(f'{path}: corner {corner} is not ink')
        sys.exit(1)
print('ok')
`

const out = execFileSync(
  'python3',
  ['-c', py, 'public/brand/icon-192.png', 'public/brand/icon-512.png'],
  { encoding: 'utf8' },
)
if (!out.includes('ok')) fail(out.trim() || 'pixel check failed')
console.log('verify-pwa-icon-ink: ok — home-screen icons are Direction A ink, not leftover navy')
