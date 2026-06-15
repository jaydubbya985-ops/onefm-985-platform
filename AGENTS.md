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

## Current priorities

1. Keep live site matching `main` (no stale deploys)
2. Wire Netlify env vars for Supabase + Stripe
3. Ops portal: real invoices, not demo data
4. Remove any remaining fake content on Story/Heritage/MediaKit
