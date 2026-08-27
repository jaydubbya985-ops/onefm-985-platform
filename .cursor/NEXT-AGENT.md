# NEXT CLOUD AGENT — paste `.cursor/HANDOFF.md` as the whole prompt

**This file is a pointer.** The full brief is `.cursor/HANDOFF.md`.

You are continuing ONE FM 98.5. Benchmark: **80% = gov-ready / send-to-FOOTT without DEMO or invented stats**.

## Model

If you are Grok: do the work you can, then tell Jay to start the **next** run as **Claude Opus** at https://cursor.com/agents. You cannot upgrade yourself.

## Single next action (do this first)

`git pull origin cursor/gov-ready-live-gate-c24f`. Read `.cursor/HANDOFF.md`. Stay on that branch (PR #16) unless starting new work (`cursor/<name>-c24f`). Do not merge without **EXE**.

Live `#/ops` is already **LIVE — not DEMO**. DNS for **fm985.com.au** already matches Resend. Domain status was stuck **pending** because every `email-status` GET restarted verification. Probe is now read-only. Do **not** click Verify. Do not change SiteGround DNS.

## After that

1. Confirm `GET /.netlify/functions/email-status` → if `fromDomainVerified: true`, `npm run live` then optional test send to `accounts@fm985.com.au` only.
2. If still pending: wait. Do not restart verification.
3. Do not POST `send-invoice` without `dryRun: true` except that station-inbox test.
4. `npm run build` must pass. Never bake `sb_secret_` into the client.

Commit, push, update PR #16. Deploy from this branch is allowed; merging to `main` is not, until EXE.
