/**
 * Fail if FOOTT / proposal PDFs still inherit leftover Heritage navy or gold.
 * Run: npx vite-node scripts/verify-pdf-letterhead-ink.ts
 */
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { generateInvoicePdf } from '../src/components/ops/InvoiceEmailTemplate'
import { generateProposalPdf, buildProposalDoc } from '../src/lib/proposalDocument'
import { PROPOSAL_PACKAGES } from '../src/components/ops/data/sponsors'
import { PDF_COVER_GRADIENT_PNG } from '../src/lib/pdfCoverGradient'

function fail(message: string): never {
  console.error(`verify-pdf-letterhead-ink FAIL: ${message}`)
  process.exit(1)
}

const letterhead = readFileSync(new URL('../src/lib/pdfLetterhead.ts', import.meta.url), 'utf8')
if (letterhead.includes('DS.rgb.navy')) {
  fail('pdfLetterhead must not inherit DS.rgb.navy (leftover #071D3A)')
}
if (letterhead.includes('DS.rgb.gold')) {
  fail('pdfLetterhead must not inherit DS.rgb.gold (leftover #D4AF37)')
}
if (!letterhead.includes('[16, 16, 16]')) {
  fail('pdfLetterhead pen ink must be Direction A #101010')
}
if (!letterhead.includes('[242, 242, 242]')) {
  fail('pdfLetterhead pen gold must be remapped paper #F2F2F2')
}

const coverSrc = readFileSync(new URL('../src/lib/pdfCoverGradient.ts', import.meta.url), 'utf8')
if (/#071D3A/.test(coverSrc) || /7,\s*29,\s*58/.test(coverSrc)) {
  fail('pdfCoverGradient must not name leftover Heritage navy')
}

function pngRgba(dataUrl: string): { w: number; h: number; pixels: Buffer } {
  const b64 = dataUrl.replace(/^data:image\/png;base64,/, '')
  const buf = Buffer.from(b64, 'base64')
  if (buf.toString('ascii', 1, 4) !== 'PNG') fail('cover overlay is not a PNG')
  let offset = 8
  const idats: Buffer[] = []
  let w = 0
  let h = 0
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset)
    const type = buf.toString('ascii', offset + 4, offset + 8)
    const data = buf.subarray(offset + 8, offset + 8 + len)
    if (type === 'IHDR') {
      w = data.readUInt32BE(0)
      h = data.readUInt32BE(4)
    }
    if (type === 'IDAT') idats.push(data)
    if (type === 'IEND') break
    offset += 12 + len
  }
  const raw = inflateSync(Buffer.concat(idats))
  const bpp = 4
  const stride = w * bpp
  const pixels = Buffer.alloc(w * h * bpp)
  let src = 0
  const paeth = (a: number, b: number, c: number) => {
    const p = a + b - c
    const pa = Math.abs(p - a)
    const pb = Math.abs(p - b)
    const pc = Math.abs(p - c)
    if (pa <= pb && pa <= pc) return a
    if (pb <= pc) return b
    return c
  }
  for (let y = 0; y < h; y++) {
    const filter = raw[src]
    src += 1
    const row = pixels.subarray(y * stride, (y + 1) * stride)
    const prev = y === 0 ? null : pixels.subarray((y - 1) * stride, y * stride)
    for (let x = 0; x < stride; x++) {
      const filt = raw[src + x]
      const a = x >= bpp ? row[x - bpp] : 0
      const b = prev ? prev[x] : 0
      const c = prev && x >= bpp ? prev[x - bpp] : 0
      if (filter === 0) row[x] = filt
      else if (filter === 1) row[x] = (filt + a) & 255
      else if (filter === 2) row[x] = (filt + b) & 255
      else if (filter === 3) row[x] = (filt + Math.floor((a + b) / 2)) & 255
      else if (filter === 4) row[x] = (filt + paeth(a, b, c)) & 255
      else fail(`cover PNG uses unsupported filter ${filter}`)
    }
    src += stride
  }
  return { w, h, pixels }
}

const cover = pngRgba(PDF_COVER_GRADIENT_PNG)
let leftoverNavyPx = 0
let inkPx = 0
for (let i = 0; i < cover.pixels.length; i += 4) {
  const r = cover.pixels[i]
  const g = cover.pixels[i + 1]
  const b = cover.pixels[i + 2]
  if (r === 7 && g === 29 && b === 58) leftoverNavyPx += 1
  if (r === 16 && g === 16 && b === 16) inkPx += 1
}
if (leftoverNavyPx > 0) {
  fail(`cover overlay still has leftover navy pixels: ${leftoverNavyPx}`)
}
if (inkPx < cover.w * cover.h * 0.9) {
  fail(`cover overlay must be Direction A ink — ink pixels ${inkPx} of ${cover.w * cover.h}`)
}

const leftoverNavyOp = '0.027 0.114 0.227 rg'
const leftoverGoldOp = '0.831 0.686 0.216 rg'
/** jsPDF writes equal RGB as a grayscale operator (16/255 ≈ 0.063). */
const inkOp = '0.063 g'

const foott = await generateInvoicePdf({
  number: 'ONEFM-2026-011',
  company: 'FOOTT Waste Solutions',
  contactName: 'Peter Foott',
  email: 'peter@foott.com.au',
  amountExclGst: 5000,
  gst: 500,
  total: 5500,
  description: 'FOOTT Waste Solutions – Community Partnership & Sponsorship Package (Jun–Nov 2026)',
  period: 'Jun 2026 – Nov 2026',
  dueDate: '2026-06-23',
  issueDate: '2026-06-09',
})
const foottText = Buffer.from(foott.output('arraybuffer')).toString('latin1')
if (foottText.includes(leftoverNavyOp)) {
  fail('FOOTT invoice PDF still paints leftover Heritage navy')
}
if (foottText.includes(leftoverGoldOp)) {
  fail('FOOTT invoice PDF still paints leftover Heritage gold')
}
if (!foottText.includes(inkOp)) {
  fail('FOOTT invoice PDF must paint Direction A ink #101010')
}

const pkg = PROPOSAL_PACKAGES.find((p) => p.id === 'partner-community')
if (!pkg) fail('Community Partner package missing')
const proposal = await generateProposalPdf(
  buildProposalDoc({
    number: 'PROP-2026-001',
    clientName: 'Ken Tuckett',
    company: 'Burkes Bakery',
    email: 'accounts@example.test',
    pkg,
    durationWeeks: 52,
    extras: {},
  }),
)
const proposalText = Buffer.from(proposal.output('arraybuffer')).toString('latin1')
if (proposalText.includes(leftoverNavyOp)) {
  fail('proposal PDF still paints leftover Heritage navy')
}
if (!proposalText.includes(inkOp)) {
  fail('proposal PDF must paint Direction A ink #101010')
}

console.log(
  JSON.stringify({
    ok: true,
    cover: { w: cover.w, h: cover.h, inkPx },
    foottHasInk: foottText.includes(inkOp),
    proposalHasInk: proposalText.includes(inkOp),
  }),
)
