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
| Logo + invoice PDF | **On `main`**. FOOTT `ONEFM-2026-011` BSB **083-894**, **$5,500.00**. Not on live until a Netlify deploy lands. |
| Mailto honesty | **On `main` plus PR #16.** Invoice mailto / billing cycle / reminders / `devMode` do **not** mark sent. Enquiry forms only claim received if Supabase stored the row or an email actually sent. Routed `/listen` song request opens a mailto draft and says **Email draft opened** (`/programs` redirects to `/listen`). |
| Public truth | **On `main` plus PR #16.** OG **189,680**. Community page **8** multicultural programs from `programGuide.ts`. |
| Live `#/ops` | **Still DEMO on production** (`index-BJ4yefZ1.js`). **PR #16 is ready for review** (not draft). LIVE banner when Supabase is configured; DEMO seeds stay in DEMO only; FOOTT + Jason’s TV upserted on first live load. Runtime `/.netlify/functions/ops-config` reads Netlify site env so `#/ops` can go LIVE **without** GitHub `VITE_*` secrets after this function is deployed. Do not merge without **EXE**. |
| Deploy | GitHub `NETLIFY_AUTH_TOKEN` is **401**. Empty-commit retries will not fix this. `npm run live` is the production gate. |

## Do this run (order)

1. `git pull origin main`. Stay on `cursor/gov-ready-live-gate-c24f` (PR #16) unless starting new work (`cursor/<name>-c24f`).
2. If live still shows `index-BJ4yefZ1.js`, do **not** empty-commit.
3. If Jay replied **done** after linking Git or replacing the PAT: do not merge without **EXE**. Re-run Deploy to Netlify on `main` only if the PAT is new; otherwise wait for Netlify’s own build, then `npm run live`.
4. `npm run ops-config` and `npx vite-node scripts/verify-ops-pdfs.ts`.
5. Do not fake live mode. Do not upsert the 19-row DEMO batch.

## Model / desks

- **Grok 4.6 Cloud Agent cannot upgrade itself.** Next coding run: https://cursor.com/agents as **Claude Opus**. Paste this file.
- **Kimi (desktop):** same GitHub repo. Pull `main`. Paste this file.

## NEED JAY (one action)

Open this link, then Link repository → GitHub → `jaydubbya985-ops/onefm-985-platform` → branch **main** → Deploy:

https://app.netlify.com/sites/onefmops/configuration/deploys

Reply **done**. Site ID must stay `8df4de74-d9a8-42ce-9316-61bd06475c94`. Do not generate a PAT.

After that deploy exists, the next one-line ask is: paste `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` into Netlify env (ops-config reads them at request time). Then say **EXE** to merge PR #16.

## Truth numbers (only these)

- Weekly listeners **39,375** — ABS 2021 via `src/data/townData.ts`
- Broadcast-area population **189,680** — `stationStats.broadcastPopulation`
- **25 towns**, **100km**
- Breakfast: `src/data/programGuide.ts` (`BREAKFAST_ROSTER`) — **not** Plemo
- Photos: `/public/assets/images/` and `/public/brand/` only

## Do not

- Force-push. Invent FOOTT invoice contents. Fake live ops. Empty-commit to retry a 401. Upsert the 19-row DEMO batch into Supabase. Merge without **EXE**.
