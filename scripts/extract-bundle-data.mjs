import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const files = {
  ops: path.join(root, 'deployed-reference/assets/OpsPortal-dIeH6Okr.js'),
  enquiry: path.join(root, 'deployed-reference/assets/EnquiryDashboard-C3KbjDYm.js'),
  index: path.join(root, 'deployed-reference/assets/index-B_LB8Wq9.js'),
}

for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) {
    console.log(`Missing ${name}: ${file}`)
    continue
  }
  const c = fs.readFileSync(file, 'utf8')
  console.log(`\n=== ${name} (${c.length} chars) ===`)

  const patterns = [
    'password', 'sessionStorage', 'OpsRouteGuard', 'Authorised', 'Ask Jason',
    'ENQ-001', 'ENQ-015', 'onefm-ops', 'OPS_PASSWORD', 'FOOTT Waste',
    'ENQUIRIES', 'PROPOSALS', 'CONTRACTS', 'BATCH SEND', 'LISTEN', 'SPONSOR',
    'BUILD PROPOSAL', '/ops', 'media-kit', '/privacy', 'OpsPortal',
  ]
  for (const pat of patterns) {
    const idx = c.indexOf(pat)
    if (idx >= 0) {
      console.log(`\n[${pat}] @${idx}:`)
      console.log(c.slice(Math.max(0, idx - 100), idx + 300).replace(/\s+/g, ' '))
    }
  }
}

// Extract ENQ mock data array
const enquiry = fs.readFileSync(files.enquiry, 'utf8')
const enqMatch = enquiry.match(/const \w+=\[\{id:"ENQ-001"[\s\S]*?\}\];/)
if (enqMatch) {
  fs.writeFileSync(path.join(__dirname, 'enquiry-data.txt'), enqMatch[0].slice(0, 50000))
  console.log('\nWrote enquiry-data.txt', enqMatch[0].length, 'chars')
}

// Extract code-path component boundaries
for (const [name, file] of Object.entries(files)) {
  const c = fs.readFileSync(file, 'utf8')
  const paths = [...c.matchAll(/code-path":"(src\/[^"]+)"/g)].map(m => m[1])
  const unique = [...new Set(paths.map(p => p.replace(/:\d+:\d+$/, '')))]
  console.log(`\n${name} code-paths (${unique.length}):`, unique.join('\n  '))
}
