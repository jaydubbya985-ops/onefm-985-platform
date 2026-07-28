# ENV VARS — NEED JAY

Paste these into **Netlify → Site settings → Environment variables** for `onefmops.netlify.app` (site ID `8df4de74-d9a8-42ce-9316-61bd06475c94`), then trigger a redeploy (or push to `main`, which auto-deploys).

Also add the same repo secrets in **cursor.com/dashboard → Cloud Agents → Secrets** so cloud agents can build/deploy with them.

## 1. Supabase — ops portal live storage
```
VITE_SUPABASE_URL      = https://myarjdatdtchmkgdpsab.supabase.co
VITE_SUPABASE_ANON_KEY = <publishable/anon key from Supabase Project Settings → API>
```
- Without these: `#/ops` stays in DEMO MODE (password `onefm2026`), nothing persists.
- With these: real staff auth, invoices/enquiries/contacts persist to Supabase.
- Schema: run `supabase-schema-all.sql` once in the Supabase SQL Editor if not already applied.

## 2. Resend — invoice + enquiry email sending (server-side only, NOT a `VITE_` var)
```
RESEND_API_KEY = re_...
```
- Set as a **Netlify function environment variable** (Site settings → Environment variables — no `VITE_` prefix, it must never reach the browser bundle).
- Used by `netlify/functions/send-invoice.ts`.
- Without it: the function returns a clean 500 "Email service not configured" and the ops UI falls back to a `mailto:` compose window — no crash, no fake "sent" confirmation (verified in code, see TECH_RUN_STATUS).

## 3. Stripe — online invoice payment button
```
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_...   (or pk_test_... for a dry run first)
```
- Without this: the red "PAY NOW" button is hidden on invoice emails; EFT bank details (BSB 083-894 / Acct 553 219 432) show instead.
- With this: PAY NOW button appears when a Stripe payment link exists for that invoice.

## 4. Google Maps — Coverage Map page
```
VITE_GOOGLE_MAPS_API_KEY = AIzaSy...
```
- Current code falls back to a shared/rate-limited hardcoded key if this is unset (`src/pages/CoverageMap.tsx`).
- Replace with a key restricted to the `onefmops.netlify.app` domain.
- If the map still fails to load for any reason, the page already shows a graceful "Map unavailable — browse the town list instead" state rather than a blank crash.

## 5. fm985.com.au interview feed (optional)
- If `LatestInterviews` shows "temporarily unavailable": `netlify/functions/fm985-proxy.ts` may need a WordPress REST API allowance/CORS rule from fm985.com.au.
- Fallback: `src/lib/fm985Feed.ts` → `scrapedFallback()` already handles this offline gracefully — no fake interviews are shown.

## 6. Real sponsor testimonials (content, not a secret)
- Football, SponsorshipKit, and Story pages currently say "testimonials available on request" — this is intentional (no fabricated quotes).
- When Jay has real, attributable quotes (name + role + company), add them to a `src/data/testimonials.ts` file.

## Not blocking launch
- ACMA license number / callsign confirmation for invoices (`src/lib/invoiceDesignSystem.ts` → `DS.station`) — cosmetic, add when convenient.

---
*Compiled by Agent C, TECH RUN 2026-07-28. See `TECH_RUN_STATUS_2026-07-28.md` for the full run log.*
