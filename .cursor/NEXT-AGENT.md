# NEXT CLOUD AGENT — paste `.cursor/HANDOFF.md` as the whole prompt

**This file is a pointer.** The full brief is `.cursor/HANDOFF.md`.

You are continuing ONE FM 98.5. Benchmark: **80% = gov-ready / send-to-FOOTT without DEMO or invented stats**.

## Model

If you are Grok: do the work you can, then tell Jay to start the **next** run as **Claude Opus** at https://cursor.com/agents. You cannot upgrade yourself.

## Single next action (do this first)

`git pull origin cursor/gov-ready-live-gate-c24f`. Read `.cursor/HANDOFF.md`. Stay on that branch (PR #16) unless starting new work (`cursor/<name>-c24f`). Do not merge without **EXE**.

Live `#/ops` is already **LIVE — not DEMO**. `npm run live` fails until **fm985.com.au** apex is verified. NEED JAY: SiteGround DNS — copy the three records from Resend → Domains → fm985.com.au (TXT `resend._domainkey`, MX `send`, TXT `send`) over the failed ones. Do not change Outlook MX.

## After that

1. Confirm `GET /.netlify/functions/email-status` → `fromDomainVerified: true`.
2. Then `npm run live` (includes FOOTT dry-run — never emails Peter).
3. Do not POST `send-invoice` without `dryRun: true`.
4. `npm run build` must pass. Never bake `sb_secret_` into the client.

Commit, push, update PR #16. Deploy from this branch is allowed; merging to `main` is not, until EXE.
