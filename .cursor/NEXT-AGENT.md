# NEXT CLOUD AGENT — paste this as the whole prompt

You are continuing ONE FM 98.5. Benchmark: **80% = gov-ready / send-to-FOOTT without DEMO or invented stats**. Current overall **~44%**. Do not wait. Pull latest. Prefer PR #9 branch if unmerged.

## Single next action (do this first)

**Kill invented audience stats on the public proposal page.** `src/pages/SalesProposal.tsx` still has `[AUDIENCE_AGE_25_34] = 38%` — that number is not sourced. Either:

- Redirect `/proposal` to `#/ops` Proposals (staff-only PDF we already built), **or**
- Strip every unsourced token (38%, AI-assisted copy) and use only `stationStats` / townData.

Public MediaKit/Football/CoverageMap still link to `/proposal`. Fix those links to the truthful path.

Then `npm run build`, commit, push, update the PR.

## After that, in order (toward 80%)

1. Merge-ready PR #9: ops proposal PDF + contract PDF already work. Do not regress BSB `083-894` (`src/lib/bankDetails.ts`).
2. One letterhead helper — invoices, proposals, contracts share one draw-header function (today the header is copied three times).
3. Live ops only if env present; else `NEED JAY: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY on Netlify`. Do not fake live mode.
4. Invoice email: real send or honest mailto. Never claim sent if it was not.
5. Stripe test on live URL only if `VITE_STRIPE_PUBLISHABLE_KEY` starts with `pk_`. Else NEED JAY one line.
6. Truth grep `src/` for Plemo, unsplash, AI-Enhanced, invented age %.

## Rules

- Never fabricate stats, sponsors, or people photos
- DEMO CRM stays labelled DEMO
- Desktop — skip Galaxy Fold work
- Leave the next slice started, not a planning doc
