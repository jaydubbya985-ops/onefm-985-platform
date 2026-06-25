# KIMI AWWARDS SWARM — ONE FM 98.5 Platform

**Mission:** Elevate onefmops.netlify.app to Awwwards-tier craft (Rock Hall · NTS · RTRFM reference tier) while keeping Brand V3 and absolute truth rules.

## Brand V3 (non-negotiable)

| Token | Hex | Usage |
|-------|-----|--------|
| ONE FM Blue | `#1B458F` | Wordmark, headers, primary UI |
| Broadcast White | `#FFFFFF` | Type on dark, reversed lockups |
| 98.5 Red | `#E51636` | Frequency, live/on-air accents |
| Deep Navy | `#071D3A` | Backgrounds, hero bases |
| Heritage Gold | `#D4AF37` | Accent only — totals, highlights, rules |
| Fluoro Cyan | `#00E5FF` | ≤4% UI — live signal, digital glow |

**NOT** black/gold casino palette. No fake stats, people, photos, or testimonials.

## Reference sites (study motion + hierarchy, do not clone)

- [rockhall.com](https://www.rockhall.com) — cinematic scroll, editorial type, museum-grade pacing
- [nts.live](https://www.nts.live) — audio-first sanctuary, minimal chrome, waveform identity
- [rtrfm.com.au](https://rtrfm.com.au) — community radio warmth, honest regional voice

## Truth rules (every squad)

1. **39,375** est. weekly listeners — from `pricing.ts` / `stationStats` only
2. Photos from `/public/assets/images/` (31 files) + root `/public/` hosts only
3. `pricing.ts` = rates only, no photos
4. OB Photos 1 & 2 (Google Drive) = outside broadcast, NOT heritage archive
5. Testimonials = "available on request" until verified quotes exist

## Squad assignments

### Squad A — Home (`Home.tsx`)

**Goal:** Cinematic audio-first hero, strongest type hierarchy, subtle motion.

- Hero: Ken Burns on real regional photos, grain overlay, `font-hero` headline
- Floating "Now on Air" card with real program guide data
- Live strip with waveform bars tied to stream state
- Honest listener stat in descriptor copy
- CTAs: Listen Live · Advertise with Us

**Patterns:** `grain-overlay`, `section-label`, `WaveformIdent` canvas, framer-motion stagger

### Squad B — Listen (`Listen.tsx`)

**Goal:** Sanctuary listening experience — full-bleed, minimal chrome.

- `CinegraphBackground` slot `listenStudio` (studio-control-room poster)
- Canvas waveform ambience (fluoro cyan ≤4%)
- Centered `LivePlayerWidget` in dark void
- Ways to Listen cards below fold

**Reference:** NTS player pages — one focal action, everything else recedes

### Squad C — Coverage (`CoverageMap.tsx`)

**Goal:** Jury-worthy intro sequence, sponsor pin polish.

- Animated hero intro with `font-hero`, stat chips, grain
- Keep existing glow canvas + Google Maps pins intact
- Sponsor CTA strip → `#/coverage`, `#/proposal`, `#/contact`
- Cross-link media kit from hero

**Do not break:** `coverageGlowCanvas.ts`, `coverageMapPins.ts`, map tour

### Squad D — Story / Heritage (`Story.tsx`, `Heritage.tsx`)

**Goal:** Editorial timeline, real milestones, no fabricated archive.

- ACMA licence facts, callsign 3ONE, since 1989
- Real presenter names from program guide only
- Heritage photos: studio exterior, community market, geo aerial

## Shared components to reuse

- `grain-overlay` — `index.css`
- `section-label` — gold rule + tracking
- `font-hero` — display headline scale
- `SponsorCommercialCta` — commercial page footer strip
- `CinegraphBackground` — poster + optional MP4 loops

## Quality bar

| Dimension | Target |
|-----------|--------|
| Typography hierarchy | Hero > H2 > body clearly separated |
| Motion | Purposeful, respects `prefers-reduced-motion` |
| Performance | Lazy routes, canvas only where needed |
| Accessibility | Semantic headings, aria on decorative elements |
| Honesty | Every number traceable to `pricing.ts` or ABS/town data |

## Swarm prompt (paste to parallel agents)

```
You are Squad [A/B/C/D] for ONE FM 98.5 (Brand V3, truth rules above).
Workspace: app/ · Live: onefmops.netlify.app (HashRouter)
Elevate [PAGE] to Rock Hall / NTS / RTRFM tier without fake content.
Use grain-overlay, font-hero, section-label. Minimal focused diffs.
Run npm run build when done. Do not commit unless asked.
```

## Post-swarm verification

1. `npm run build` — zero TS errors
2. Grep `href="#"` on public pages — zero dead links
3. Smoke: Home → Listen → Coverage → Sponsorship → Payment routes
4. Visual: mobile + desktop hero legibility
