/**
 * Fail if the non-GVL PDF cover is still the unlabeled host or the
 * leftover match-day camera-op still labeled “studio”.
 * Run: npx vite-node scripts/verify-pdf-studio-cover.ts
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PDF_COVER_STUDIO_JPEG, PDF_COVER_STUDIO_PX } from '../src/lib/pdfCoverImages'

const UNLABELED_HOST = '2b1293e956ba40f2deacee6d18f407fc'
const OLD_CAMERA_OP = 'f0d90548d936b901495e84fe5c1f1522'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-pdf-studio-cover FAIL: ${message}`)
    process.exit(1)
  }
}

function jpegMd5(dataUrl: string): string {
  const b64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '')
  return createHash('md5').update(Buffer.from(b64, 'base64')).digest('hex')
}

const source = readFileSync(resolve('src/lib/pdfCoverImages.ts'), 'utf8')
assert(
  source.includes('/public/assets/images/ob-van-branded.jpg (studio / non-GVL)'),
  'header must name the branded OB van as the non-GVL studio cover',
)
assert(
  !source.includes('commentary-box-action.jpg (studio)'),
  'header must not call the match-day camera-op the studio cover',
)

assert(PDF_COVER_STUDIO_PX.w === 1480, `studio cover width ${PDF_COVER_STUDIO_PX.w}`)
assert(PDF_COVER_STUDIO_PX.h === 1110, `studio cover height ${PDF_COVER_STUDIO_PX.h}`)

const md5 = jpegMd5(PDF_COVER_STUDIO_JPEG)
assert(md5 !== UNLABELED_HOST, 'studio cover must not be the unlabeled host face')
assert(md5 !== OLD_CAMERA_OP, 'studio cover must not be the leftover camera-op still')
assert(md5 === '51787a5e8ba4d4acf74a71b18f22fef9', `unexpected studio cover hash ${md5}`)

console.log('verify-pdf-studio-cover OK')
