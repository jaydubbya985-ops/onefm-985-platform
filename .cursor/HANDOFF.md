# ONE FM 98.5 — paste this into the next agent (Cloud / Claude Opus)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**GitHub `main` is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.** Never merge PR **#13**. Never merge **#28** or **#29**.

**ULTRA IS ON (3 September 2026).** Read `.cursor/ULTRA.md`. World class is the only pass mark. One deep PR — not the stamp factory.

**CONTINUOUS RUN IS ON.** Read `.cursor/CONTINUOUS.md`. Keep shipping.

## Already true on GitHub `main` (`1ee8711`)

`main` tip is **#201** (`cursor/ultra-world-class-273d`). Jay has **not EXE’d** anything after that.

- Coverage: **39,375** weekly / **189,680** people / **25 towns** / **100km** — always via `coverageCopy.ts`.
- **39,375** = ABS 2021 via `townData` (`stationStats.weeklyListeners`).
- **189,680** = sum of `townData` `population2026` estimates (`stationStats.broadcastPopulation`). Not ABS 2021. Open PRs #249 / #250 split those sources on public copy — not on `main` yet.
- Standard 30s: **$25 plus GST**. GVL is premium — never “from $25”.
- Invoice design **A · Broadcast Letter** is locked (`STATION_INVOICE_DESIGN_CHOICE`).
- Breakfast is ONE FM Breakfast with rotating hosts (Tim Ahemt, The Big G / Craig Stott, Ralph Whitehead, Josh Revens) — not Plemo.

## First human action

**`EXE PR #205`** (Programs guide: one live row a listener can use). Then the listen/programs stack: #211, #214, #218 (or skip if #243), #221, #225, #227 (or skip if #241), #229, #230.

## Open PRs (do not merge)

The #170–#200 band is mostly **stamp-the-same-copy** (coverage + breakfast + GVL hours on one more page). Recommend **close**, do not stack more of them. Close stamp leftovers **#176 #187 #190 #203**.

Stale/conflicting: **#1 #3 #4 #8 #10 #11** — close manually. **#13** never merge (regresses ops).

Do **not** stamp these leftovers onto a second page (factory is closed):

- Coverage source-split (39,375 vs 189,680) — #249 / #250
- 24/7 removal — #259 did Footer; do not restamp Programs / BroadcastExplorer
- Enquiry / proposal receipt — #253 SponsorshipKit, #273 `/proposal`
- Song-request draft — #263 Programs
- Donate honesty — #261
- Contact office hours / partnerships desk — #247
- Heritage 1988 panel archive — #255
- PlayHQ invented scores — #266
- Mini-player stream errors — #268
- Nav lamp live vs automated — #270
- Melbourne-guide timezone / Overnight Mix — #209 / #212 / #225

## NEED JAY (one action)

Replace the two Cursor Cloud Supabase secrets:

- `VITE_SUPABASE_URL` must be the full Project URL from Supabase Project Settings → API.
- `VITE_SUPABASE_ANON_KEY` must be the anon / publishable key (`eyJ...` or `sb_publishable_...`), never `sb_secret...` / `sb_s...`.

Next human blocker after Supabase: `RESEND_API_KEY` in Netlify for live invoice email — test send one invoice to `jasonstv1@bigpond.com` in Test Mode first.

## Next desks

Pick a leftover that is **not** already an open PR and **not** a stamp above.

1. Listen / Home craft a listener would feel (remaining time, honest presenter) — many play/error PRs already open; do not duplicate.
2. Programs as a usable weekly grid — wait for #205 EXE, or skip if #241 locks the Amrap grid first.
3. Invented titles still on `main`: Football success “sponsorship team will be in touch”; Programs / BroadcastExplorer “24/7” (owned by the Footer 24/7 factory — do not restamp).
4. Keep this file’s `main` SHA matching `git rev-parse --short origin/main` after each EXE.

## Closed factories (do not reopen)

- `formatCoverageShort()` + breakfast roster + GVL hours on another chrome component
- Empty-commit CI retries
- Invented listener pulses, portraits, Stripe links, or “sent” email states
