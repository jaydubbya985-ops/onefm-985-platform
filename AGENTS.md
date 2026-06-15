# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **Vite + React 19 + TypeScript** SPA for **ONE FM 98.5** (a community radio station). It serves both the public marketing site and an internal sales/CRM "Ops" portal from one app. There is no separate backend service to run locally — all external integrations (Supabase, OpenAI, Stripe, Resend, Google Maps, PlayHQ) are optional and gracefully degrade to demo/mock data when their env vars are absent.

### Running / building / testing

Standard scripts live in `package.json`; use them directly:

- Dev server: `npm run dev` → http://localhost:3000 (port set in `vite.config.ts`).
- Build: `npm run build` (runs `tsc -b && vite build`). This currently passes.
- Lint: `npm run lint`. NOTE: lint currently reports pre-existing errors in app source (e.g. `react-hooks/purity` from `Math.random()` in render, a `prefer-const`, and unused vars in `supabase/functions/`). These are not environment issues — do not "fix" them unless that is the task.
- There is no automated test suite (no test runner configured).

### Non-obvious gotchas

- **Hash routing.** The app uses `HashRouter`, so all routes are hash-based. The Ops portal is at `http://localhost:3000/#/ops` (not `/ops`). Other routes: `/#/football`, `/#/coverage`, `/#/programs`, etc.
- **Ops portal access in demo mode.** With no Supabase configured (the default), the Ops portal uses a sessionStorage password gate. The demo password is `onefm2026` (see `src/hooks/useOpsAccess.ts`, `OPS_PASSWORD`). If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set, it instead requires a real Supabase Auth login.
- **"Create Proposal" is hidden for closed enquiries.** In the Enquiries dashboard, the Create Proposal button only appears for enquiries that are not `closed_won` / `closed_lost`. Pick a "New"/"In Progress" enquiry to exercise that flow.
- **Live content proxy.** `vite.config.ts` proxies `/api/fm985/*` → `https://fm985.com.au` to pull live WordPress interviews/news (avoids CORS). Needs outbound internet; the site renders fine without it.
- **Optional env vars** are documented in `.env.example`; copy to `.env` only when testing real integrations. None are required to run or visually test the app.
- The Windows-only `scripts/*.ps1` and `start-dev.cmd` are deploy/backend-wiring helpers, not needed for local dev. `deployed-reference/`, `_mine/`, and `onefm-site-deploy.zip` are reference artifacts, not part of the dev build.
