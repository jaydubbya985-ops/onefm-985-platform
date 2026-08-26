# Overnight public-site swarm — 26 Aug 2026

Jay is away ~7 hours. This is the public-site upgrade, **not** invoicing.
Do not edit `src/components/ops/**`, `src/lib/stationBank.ts`, `src/lib/logoForPdf.ts`, invoice files.
Do not merge to `main`. Do not deploy production unless Jay replies.

## Branch

`cursor/overnight-site-upgrade-6802` off `origin/main`. PR **#11**.

## Already shipped

- Presenter wall context photos + Di Hunter heritage portrait
- `HeadlinePop` on name wall, Programs, Football, Coverage, Heritage, Support, Media Kit, Home feeds, Footer, Contact, Social Hub, Audience
- Coverage **On air** pins from fm985.com.au posts
- Latest interviews + recent activity (WP scan; no August 2026 interview posts in API)
- Listen hero play/pause + HashRouter MiniPlayer
- Honest Social Hub (Facebook + SoundCloud, no fake hearts)
- **`/programs` route restored** (was redirecting to `/listen`)
- GVL finals window on Football (H&A closed 22 Aug, first weekend 29–30 Aug) — no invented clubs
- OG/LCP: weekly listeners 39,375; hero poster preload
- Truth: stripped invented NFP 100+, social follower 4,000, podcast 500, fake audience heatmap/trends/+31% match-day lifts
- Cookie banner sits **above** MiniPlayer so Accept is not covered
- Story.tsx leftover “100+ NFPs” stripped (page still redirects to Heritage)

## Remaining (hourly continue)

1. Named host JPGs if Jay drops them in `/public/photos/hosts/`
2. More WP pins only when new posts exist (latest still 27 Jul 2026)

Cookie QA, `/broadcast`, Community town photos, Home GVL finals badge: done.
Coverage **On air recently** cards pan the map to WP pins. Nav includes Broadcast Grid. Community languages = guide show count (not “8+”). Population copy is 2026 est., not “people reached”.

## Stop

Stop spawning new work after **21:20 UTC 26 Aug 2026**

## Truth

- 39,375 weekly / 25 towns / 100km
- Breakfast: Tim Ahemt Mon–Tue, The Big G Wed, Ralph Whitehead Thu, Josh Revens Fri
- No Plemo, unsplash, invented follower counts, AI people
- Stop spawning new work after **21:20 UTC 26 Aug 2026**
