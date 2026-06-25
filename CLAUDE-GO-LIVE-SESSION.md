# ONE FM 98.5 — Go-Live Tomorrow Session (Claude Code)

**Repo:** `app/` · **Live:** https://onefmops.netlify.app · **Ops:** `#/ops`  
**Deploy:** push `main` → Netlify auto-build

Copy everything below the line into Claude Code.

---

```
═══════════════════════════════════════════════════════════════════
ONE FM 98.5 — GO-LIVE TOMORROW — FULL CODING SESSION
═══════════════════════════════════════════════════════════════════

REPO:  C:\Users\jaydu\Downloads\Kimi_Agent_ONE FM Project Consolidation\app
LIVE:  https://onefmops.netlify.app
OPS:   https://onefmops.netlify.app/#/ops

CLIENT: Jason (Jay Welsh), Vice Chair, ONE FM
ABN: 92 117 291 771 · BSB 083-894 · Acct 553 219 432 · 98.5 One FM

NON-NEGOTIABLES
1. NEVER fake data, stats, people, or photos on PUBLIC pages.
2. pricing.ts = rates only. No photos. OB Drive folders ≠ history archive.
3. npm run build MUST pass before every commit.
4. Commit after EACH job. NEED JAY: for secrets only Jay can paste.
5. OUT OF SCOPE: Heritage merge, Drive photo sync, ops IA consolidation.

BRAND: navy #071D3A · blue #1B458F · gold #D4AF37 · red #E51636
Logo email: https://onefmops.netlify.app/brand/one-fm-logo-primary.png
No rainbow gradients. No Bootstrap rounded cards on invoices.

SESSION: git pull → npm ci && npm run build → jobs in order → LAUNCH STATUS at end

───────────────────────────────────────────────────────────────────
JOB 0 — BASELINE (15 min) · P0
───────────────────────────────────────────────────────────────────
npm ci && npm run build
Grep: DATA_MISSING, placeholder, unsplash, lorem, href="#"
Read .cursor/RUN-PLAN.md and AGENTS.md

───────────────────────────────────────────────────────────────────
JOB 1 — BROADCAST LETTER: INVOICE EMAIL + PDF (90–120 min) · P0 ★★★
───────────────────────────────────────────────────────────────────
CREATE src/lib/invoiceDesignSystem.ts (shared tokens)

REWRITE src/components/ops/InvoiceEmailTemplate.tsx:
- generateInvoiceEmailHtml() — Behance-grade cover letter (hero amount poster)
- generateReceiptEmailHtml() — same shell
- generateInvoicePdf() — KILL html2canvas, vector jsPDF only

Cover email: navy hero → white body → wire-transfer slip → navy footer
PDF: same header geometry + gold rule on A4. ONEFM-{number}.pdf
Keep all interfaces + BANK_BSB + STRIPE_CONFIG exports
Verify: InvoiceGenerator + InvoiceBatchSender

Commit: "Broadcast Letter: premium invoice email and vector PDF"

───────────────────────────────────────────────────────────────────
JOB 2 — LAUNCH BLOCKERS (60 min) · P0
───────────────────────────────────────────────────────────────────
□ Broken image 404s — real assets from public/ or remove block
□ Remove [DATA_MISSING_FROM_SOURCE] from public render paths
□ UTF-8 mojibake on Home.tsx section headers
□ LatestInterviews.tsx — graceful empty state if fm985 proxy fails
□ Replace or remove href="#" dead links:
  - src/pages/BroadcastExplorer.tsx (5)
  - src/pages/SocialHub.tsx (1)
  - src/pages/Support.tsx (1)
□ Ops demo banner when Supabase not configured (OpsPortal.tsx)

Commit: "fix: launch blockers for go-live"

───────────────────────────────────────────────────────────────────
JOB 2b — PAYMENT ROUTES (20 min) · P0
───────────────────────────────────────────────────────────────────
Stripe URLs in InvoiceEmailTemplate point to #/payment/success and #/payment/cancel
but App.tsx has NO routes. Add minimal pages:
- src/pages/PaymentSuccess.tsx
- src/pages/PaymentCancel.tsx
Register in App.tsx. On-brand navy/gold. Invoice ref from query string.

Commit: "fix: add payment success and cancel routes"

───────────────────────────────────────────────────────────────────
JOB 3 — HOME HERO PHASE A (60–90 min) · P1
───────────────────────────────────────────────────────────────────
src/pages/Home.tsx + Layout nav/footer only
Navy hero, gold rule, live player CTA, mobile 375px
Real photos via stationPhotos — no Unsplash

Commit: "design: Phase A home hero for go-live"

───────────────────────────────────────────────────────────────────
JOB 4 — OPS SMOKE PATH (45 min) · P1
───────────────────────────────────────────────────────────────────
#/ops → Invoices → preview → PDF download → copy HTML email
Demo password onefm2026 works without Supabase
Bank BSB 083-894 everywhere

Commit: "ops: invoice smoke path for go-live"

───────────────────────────────────────────────────────────────────
JOB 5 — TRUTH GREP (30 min) · P1
───────────────────────────────────────────────────────────────────
Purge fake/placeholder claims from public pages (not ops demo data)

Commit: "truth: clean public pages for go-live"

───────────────────────────────────────────────────────────────────
JOB 6 — LAUNCH-CHECKLIST.md (20 min) · P1
───────────────────────────────────────────────────────────────────
AGENT COMPLETED + NEED JAY sections:

Netlify → Environment variables → Redeploy:
  VITE_SUPABASE_URL=https://myarjdatdtchmkgdpsab.supabase.co
  VITE_SUPABASE_ANON_KEY=<from Supabase dashboard>
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
  VITE_GOOGLE_MAPS_API_KEY=... (coverage map)

Note: GitHub Actions deploy.yml only injects Supabase + station vars.
Stripe/Maps/OpenAI must be in Netlify env (or add to workflow).

Supabase edge secrets: RESEND_API_KEY, RESEND_FROM, STATION_EMAIL
Schema already applied: supabase-schema-all.sql

Commit: "docs: go-live checklist"

───────────────────────────────────────────────────────────────────
JOB 7 — MOBILE QA (30 min) · P2 if time
───────────────────────────────────────────────────────────────────
/ /contact /sponsorship /football /ops login — fix overflow

OUT OF SCOPE: Heritage, Drive sync, SocialHub→ops merge, DNS, schema changes

END: print LAUNCH STATUS (commits, P0/P1 checkboxes, NEED JAY, risk LOW/MED/HIGH)
```

## Jay — tomorrow morning (10 min)

1. Netlify env vars → redeploy (if you have keys)
2. `#/ops` → Invoices → PDF + email preview
3. Phone-check homepage
4. Sign off or list gaps

## Public site vs real ops

| Tomorrow OK | Needs secrets |
|-------------|---------------|
| Marketing, listen, programs, contact UI | Supabase auth + DB |
| Invoice PDF + preview in demo mode | Resend email send |
| Ops behind demo password | Stripe live pay links |
