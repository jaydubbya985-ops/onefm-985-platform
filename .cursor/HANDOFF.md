# ONE FM 98.5 — paste this into the next agent (Cloud / Claude / Kimi)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**Netlify site ID:** `8df4de74-d9a8-42ce-9316-61bd06475c94`  
**GitHub is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.**

## Benchmark (stop only when this is true)

**80% gov-ready** = FOOTT can be sent a real invoice PDF; live `#/ops` is not DEMO; public pages have no invented stats; invoice email does not lie about send.

| Gate | Status (2026-08-27) |
|------|---------------------|
| Logo + invoice PDF | **On live.** FOOTT `ONEFM-2026-011` BSB **083-894**, **$5,500.00**. Invoice Generator Send looks up store rows. First authenticated LIVE load upserts FOOTT + Jason’s TV only. Staff sign-in required to send. |
| Mailto honesty | **On live.** Invoice mailto / `devMode` / SPA HTML do **not** mark sent. `sb_secret_` is rejected as LIVE credentials. |
| Public truth | **On live.** OG **189,680**. `/gov-ready-gate.txt` reads `og=189680`. `npm run live` passes. Audience shows 39,375 weekly listeners (ABS 2021 via townData). |
| Live `#/ops` | **LIVE — not DEMO** on https://onefmops.netlify.app/#/ops (ops-config function + Netlify site env). Do not merge PR #16 without **EXE** — `main` is still behind this branch. |
| Deploy | Production deploy `6a8fbe00d8613af657b3ddf4` from this branch. Bundle `index-CfDQJh2P.js`. |

## Do this run (order)

1. `git pull origin cursor/gov-ready-live-gate-c24f`. Stay on this branch (PR #16) unless starting new work (`cursor/<name>-c24f`).
2. Run `npm run live`. If it fails, production drifted.
3. Do not merge without **EXE**.
4. Do not fake live mode. Do not upsert the 19-row DEMO batch. Never bake `sb_secret_` into the client.

## Model / desks

- **Grok 4.6 Cloud Agent cannot upgrade itself.** Next coding run: https://cursor.com/agents as **Claude Opus**. Paste this file.
- **Kimi (desktop):** same GitHub repo. Pull `main` only after EXE merge.

## NEED JAY (one action)

Say **EXE** to merge PR #16 so GitHub `main` matches live.

Then sign in at https://onefmops.netlify.app/#/ops with a Supabase staff user and Send FOOTT `ONEFM-2026-011`.

## Truth numbers (only these)

- Weekly listeners **39,375** — ABS 2021 via `src/data/townData.ts`
- Broadcast-area population **189,680** — `stationStats.broadcastPopulation`
- **25 towns**, **100km**
- Breakfast: `src/data/programGuide.ts` (`BREAKFAST_ROSTER`) — **not** Plemo
- Photos: `/public/assets/images/` and `/public/brand/` only

## Do not

- Force-push. Invent FOOTT invoice contents. Fake live ops. Empty-commit to retry a 401. Upsert the 19-row DEMO batch into Supabase. Merge without **EXE**. Bake `sb_secret_` into the browser bundle.
