# ONE FM 98.5 — paste this into the next agent (Cloud / Claude / Kimi)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**Netlify site ID:** `8df4de74-d9a8-42ce-9316-61bd06475c94`  
**GitHub is source of truth.** Always `git pull origin main` first.

## Benchmark (stop only when this is true)

**80% gov-ready** = FOOTT can be sent a real invoice PDF; live `#/ops` is not DEMO; public pages have no invented stats; invoice email does not lie about send.

| Gate | Status (2026-08-27) |
|------|---------------------|
| Logo + invoice PDF | **On `main`** (`e511343` + later PRs). FOOTT `ONEFM-2026-011` BSB **083-894**, **$5,500.00**. Not on live until Netlify PAT works. |
| Mailto honesty | **On `main`**. Mailto / billing cycle / reminders / `devMode` do **not** mark sent (`success: false` when no Resend). |
| Public truth | **On `main` plus PR #16.** `/audience` towns from `townData.ts`. OG **189,680**. Community page uses **8** multicultural programs from `programGuide.ts` (not 25+ language communities / 8+). `npm run truth` scans `src/` **and** `index.html`. |
| Live `#/ops` | **Still DEMO.** https://onefmops.netlify.app still serves `index-BJ4yefZ1.js`. Code on the live-gate branch stops LIVE mode from hydrating the 19-row DEMO batch; it upserts only FOOTT + Jason's TV. |
| Deploy | GitHub `NETLIFY_AUTH_TOKEN` is set and **rejected (HTTP 401)**. Empty-commit retries will not fix this. `npm run live` (`scripts/verify-live.mjs`) is the production gate after a successful deploy. |
| Ops live env | Needs `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in **GitHub Actions secrets** (baked at `npm run build`) **and** Netlify site env. |

## Do this run (order)

1. `git pull origin main`. Do not merge PRs unless Jay says **EXE**.
2. New work = new branch `cursor/<name>-c24f`. Never share another agent’s branch.
3. **First:** if live still shows `index-BJ4yefZ1.js`, do **not** empty-commit. The PAT is dead. NEED JAY (below).
4. `npx vite-node scripts/verify-ops-pdfs.ts` then pymupdf (`python3 -m pip install --user pymupdf`).
5. Ops: DEMO until env vars exist. Do not fake live mode. Password already in `AGENTS.md`.
6. If blocked on secrets: post **NEED JAY:** one line. Keep coding independent work.
7. `npm run build` must pass. Commit + push + PR. Deploy needs a **new** Netlify PAT. Then `npm run live` against production.

## Model / desks

- **Grok 4.6 Cloud Agent cannot upgrade itself.** Jay: start next run at https://cursor.com/agents as **Claude Opus** (or GPT 5.6 extra-high). Paste this file.
- **Kimi (desktop):** same GitHub repo. Pull `main`. Paste this file.
- **Cursor Automation:** https://cursor.com/automations — prompt = this file; model = Claude Opus.

## NEED JAY (one action)

Replace GitHub secret `NETLIFY_AUTH_TOKEN` with a **new** Netlify PAT (Netlify → User settings → Applications → New access token), then **Re-run** the failed **Deploy to Netlify** workflow on `main` (do not empty-commit).

Also paste `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` into GitHub Actions secrets **and** Netlify Site settings → Environment variables so `#/ops` can leave DEMO after that deploy.

Site ID must stay `8df4de74-d9a8-42ce-9316-61bd06475c94`.

## Truth numbers (only these)

- Weekly listeners **39,375** — ABS 2021 via `src/data/townData.ts`
- Broadcast-area population **189,680** — `stationStats.broadcastPopulation`
- **25 towns**, **100km**
- Breakfast: `src/data/programGuide.ts` (`BREAKFAST_ROSTER`) — **not** Plemo
- Photos: `/public/assets/images/` and `/public/brand/` only

## Do not

- Force-push. Invent FOOTT invoice contents. Fake live ops. Empty-commit to retry a 401. Upsert the 19-row DEMO batch into Supabase.
