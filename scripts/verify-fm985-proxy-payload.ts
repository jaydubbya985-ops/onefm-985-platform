/**
 * Fail if the fm985 proxy caches an HTML maintenance page as the interview API.
 * Run: npx vite-node scripts/verify-fm985-proxy-payload.ts
 */
import { readFileSync } from 'node:fs'
import {
  fm985ProxyLooksLikeHtml,
  fm985ProxyLooksLikeJson,
  fm985ProxyPayload,
} from '../src/lib/fm985ProxyPayload'

function assert(cond: unknown, message: string) {
  if (!cond) {
    console.error(`verify-fm985-proxy-payload FAIL: ${message}`)
    process.exit(1)
  }
}

assert(fm985ProxyLooksLikeHtml('text/html', 'ok'), 'text/html is HTML even with a short body')
assert(fm985ProxyLooksLikeHtml('application/json', '<!doctype html><html><p>Down</p></html>'), 'doctype is HTML')
assert(fm985ProxyLooksLikeHtml(null, '<html><body>SPA</body></html>'), 'bare html tag is HTML')
assert(!fm985ProxyLooksLikeHtml('application/json', '[{"id":1}]'), 'JSON array is not HTML')
assert(fm985ProxyLooksLikeJson('[{"id":24,"title":{"rendered":"Guest"}}]'), 'WP posts array is JSON')
assert(!fm985ProxyLooksLikeJson('<!doctype html>'), 'HTML is not JSON')
assert(!fm985ProxyLooksLikeJson('{not json'), 'broken object is not JSON')

const html = fm985ProxyPayload({
  status: 200,
  contentType: 'text/html; charset=UTF-8',
  body: '<!doctype html><html><title>Maintenance</title></html>',
})
assert(html.statusCode === 502, `HTML 200 must become 502, got ${html.statusCode}`)
assert(html.headers['Cache-Control'] === 'no-store', 'do not cache an HTML miss as the interview API')
assert(html.headers['Content-Type'] === 'application/json', 'error body must be JSON')
const htmlErr = JSON.parse(html.body) as { error?: string }
assert(/HTML/i.test(htmlErr.error ?? ''), `error must name HTML: ${htmlErr.error}`)
assert(!/interview|Guest/i.test(html.body), 'do not invent interview JSON from a maintenance page')

const spa = fm985ProxyPayload({
  status: 200,
  contentType: 'application/json',
  body: '<html><head></head><body>ONE FM</body></html>',
})
assert(spa.statusCode === 502, 'SPA HTML labelled as JSON must not pass')
assert(spa.headers['Cache-Control'] === 'no-store', 'do not cache SPA HTML')

const posts = '[{"id":88,"date":"2026-09-01T10:00:00","title":{"rendered":"Local guest"}}]'
const ok = fm985ProxyPayload({
  status: 200,
  contentType: 'application/json; charset=UTF-8',
  body: posts,
})
assert(ok.statusCode === 200, 'real WP JSON stays 200')
assert(ok.body === posts, 'pass the WordPress body through')
assert(ok.headers['Cache-Control'] === 'public, max-age=300', 'only cache real JSON')

const notFound = fm985ProxyPayload({
  status: 404,
  contentType: 'application/json',
  body: '{"code":"rest_no_route"}',
})
assert(notFound.statusCode === 404, 'keep the WP 404')
assert(notFound.headers['Cache-Control'] === 'no-store', 'do not cache a WP miss')

const empty = fm985ProxyPayload({ status: 200, contentType: 'application/json', body: '   ' })
assert(empty.statusCode === 502, 'empty 200 is not an interview list')

const fn = readFileSync(new URL('../netlify/functions/fm985-proxy.ts', import.meta.url), 'utf8')
assert(fn.includes('fm985ProxyPayload'), 'proxy must classify the upstream body')
assert(!/max-age=300/.test(fn), 'do not hard-code cache on every upstream response')

console.log('verify-fm985-proxy-payload OK')
console.log('html-as-200 →', html.statusCode, htmlErr.error)
