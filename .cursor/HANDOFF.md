# ONE FM 98.5 — paste this into the next agent (Cloud / Claude Opus)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**GitHub `main` is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.** Never merge PR **#13**. Never merge **#28** or **#29**.

**ULTRA IS ON (3 September 2026).** Read `.cursor/ULTRA.md`. World class is the only pass mark. One deep PR — not the stamp factory.

**CONTINUOUS RUN IS ON.** Read `.cursor/CONTINUOUS.md`. Keep shipping.

## Already true on GitHub `main` (`a2a0519`)

- PR **#28–#143** batch is on `main` (home/listen craft #51, leftover AI copy #135, invoice Stripe honesty #121, marquee #143).
- Coverage: **39,375** weekly / **189,680** people / **25 towns** / **100km** — always via `coverageCopy.ts`.
- Standard 30s: **$25 plus GST**. GVL is premium — never “from $25”.
- Invoice design **A · Broadcast Letter** is locked (`STATION_INVOICE_DESIGN_CHOICE`).
- Breakfast is ONE FM Breakfast with rotating hosts — not Plemo.

## Open PRs (do not merge)

The #170–#200 band is mostly **stamp-the-same-copy** (coverage + breakfast + GVL hours on one more page). Recommend **close**, do not stack more of them.

Stale/conflicting: **#1 #3 #4 #8 #10 #11** — close manually. **#13** never merge (regresses ops).

## NEED JAY (one action)

Replace the two Cursor Cloud Supabase secrets:

- `VITE_SUPABASE_URL` must be the full Project URL from Supabase Project Settings → API.
- `VITE_SUPABASE_ANON_KEY` must be the anon / publishable key (`eyJ...` or `sb_publishable_...`), never `sb_secret...` / `sb_s...`.

Next human blocker after Supabase: `RESEND_API_KEY` in Netlify for live invoice email — test send one invoice to `jasonstv1@bigpond.com` in Test Mode first.

## Next desks

- Listen / Home craft a listener would feel (remaining time, honest presenter, stream errors).
- Programs as a usable weekly grid.
- Do **not** stamp coverage onto another chrome component.
