# Overnight public-site swarm — 26 Aug 2026

Jay is away ~7 hours. This is the public-site upgrade, **not** invoicing.
Do not edit `src/components/ops/**`, `src/lib/stationBank.ts`, `src/lib/logoForPdf.ts`, invoice files.
Do not merge to `main`. Do not deploy production unless Jay replies.

## Branch

`cursor/overnight-site-upgrade-6802` off `origin/main`.

## Already shipped this session

- Presenter wall no longer labels a van/truck/control room as a host face
- Shared `src/data/onAirPeople.ts` + `presenterAssets.ts` fallbacks
- Heading pop (`HeadlinePop`) on the name wall
- Coverage map **On air** pins from fm985.com.au posts (Yorta Yorta Turtles, Kidstown/Mooroopna, Visitor Centre, GVL finals window)
- Di Hunter keeps the 2014 Carols heritage portrait (filename matches)

## Remaining lanes (cloud agents)

1. **activity** — live WP interviews + featured images, LatestInterviews, no fake dates
2. **player-social** — persistent listen control, strip fake SocialHub engagement, real FB/SoundCloud
3. **motion-pages** — HeadlinePop on Programs, Football, CoverageMap, Heritage h1/h2
4. **photos-hosts** — if Jay drops named JPGs into `/public/photos/hosts/`, wire them; otherwise keep context photos

## Truth

- 39,375 weekly / 25 towns / 100km
- Breakfast: Tim Ahemt Mon–Tue, The Big G Wed, Ralph Whitehead Thu, Josh Revens Fri
- No Plemo, unsplash, invented follower counts, AI people

## Hourly continue

Pick the next unfinished lane. Build must pass. Commit, push, update the PR.
