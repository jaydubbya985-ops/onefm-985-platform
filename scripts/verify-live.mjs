/**
 * Prove production matches the 80% gov-ready bar.
 * Run: npm run live   (after a production deploy)
 *
 * Does not run during `npm run build` — local dist is not production.
 */
const LIVE = 'https://onefmops.netlify.app'

/** Bundles known to be the pre-EXE DEMO deploy. */
const STALE_CHUNKS = [
  'OpsPortal-DpfuQL4N.js',
  'AudienceAnalytics-BCNjZ7SS.js',
  'index-BJ4yefZ1.js',
]

const fail = []

async function get(path) {
  const url = path.startsWith('http') ? path : LIVE + path
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} HTTP ${res.status}`)
  return res.text()
}

const html = await get('/')

try {
  const gate = await get('/gov-ready-gate.txt')
  if (!gate || gate.trimStart().startsWith('<')) {
    fail.push('live /gov-ready-gate.txt is SPA HTML — production is still the stale DEMO deploy')
  } else if (!gate.includes('onefm-gov-ready') || !gate.includes('og=189680')) {
    fail.push('live /gov-ready-gate.txt is not the current drop (missing onefm-gov-ready og=189680)')
  }
} catch {
  fail.push('live is missing /gov-ready-gate.txt — production is still the stale DEMO deploy')
}

if (/185,?791/.test(html)) {
  fail.push('live index.html still has stale OG population 185,791')
}
if (/36 years/.test(html)) {
  fail.push('live index.html still has stale "36 years" OG copy')
}

const indexPath = html.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0]
if (!indexPath) fail.push('live index.html has no /assets/index-*.js')
else {
  for (const stale of STALE_CHUNKS) {
    if (indexPath.includes(stale.replace('.js', '')) || html.includes(stale)) {
      fail.push(`live still serves stale bundle ${stale} — Netlify did not get current main`)
    }
  }

  const indexJs = await get(indexPath)
  for (const stale of STALE_CHUNKS) {
    if (indexJs.includes(stale)) {
      fail.push(`live index chunk still references stale ${stale}`)
    }
  }

  const ops = indexJs.match(/OpsPortal-[A-Za-z0-9_-]+\.js/)?.[0]
  const audience = indexJs.match(/AudienceAnalytics-[A-Za-z0-9_-]+\.js/)?.[0]
  if (ops === 'OpsPortal-DpfuQL4N.js') {
    fail.push('live still lazy-loads OpsPortal-DpfuQL4N.js (DEMO deploy)')
  }
  if (audience) {
    const chunk = await get('/assets/' + audience)
    if (/78% within 50km/i.test(chunk)) fail.push('/audience still has invented 78% within 50km')
    if (/Balanced gender split — 48\/52/i.test(chunk)) {
      fail.push('/audience still has invented 48/52 gender split')
    }
  } else {
    fail.push('could not find AudienceAnalytics chunk')
  }

  const haystack = indexJs + html
  const hasBakedSupabase =
    haystack.includes('myarjdatdtchmkgdpsab.supabase.co') ||
    /https:\/\/[a-z0-9]+\.supabase\.co/.test(haystack)
  const snippetConfigured =
    html.includes('__ONEFM_OPS__') &&
    /https:\/\/[a-z0-9]+\.supabase\.co/.test(html) &&
    !html.includes('placeholder.supabase.co') &&
    !html.includes('your-project-id')

  let runtimeConfigured = false
  try {
    const cfgRes = await fetch(LIVE + '/.netlify/functions/ops-config')
    const cfgText = await cfgRes.text()
    const looksLikeHtml = cfgText.trimStart().startsWith('<')
    if (cfgRes.ok && !looksLikeHtml) {
      const cfg = JSON.parse(cfgText)
      runtimeConfigured =
        cfg?.configured === true &&
        typeof cfg.url === 'string' &&
        cfg.url.includes('supabase.co') &&
        !cfg.url.includes('your-project-id')
    } else if (cfgRes.ok && looksLikeHtml && !snippetConfigured) {
      fail.push(
        'ops-config is not deployed yet (SPA HTML fallback) and no Netlify snippet is present — #/ops stays DEMO until Git+env, a snippet, or this branch is on production',
      )
    } else if (!cfgRes.ok && cfgRes.status !== 404 && !snippetConfigured) {
      fail.push(`ops-config HTTP ${cfgRes.status} — #/ops cannot read Netlify env`)
    }
  } catch (err) {
    if (!snippetConfigured) {
      fail.push(`ops-config fetch failed: ${err instanceof Error ? err.message : err}`)
    }
  }

  if (!hasBakedSupabase && !runtimeConfigured && !snippetConfigured) {
    fail.push(
      'live #/ops will stay DEMO — no baked Supabase URL, no Netlify snippet, and /.netlify/functions/ops-config is not configured.',
    )
  }
}

if (fail.length) {
  console.error('verify-live failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-live: ok — production is not the stale DEMO deploy')
