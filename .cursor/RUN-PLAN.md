# ONE FM RUN PLAN — Non-stop to 80% gov-ready

**Current score: code is past 70%; live site is still the stale DEMO deploy.** Truth + FOOTT PDF + honest send **on `main`**; OG 189,680 + LIVE-without-DEMO-batch **on `cursor/gov-ready-live-gate-c24f`**. Live `#/ops` is still DEMO because Netlify PAT is unauthorized.

Target **80%**: FOOTT can be sent a PDF; ops is not DEMO **on live**; no invented stats on public pages; invoice email does not lie about send.

**Paste for every desk:** `.cursor/HANDOFF.md`

## Live verification (2026-08-27)

| Check | Status |
|------|--------|
| EXE merge | PRs #12, #14, #15 on `main` (`e511343`) |
| GitHub Actions build | Passed on EXE; later pushes fail at Netlify preflight |
| Deploy to Netlify | Failed: HTTP 401. Token is set and rejected. |
| Live site | Still old DEMO (`index-BJ4yefZ1.js`) |
| `/audience` sourced towns | On `main`, not live |
| Ops portal live (not DEMO) | Needs working deploy **and** `VITE_SUPABASE_*` in GitHub + Netlify env |
| Production gate | `npm run live` after deploy |
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
