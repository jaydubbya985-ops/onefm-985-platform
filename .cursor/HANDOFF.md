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
| Logo + invoice PDF | **On `main` plus PR #16.** FOOTT `ONEFM-2026-011` BSB **083-894**, **$5,500.00**. Invoice Generator Send now looks up store rows (FOOTT), not only local drafts. Not on live until a Netlify deploy lands. |
| Mailto honesty | **On `main` plus PR #16.** Invoice mailto / billing cycle / reminders / `devMode` do **not** mark sent. SPA HTML from missing Netlify functions is not treated as a successful send. Enquiry forms only claim received if Supabase stored the row or an email actually sent. Routed `/listen` song request opens a mailto draft and says **Email draft opened**. |
| Public truth | **On `main` plus PR #16.** OG **189,680**. Community page **8** multicultural programs from `programGuide.ts`. |
| Live `#/ops` | **Still DEMO on production** (`index-BJ4yefZ1.js`, OG still `185,791` / `36 years`). **PR #16 is ready for review**. LIVE via baked `VITE_*`, `window.__ONEFM_OPS__` snippet, or `/.netlify/functions/ops-config`. Lock screen shows **LIVE — not DEMO** once credentials exist. Do not merge without **EXE**. |
| Deploy | GitHub `NETLIFY_AUTH_TOKEN` is **401**. Empty-commit retries will not fix this. `npm run live` is the production gate (accepts snippet in live HTML). |

## Do this run (order)

1. `git pull origin cursor/gov-ready-live-gate-c24f`. Stay on this branch (PR #16) unless starting new work (`cursor/<name>-c24f`).
2. If live still shows `index-BJ4yefZ1.js`, do **not** empty-commit.
3. If Jay replied **done** after dropping the zip or linking Git: do not merge without **EXE**. Run `npm run live`. If OG is 189,680 but `#/ops` is still DEMO, the next one-liner is the Netlify snippet.
4. `npm run ops-config` and `npx vite-node scripts/verify-ops-pdfs.ts`.
5. Do not fake live mode. Do not upsert the 19-row DEMO batch.

## Model / desks

- **Grok 4.6 Cloud Agent cannot upgrade itself.** Next coding run: https://cursor.com/agents as **Claude Opus**. Paste this file.
- **Kimi (desktop):** same GitHub repo. Pull `main`. Paste this file.

## NEED JAY (one action)

Open https://app.netlify.com/sites/onefmops/deploys — drag **`onefmops_drop_phone.zip`** onto Production, reply **done**.

Same zip is on GitHub Actions (PR #16 pack job): https://github.com/jaydubbya985-ops/onefm-985-platform/actions/runs/33039479958 — Artifacts → `onefmops-production-drop`. A newer pack run appears after each push.

After drop, `https://onefmops.netlify.app/gov-ready-gate.txt` must contain `og=189680`. Site ID must stay `8df4de74-d9a8-42ce-9316-61bd06475c94`. Do not generate a PAT.

After that deploy exists, the next one-line ask is a Netlify snippet with the **anon / publishable** key (`eyJ…` or `sb_publishable_…`). Never `sb_secret_`.

```html
<script>
window.__ONEFM_OPS__ = {
  url: 'https://myarjdatdtchmkgdpsab.supabase.co',
  anonKey: 'PASTE_ANON_OR_PUBLISHABLE_KEY'
};
</script>
```

Then say **EXE** to merge PR #16 if the drop did not already put this branch on production.

## Truth numbers (only these)

- Weekly listeners **39,375** — ABS 2021 via `src/data/townData.ts`
- Broadcast-area population **189,680** — `stationStats.broadcastPopulation`
- **25 towns**, **100km**
- Breakfast: `src/data/programGuide.ts` (`BREAKFAST_ROSTER`) — **not** Plemo
- Photos: `/public/assets/images/` and `/public/brand/` only

## Do not

- Force-push. Invent FOOTT invoice contents. Fake live ops. Empty-commit to retry a 401. Upsert the 19-row DEMO batch into Supabase. Merge without **EXE**.
