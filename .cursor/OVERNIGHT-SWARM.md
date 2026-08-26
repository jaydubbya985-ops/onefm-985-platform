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

**WRAP 20:58 UTC 26 Aug 2026.** Stopped. Hourly timer unsubscribed. Do not merge. Do not deploy.

1. Named host JPGs if Jay drops them in `/public/photos/hosts/`
2. More WP pins only when new posts exist (latest still 27 Jul 2026)
3. Figma MCP still needs Jay OAuth

Public area population is the **25-town sum 189,680** (townData), not the 185,791 scrape. Social Hub is in About nav. 404 offers Listen / Programs / Coverage.
Heritage gallery no longer claims 25+ languages, never-dark transmitter, or standing MCG coverage. Multicultural count is the current program-guide show list.

Cookie QA, `/broadcast`, Community town photos, Home GVL finals badge: done.
Coverage **On air recently** cards pan the map to WP pins. Nav includes Broadcast Grid. Community languages = guide show count (not “8+”). Population copy is 2026 est., not “people reached”.
Public Social Hub no longer downloads ops DEMO Mailchimp leads.

Broadcast Explorer “state-of-the-art / HD suite” copy stripped. Donate account name is the licensed entity. Community menu hover is a town photo, not the OB van.

Contact hero lists **Facebook + SoundCloud only** (no dead Instagram/Twitter/YouTube). Marquee is **On air 24/7**, not “Open 7 Days”. Office-hours 9–5 card replaced with live programming 6AM–10PM. FAQ no longer invents TuneIn/iHeart. Broadcast presenter cards have no dummy social icons. Donate 24/7 label is **On air**, not live-local overnight. Broadcast Listen CTA plays the real Radio.co stream (FM / Web / Radio.co — no Alexa/app claims).

Unsourced `twitter:site @onefm985` removed (Twitter URL is null). Live Amrap guide 26 Aug 2026: Wednesday 4pm is **All Things Rock**, not Thursday Afternoon. Invented Rochester flood quote stripped from Football (and Story). WP latest post still **27 Jul 2026**.

Social Hub templates are Canva **sizes** (Facebook / Square / Story) — not Instagram/TikTok/X accounts. Campaign calendar is the sourced Aug 2026 GVL window only (no invented weekly rounds). Football photo captions no longer claim every premiership / every match day.

Dead “Download Font Package” / Host Portraits kit claims stripped. Heritage gallery GVL caption points at the weekly guide, not “every weekend since the first bounce”.

Listen is the stream (play/pause). The weekly grid lives on Programs only — Listen no longer embeds a second copy.

## Stop

Stop spawning new work after **21:20 UTC 26 Aug 2026**

## Truth

- 39,375 weekly / 25 towns / 100km
- Breakfast: Tim Ahemt Mon–Tue, The Big G Wed, Ralph Whitehead Thu, Josh Revens Fri
- No Plemo, unsplash, invented follower counts, AI people
- Stop spawning new work after **21:20 UTC 26 Aug 2026**
