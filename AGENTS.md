# ONE FM 98.5 Platform — Agent Instructions

Government community broadcaster (Goulburn Valley Community Radio Inc.). **Never use fake data, stock images, or fabricated stats on public pages.**

## Repo

- **GitHub:** `jaydubbya985-ops/onefm-985-platform` branch `main`
- **Live:** https://onefmops.netlify.app
- **Netlify site ID:** `8df4de74-d9a8-42ce-9316-61bd06475c94`
- **Stack:** Vite + React + TypeScript, Tailwind, Supabase (ops), Netlify

## Commands

```bash
npm ci
npm run dev          # http://localhost:3000
npm run build        # must pass before deploy
npx netlify deploy --prod --dir=dist
```

## Truth data (mandatory)

- Weekly listeners: **39,375** (source: `src/data/townData.ts` / ABS 2021)
- **25 towns**, **100km** radius — not national stream totals
- Program data: `src/data/programGuide.ts` (source: fm985.com.au/guide/)
- Photos: `src/lib/stationPhotos.ts` → `/public/assets/images/` only
- **No "Plemo"** — breakfast is ONE FM Breakfast with rotating hosts (Tim Ahemt, The Big G, Ralph Whitehead, Josh Revens)
- Mark ops demo data with `// DEMO DATA` in `src/components/ops/data/`

## Key files

| Area | Files |
|------|-------|
| Homepage | `src/pages/Home.tsx` (full page — do not replace with minimal stub) |
| Stream | `src/lib/streamConfig.ts`, `src/hooks/useLiveStream.ts` |
| Brand V3 | `src/lib/brand.ts`, `public/brand/`, `tailwind.config.js` |
| Programs | `src/data/programGuide.ts`, `src/pages/Programs.tsx` |
| Invoices | `src/components/ops/InvoiceEmailTemplate.tsx` |
| Ops | `src/pages/OpsPortal.tsx`, Supabase env required for live |

## Ops portal (Supabase)

- **Project URL:** `https://myarjdatdtchmkgdpsab.supabase.co`
- **Project ref:** `myarjdatdtchmkgdpsab`
- **Schema:** run `supabase-schema-all.sql` in Supabase SQL Editor (once)
- **Netlify env:** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (from Project Settings → API)
- Without env vars, `#/ops` stays in demo mode (password `onefm2026`)

## Supabase MCP (Cursor)

Project-scoped MCP for database, migrations, edge functions, and logs.

| File | Purpose |
|------|---------|
| `.cursor/mcp.json` | Live MCP config (project ref only — no secrets) |
| `.cursor/mcp.json.example` | Template for other devs |
| `.agents/skills/supabase/` | Installed agent skills (gitignored) |

**Authenticate (Jay — one-time, in Cursor UI):**

1. **Settings → Tools & MCP** (or Cursor Settings → MCP)
2. Find **supabase** server → **Connect** / **Authenticate**
3. Browser opens → log in to Supabase → grant access to org with this project
4. **Reload window** (Cmd/Ctrl+Shift+P → “Reload Window”)
5. Verify: ask agent “List tables using Supabase MCP” — tools should appear under MCP

Agents **cannot** complete OAuth from the terminal; this step must be done in Cursor.

**Claude Code CLI equivalent** (if using Claude outside Cursor):

```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=myarjdatdtchmkgdpsab"
claude /mcp   # then select supabase → Authenticate
```

**Install / refresh agent skills:**

```bash
npx skills add supabase/agent-skills
```

**Security:** Prefer dev project only; use `?read_only=true` on the MCP URL if querying production-adjacent data. Review each MCP tool call before approving.

## Parallel agents (do not collide)

**This Cursor cloud agent = invoicing / collect.** Owns `src/components/ops/**`, `src/lib/stationBank.ts`, `src/lib/logoForPdf.ts`, `src/lib/invoice*.ts`. Do not start other projects in this thread.

**Kimi (desktop) = public site.** New branch off `main`. Must not edit any ops/invoice files above. One prompt, one shippable public-page result, then stop.

Jay: keep prompting this invoicing agent with one invoice at a time (`Next dollar. Open it. PDF. Stop.`). Paste the Kimi block below into Kimi at the same time.

### KIMI — paste this now (public site only)

```
You are working on GitHub jaydubbya985-ops/onefm-985-platform.

DO NOT TOUCH: src/components/ops/**, src/lib/stationBank.ts, src/lib/logoForPdf.ts, src/lib/invoiceAging.ts, src/lib/invoiceDocument.test.ts, InvoiceEmailTemplate, InvoiceBatchSender, InvoiceGenerator. Another agent owns invoicing.

Pull origin main. Create branch cursor/public-truth-kimi. Work only on the public site.

1. Grep src/pages and src/data for: Plemo, unsplash, lorem, "million listeners", AI-Enhanced, stock people photos.
2. Breakfast must be ONE FM Breakfast with rotating hosts from src/data/programGuide.ts (Tim Ahemt, The Big G, Ralph Whitehead, Josh Revens). No invented hosts.
3. Listener figure only 39,375 weekly / 25 towns / 100km from src/data/townData.ts (ABS 2021). If unknown, "Data pending".
4. Photos only from src/lib/stationPhotos.ts → /public/assets/images/ and /public/brand/. No AI people.
5. Cross-check program names against https://fm985.com.au/guide/ — do not invent shows.
6. npm run build must pass. Commit, push the branch, open a PR to main. Do not merge. Do not deploy.

If blocked: one line starting NEED JAY:
```

## Cursor Cloud specific instructions

1. Always `git pull origin main` before editing.
2. Run `npm run build` before opening a PR or deploying.
3. Deploy: `npx netlify deploy --prod --dir=dist` (needs `NETLIFY_AUTH_TOKEN` secret).
4. Do **not** commit `.env` or secrets.
5. If blocked on credentials or human approval, **stop and leave a clear message** listing exactly what Jay must provide — do not invent workarounds.
6. After meaningful changes: commit, push to `main`, deploy, verify live URL.

## Secrets (add at cursor.com/dashboard → Cloud Agents → Secrets)

Runtime secrets for cloud agents:

| Secret | Purpose |
|--------|---------|
| `VITE_SUPABASE_URL` | Ops portal auth |
| `VITE_SUPABASE_ANON_KEY` | Ops portal auth |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Payments (pk_test_ or pk_live_) |
| `NETLIFY_AUTH_TOKEN` | Deploy from cloud agent |
| `NETLIFY_SITE_ID` | `8df4de74-d9a8-42ce-9316-61bd06475c94` |

Also set the same `VITE_*` vars in **Netlify Dashboard → Site settings → Environment variables** for production builds.

## Mobile / continuous workflow (Jay)

- **Phone:** Cursor app (same account) or https://cursor.com/agents on mobile
- **This chat (desktop):** local folder `Kimi_Agent_ONE FM Project Consolidation/app`
- **Cloud agent:** same GitHub repo — always pull latest `main` first
- **Source of truth:** GitHub `main` → Netlify production
- When you need Jay: say **"NEED JAY:"** then one line (e.g. Netlify login, Stripe key, approve deploy)

## Auto-deploy

Push to `main` triggers `.github/workflows/deploy.yml` → build → Netlify production.

**GitHub repo secrets required:**
- `NETLIFY_SITE_ID` — set ✓
- `NETLIFY_AUTH_TOKEN` — Jay must add (Netlify → User settings → Applications → New access token)
- `VITE_SUPABASE_URL` — optional for build, required for ops portal
- `VITE_SUPABASE_ANON_KEY` — optional for build, required for ops portal

## Non-stop loop (Cloud / Claude / Kimi)

**Continuous run is on.** After EXE, keep coding the next desk. Do not end a run with “start the next agent” as the only action.

**This conversation:** Cloud Agents with `subscribe_timer` must arm a **20-minute** continue timer named `onefm-continuous` (prompt in `.cursor/CONTINUOUS.md`).

**Mobile control:** `.cursor/MOBILE.md` is Jay's phone-first runbook. Use it when Jay needs one concrete action from the Fold instead of a long handoff.

**Overnight (Jay, one click this agent cannot do):** https://cursor.com/automations → new automation → repo `onefm-985-platform` → model **Claude Opus** → prompt = contents of `.cursor/CONTINUOUS.md` → every 2 hours.

**Kimi (desktop):** `git pull origin main`, paste `.cursor/CONTINUOUS.md`. Do not treat a Downloads folder as source of truth.

## Ultra allocations (from 3 September 2026)

Jay is on **Cursor Ultra**. The bar is **6.3×**. Read `.cursor/ULTRA.md` before you ship.

- **WORLD CLASS** is the only pass mark.
- **One deep PR** per run. The stamp factory (coverage + breakfast + GVL hours on every chrome component) is **closed**.
- Would this sit next to ABC Listen without looking like a template? If no, keep working.

## NEXT RUN (copy `.cursor/ULTRA.md` then `.cursor/CONTINUOUS.md`)

Keep shipping. Pull origin main first. Do not merge PRs unless Jay says EXE. Never merge PR #13.

## Current priorities

1. Listen / Home craft a listener would feel — `programGuide.ts` + `townData.ts` + `/public/brand/` + station photos
2. Close conflicting stale drafts #1 #3 #4 #11 (do not merge). Never merge #13. Recommend close on stamp PRs #170–#200
3. Optional: `VITE_SUPABASE_*` in Cloud secrets must be the full URL + **anon** key (never `sb_secret_`)
