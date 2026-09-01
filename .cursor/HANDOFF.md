# ONE FM 98.5 — paste this into the next agent (Cloud / Claude Opus)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**Netlify site ID:** `8df4de74-d9a8-42ce-9316-61bd06475c94`  
**GitHub `main` is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.**

**CONTINUOUS RUN IS ON.** Do not idle. Do not wait for Jay to start the next agent. Read `.cursor/CONTINUOUS.md`. Arm a 20-minute continue timer. Keep shipping.

## Already true on GitHub `main` (`29fb88a`)

- PR **#26** EXE'd. Support coverage via `coverageCopy.ts` + truth guards.
- PR **#25** EXE'd. Invoice Design Lab — 3 variants (broadcast / on-air / valley) at `#/ops` → Invoice Design tab.
- PR **#24** merged. Home/Listen/Community/OnAirNav coverage strings go through `coverageCopy.ts`.
- PR **#22** EXE'd. `#/coverage` Heartland + listener-scaled dots. `#/broadcast` and `#/social` mounted. Inventory ladder. Named portraits: Di Hunter, Sally Nayler only.
- `#/ops` is LIVE when Netlify has real `VITE_SUPABASE_*` (anon key, not `sb_secret_`).
- Coverage: **39,375** weekly / **189,680** people / **25 towns** / **100km**.
- Standard 30s: **$25 plus GST**. GVL is premium — never “from $25”.
- FOOTT `ONEFM-2026-011` PDF send proven. Do not email `peter@foott.com.au` unless Jay asks.

## Do this run

1. New branch `cursor/<name>-c24f` off latest `main`.
2. `npm run build` must pass.
3. Do not merge without **EXE**. Never merge PR **#13**.
4. After you open a PR, start the next desk immediately.

## Open now

PR **#27** `cursor/sponsor-pages-coverage-c24f` — MediaKit, Football, SponsorshipKit, SalesProposal via `coverageCopy.ts`. Do not merge without **EXE**.

## Next desks (do not wait)

- Leftover `stationStats` on Story, Contact, AudienceAnalytics, Heritage, HorizontalGallery, proposal/contract docs.
- Jay picks invoice design: **A** broadcast / **B** on-air / **C** valley — set default before live batch.
- Stale drafts: recommend **close** #1 #3 #4 #11 (agent lacks close permission — Jay can close). **Do not merge** #8 #10 without rebase. **Never merge #13**.

## NEED JAY (one action)

Pick invoice design **A / B / C** at `#/ops` → Invoice Design tab (default is broadcast).

## Do not

- Force-push. Invent portraits or stats. Market GVL as from $25. Merge #13 as-is. Restart Resend verification. Email Peter at FOOTT unless Jay asks. Bake `sb_secret_` into the browser bundle. Idle after opening a PR.
