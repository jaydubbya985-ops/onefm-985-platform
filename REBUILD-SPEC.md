# ONE FM — SIX-PAGE REBUILD SPEC (the blueprint)

**Status: APPROVED direction. This document is law for all rebuild sessions.**
Any model executing this spec: read fully before touching code. Do not invent
content, colours, or modules. Home (`src/pages/Home.tsx`) is the reference
implementation — when in doubt, do what Home does.

## The site is SIX pages (Jay's IA, 2026-07-05)

| Page | Route | Absorbs (old pages → fold content in, then redirect) |
|---|---|---|
| HOME | `/` | ✅ DONE — reference implementation |
| LISTEN | `/listen` | Programs (`/programs`), Broadcast Explorer (`/broadcast`) |
| OUR COMMUNITY | `/community` | GVL Football (`/football`), Coverage Map (`/coverage`), Social Hub (`/social`) |
| HISTORY | `/heritage` | Story (`/story`) |
| SPONSOR | `/sponsorship` | Media Kit (`/media-kit`), Audience (`/audience`), Proposal (`/proposal`) |
| DONATE | `/support` | — (focus it) |

Old routes 301-style redirect (HashRouter: `<Navigate to>` routes in App.tsx).
Keep: `/contact`, `/privacy`, `/payment/*`, `/ops` (not part of the six, keep
functional, restyle minimally). NEVER delete old page files until their content
is confirmed absorbed — move, then retire.

## Design laws (violations = rejected work)

1. **Palette**: ink `#0A0A0A`/`#101010`/`#161616`, white, signal red `#E51636`.
   Red is RARE: ticker, live states, labels, one CTA per screen, one stat.
2. **Fluoro law**: lime `#B6FF00` = live data + interaction (hover/focus) ONLY.
   Orange `#FF6A00` reserved for sport contexts. Magenta `#FF2BD6` reserved for
   music/events. ONE fluoro per screen. Fluoro never on backgrounds/headlines.
3. **Type**: Anton (`font-poster`/`font-heading`) for display, uppercase,
   leading ~0.92. Inter for body. JetBrains Mono for tickers/labels only.
4. **Motion**: line-rise reveals (WordReveal/PosterReveal), <900ms to readable,
   once-only, reduced-motion instant. Hover = light (poster-hover, bloom,
   border-beam — classes exist in index.css).
5. **Interaction is design**: every headline, logo, card, and link must DO
   something on hover/touch. Static elements are rejected.
6. **Content**: REAL ONLY. Real people (programGuide.ts), real photos
   (public/assets/images/ + station photos), real stats (stationStats in
   data/pricing.ts). No stock, no lorem, no invented names. If content is
   missing, use fewer modules — never fake it.
7. **Bloom budget**: one glowing element per viewport. Fluoro <5% of pixels.
8. **MiniPlayer occlusion**: every page ends with `pb-32`; no bottom-anchored
   hero text.

## The module kit (src/components/onair/) — assemble pages from THESE

- `OnAirTicker` — red marquee band; props: items[] (live metadata via
  usePlayerMetadata on Home; static real facts elsewhere)
- `PosterHero` — giant Anton headline (lines + StrokeFill words), red pill
  link, sub copy, CTA links; optional `videoReel` (HeroReel pattern) or photo
- `LabelReveal` — "— SECTION" red label (exists: components/motion/)
- `NameWall` — alternating giant-name rows + photo bars (people OR shows OR
  towns — any list of real things with images)
- `FeatureFrame` — red-bordered full-width photo/video link + badge + beam
- `StatsStrip` — 2-4 Anton numerals, ONE red, stroke-hover on whites
- `EditorialCards` — bordered cards: red date/tag, Anton title, body, link
- Existing keepers: LatestInterviews (restyle to EditorialCards look),
  WeeklySchedule, FrequencyTuner (Listen only, recolor red), coverage map
  (Community, per map spec later), DeadAir 404

## Per-page blueprints (top → bottom)

### LISTEN `/listen`
1. OnAirTicker (live) → 2. PosterHero "LISTEN LIVE." + big play button
(useLiveStream), video: none — live waveform canvas recolored red/white
→ 3. NOW/NEXT strip (getCurrentLiveShow) → 4. NameWall = this week's real
presenters (breakfast roster + weekend hosts from programGuide FULL_SCHEDULE)
→ 5. WeeklySchedule (full guide, absorbed from Programs) → 6. EditorialCards =
LatestInterviews feed → 7. "Ways to listen" as 3 quiet cards → StatsStrip.

### OUR COMMUNITY `/community`
1. Ticker (static: 25 towns · GVL · multicultural programs) → 2. PosterHero
"OUR COMMUNITY." video: hero-03-community-festival.mp4 → 3. FeatureFrame GVL
(gvl-action-sprint.jpg, orange-context allowed) + live scores if match day →
4. NameWall = TOWNS (top towns from townData.ts, real populations as sublabels)
→ 5. Coverage map section (absorbed; keep functional map, ON AIR controls
later) → 6. Multicultural programming cards (real, from old Community page) →
7. Community photo strip (real photos) → StatsStrip.

### HISTORY `/heritage`
1. Ticker (static: est 1989 · callsign 3ONE · 37 years) → 2. PosterHero
"SINCE 1989." video: hero-05-river-bridge.mp4 or archive photo → 3. Timeline
(keep existing horizontal gallery, restyle chrome to kit) → 4. NameWall =
DECADES or legends (Sally Nayler '90s, Di Hunter, the 1988 panel — archive
imgs) → 5. Story content absorbed (mission/values as EditorialCards) →
6. FeatureFrame = heritage-original-panel-1988 → StatsStrip.

### SPONSOR `/sponsorship`
1. Ticker (static: 39,375 listeners · 25 towns · from $25/week) → 2. PosterHero
"YOUR BRAND, ON AIR." video: hero-01-aerial-factory.mp4 → 3. StatsStrip (the
reach numbers) FIRST — sell with facts → 4. Package tiers as EditorialCards
(real pricing from data/pricing.ts) → 5. FeatureFrame GVL sponsorship →
6. Audience charts section (absorbed from /audience, recolored, sky-blue data
lines allowed) → 7. Media kit downloads row (absorbed) → 8. Contact/enquiry
form (wired to Supabase contact_enquiries — KEEP WORKING) → red CTA.

### DONATE `/support`
1. Ticker (static: volunteer-run · community-owned · NFP) → 2. PosterHero
"KEEP THE VALLEY ON AIR." → 3. Impact cards (what donations do — real items
from old Support) → 4. Donation tiers + bank transfer details (REAL: NAB
BSB 083-894 Acct 553 219 432) — Stripe pay buttons when keys arrive →
5. Patrons wall (real names already on old page) → 6. Volunteer CTA →
StatsStrip. NO fake payment forms — honest mailto/bank flow until Stripe.

## Execution rules for cheap sessions

- One page per session. Order: LISTEN → OUR COMMUNITY → SPONSOR → HISTORY → DONATE.
- Per page: build new page from kit → move real content across → wire redirects
  for absorbed routes → `npx tsc -b --noEmit` → `npm run build` → commit
  (conventional message) → push → `npx netlify deploy --prod --dir=dist`
  (node at %LOCALAPPDATA%\node-portable\node-v24.16.0-win-x64).
- NO screenshot verification passes (Jay QAs live himself). NO exploratory
  searches. NO new dependencies. NO redesigning the kit — assemble only.
- Jay's text feedback = punch list → fix → redeploy. Done = Jay says done.
