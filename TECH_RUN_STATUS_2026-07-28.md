# TECH RUN STATUS — Tue 28 Jul 2026 (Agent A)

**Branch:** `cursor/tech-run-reconnaissance-9f62` (base `main`, HEAD at pull time: `48862b3`)
**Live:** https://onefmops.netlify.app · **Ops:** `#/ops`

---

## TL;DR

The invoice **generation + PDF + demo-mode UI** is solid and already matches live `main`. The actual **send path is broken in production** — not because of missing secrets, but because the GitHub Actions Netlify deploy step never ships Netlify Functions or applies `netlify.toml` redirects/headers. Fixed that in this run (see "Fixed now"). Remaining blockers to *real* invoice sending are Jay's Resend/Supabase/Stripe keys — already documented, not new.

---

## 1. Smoke test — live vs code

- `https://onefmops.netlify.app/` → HTTP 200. Deployed JS entry hash (`index-DG0qzZHD.js`) **matches a fresh local build of current `main`** — live site is not stale, no old "Plemo" deploy.
- No "Plemo" anywhere in source or the deployed bundle. Breakfast data (`src/data/programGuide.ts`) correctly shows Tim Ahemt (Mon–Tue), The Big G / Craig Stott (Wed), Ralph Whitehead (Thu), Josh Revens (Fri).
- `#/ops` code path: `useOpsAccess.ts` auto-switches between Supabase auth and the `onefm2026` demo password gate based on `isSupabaseConfigured()`. No `VITE_SUPABASE_*` secrets are present in this cloud-agent environment, and this run has no way to read Netlify's dashboard env vars — **can't confirm from here whether production Netlify has Supabase configured yet**. If not, `#/ops` is still DEMO MODE live (matches `LAUNCH-CHECKLIST.md` open item).
- No GUI/computer-use executor available in this environment, so the ops portal wasn't clicked through visually this run — verification below is via source, build output, and live HTTP checks only.

## 2. BROKEN — found and fixed this run

**Netlify Functions and `netlify.toml` redirects/headers were never deployed to production**, despite existing correctly in the repo since the last go-live session.

- `netlify.toml` declares `[functions] directory = "netlify/functions"` and SPA/API redirects — correct.
- `.github/workflows/deploy.yml` uses `nwtgck/actions-netlify@v3.0` but never passed `functions-dir` or `netlify-config-path` inputs, both of which default to **undefined** (confirmed against the action's README). Without them, the JS client's `deploy()` call never bundles functions or applies the toml's redirects/headers.
- **Proof (before fix):**
  - `GET /.netlify/functions/send-invoice` → Netlify's own 404 page (function not deployed)
  - `GET /.netlify/functions/fm985-proxy` → same 404
  - `GET /api/fm985/wp-json` (should redirect to the proxy function per `netlify.toml`) → 404
  - `GET /this-page-does-not-exist-xyz` (should redirect to `index.html`, status 200, per the catch-all SPA rule) → real Netlify 404
  - `Cache-Control` header on `/assets/*.js` → `public,max-age=0,must-revalidate` instead of the configured `public, max-age=31536000, immutable`
- This explains **both** documented symptoms in `LAUNCH-CHECKLIST.md`: the invoice send function being unreachable, and the fm985 interview proxy's "temporarily unavailable" fallback.
- **First fix attempt:** added `functions-dir: './netlify/functions'` and `netlify-config-path: './netlify.toml'` to the `nwtgck/actions-netlify@v3.0` step. This made the *next* deploy run fail outright — its bundled `esbuild` binary is missing under GitHub's current Node 24 runner (`spawn .../dist/esbuild ENOENT`), a known breakage in that third-party action once it's asked to bundle functions.
- **Actual fix:** replaced the `nwtgck/actions-netlify` action entirely with the official Netlify CLI (`npx netlify-cli deploy --prod --no-build --dir=dist --auth=... --site=...`), which is the same tool documented in `AGENTS.md`. It reads `netlify.toml` (functions, redirects, headers) natively and isn't affected by the third-party action's bundling bug. Verified the CLI's flag parsing locally with a fake token (fails cleanly on `Unauthorized`, not on argument parsing).
- **Still needed after this fix:** `RESEND_API_KEY` in Netlify's function-runtime environment (not GitHub Actions) for `send-invoice` to actually send mail — this was already a known NEED JAY item, now it's the *only* remaining blocker on that path instead of one of several.
- **Confirm after this run's deploy completes:** watch the `Deploy to Netlify` GitHub Actions run — if `NETLIFY_AUTH_TOKEN`/`NETLIFY_SITE_ID` repo secrets are valid, this should now go green end-to-end.

## 3. Truth grep results

| Pattern | Result |
|---|---|
| `Plemo` | None in `src/` |
| `unsplash` (case-insensitive) | Only a stale `<link rel="preconnect" href="https://images.unsplash.com">` in `index.html` — no actual Unsplash image is referenced anywhere in `src/`. **Removed this run** (dead preconnect, contradicts the "no Unsplash" policy even as an unused hint). |
| `lorem` | None |
| `DATA_MISSING` | Present, but only inside `src/data/oneFmScrapedData.json` as `[DATA_MISSING_FROM_SOURCE]` placeholders for fields never scraped from fm985.com.au (presenter/time/host slots). Not currently confirmed whether this file is rendered on any public page — flagged for a follow-up check, not fixed this run. |
| `TODO` / `FIXME` | None |
| `DEMO DATA` | Only tagged in `src/components/ops/data/payments.ts` (`SEED_DONATIONS`, `SEED_MEMBERS`). |
| Bank details | `BSB 083-894` / `Acct 553 219 432` consistent across `InvoiceEmailTemplate.tsx`, `InvoiceGenerator.tsx`, `InvoiceBatchSender.tsx`, `invoiceSend.ts`, `Support.tsx`. No mismatches found. |

### Data-provenance gap needing Jay's confirmation (not auto-fixed)

`src/components/ops/data/` has three untagged seed files that mix **real named invoices** with what look like **fabricated example rows**:

- `invoices.ts` (`BATCH_INVOICES`, `BILLING_INVOICES`) and `sponsors.ts` (`MOCK_CONTRACTS`) open with **FOOTT Waste Solutions** and **Jason's TV Pty Ltd** — both explicitly called out as real invoices in the workspace truth rules. These should **not** be labelled DEMO DATA.
- `enquiries.ts` (`MOCK_ENQUIRIES`) contains entries like "Urban Grill Restaurant" / "David Chen" in **South Geelong** — outside ONE FM's stated 25-town/100km Goulburn Valley coverage area — which reads as a fabricated placeholder enquiry, not a real lead.
- I did **not** relabel any of this myself: mislabelling a real invoice as DEMO (or vice versa) is a bigger truth risk than leaving it unmarked for one more day. **NEED JAY**: confirm which rows in `enquiries.ts`, `invoices.ts`, and `sponsors.ts` are real vs. seed/example data, so the correct ones can be tagged `// DEMO DATA` per AGENTS.md.

## 4. Module map — `src/components/ops/`

| Module | File | Data source | Notes |
|---|---|---|---|
| Enquiries | `EnquiryDashboard.tsx` + `data/enquiries.ts` | `MOCK_ENQUIRIES` seed, synced via `store.tsx` → Supabase when configured | See provenance flag above |
| Proposals | `ProposalBuilder.tsx` | store state | Small (253 lines), straightforward |
| Contracts | `ContractManager.tsx` + `contracts/constants.ts`, `contracts/xero.ts` | `MOCK_CONTRACTS` in `data/sponsors.ts` | Real FOOTT/Jason's TV contracts present |
| Sponsors/CRM | `SponsorCRM.tsx` + `data/sponsors.ts` | same as above | 1585 lines |
| Schedule | `BroadcastSchedule.tsx` + `data/schedule.ts` | — | 2194 lines |
| Invoices (generator) | `InvoiceGenerator.tsx` + `data/invoices.ts` | `BATCH_INVOICES`, `BILLING_INVOICES` | Largest module, 2240 lines |
| Invoices (batch send) | `InvoiceBatchSender.tsx` | shares invoice data | Wires to `netlify/functions/send-invoice.ts` (was unreachable, now fixed) |
| Invoice templates | `InvoiceEmailTemplate.tsx` | `BANK_BSB`/`BANK_ACCOUNT`/`STRIPE_CONFIG` exports | Vector jsPDF, Outlook-safe HTML email — per `LAUNCH-CHECKLIST.md` Job 1, already done |
| Billing/Aging | `BillingEngine.tsx` | — | 2527 lines, largest ops file |
| Payments/Donations | `PaymentsModule.tsx` + `data/payments.ts` | `SEED_DONATIONS`/`SEED_MEMBERS` (correctly tagged DEMO DATA) | 2653 lines |
| Shared state | `store.tsx` | localStorage fallback + Supabase sync via `@/lib/opsApi` | Handles both demo and live mode cleanly |

## 5. Build status

- `npm ci` — clean, 608 packages, no errors (15 pre-existing audit advisories, unrelated to this run).
- `npm run build` — **passes clean** before and after this run's changes.

## 6. Done this run

- [x] Pulled `main`, confirmed branch is up to date, no conflicts.
- [x] Read `AGENTS.md`, `LAUNCH-CHECKLIST.md`, `REBUILD-SPEC.md`, `CLAUDE-GO-LIVE-SESSION.md`, `README.md`.
- [x] Live smoke test of `/` and the deploy pipeline (no GUI executor available this run — see §1).
- [x] Mapped all ops modules under `src/components/ops/`.
- [x] Full truth grep (`Plemo`, `unsplash`, `lorem`, `DATA_MISSING`, `TODO`/`FIXME`, `DEMO DATA`, bank details).
- [x] **Root-caused and fixed** the Netlify Functions / redirects not deploying (`.github/workflows/deploy.yml`).
- [x] Removed the stale Unsplash preconnect hint from `index.html`.
- [x] `npm run build` verified green before commit.
- [x] Created this status doc + `TECH_RUN_2026-07-28.md`.

## 7. Agent-doable now (next, no secrets needed)

- Verify `oneFmScrapedData.json`'s `[DATA_MISSING_FROM_SOURCE]` fields aren't rendered on any public page (quick grep + trace of imports).
- Once Jay confirms which `enquiries.ts`/`invoices.ts`/`sponsors.ts` rows are real vs. example, add the `// DEMO DATA` tags to the example-only rows.
- After the workflow fix deploys, re-test `GET /.netlify/functions/send-invoice` and `/api/fm985/*` live to confirm functions are now reachable (expect a clean 4xx from the function itself instead of Netlify's generic 404 — full success still needs `RESEND_API_KEY`).

## 8. NEED JAY

1. **`RESEND_API_KEY`** (Netlify site env var, function runtime — not `VITE_` prefixed) — required for `send-invoice` to actually dispatch email. This is now the single blocker on the invoice send path once the functions-deploy fix goes live.
2. **`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`** (Netlify env vars) — without these, `#/ops` stays in DEMO MODE and invoices/enquiries don't persist. Cannot confirm from this environment whether they're already set in Netlify's dashboard.
3. **`VITE_STRIPE_PUBLISHABLE_KEY`** — PAY NOW button stays hidden without it (EFT-only fallback works fine in the meantime).
4. **Confirm real vs. example rows** in `src/components/ops/data/enquiries.ts`, `invoices.ts`, `sponsors.ts` (see §3) so demo rows can be correctly tagged.
5. **`NETLIFY_AUTH_TOKEN`** — not available in this cloud-agent environment, so this agent cannot run `netlify deploy` directly or confirm live Netlify dashboard env-var state. Relying entirely on the GitHub Actions auto-deploy (confirmed working — last 5 runs on `main` all succeeded) to ship this run's fix.

---

*Deploy note: this run's commits will auto-deploy via `.github/workflows/deploy.yml` on push to `main` (GitHub Actions → Netlify, confirmed working via `gh run list`). No manual `netlify deploy` was run from this environment — no Netlify CLI auth token available here.*
