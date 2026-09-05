/**
 * Fail the build if public/app source still contains invented claims.
 * Run: npm run truth
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('../src', import.meta.url).pathname
const INDEX_HTML = new URL('../index.html', import.meta.url).pathname

/** Phrases that must never ship in src/ (gov-truth). */
const FORBIDDEN = [
  { re: /Plemo/i, why: 'breakfast is ONE FM Breakfast, not Plemo' },
  { re: /unsplash\.com/i, why: 'no stock photography URLs' },
  { re: /AI-Enhanced/i, why: 'no AI-enhanced claims' },
  { re: /AI POWERED/i, why: 'no fake AI caption theatre' },
  { re: /fastest-growing segment/i, why: 'no invented age growth' },
  { re: /Updated 2s ago/i, why: 'no fake live listener pulse' },
  { re: /raised over \$120,000/i, why: 'no invented marathon total' },
  { re: /landmark agreement with the Goulburn Valley League/i, why: 'GVL rights are sourced in stationHistory, not this copy' },
  { re: /78% within 50km/i, why: 'no invented 50km coverage share' },
  { re: /Balanced gender split — 48\/52/i, why: 'gender split must match ABS LGA 49/51' },
  { re: /Real-time insights into who's listening/i, why: 'no fake live audience dashboard copy' },
  { re: /25\+ multicultural programs weekly/i, why: 'programGuide has 8 multicultural slots, not 25+' },
  { re: /reaching a total population of/i, why: 'population is in the broadcast area, not reached' },
  { re: /covering a projected population of/i, why: 'population is in the broadcast area, not covered as reach' },
  { re: /Mooroopna',\s*listeners:\s*3710/, why: '3710 is Echuca listener estimate, not Mooroopna' },
  { re: /12 345 678 901/, why: 'placeholder ABN — station ABN is 92 117 291 771' },
  { re: /registered as a Deductible Gift Recipient/i, why: 'DGR status is data pending — do not claim it' },
  { re: /185,?791/, why: 'stale OG population — use 189,680 from townData / stationStats' },
  { re: /36 years/, why: 'stale year count — licensed 1989 (37 in 2026) or omit years' },
  { re: /25\+ language communities/i, why: 'programGuide has 8 multicultural programs, not 25+ language communities' },
  { re: /8\+ languages/i, why: 'use the exact multicultural program count from programGuide' },
  { re: /never gone dark/i, why: 'unsourced transmitter uptime claim' },
  { re: /pay\.onefm985\.com\.au/i, why: 'hosted pay domain does not exist — use BSB 083-894' },
  { re: /api\.onefm985\.com\.au\/webhooks/i, why: 'webhook domain does not exist' },
  { re: /checkout\.stripe\.com\/pay\?/i, why: 'do not invent Stripe Checkout query URLs' },
  { re: /pk_live_placeholder/i, why: 'do not ship fake Stripe publishable-key placeholders' },
  { re: /Request Received!/, why: 'mailto song request is a draft, not a received request' },
  { re: /Enquiry Sent!/, why: 'enquiry forms must not claim sent unless stored or emailed' },
  { re: /Sent via ONE FM Operations Portal/, why: 'invoice email footer must not claim the message was sent' },
  { re: /GVL Footy Sponsorship · From \$25/i, why: 'GVL is premium — never advertise from $25' },
  { re: /GVL Footy · From \$25/i, why: 'GVL is premium — never advertise from $25' },
  { re: /9 sponsorship tiers from \$25\/week/i, why: 'GVL is premium — never advertise from $25' },
  { re: /FROM \$25\/WEEK · NAMING RIGHTS/i, why: 'GVL is premium — never advertise from $25' },
  { re: /advertise on GVL.{0,40}from \$25/i, why: 'GVL must never be sold from $25' },
  { re: /~100km radius/, why: 'use formatRadius() from coverageCopy — do not hardcode ~100km' },
  { re: /roughly 30 km/, why: 'coverage model is townData / coverageCopy radius, not a 30km city-centre shorthand' },
  { re: /~\$\{stationStats\.broadcastRadiusKm\}/, why: 'use formatRadius() from coverageCopy — do not hardcode ~km' },
  { re: /Peak listening: breakfast/, why: 'do not invent peak listening hours — Radio.co daypart share is data pending' },
  { re: /drive \(4–7pm\)/, why: 'drive 4–7pm is not a programGuide slot and is not a measured peak' },
  { re: /5555 0198/, why: 'placeholder phone — use BRAND.phone (03) 5831 3131' },
  { re: /The World, On the Weekend Dial/i, why: 'multicultural programs are Mon–Wed evenings in programGuide, not weekend' },
  { re: /languages on the weekend dial/i, why: 'multicultural programs are Mon–Wed evenings in programGuide, not weekend' },
  { re: /dangerouslyAllowBrowser/i, why: 'never expose provider API keys directly in the browser bundle' },
  { re: /VITE_OPENAI_API_KEY/i, why: 'OpenAI secret keys must not be Vite/browser environment variables' },
  { re: /AIza[0-9A-Za-z_-]{20,}/, why: 'Google Maps browser keys must come from VITE_GOOGLE_MAPS_API_KEY, not source code' },
  { re: /VITE_RESEND_API_KEY/i, why: 'Resend keys must stay server-side as RESEND_API_KEY, not Vite/browser variables' },
  { re: /api\.resend\.com\/emails/i, why: 'browser code must send email through Netlify functions, not Resend directly' },
  { re: /VITE_PLAYHQ_API_KEY/i, why: 'PlayHQ API keys must stay server-side, not in Vite/browser variables' },
  { re: /planet-fri/, why: 'Planet of Sound is Thursday only in FULL_SCHEDULE — do not invent a Friday slot' },
  { re: /country-fri/, why: 'Good Evening Country is Monday 8–9pm in FULL_SCHEDULE — Friday 7–10pm is NIRS AFL' },
  { re: /regional-voice/, why: 'Do not invent a weekday 12–3 strip that is not on FULL_SCHEDULE' },
]

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(ts|tsx|js|jsx)$/.test(name)) out.push(p)
  }
  return out
}

const hits = []
const files = [
  ...walk(ROOT).map((p) => ({ label: relative(ROOT, p), text: readFileSync(p, 'utf8') })),
  { label: 'index.html', text: readFileSync(INDEX_HTML, 'utf8') },
]
for (const file of files) {
  for (const rule of FORBIDDEN) {
    if (rule.re.test(file.text)) {
      hits.push(`${file.label}: ${rule.why}`)
    }
  }
}

const listen = files.find((f) => f.label === 'pages/Listen.tsx')
if (
  !listen ||
  !listen.text.includes('Email draft opened') ||
  !listen.text.includes('Open email draft')
) {
  hits.push(
    'pages/Listen.tsx: routed song request must open a mailto draft and say so',
  )
}
if (listen && /stationStats/.test(listen.text)) {
  hits.push('pages/Listen.tsx: coverage stats must come from coverageCopy, not stationStats')
}
if (
  !listen ||
  !listen.text.includes('formatWeeklyListenersPlain') ||
  !listen.text.includes('ON_AIR_WEEK')
) {
  hits.push('pages/Listen.tsx: weekly listeners via coverageCopy; on-air wall from ON_AIR_WEEK')
}
if (
  !listen ||
  !listen.text.includes('liveNowFromMetadata') ||
  !listen.text.includes('ON_AIR_WEEK')
) {
  hits.push('pages/Listen.tsx: live hero from liveNowFromMetadata; on-air wall from ON_AIR_WEEK')
}

const home = files.find((f) => f.label === 'pages/Home.tsx')
if (!home || !home.text.includes('liveNowFromMetadata')) {
  hits.push('pages/Home.tsx: hero must show liveNowFromMetadata (programGuide + BREAKFAST_ROSTER)')
}
if (!home || !home.text.includes("formatGuideHours('GVL Match of the Day')")) {
  hits.push('pages/Home.tsx: GVL photo badge hours must come from formatGuideHours / FULL_SCHEDULE')
}
if (
  !home ||
  /On air ever since/i.test(home.text) ||
  !home.text.includes("'Community licence'")
) {
  hits.push(
    'pages/Home.tsx: 1989 stat must name the community licence — not leftover On air ever since',
  )
}

const liveNow = files.find((f) => f.label === 'lib/liveNow.ts')
if (
  !liveNow ||
  !liveNow.text.includes('BREAKFAST_SHOW') ||
  !liveNow.text.includes('getBreakfastScheduleLabel') ||
  !liveNow.text.includes('getWeekdayBreakfastHost')
) {
  hits.push('lib/liveNow.ts: weekday breakfast must use BREAKFAST_SHOW / BREAKFAST_ROSTER helpers')
}

const onAirKit = files.find((f) => f.label === 'components/onair/kit.tsx')
if (!onAirKit || !onAirKit.text.includes('onAirWallSub')) {
  hits.push('components/onair/kit.tsx: NameWall hours must come from onAirWallSub / FULL_SCHEDULE')
}

const miniPlayer = files.find((f) => f.label === 'components/MiniPlayer.tsx')
if (!miniPlayer || !miniPlayer.text.includes('liveNowFromMetadata')) {
  hits.push('components/MiniPlayer.tsx: breakfast chrome must use liveNowFromMetadata')
}

const onAirNav = files.find((f) => f.label === 'components/OnAirNav.tsx')
if (!onAirNav || !onAirNav.text.includes('formatBreakfastChromeLabel')) {
  hits.push('components/OnAirNav.tsx: menu footer must show formatBreakfastChromeLabel from programGuide')
}

const guide = files.find((f) => f.label === 'data/programGuide.ts')
if (
  !guide ||
  !guide.text.includes('mergedBreakfastRoster()') ||
  /return 'Mon–Tue: Tim Ahemt/.test(guide.text)
) {
  hits.push('data/programGuide.ts: getBreakfastScheduleLabel must be derived from BREAKFAST_ROSTER')
}
if (
  !guide ||
  !guide.text.includes("timeZone: 'Australia/Melbourne'") ||
  /const day = now\.getDay\(\)/.test(guide.text) ||
  /const hour = now\.getHours\(\)/.test(guide.text)
) {
  hits.push('data/programGuide.ts: live show detection must use Australia/Melbourne time, not viewer/server local time')
}

const community = files.find((f) => f.label === 'pages/Community.tsx')
if (community && /stationStats/.test(community.text)) {
  hits.push('pages/Community.tsx: coverage stats must come from coverageCopy, not stationStats')
}
if (!community || !community.text.includes('formatBroadcastPopulation')) {
  hits.push('pages/Community.tsx: broadcast population must use formatBroadcastPopulation()')
}
if (
  !community ||
  !community.text.includes('multiculturalWhen') ||
  !community.text.includes('Weeknight world programs')
) {
  hits.push(
    'pages/Community.tsx: multicultural cards must show programGuide weeknight hours, not a weekend dial',
  )
}
if (!community || !community.text.includes("formatGuideHours('GVL Match of the Day')")) {
  hits.push('pages/Community.tsx: GVL badge/ticker hours must come from formatGuideHours / FULL_SCHEDULE')
}

const stationHistory = files.find((f) => f.label === 'data/stationHistory.ts')
if (
  !stationHistory ||
  !stationHistory.text.includes('MULTICULTURAL_PROGRAM_COUNT') ||
  /weekend dial/i.test(stationHistory.text)
) {
  hits.push(
    'data/stationHistory.ts: Heritage institution fact must use programGuide weeknight count, not weekend dial',
  )
}

const support = files.find((f) => f.label === 'pages/Support.tsx')
if (
  support &&
  /stationStats\.(totalTowns|weeklyListeners|broadcastPopulation|broadcastRadiusKm)/.test(
    support.text,
  )
) {
  hits.push('pages/Support.tsx: coverage stats must come from coverageCopy')
}
if (!support || !support.text.includes('formatTowns()')) {
  hits.push('pages/Support.tsx: town count must use formatTowns()')
}
if (
  !support ||
  !support.text.includes('formatCoverageShort()') ||
  !support.text.includes('formatWeeklyListenersPlain()')
) {
  hits.push('pages/Support.tsx: leftover coverage must use formatCoverageShort and formatWeeklyListenersPlain')
}

for (const label of ['pages/Story.tsx', 'pages/AudienceAnalytics.tsx']) {
  const page = files.find((f) => f.label === label)
  if (page && /stationStats/.test(page.text)) {
    hits.push(`${label}: public year stats must come from coverageCopy, not stationStats`)
  }
}

const footer = files.find((f) => f.label === 'components/Footer.tsx')
if (
  !footer ||
  !footer.text.includes('formatCoverageShort()') ||
  !footer.text.includes('formatWeeklyListeners()')
) {
  hits.push('components/Footer.tsx: coverage strip must use coverageCopy')
}
if (!footer || !footer.text.includes("formatGuideHours('GVL Match of the Day')")) {
  hits.push('components/Footer.tsx: GVL hours in the coverage strip must come from formatGuideHours / FULL_SCHEDULE')
}
if (!footer || !footer.text.includes("formatGuideHours('NIRS AFL Friday Night Footy')")) {
  hits.push('components/Footer.tsx: NIRS Friday hours in the coverage strip must come from formatGuideHours / FULL_SCHEDULE')
}

const seo = files.find((f) => f.label === 'components/SEO.tsx')
if (!seo || !seo.text.includes('formatSeoDefault()')) {
  hits.push('components/SEO.tsx: default description must use formatSeoDefault()')
}

const explore = files.find((f) => f.label === 'components/home/ExploreOneFMGrid.tsx')
if (
  !explore ||
  !explore.text.includes('BREAKFAST_SHOW') ||
  !explore.text.includes('formatTowns()') ||
  !explore.text.includes("formatGuideHours('GVL Match of the Day')")
) {
  hits.push(
    'components/home/ExploreOneFMGrid.tsx: programs tile from BREAKFAST_SHOW; sport tile hours from formatGuideHours / FULL_SCHEDULE',
  )
}

const siteNav = files.find((f) => f.label === 'lib/siteNav.ts')
if (!siteNav || !siteNav.text.includes('BREAKFAST_SHOW') || !siteNav.text.includes('formatTowns()')) {
  hits.push('lib/siteNav.ts: Program Guide and Community/Donate must use BREAKFAST_SHOW / formatTowns')
}

const gallery = files.find((f) => f.label === 'components/HorizontalGallery.tsx')
if (
  gallery &&
  /stationStats\.(totalTowns|weeklyListeners|broadcastPopulation|broadcastRadiusKm)/.test(gallery.text)
) {
  hits.push('components/HorizontalGallery.tsx: coverage captions must come from coverageCopy')
}
if (
  !gallery ||
  !gallery.text.includes('formatTowns()') ||
  !gallery.text.includes('formatBroadcastPopulation()') ||
  !gallery.text.includes('formatRadius()')
) {
  hits.push('components/HorizontalGallery.tsx: captions must use formatTowns, formatBroadcastPopulation, formatRadius')
}

const indexHtml = files.find((f) => f.label === 'index.html')
if (
  !indexHtml ||
  !indexHtml.text.includes('__ONEFM_OG_DESCRIPTION__') ||
  !indexHtml.text.includes('__ONEFM_META_DESCRIPTION__')
) {
  hits.push('index.html: OG/meta must use Vite coverage placeholders, not hardcoded 25 / 189,680')
}
if (indexHtml && /25 towns/.test(indexHtml.text)) {
  hits.push('index.html: do not hardcode 25 towns — inject formatOgDescription at build')
}

const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url).pathname, 'utf8')
if (!viteConfig.includes('inject-coverage-og') || !viteConfig.includes('stationStats')) {
  hits.push('vite.config.ts: must inject OG description from stationStats')
}

const football = files.find((f) => f.label === 'pages/Football.tsx')
if (
  !football ||
  /GVL Match of the Day is Saturday afternoon/.test(football.text) ||
  !football.text.includes('GVL_MATCH_SLOT.name')
) {
  hits.push(
    'pages/Football.tsx: GVL Match of the Day hours must come from GVL_MATCH_SLOT / FULL_SCHEDULE, not “Saturday afternoon”',
  )
}

const sponsorPages = [
  'pages/SponsorshipKit.tsx',
  'pages/SalesProposal.tsx',
  'pages/MediaKit.tsx',
  'pages/Football.tsx',
]
for (const label of sponsorPages) {
  const page = files.find((f) => f.label === label)
  if (
    page &&
    /stationStats\.(totalTowns|weeklyListeners|broadcastPopulation|broadcastRadiusKm)/.test(
      page.text,
    )
  ) {
    hits.push(`${label}: coverage stats must come from coverageCopy, not stationStats`)
  }
}

const salesProposal = files.find((f) => f.label === 'pages/SalesProposal.tsx')
if (!salesProposal || !salesProposal.text.includes("formatGuideHours('GVL Match of the Day')")) {
  hits.push('pages/SalesProposal.tsx: GVL photo badge hours must come from formatGuideHours / FULL_SCHEDULE')
}

const leftoverProposalDocs = [
  'lib/ai.ts',
  'lib/proposalDocument.ts',
  'lib/contractDocument.ts',
  'components/ops/OpsProposalSheet.tsx',
]
for (const label of leftoverProposalDocs) {
  const file = files.find((f) => f.label === label)
  if (
    file &&
    /stationStats\.(totalTowns|weeklyListeners|broadcastPopulation|broadcastRadiusKm)/.test(
      file.text,
    )
  ) {
    hits.push(`${label}: coverage stats must come from coverageCopy, not stationStats`)
  }
}
if (!files.find((f) => f.label === 'lib/ai.ts')?.text.includes('weeklyListenersValue()')) {
  hits.push('lib/ai.ts: proposal copy must use weeklyListenersValue()')
}
if (
  !files.find((f) => f.label === 'lib/proposalDocument.ts')?.text.includes('weeklyListenersValue()')
) {
  hits.push('lib/proposalDocument.ts: proposal PDF/email must use weeklyListenersValue()')
}
if (
  !files.find((f) => f.label === 'pages/SponsorshipKit.tsx')?.text.includes('coverageStatsStrip')
) {
  hits.push('pages/SponsorshipKit.tsx: stats strip must use coverageStatsStrip()')
}

function assertCoverageCopy(label, requiredFns) {
  const file = files.find((f) => f.label === label)
  if (
    file &&
    /stationStats\.(totalTowns|weeklyListeners|broadcastPopulation|broadcastRadiusKm)/.test(
      file.text,
    )
  ) {
    hits.push(`${label}: coverage stats must come from coverageCopy`)
  }
  for (const fn of requiredFns) {
    if (!file || !file.text.includes(fn)) {
      hits.push(`${label}: must use ${fn}`)
    }
  }
}

assertCoverageCopy('pages/Contact.tsx', [
  'formatTowns()',
  'formatRadius()',
  'formatBroadcastPopulation()',
])
assertCoverageCopy('pages/AudienceAnalytics.tsx', [
  'formatTowns()',
  'formatRadius()',
  'formatWeeklyListenersPlain()',
  'formatBroadcastPopulation()',
])
assertCoverageCopy('pages/Heritage.tsx', ['formatTowns()', 'yearsBroadcastingValue()'])
assertCoverageCopy('pages/Story.tsx', [
  'formatTowns()',
  'formatRadius()',
  'formatBroadcastPopulation()',
])

const mediaKit = files.find((f) => f.label === 'pages/MediaKit.tsx')
if (
  !mediaKit ||
  !mediaKit.text.includes('BREAKFAST_TIME') ||
  !mediaKit.text.includes('Daypart listenership share is data pending')
) {
  hits.push('pages/MediaKit.tsx: breakfast hours from programGuide; daypart peaks are data pending')
}
if (!mediaKit || !mediaKit.text.includes('contactPhone: BRAND.phone')) {
  hits.push('pages/MediaKit.tsx: media-kit DOCX must use BRAND.phone, not a placeholder')
}

const programs = files.find((f) => f.label === 'pages/Programs.tsx')
if (
  !programs ||
  !programs.text.includes('Email Draft Opened') ||
  /Request Received/i.test(programs.text)
) {
  hits.push(
    'pages/Programs.tsx: song request must say a draft opened — not that it was received',
  )
}
if (
  !programs ||
  !programs.text.includes('formatGuideHours') ||
  !programs.text.includes('formatHostHours')
) {
  hits.push(
    'pages/Programs.tsx: featured show and host hours must come from formatGuideHours / formatHostHours',
  )
}

const coverageCopy = files.find((f) => f.label === 'lib/coverageCopy.ts')
if (!coverageCopy || !coverageCopy.text.includes('stationStats.weeklyListeners')) {
  hits.push('lib/coverageCopy.ts: coverage strings must read stationStats')
}
if (
  !coverageCopy ||
  !coverageCopy.text.includes('formatOgDescription') ||
  !coverageCopy.text.includes('formatSeoDefault')
) {
  hits.push('lib/coverageCopy.ts: must export formatOgDescription and formatSeoDefault')
}
const presenterAssets = files.find((f) => f.label === 'lib/presenterAssets.ts')
if (
  !presenterAssets ||
  !presenterAssets.text.includes('heritage-di-hunter-carols-2014') ||
  !presenterAssets.text.includes('heritage-sally-nayler-90s')
) {
  hits.push('lib/presenterAssets.ts: only Di Hunter and Sally Nayler may be named portraits')
}

const opsPayments = files.find((f) => f.label === 'components/ops/data/payments.ts')
for (const required of [
  'DEMO DATA — payment history',
  'DEMO DATA — contract renewal pipeline',
  'DEMO DATA — sponsor acquittal reports',
  'DEMO DATA — client payment rows',
  'DEMO DATA — donations, members, and recurring donors',
]) {
  if (!opsPayments?.text.includes(required)) {
    hits.push(`components/ops/data/payments.ts: missing ${required} label`)
  }
}

const app = files.find((f) => f.label === 'App.tsx')
if (
  !app ||
  !app.text.includes("path=\"/programs\"") ||
  /path=\"\/programs\" element=\{<Navigate to=\"\/listen\"/.test(app.text)
) {
  hits.push('App.tsx: /programs must mount Programs, not redirect to /listen')
}
if (
  !app ||
  !app.text.includes('BroadcastExplorer') ||
  /path=\"\/broadcast\" element=\{<Navigate to=\"\/listen\"/.test(app.text)
) {
  hits.push('App.tsx: /broadcast must mount BroadcastExplorer, not redirect to /listen')
}
if (
  !app ||
  !app.text.includes('SocialHub') ||
  /path=\"\/social\" element=\{<Navigate to=\"\/community\"/.test(app.text)
) {
  hits.push('App.tsx: /social must mount SocialHub, not redirect to /community')
}

if (hits.length) {
  console.error('verify-truth failed:\n' + hits.map((h) => `  ${h}`).join('\n'))
  process.exit(1)
}

console.log('verify-truth: ok')
