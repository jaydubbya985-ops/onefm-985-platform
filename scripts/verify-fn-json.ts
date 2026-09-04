/**
 * Prove a BOM-prefixed function JSON body is still LIVE, and SPA HTML is not.
 * Run: npx vite-node scripts/verify-fn-json.ts
 */
import { readFileSync } from 'node:fs'
import { readFunctionJson } from '../src/lib/readFunctionJson.ts'

const fail: string[] = []

function assert(cond: boolean, msg: string) {
  if (!cond) fail.push(msg)
}

const source = readFileSync(new URL('../src/lib/readFunctionJson.ts', import.meta.url), 'utf8')
assert(source.includes('stripBom') || source.includes('0xfeff'), 'must strip a UTF-8 BOM')
assert(source.includes('text/html'), 'must reject SPA HTML by content-type')
assert(source.includes("startsWith('<')"), 'must still reject HTML that starts with <')

const html = await readFunctionJson(new Response('<!doctype html><html></html>', { status: 200 }))
assert(html === null, 'HTML 200 must not parse as JSON success')

const htmlType = await readFunctionJson(
  new Response(JSON.stringify({ success: true, configured: true }), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  }),
)
assert(htmlType === null, 'text/html must not parse even if the body looks like JSON')

const bomHtml = await readFunctionJson(new Response('\uFEFF<!doctype html>', { status: 200 }))
assert(bomHtml === null, 'BOM + HTML must not parse as JSON success')

const ok = await readFunctionJson<{ success?: boolean }>(
  new Response(JSON.stringify({ success: true }), { status: 200 }),
)
assert(ok?.success === true, 'JSON success must parse')

const bomLive = await readFunctionJson<{ configured?: boolean; anonKey?: string }>(
  new Response(`\uFEFF${JSON.stringify({ configured: true, url: 'https://example.supabase.co', anonKey: 'eyJtest' })}`, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }),
)
assert(bomLive?.configured === true, 'BOM + ops-config JSON must stay LIVE')
assert(bomLive?.anonKey === 'eyJtest', 'BOM must not drop the anon key')

const sent = await readFunctionJson<{ success?: boolean; sent?: boolean }>(
  new Response(`\uFEFF${JSON.stringify({ success: true, sent: true, messageId: 'msg_1' })}`, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }),
)
assert(sent?.success === true && sent.sent === true, 'BOM + send-invoice JSON must stay a send')

const arrayBody = await readFunctionJson(new Response('[]', { status: 200 }))
assert(arrayBody === null, 'a JSON array is not a function payload')

const stringBody = await readFunctionJson(new Response('"<!doctype html>"', { status: 200 }))
assert(stringBody === null, 'a JSON string is not a function payload')

const empty = await readFunctionJson(new Response('', { status: 200 }))
assert(empty === null, 'empty body is not JSON success')

const configuredFalse = await readFunctionJson<{ configured?: boolean }>(
  new Response(JSON.stringify({ configured: false }), { status: 200 }),
)
assert(configuredFalse?.configured === false, '{configured:false} must still parse')

if (fail.length) {
  console.error('verify-fn-json FAILED')
  for (const msg of fail) console.error(' -', msg)
  process.exit(1)
}

console.log('verify-fn-json OK')
console.log('  SPA HTML 200 → null')
console.log('  text/html + JSON-looking body → null')
console.log('  BOM + HTML → null')
console.log('  BOM + ops-config JSON → LIVE')
console.log('  BOM + send-invoice JSON → send')
console.log('  {configured:false} still parses')
