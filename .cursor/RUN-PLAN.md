# ONE FM RUN PLAN — Non-stop to 80% gov-ready

**Current score: ~70% of 80% gov-ready bar** (truth + FOOTT PDF + honest send **on `main`**; live `#/ops` still DEMO because Netlify PAT is unauthorized).

Target **80%**: FOOTT can be sent a PDF; ops is not DEMO **on live**; no invented stats on public pages; invoice email does not lie about send.

**Paste for every desk:** `.cursor/HANDOFF.md`

## Live verification (2026-08-27)

| Check | Status |
|------|--------|
| EXE merge | PR #12 merged to `main` (`4a7315f`) |
| GitHub Actions build | Passed (`npm run truth` + `npm run build`) |
| Deploy to Netlify | Failed: `Unauthorized: could not retrieve project`. Token is set and rejected. |
| Live site | Still old DEMO (`onefm2026`, `OpsPortal-DpfuQL4N.js`) |
| `/audience` sourced towns | On `main`, not live |
| Ops portal live (not DEMO) | Needs working deploy **and** `VITE_SUPABASE_*` in GitHub + Netlify env |
| Stripe payments | Needs `VITE_STRIPE_PUBLISHABLE_KEY` |

## Agent continuity (no stop-start)

| Desk | How to ship work |
|------|------------------|
| Cursor Cloud | https://cursor.com/agents — **Claude Opus**, paste `HANDOFF.md` |
| This Grok run | Cannot change model |
| Kimi desktop | `git pull origin main` then paste `HANDOFF.md` |
| Overnight loop | https://cursor.com/automations — prompt = `HANDOFF.md`, model Opus |

## NEED JAY (only if blocked)

1. Replace GitHub `NETLIFY_AUTH_TOKEN` with a **new** Netlify PAT, then re-run **Deploy to Netlify** on `main` (no empty-commit).
2. `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in GitHub Actions secrets and Netlify env.
3. Start next Cloud Agent as Claude Opus with `.cursor/HANDOFF.md`.
