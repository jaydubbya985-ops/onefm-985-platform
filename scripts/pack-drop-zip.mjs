/**
 * Zip dist for a Netlify production drag-drop.
 * Unused GVL/KDL club logo dumps are omitted (they are not referenced in src/).
 * Run after `npm run build`. Output: onefmops-production-drop.zip at repo root.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, statSync, copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const dist = resolve(root, 'dist')
const htmlPath = resolve(dist, 'index.html')

if (!existsSync(htmlPath)) {
  console.error('pack-drop-zip: dist/index.html missing — run npm run build first')
  process.exit(1)
}

const html = readFileSync(htmlPath, 'utf8')
if (!html.includes('189,680')) {
  console.error('pack-drop-zip: dist/index.html is missing OG 189,680')
  process.exit(1)
}
if (/185,?791/.test(html) || html.includes('36 years')) {
  console.error('pack-drop-zip: dist/index.html still has stale OG copy')
  process.exit(1)
}

for (const dir of ['kdl', 'gvl']) {
  rmSync(resolve(dist, 'assets/logos', dir), { recursive: true, force: true })
}

const zipName = 'onefmops-production-drop.zip'
const zipPath = resolve(root, zipName)
rmSync(zipPath, { force: true })

const zipped = spawnSync('zip', ['-r', '-q', zipPath, '.'], { cwd: dist, stdio: 'inherit' })
if (zipped.status !== 0) {
  console.error('pack-drop-zip: zip failed')
  process.exit(zipped.status ?? 1)
}

const mb = (statSync(zipPath).size / (1024 * 1024)).toFixed(1)
console.log(`pack-drop-zip: ${zipName} (${mb} MB)`)

const artifacts = '/opt/cursor/artifacts'
if (existsSync(artifacts)) {
  mkdirSync(artifacts, { recursive: true })
  copyFileSync(zipPath, resolve(artifacts, 'onefmops_drop_phone.zip'))
  console.log('pack-drop-zip: copied to /opt/cursor/artifacts/onefmops_drop_phone.zip')
}
