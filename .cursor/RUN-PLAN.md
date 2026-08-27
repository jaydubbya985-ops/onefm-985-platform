# ONE FM RUN PLAN — Non-stop to 80% gov-ready

**Current score: ~55% of 80% gov-ready bar** (public truth + PDF kit on `main`; live `#/ops` still DEMO until secrets; logo preview is PR #12 until EXE).

Target **80%**: FOOTT can be sent a PDF; ops is not DEMO on live; no invented stats on public pages; invoice email does not lie about send.

**Paste for every desk:** `.cursor/HANDOFF.md`

## Live verification (2026-08-26)

| Check | Status |
|------|--------|
| Deploy pipeline (push → Netlify) | GitHub Actions 401 until a **new** Netlify PAT is in GitHub `NETLIFY_AUTH_TOKEN` |
| Plemo removed | Live shows ONE FM Breakfast hosts |
| Public /proposal (no fake 38%) | Request form; staff send PDF |
| Shared PDF letterhead | `src/lib/pdfLetterhead.ts` on `main` |
| Ops invoice/proposal **preview** logo | PR #12 — real `/brand/` lockup. Live still old until EXE |
| Ops portal live (not DEMO) | Needs `VITE_SUPABASE_*` on Netlify + Cloud secrets |
| Stripe payments | Needs `VITE_STRIPE_PUBLISHABLE_KEY` |

## Agent continuity (no stop-start)

| Desk | How to ship work |
|------|------------------|
| Cursor Cloud | https://cursor.com/agents — **Claude Opus**, paste `HANDOFF.md` |
| This Grok run | Cannot change model. Bridges + PRs only |
| Kimi desktop | `git pull origin main` then paste `HANDOFF.md`. GitHub is source of truth |
| Claude ("Claw") | Same repo. MCP: project ref `myarjdatdtchmkgdpsab` |
| Overnight loop | https://cursor.com/automations — prompt = `HANDOFF.md`, model Opus |

Environment (Save if not already): https://cursor.com/dashboard/cloud-agents/environments/e/12f6eaa3-4493-4864-b566-b35c84d6e030

## NEED JAY (only if blocked)

1. Cloud Agent + Netlify secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, new `NETLIFY_AUTH_TOKEN`
2. Start next Cloud Agent as Claude Opus with `.cursor/HANDOFF.md`
3. Optional: Cursor Automation on a schedule using `HANDOFF.md`
4. EXE to merge PR #12 when you want live `#/ops` to show the real logo
