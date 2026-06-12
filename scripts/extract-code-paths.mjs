import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tempDir = process.env.TEMP || '/tmp'
const files = [
  path.join(tempDir, 'OpsPortal-dIeH6Okr.js'),
  path.join(tempDir, 'EnquiryDashboard-C3KbjDYm.js'),
  path.join(tempDir, 'onefm-index.js'),
]

const allPaths = new Set()
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn('Missing:', file)
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  const re = /code-path":"(src\/[^"]+)"/g
  let m
  while ((m = re.exec(content)) !== null) {
    allPaths.add(m[1].replace(/:\d+:\d+$/, ''))
  }
}

const sorted = [...allPaths].sort()
console.log('Found', sorted.length, 'unique source files')
for (const p of sorted) console.log(p)
