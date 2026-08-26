# NEXT CLOUD AGENT — paste this as the whole prompt

You are continuing ONE FM 98.5. Benchmark: **80% = gov-ready / send-to-FOOTT without DEMO or invented stats**. Public `/proposal` is a request form. PDFs share `src/lib/pdfLetterhead.ts`. Do not wait. Pull latest. Open PR: invoice real logo + proposal sheet (`cursor/invoice-real-logo-c24f`).

## Single next action (do this first)

**Live ops only if env present.** Check Netlify / this VM for `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. If missing: `NEED JAY: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY on Netlify` and continue other ops work — do not fake live mode.

If present: confirm `#/ops` is LIVE (not DEMO password gate), enquiries/proposals persist.

Then `npm run build`, commit, push, update the PR.

## After that, in order (toward 80%)

1. If Jay says EXE: merge the real-logo PR to main so live `#/ops` invoice + proposal previews match `/public/brand/`.
2. Stripe test on live URL only if `VITE_STRIPE_PUBLISHABLE_KEY` starts with `pk_`. Else NEED JAY one line.
3. Truth grep `src/` for Plemo, unsplash, AI-Enhanced, invented age %.
4. `npx vite-node scripts/verify-ops-pdfs.ts` then pymupdf-extract: proposal has 39,375 + GST; contract/invoice have BSB 083-894.

## Rules

- Never fabricate stats, sponsors, or people photos
- DEMO CRM stays labelled DEMO
- Mailto / devMode must not mark invoices sent
- Desktop — skip Galaxy Fold work
- Leave the next slice started, not a planning doc
