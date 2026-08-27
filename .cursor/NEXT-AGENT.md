# NEXT CLOUD AGENT — paste `.cursor/HANDOFF.md` as the whole prompt

**This file is a pointer.** The full brief is `.cursor/HANDOFF.md`.

You are continuing ONE FM 98.5. Benchmark: **80% = gov-ready / send-to-FOOTT without DEMO or invented stats**.

## Model

If you are Grok: do the work you can, then tell Jay to start the **next** run as **Claude Opus** at https://cursor.com/agents. You cannot upgrade yourself.

## Single next action (do this first)

`git pull origin main`. Read `.cursor/HANDOFF.md`. New branch off main.

PR #12 is **merged** (`4a7315f`). Live is still DEMO because GitHub `NETLIFY_AUTH_TOKEN` is unauthorized. Do not empty-commit retry.

**Live ops only if env present.** If `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` missing: `NEED JAY:` one line and continue independent code. Do not fake live mode.

## After that

1. Confirm live `#/ops` — if still `onefm2026`, NEED JAY a new Netlify PAT, then re-run **Deploy to Netlify** on `main`.
2. `npx vite-node scripts/verify-ops-pdfs.ts` — 39,375 + GST + BSB 083-894.
3. Mailto / `devMode` must not mark invoices sent.
4. `npm run truth` + `npm run build` must pass.
5. Public craft: `Home.tsx` / `Listen.tsx` / `Coverage.tsx` / `Story.tsx` — `programGuide.ts` is breakfast source of truth.

Commit, push, open/update a PR. Deploy needs a new Netlify PAT.
