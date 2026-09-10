# ONE FM 98.5 Platform — Session Ground Rules

## Cost protection (non-negotiable)
- **Local-first.** All work happens against `npm run dev` at http://localhost:3000. Never run `npm run deploy` or `deploy:preview` unless Jay explicitly asks in this conversation.
- **No cloud services without asking.** No `.env` locally is intentional — the Ops Portal runs in DEMO MODE (password `onefm2026`, all data local/unsaved). Do not add Supabase/Stripe/OpenAI keys or make calls to those services unless asked.
- **Commit in small increments.** Big design jobs are broken into steps, each committed, so an interrupted session never loses finished work. Don't push without asking.

## Project facts
- Vite 7 + React 19 + TypeScript + Tailwind + Radix (shadcn-style, `src/components/ui/`). Hash routing.
- Dev server is **port 3000** (fixed in vite config; `.claude/launch.json` matches).
- Ops Portal: route `#/ops`. Code lives in `src/pages/OpsPortal.tsx`, `src/components/ops/`, `src/lib/opsApi.ts`, `src/hooks/useOpsAccess.ts`, `src/lib/opsConfigResolve.ts`.
- `npm run build` runs verification scripts (`truth`, `ops-config`) before compiling — a failing verify script is a real failure, don't bypass it.

## Working style
- Jay values straight answers over reassurance. If something is broken, half-done, or a bad idea, say so plainly.
- The design bar is world-class: ONE FM is the pilot for a platform intended for the whole community-radio sector.
- Verify visual changes in the browser at localhost:3000 before calling them done.
