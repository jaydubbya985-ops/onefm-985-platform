# ONE FM RUN PLAN — Non-stop to launch

**Current score: ~50% of 80% gov-ready bar** (not world-class yet). Public `/proposal` is a request form (sourced 39,375 / 25 towns). Remaining: live ops (Supabase env), shared PDF letterhead, honest invoice send.

Target **80%**: FOOTT can be sent a PDF; ops is not DEMO on live; no invented stats on public pages; invoice email does not lie about send.

## Live verification (2026-08-26)

| Check | Status |
|-------|--------|
| Deploy pipeline (push → Netlify) | Working if `NETLIFY_AUTH_TOKEN` is valid |
| Plemo removed | Live shows ONE FM Breakfast hosts |
| Public /proposal (no fake 38%) | This branch — request form, staff send PDF |
| Ops proposals PDF | This branch — Community/Champion/Premier/Signature + football |
| Ops portal live (invoices, Stripe) | Needs env vars |
| Supabase auth | NEED JAY: `VITE_SUPABASE_*` on Netlify |
| Stripe payments | NEED JAY: `VITE_STRIPE_PUBLISHABLE_KEY` |

## Agent continuity

Paste `.cursor/NEXT-AGENT.md` into a new Cloud Agent at https://cursor.com/agents when a session ends. Do not wait for a mobile workflow.

## NEED JAY (only if blocked)

1. Netlify env: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
2. Optional: Cursor Automation on a schedule using NEXT-AGENT.md so work continues overnight
3. Run `supabase-schema-all.sql` (or the new `ops_proposals` columns) in Supabase SQL Editor for live proposal extras

