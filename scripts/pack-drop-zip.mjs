/**
 * Zip dist for a Netlify production drag-drop.
 * Unused GVL/KDL club logo dumps are omitted (they are not referenced in src/).
 * Run after `npm run build`. Output: onefmops-production-drop.zip at repo root.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, statSync, copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath (not .pathname) — on Windows, pathname is '/C:/...' which
// Node resolves to 'C:\C:\...' and every fs call dies with ENOENT.
const root = fileURLToPath(new URL('..', import.meta.url))
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

const gatePath = resolve(dist, 'gov-ready-gate.txt')
if (!existsSync(gatePath) || !readFileSync(gatePath, 'utf8').includes('og=189680')) {
  console.error('pack-drop-zip: dist/gov-ready-gate.txt missing or stale')
  process.exit(1)
}

for (const dir of ['kdl', 'gvl']) {
  rmSync(resolve(dist, 'assets/logos', dir), { recursive: true, force: true })
}

const toml = resolve(root, 'netlify.toml')
if (existsSync(toml)) {
  copyFileSync(toml, resolve(dist, 'netlify.toml'))
}

const zipName = 'onefmops-production-drop.zip'
const zipPath = resolve(root, zipName)
rmSync(zipPath, { force: true })

// Zip fallback chain: unix `zip` (CI) → tar (Linux) → PowerShell
// Compress-Archive (absolute path — Git Bash strips COMSPEC and System32
// from PATH, so 'powershell.exe' is not always resolvable by name).
function tryZip() {
  const zip = spawnSync('zip', ['-r', '-q', zipPath, '.'], { cwd: dist, stdio: 'inherit' })
  if (zip.status === 0) return 0

  if (process.platform !== 'win32') {
    const tar = spawnSync('tar', ['-a', '-cf', zipPath, '.'], { cwd: dist, stdio: 'inherit' })
    return tar.status ?? 1
  }

  const winDir = process.env.WINDIR ?? 'C:\\Windows'
  const psPath = resolve(winDir, 'System32/WindowsPowerShell/v1.0/powershell.exe')
  if (!existsSync(psPath)) {
    console.error(`pack-drop-zip: powershell not found at ${psPath}`)
    return 1
  }
  const ps = spawnSync(
    psPath,
    ['-NoProfile', '-NonInteractive', '-Command', `Compress-Archive -Path '${dist}\\*' -DestinationPath '${zipPath}' -Force`],
    { stdio: 'inherit' },
  )
  return ps.status ?? 1
}

const zipStatus = tryZip()
if (zipStatus !== 0) {
  console.error('pack-drop-zip: zip failed (tried zip, tar, powershell)')
  process.exit(zipStatus)
}

const mb = (statSync(zipPath).size / (1024 * 1024)).toFixed(1)
console.log(`pack-drop-zip: ${zipName} (${mb} MB)`)

const artifacts = '/opt/cursor/artifacts'
if (existsSync(artifacts)) {
  mkdirSync(artifacts, { recursive: true })
  copyFileSync(zipPath, resolve(artifacts, 'onefmops_drop_phone.zip'))
  console.log('pack-drop-zip: copied to /opt/cursor/artifacts/onefmops_drop_phone.zip')
}
