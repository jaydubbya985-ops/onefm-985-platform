# ONE FM 98.5 — Go-Live Launch Checklist

**Site:** https://onefmops.netlify.app  
**Deploy:** push to `main` → Netlify auto-build  
**ABN:** 92 117 291 771 · **BSB:** 083-894 · **Acct:** 553 219 432

---

## AGENT COMPLETED

### Job 0 — Baseline audit
- [x] `npm run build` passes clean (TypeScript + Vite v7)
- [x] Fixed TypeScript error TS2339 in `coverageGlowCanvas.ts` (Map.getDiv type narrowing)
- [x] No broken image 404s found in `public/assets/images/`
- [x] No Unsplash, lorem ipsum, or dummy data in public-facing pages

### Job 1 — Invoice email + PDF rewrite (Broadcast Letter)
- [x] `src/lib/invoiceDesignSystem.ts` — shared brand tokens (DS.color, DS.rgb, DS.station)
- [x] `generateInvoiceEmailHtml` — Outlook-safe table layout, navy hero, 64px gold amount, 3px gold rule
- [x] `generateReceiptEmailHtml` — same shell with green "PAYMENT RECEIVED" variant
- [x] `generateInvoicePdf` — pure vector jsPDF (no html2canvas), A4, Helvetica, navy header band
- [x] Logo: absolute HTTPS PNG (`https://onefmops.netlify.app/brand/one-fm-logo-primary.png`)
- [x] Bank details throughout: BSB 083-894 / Acct 553 219 432 / 98.5 One FM

### Job 2 — Launch blockers
- [x] `LatestInterviews` — graceful empty state when items.length === 0
- [x] `LatestInterviews` — icon-based error card instead of bare red text
- [x] OpsPortal DEMO MODE banner — gold-toned, friendly, explains what to add in Netlify
- [x] All public image references verified — no 404s

### Job 3 — Home hero Phase A polish
- [x] `Home.tsx` — all UTF-8 mojibake in code comments fixed (ΓòÉ / Γö sequences → ASCII)
- [x] Ticker comment `4├ù` → `4x`
- [x] Stats: `39,375 Est. Weekly Listeners` label is honest ("Est.")

### Job 4 — Ops portal smoke path
- [x] PDF download button wired to `generateInvoicePdf` (vector jsPDF, not `window.print()`)
- [x] Invoice print preview footer: wrong email + phone corrected
  - Was: `accounts@onefm985.org.au | (03) 9783 2955`
  - Now: `accounts@fm985.com.au | (03) 5831 3131`
- [x] Demo password gate confirmed: `onefm2026` (set in `src/hooks/useOpsAccess.ts`)
- [x] DEMO MODE banner shows when `VITE_SUPABASE_URL` absent

### Job 5 — Truth audit
- [x] No fake names, Unsplash images, lorem ipsum, or inflated stats on public pages
- [x] Home testimonial: unverifiable "Margaret Tresize" → "Rochester Community Member, 2022 Goulburn Valley Floods"
- [x] Football + SponsorshipKit testimonial blocks: deferred to "available on request"
- [x] AudienceAnalytics: "live stream analytics pending Radio.co integration" disclaimer in place

### Coverage map (pre-existing work committed)
- [x] `coverageMapPins.ts` — pin data for advertiser tour
- [x] `coverageMapVisuals.ts` — `mountCoverageGlow`, `pinMarkerIcon`, `buildAdvertiserTour`, `flyTo`
- [x] `coverageGlowCanvas.ts` — canvas-based broadcast glow overlay

---

## NEED JAY

These items require credentials or accounts that only Jay can provide.  
Add them all in **Netlify → Site settings → Environment variables**.

### 1. Supabase (ops portal live storage)
```
VITE_SUPABASE_URL      = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = eyJh... (publishable anon key)
```
- Without these: portal runs in DEMO MODE (local, unsaved)
- With these: real multi-user auth, enquiries/invoices persist to Supabase

### 2. Stripe (online invoice payment buttons)
```
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_...
```
- Without this: PAY NOW button is hidden (EFT instructions shown instead)
- With this: PAY NOW red button appears on invoice emails when a payment link exists

### 3. Google Maps JavaScript API key
```
VITE_GOOGLE_MAPS_KEY = AIzaSy...
```
- Current fallback: hardcoded key in `CoverageMap.tsx:118` — works but is rate-limited
- Replace with a key restricted to onefmops.netlify.app domain

### 4. Email sending (Resend API)
```
RESEND_API_KEY = re_...
```
- Set in Netlify serverless function environment (not VITE_ prefix)
- Used by `/.netlify/functions/send-invoice` for dispatch from ops portal

### 5. SoundCloud / fm985.com.au interview feed
- If interviews show as "temporarily unavailable": the `/.netlify/functions/fm985-proxy` function may need a WordPress REST API key or CORS allowance from fm985.com.au
- Fallback JSON at `src/lib/fm985Feed.ts` → `scrapedFallback()` handles offline gracefully

### 6. Real sponsor testimonials
- Football, SponsorshipKit, and Story pages show "testimonials available on request"
- Replace with real quotes (including name + role + company) once collected
- Add to `src/data/testimonials.ts` (create if needed) — do NOT hardcode unverifiable names

### 7. ACMA license number
- Confirm callsign: **3ONE** · License to broadcast on **98.5 MHz FM**
- Add to `DS.station` in `src/lib/invoiceDesignSystem.ts` if needed on invoices

---

## Pre-deploy checklist (Jay runs these)

- [ ] Push `main` to trigger Netlify build
- [ ] Verify build log is green in Netlify dashboard
- [ ] Open https://onefmops.netlify.app — home page loads, hero shows, player strip visible
- [ ] Navigate to `/#/ops` — DEMO MODE banner shows gold (not red/scary)
- [ ] Enter password `onefm2026` — portal unlocks
- [ ] Invoices tab → create draft invoice → click Download PDF → file saves cleanly
- [ ] Check mobile 375px: hero doesn't overflow, nav hamburger works
- [ ] CoverageMap: map tiles load, broadcast circle visible
- [ ] Contact form: submits without console errors (Netlify Forms or mailto fallback)
- [ ] AudienceAnalytics: disclaimer "live stream analytics pending" visible
