# ONE FM 98.5 — paste this into the next agent (Cloud / Claude / Kimi)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**Netlify site ID:** `8df4de74-d9a8-42ce-9316-61bd06475c94`  
**GitHub is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.**

## Benchmark (this is now true on live)

**80% gov-ready** = FOOTT can be sent a real invoice PDF; live `#/ops` is not DEMO; public pages have no invented stats; invoice email does not lie about send.

| Gate | Status (2026-08-27) |
|------|---------------------|
| Logo + invoice PDF | **On live.** FOOTT `ONEFM-2026-011` BSB **083-894**, **$5,500.00**. PDF ~32KB with real logo. |
| Mailto / dry-run honesty | **On live.** Dry-run: `wouldSendTo=peter@foott.com.au`, `sent=false`, `hasPdf=true`. |
| Public truth | **On live.** OG **189,680**. Homepage 39,375 / 25 towns / 1989 / callsign 3ONE. No 185,791, no 78%, no 48/52. |
| Live `#/ops` | **LIVE — not DEMO**. Staff login is Supabase Auth. |
| FOOTT PDF emailed | **Proven.** `fm985.com.au` is **verified**, sending **enabled**. Real `send-invoice` to `accounts@fm985.com.au` (not Peter) returned HTTP 200 `sent=true` messageId `f6ed46c5-c281-4c5d-b17d-43885c3199ba`. |

Cause of the earlier pending 403: `email-status` was restarting Resend verification on every GET. Probe is read-only now. Do not POST verify from GET.

## Do this run (order)

1. `git pull origin cursor/gov-ready-live-gate-c24f`. Stay on this branch (PR #16) unless starting new work (`cursor/<name>-c24f`).
2. `npm run live` must pass. Optional: confirm `accounts@fm985.com.au` received the `[TEST] Invoice pipeline — ONEFM-2026-011` mail.
3. Do not merge without **EXE**. Do not email `peter@foott.com.au` unless Jay asks.
4. Do not fake live mode. Do not upsert the 19-row DEMO batch. Never bake `sb_secret_` into the client.

## Model / desks

- **Grok 4.6 Cloud Agent cannot upgrade itself.** Next coding run: https://cursor.com/agents as **Claude Opus**. Paste this file.
- **Kimi (desktop):** same GitHub repo. Pull `main` only after EXE merge.

## NEED JAY (one action)

Say **EXE** to merge PR #16. Then check `accounts@fm985.com.au` for the pipeline test with `ONEFM-2026-011.pdf`. Do not send FOOTT to Peter unless you mean to invoice him.

## Truth numbers (only these)

- Weekly listeners **39,375** — ABS 2021 via `src/data/townData.ts`
- Broadcast-area population **189,680** — `stationStats.broadcastPopulation`
- **25 towns**, **100km**
- Breakfast: `src/data/programGuide.ts` (`BREAKFAST_ROSTER`) — **not** Plemo
- Photos: `/public/assets/images/` and `/public/brand/` only

## Do not

- Force-push. Invent FOOTT invoice contents. Fake live ops. Empty-commit to retry a 401. Upsert the 19-row DEMO batch into Supabase. Merge without **EXE**. Bake `sb_secret_` into the browser bundle. POST `send-invoice` to `peter@foott.com.au` unless Jay asks. Restart Resend domain verification from `email-status`.
