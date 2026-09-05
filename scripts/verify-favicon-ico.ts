/**
 * Fail if /favicon.ico is missing or still leftover navy/gold.
 * Run: npx vite-node scripts/verify-favicon-ico.ts
 *
 * index.html already points at favicon.svg (#301). This file is the
 * default /favicon.ico browsers still request — do not edit claimed SVG.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

function fail(msg: string): never {
  console.error(`verify-favicon-ico FAIL: ${msg}`)
  process.exit(1)
}

if (!existsSync('public/favicon.ico')) {
  fail('public/favicon.ico must exist so /favicon.ico is not SPA HTML')
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
im = Image.open(path)
sizes = set(im.ico.sizes())
if (16, 16) not in sizes or (32, 32) not in sizes:
    print(f'{path}: expected 16 and 32 frames, got {sorted(sizes)}')
    sys.exit(1)
for size in sizes:
    rgb = im.ico.getimage(size).convert('RGB')
    counts = Counter(list(rgb.getdata()))
    if counts.get(LEFTOVER_NAVY, 0) > 0:
        print(f'{path} {rgb.size}: leftover navy #0A1628')
        sys.exit(1)
    if any(counts.get(c, 0) > 0 for c in LEFTOVER_GOLD):
        print(f'{path} {rgb.size}: leftover gold')
        sys.exit(1)
    if counts.get(INK, 0) < rgb.size[0] * rgb.size[1] * 0.35:
        print(f'{path} {rgb.size}: Direction A ink #101010 is not the tile')
        sys.exit(1)
    if rgb.size[0] >= 32 and counts.get(RED, 0) < 20:
        print(f'{path} {rgb.size}: missing Direction A red FM mark ({counts.get(RED, 0)} px)')
        sys.exit(1)
    if rgb.getpixel((1, 1)) != INK:
        print(f'{path} {rgb.size}: corner {rgb.getpixel((1, 1))} is not ink')
        sys.exit(1)
print('ok')
`

const out = execFileSync('python3', ['-c', py, 'public/favicon.ico'], { encoding: 'utf8' })
if (!out.includes('ok')) fail(out.trim() || 'pixel check failed')
console.log('verify-favicon-ico: ok — /favicon.ico is Direction A ink, not leftover navy')
