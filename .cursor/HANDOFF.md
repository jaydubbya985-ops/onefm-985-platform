# ONE FM 98.5 — paste this into the next agent (Cloud / Claude / Kimi)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**Netlify site ID:** `8df4de74-d9a8-42ce-9316-61bd06475c94`  
**GitHub is source of truth.** Not a stale Downloads folder. Always `git pull origin main` first.

## Benchmark (stop only when this is true)

**80% gov-ready** = FOOTT can be sent a real invoice PDF; live `#/ops` is not DEMO; public pages have no invented stats; invoice email does not lie about send.

| Gate | Done when |
|------|-----------|
| Logo | `#/ops` Invoice + Proposal preview = real `/brand/` lockup (not gold text). PR #12. |
| Proposal PDF | Community Partner PDF has **39,375**, GST, no 38%. |
| Invoice | BSB **083-894**, account `553 219 432`, name `98.5 One FM`. Mailto does **not** mark sent. |
| Truth | No Plemo / unsplash / fake millions / AI-Enhanced on public pages. |
| Ops live | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` on Netlify **and** Cloud Agent secrets. |
| Deploy | New Netlify PAT in GitHub `NETLIFY_AUTH_TOKEN`. |
| Payments | Stripe test key (optional until 80%). |

## Do this run (order)

1. `git pull origin main`. Do not merge PRs unless Jay says **EXE**.
2. If PR #12 is still open: keep logo/proposal work there. New work = **new branch** `cursor/<name>-c24f`. Never share another agent’s branch.
3. `npx vite-node scripts/verify-ops-pdfs.ts` then pymupdf (install: `python3 -m pip install --user pymupdf`).
4. Public site craft (Kimi/Claude): `Home.tsx` / `Listen.tsx` / `Coverage.tsx` / `Story.tsx` — Brand V3 blue+white+red, real photos only, `programGuide.ts` + `townData.ts` only.
5. Ops: DEMO until env vars exist. Do not fake live mode. Password already in `AGENTS.md`.
6. If blocked on secrets: post **NEED JAY:** one line. Keep coding independent work.
7. `npm run build` must pass. Commit + push + PR. Deploy needs Netlify PAT.

## Model / desks

- **This Grok 4.6 Cloud Agent cannot upgrade itself.** Jay: start next run at https://cursor.com/agents as **Claude Opus** (or GPT 5.6 extra-high). Paste this file.
- **Kimi (desktop):** same GitHub repo. Pull `main`. Paste this file. Local path if used: `Kimi_Agent_ONE FM Project Consolidation/app` — treat as checkout of GitHub, not a second source of truth.
- **Claude Code:** `claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=myarjdatdtchmkgdpsab"` then authenticate in the CLI.
- **Cursor Automation:** https://cursor.com/automations — prompt = this file; repo = this; model = Claude Opus; after each PR merge or on a timer. That is the non-stop loop.

## Secrets Jay pastes (never commit)

Cloud Agents → Secrets **and** Netlify env:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `NETLIFY_AUTH_TOKEN` (new PAT — old one 401s)
- `NETLIFY_SITE_ID` = `8df4de74-d9a8-42ce-9316-61bd06475c94`
- Optional: `VITE_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`

Environment Save: https://cursor.com/dashboard/cloud-agents/environments/e/12f6eaa3-4493-4864-b566-b35c84d6e030 (install already has `npm ci` + pymupdf).

## Truth numbers (only these)

- Weekly listeners **39,375** — ABS 2021 via `src/data/townData.ts`
- **25 towns**, **100km**
- Breakfast: `src/data/programGuide.ts` (`BREAKFAST_ROSTER`) — **not** Plemo
- Photos: `/public/assets/images/` and `/public/brand/` only

## Open PRs (do not assume merged)

- Logo + proposal preview: check `gh pr list`
- Do not force-push. Do not invent FOOTT invoice contents.
