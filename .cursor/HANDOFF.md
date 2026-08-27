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
| Logo + invoice PDF | **On live.** FOOTT `ONEFM-2026-011` BSB **083-894**, **$5,500.00**. PDF generates (~32KB, real logo). Invoice Generator Send looks up store rows and **confirms** before emailing. |
| Mailto / dry-run honesty | **On live.** Mailto / `devMode` / SPA HTML / `dryRun` do **not** mark sent. Production dry-run: `wouldSendTo=peter@foott.com.au`, `sent=false`, `hasPdf=true`. |
| Public truth | **On live.** OG **189,680**. `/gov-ready-gate.txt` reads `og=189680`. Audience shows 39,375 weekly listeners (ABS 2021 via townData). |
| Live `#/ops` | **LIVE — not DEMO**. `sb_secret_` is rejected as LIVE credentials. |
| FOOTT actually emailed | **Blocked.** Apex `fm985.com.au` is not verified. Public DNS: `resend._domainkey` is an old TXT; apex SPF has Outlook but not `amazonses.com`. MX is Outlook — leave it. `send.fm985.com.au` already has SES bounce records. |

## Do this run (order)

1. `git pull origin cursor/gov-ready-live-gate-c24f`. Stay on this branch (PR #16) unless starting new work (`cursor/<name>-c24f`).
2. Run `npm run live`. It **must fail** until Resend shows `fm985.com.au` verified.
3. After Jay fixes DNS: `npm run live` should pass, including `npx vite-node scripts/verify-foott-send.ts` (`emailed: false` — dry-run only).
4. Do not merge without **EXE**. Do not email `peter@foott.com.au` as a test.
5. Do not fake live mode. Do not upsert the 19-row DEMO batch. Never bake `sb_secret_` into the client.

## Model / desks

- **Grok 4.6 Cloud Agent cannot upgrade itself.** Next coding run: https://cursor.com/agents as **Claude Opus**. Paste this file.
- **Kimi (desktop):** same GitHub repo. Pull `main` only after EXE merge.

## NEED JAY (one action)

SiteGround DNS for **fm985.com.au** (ns1/ns2.siteground.net):

1. Replace the old **TXT** `resend._domainkey` with the **DKIM CNAME** shown in Resend → Domains → fm985.com.au.
2. Edit the existing SPF TXT: keep `include:spf.protection.outlook.com`, add `include:amazonses.com`. Do not use `-all` until that include is there (current record already has `-all`).
3. **Do not change MX** — Outlook stays for receiving mail.
4. In Resend, click **Verify**.

Then say **EXE** to merge PR #16. Do not send FOOTT to Peter until `email-status` shows `fromDomainVerified: true`.

## Truth numbers (only these)

- Weekly listeners **39,375** — ABS 2021 via `src/data/townData.ts`
- Broadcast-area population **189,680** — `stationStats.broadcastPopulation`
- **25 towns**, **100km**
- Breakfast: `src/data/programGuide.ts` (`BREAKFAST_ROSTER`) — **not** Plemo
- Photos: `/public/assets/images/` and `/public/brand/` only

## Do not

- Force-push. Invent FOOTT invoice contents. Fake live ops. Empty-commit to retry a 401. Upsert the 19-row DEMO batch into Supabase. Merge without **EXE**. Bake `sb_secret_` into the browser bundle. POST to `send-invoice` without `dryRun: true` (that would email Peter).
