/**
 * Prove production matches the 80% gov-ready bar.
 * Run: npm run live   (after a production deploy)
 *
 * Does not run during `npm run build` — local dist is not production.
 */
const LIVE = 'https://onefmops.netlify.app'
const FETCH_ATTEMPTS = 4
const FETCH_RETRY_MS = [500, 1000, 2000]
const RETRYABLE_HTTP = new Set([408, 425, 429, 500, 502, 503, 504])

/** Bundles known to be the pre-EXE DEMO deploy. */
const STALE_CHUNKS = [
  'OpsPortal-DpfuQL4N.js',
  'AudienceAnalytics-BCNjZ7SS.js',
  'index-BJ4yefZ1.js',
]

const fail = []

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableFetchError(err) {
  const text = err instanceof Error ? `${err.name} ${err.message} ${err.cause?.code ?? ''}` : String(err)
  return /fetch failed|ECONNRESET|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN|UND_ERR/i.test(text)
}

async function liveFetch(path) {
  const url = path.startsWith('http') ? path : LIVE + path
  let lastError
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(url)
      if (res.ok || !RETRYABLE_HTTP.has(res.status) || attempt === FETCH_ATTEMPTS) {
        return res
      }
      lastError = new Error(`${url} HTTP ${res.status}`)
    } catch (err) {
      if (!isRetryableFetchError(err) || attempt === FETCH_ATTEMPTS) throw err
      lastError = err
    }
    await wait(FETCH_RETRY_MS[attempt - 1] ?? FETCH_RETRY_MS.at(-1))
  }

  throw lastError instanceof Error ? lastError : new Error(`${url} fetch failed`)
}

async function get(path) {
  const url = path.startsWith('http') ? path : LIVE + path
  const res = await liveFetch(path)
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
    const cfgRes = await liveFetch('/.netlify/functions/ops-config')
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

try {
  const statusRes = await liveFetch('/.netlify/functions/email-status')
  const statusText = await statusRes.text()
  if (!statusRes.ok || statusText.trimStart().startsWith('<')) {
    fail.push('live email-status is missing or SPA HTML — invoice email cannot be proven')
  } else {
    const status = JSON.parse(statusText)
    if (status.resendConfigured !== true) {
      fail.push('live email-status reports Resend is not configured — FOOTT cannot be emailed')
    }
    if (status.dryRunSupported === true && status.fromDomainVerified !== true) {
      fail.push(
        `live Resend domain fm985.com.au is not verified (domainStatus=${status.domainStatus ?? 'unknown'}) — NEED JAY: fix DNS in Resend`,
      )
    }
  }
} catch (err) {
  fail.push(`email-status fetch failed: ${err instanceof Error ? err.message : err}`)
}

try {
  const sendRes = await liveFetch('/.netlify/functions/send-invoice')
  const sendText = await sendRes.text()
  if (sendText.trimStart().startsWith('<')) {
    fail.push('live send-invoice is SPA HTML — function is not deployed')
  } else if (sendRes.status !== 405) {
    fail.push(`live send-invoice GET expected 405, got ${sendRes.status}`)
  }
} catch (err) {
  fail.push(`send-invoice fetch failed: ${err instanceof Error ? err.message : err}`)
}

if (fail.length) {
  console.error('verify-live failed:\n' + fail.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}

console.log('verify-live: ok — production is not the stale DEMO deploy')
