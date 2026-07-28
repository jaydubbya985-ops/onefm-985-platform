# TECH RUN STATUS — Tue 28 Jul 2026

Jay away, open permission: pull/edit/commit/push `main` when build green. Secrets → NEED JAY.

**Live:** https://onefmops.netlify.app · **Ops:** `#/ops`

---

## Agent A — Reconnaissance + deploy pipeline fix

**Branch:** `cursor/tech-run-reconnaissance-9f62` (base `main`, HEAD at pull time: `48862b3`)

### TL;DR

The invoice **generation + PDF + demo-mode UI** is solid and already matches live `main`. The invoice **send path is broken in production** because Netlify Functions and `netlify.toml` redirects/headers were never actually deployed (root-caused below). Attempting to fix that surfaced a **more urgent, blocking problem: `NETLIFY_AUTH_TOKEN` is now unauthorized against Netlify's API**, even on the exact deploy config that worked on 2026-07-06. **Every future push to `main` will fail to auto-deploy until this token is fixed — this is now the #1 NEED JAY item, above the invoice work.**

### 1. Smoke test — live vs code

- `https://onefmops.netlify.app/` → HTTP 200. Deployed JS entry hash (`index-DG0qzZHD.js`) **matches a fresh local build of current `main`** — live site is not stale, no old "Plemo" deploy.
- No "Plemo" anywhere in source or the deployed bundle. Breakfast data (`src/data/programGuide.ts`) correctly shows Tim Ahemt (Mon–Tue), The Big G / Craig Stott (Wed), Ralph Whitehead (Thu), Josh Revens (Fri).
- `#/ops` code path: `useOpsAccess.ts` auto-switches between Supabase auth and the `onefm2026` demo password gate based on `isSupabaseConfigured()`. No `VITE_SUPABASE_*` secrets are present in this cloud-agent environment, and this run has no way to read Netlify's dashboard env vars — **can't confirm from here whether production Netlify has Supabase configured yet**. If not, `#/ops` is still DEMO MODE live (matches `LAUNCH-CHECKLIST.md` open item).
- No GUI/computer-use executor available in this environment, so the ops portal wasn't clicked through visually this run — verification below is via source, build output, and live HTTP checks only.

### 2. BROKEN — found and fixed this run

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
- **Attempt 1:** added `functions-dir: './netlify/functions'` and `netlify-config-path: './netlify.toml'` to the `nwtgck/actions-netlify@v3.0` step. Broke the next deploy outright — its bundled `esbuild` binary is missing under GitHub's current Node 24 runner (`spawn .../dist/esbuild ENOENT`), a breakage in that third-party action once it's asked to bundle functions.
- **Attempt 2:** replaced the action with the official Netlify CLI (`npx netlify-cli deploy --prod --no-build --dir=dist --auth=... --site=...`), the same tool `AGENTS.md` documents. Failed with `Error: Unauthorized: could not retrieve project`.
- **Attempt 3:** suspected Node-version incompatibility (`netlify-cli`'s deps need Node ≥22.12, workflow was pinned to 20 → `EBADENGINE` warnings). Bumped CI to Node 22. Same `Unauthorized` error, no more engine warnings.
- **Attempt 4:** suspected the `--auth`/`--site` flag form itself (documented CLI bug pattern on Netlify's own forums). Switched to reading `NETLIFY_AUTH_TOKEN`/`NETLIFY_SITE_ID` purely from env vars, no flags. **Still** `Unauthorized: could not retrieve project`.
- **Decisive test:** reverted the deploy step to be **byte-for-byte identical** to the config that successfully deployed on 2026-07-06 (`git diff` against that commit's `deploy.yml` confirms it, modulo one comment). Pushed it. **It also failed — with a bare `Unauthorized`.**
- **Conclusion:** this is not a workflow bug. The exact configuration that worked two weeks ago no longer authenticates against Netlify's API. `NETLIFY_AUTH_TOKEN` has almost certainly expired, been revoked, or `NETLIFY_SITE_ID` no longer matches — something only visible/fixable from the Netlify dashboard. Stopped here per the run's ground rules ("stop only for secrets").
- **Current state:** reverted to the known-good deploy config (§ commit trail below) so there's nothing extra broken once the token is fixed — but **no push to `main` will auto-deploy until `NETLIFY_AUTH_TOKEN` is repaired**, including this run's own commits (unsplash-preconnect removal, docs). The live site itself is unaffected and still serving the last successful 2026-07-06 deploy; it's just now one deploy behind `main`.
- **Once the token is fixed:** re-attempt the `functions-dir`/`netlify-config-path` addition to `nwtgck/actions-netlify@v3.0` (Attempt 1), or move to the Netlify CLI (Attempts 2–4) if that action's `esbuild` bug isn't resolved by then — either should then deploy Functions correctly.
- **RESEND_API_KEY** (Netlify function-runtime env, not GitHub Actions) is still needed on top of all this for `send-invoice` to actually dispatch mail once functions do deploy.

### 3. Truth grep results

| Pattern | Result |
|---|---|
| `Plemo` | None in `src/` |
| `unsplash` (case-insensitive) | Only a stale `<link rel="preconnect" href="https://images.unsplash.com">` in `index.html` — no actual Unsplash image is referenced anywhere in `src/`. **Removed this run** (dead preconnect, contradicts the "no Unsplash" policy even as an unused hint). |
| `lorem` | None |
| `DATA_MISSING` | Present, but only inside `src/data/oneFmScrapedData.json` as `[DATA_MISSING_FROM_SOURCE]` placeholders for fields never scraped from fm985.com.au (presenter/time/host slots). Not currently confirmed whether this file is rendered on any public page — flagged for a follow-up check, not fixed this run. |
| `TODO` / `FIXME` | None |
| `DEMO DATA` | Only tagged in `src/components/ops/data/payments.ts` (`SEED_DONATIONS`, `SEED_MEMBERS`). |
| Bank details | `BSB 083-894` / `Acct 553 219 432` consistent across `InvoiceEmailTemplate.tsx`, `InvoiceGenerator.tsx`, `InvoiceBatchSender.tsx`, `invoiceSend.ts`, `Support.tsx`. No mismatches found. |

#### Data-provenance gap needing Jay's confirmation (not auto-fixed)

`src/components/ops/data/` has three untagged seed files that mix **real named invoices** with what look like **fabricated example rows**:

- `invoices.ts` (`BATCH_INVOICES`, `BILLING_INVOICES`) and `sponsors.ts` (`MOCK_CONTRACTS`) open with **FOOTT Waste Solutions** and **Jason's TV Pty Ltd** — both explicitly called out as real invoices in the workspace truth rules. These should **not** be labelled DEMO DATA.
- `enquiries.ts` (`MOCK_ENQUIRIES`) contains entries like "Urban Grill Restaurant" / "David Chen" in **South Geelong** — outside ONE FM's stated 25-town/100km Goulburn Valley coverage area — which reads as a fabricated placeholder enquiry, not a real lead.
- I did **not** relabel any of this myself: mislabelling a real invoice as DEMO (or vice versa) is a bigger truth risk than leaving it unmarked for one more day. **NEED JAY**: confirm which rows in `enquiries.ts`, `invoices.ts`, and `sponsors.ts` are real vs. seed/example data, so the correct ones can be tagged `// DEMO DATA` per AGENTS.md.

### 4. Module map — `src/components/ops/`

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

### 5. Build status

- `npm ci` — clean, 608 packages, no errors (15 pre-existing audit advisories, unrelated to this run).
- `npm run build` — **passes clean** before and after this run's changes.

### 6. Done this run

- [x] Pulled `main`, confirmed branch is up to date, no conflicts.
- [x] Read `AGENTS.md`, `LAUNCH-CHECKLIST.md`, `REBUILD-SPEC.md`, `CLAUDE-GO-LIVE-SESSION.md`, `README.md`.
- [x] Live smoke test of `/` and the deploy pipeline (no GUI executor available this run — see §1).
- [x] Mapped all ops modules under `src/components/ops/`.
- [x] Full truth grep (`Plemo`, `unsplash`, `lorem`, `DATA_MISSING`, `TODO`/`FIXME`, `DEMO DATA`, bank details).
- [x] **Root-caused and fixed** the Netlify Functions / redirects not deploying (`.github/workflows/deploy.yml`).
- [x] Removed the stale Unsplash preconnect hint from `index.html`.
- [x] `npm run build` verified green before commit.
- [x] Created this status doc + `TECH_RUN_2026-07-28.md`.

### 7. Agent-doable now (next, no secrets needed)

- Verify `oneFmScrapedData.json`'s `[DATA_MISSING_FROM_SOURCE]` fields aren't rendered on any public page (quick grep + trace of imports).
- Once Jay confirms which `enquiries.ts`/`invoices.ts`/`sponsors.ts` rows are real vs. example, add the `// DEMO DATA` tags to the example-only rows.
- **Blocked on NEED JAY #1:** re-adding `functions-dir`/`netlify-config-path` (or the Netlify CLI approach) to deploy Functions correctly — can't verify any of it works until the token is fixed and a deploy actually runs. The three failed approaches are preserved in the commit history and in §2 above so whoever picks this up doesn't repeat them blind.
- Once a deploy succeeds again, re-test `GET /.netlify/functions/send-invoice` and `/api/fm985/*` live to confirm functions are reachable (expect a clean 4xx from the function itself instead of Netlify's generic 404 — full success still needs `RESEND_API_KEY`).

### 8. NEED JAY (Agent A)

1. **`NETLIFY_AUTH_TOKEN` is unauthorized — URGENT, blocks all auto-deploy.** Confirmed by reverting the deploy workflow to the byte-for-byte config that succeeded on 2026-07-06 and re-running it: it now fails with a bare `Unauthorized` from Netlify's API. This is not caused by anything in this run — it will block *any* push to `main` from auto-deploying, for any agent or for Jay, until fixed. **Action needed:** in Netlify → User settings → Applications → Personal access tokens, generate a fresh token, and update the `NETLIFY_AUTH_TOKEN` GitHub repo secret (Settings → Secrets and variables → Actions). While there, double-check `NETLIFY_SITE_ID` still matches the onefmops site's API ID (`8df4de74-d9a8-42ce-9316-61bd06475c94` per `AGENTS.md`).
2. **`RESEND_API_KEY`** (Netlify site env var, function runtime — not `VITE_` prefixed) — required for `send-invoice` to actually dispatch email. Blocked on #1 first (functions can't deploy without a working auto-deploy), then this.
3. **`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`** (Netlify env vars) — without these, `#/ops` stays in DEMO MODE and invoices/enquiries don't persist. Cannot confirm from this environment whether they're already set in Netlify's dashboard.
4. **`VITE_STRIPE_PUBLISHABLE_KEY`** — PAY NOW button stays hidden without it (EFT-only fallback works fine in the meantime).
5. **Confirm real vs. example rows** in `src/components/ops/data/enquiries.ts`, `invoices.ts`, `sponsors.ts` (see §3) so demo rows can be correctly tagged.

*Deploy note: this run's commits are pushed to `main` but **did not auto-deploy** — see NEED JAY #1. Once the token is fixed, either re-push (workflow_dispatch also works) or trigger a manual re-run of the latest `Deploy to Netlify` GitHub Actions run. No manual `netlify deploy` was run from this environment — no Netlify CLI auth token available here either.*

---

## Agent C — Parallel launch polish

**Branch:** `cursor/portal-launch-readiness-31c1` (based on `main` @ `48862b3`)

### Pulled & audited
- `git pull origin main` — already up to date at `48862b3`.
- `LAUNCH-CHECKLIST.md` reviewed — every item not requiring Jay's secrets was already complete from prior runs (invoice email/PDF rewrite, launch blockers, Home hero polish, ops smoke path, truth audit). Nothing actionable left there besides the "Jay runs these" live-verification checklist.
- Verified the invoice-send graceful-failure path already in `main` (`netlify/functions/send-invoice.ts`, `src/lib/invoiceSend.ts`, `src/components/ops/InvoiceGenerator.tsx`, `src/components/ops/InvoiceBatchSender.tsx`): when `RESEND_API_KEY` is absent the function returns a clean 500, the client falls back to a `mailto:` compose window or an explicit "NOT sent — no email service configured" toast/alert. No fake "sent" confirmations anywhere in that path. No code changes needed here.
- Confirmed OpsPortal DEMO MODE gate is already conditional on `isSupabaseConfigured()` — will auto-clear once Jay adds Supabase env vars, no code change needed.
- Confirmed Google Maps fallback + graceful "Map unavailable" empty state already in `CoverageMap.tsx`.
- Confirmed Stripe PAY NOW button already hides itself when `VITE_STRIPE_PUBLISHABLE_KEY` is unset (`InvoiceEmailTemplate.tsx`).

### Truth pass (grep across `src/`, `public/`, root docs)
- `Plemo` — 0 hits in code (only appears in AGENTS.md/RUN-PLAN docs describing the rule itself). Breakfast confirmed as "ONE FM Breakfast" with rotating hosts (Tim Ahemt, The Big G, Ralph Whitehead, Josh Revens) in `src/data/programGuide.ts`.
- `unsplash` — 0 hits (only in doc comments describing the ban).
- `AI-Enhanced` — 0 hits.
- `lorem` — 0 hits.
- "fake listener millions" — 0 hits; weekly listener figure is `39,375` everywhere, always labelled "Est." and sourced from `src/data/pricing.ts` / `townData.ts` (ABS 2021).
- No `href="#"` placeholder links, no `DATA_MISSING`/TODO/FIXME placeholders found in `src/`.

### Shipped
1. **Fixed broken image reference + UTF-8 mojibake** in `src/pages/SocialHub.tsx` and `src/pages/Story.tsx`:
   - `SocialHub.tsx` referenced `/assets/images/culture-riverboat-scenic.jpg`, which doesn't exist in `public/assets/images/`. Corrected to the real file `culture-riverboat-murray.jpg`.
   - Both files had leftover double-encoded UTF-8 (em dashes, middle dots, arrows, emoji) rendering as `â€"`, `Ã—`, `Â·`, `ðŸ"»` etc. — same class of bug already fixed on `Home.tsx` in a prior run (Job 3) but these two files were missed. Fixed via a cp1252→UTF-8 byte-reversal script, verified against every unique mangled sequence in both files (zero unresolved chars) — cosmetic only, no copy/data changes.
   - **Note:** `/social` and `/story` currently redirect to `/community` and `/heritage` respectively per the six-page IA rebuild (`REBUILD-SPEC.md`) — `SocialHub.tsx` and `Story.tsx` are not on any live route right now. Fixed anyway since they're real code with real bugs that would resurface if either page is reinstated, and confirmed via full scan that **zero** actively-routed pages (`Home`, `Listen`, `Football`, `CoverageMap`, `SponsorshipKit`, `AudienceAnalytics`, `SalesProposal`, `Heritage`, `Community`, `Support`, `Contact`, `MediaKit`, `Privacy`, `OpsPortal`) have any mojibake or broken image references.
2. **`ENV_NEED_JAY.md`** — new file with the exact Netlify env var list Jay needs to paste, consolidated from `LAUNCH-CHECKLIST.md`, `.env.example`, and `.cursor/RUN-PLAN.md` (which had drifted slightly out of sync with each other).
3. This status file (Agent C section).

### Verified
- `npm run build` — green (tsc -b && vite build), before and after changes.
- Re-ran the broken-asset scan and mojibake grep after the fix — 0 remaining issues anywhere in `src/`, including all live-routed pages.

### NEED JAY (see `ENV_NEED_JAY.md` for full detail)
1. `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` — ops portal live storage (currently DEMO MODE).
2. `RESEND_API_KEY` — Netlify function env var (not `VITE_`) — real invoice/enquiry email sending.
3. `VITE_STRIPE_PUBLISHABLE_KEY` — enables PAY NOW button on invoices.
4. `VITE_GOOGLE_MAPS_API_KEY` — replaces shared/rate-limited fallback key on Coverage Map.
5. Real sponsor testimonials (content, not a secret) — pages currently say "available on request" by design, no fabricated quotes.

### Out of scope (left untouched per instructions)
- Pleming/FWC references.
- Heritage merge.
- Drive photo sync.

### Note for Jay (not actioned — needs a decision, not a secret)
`jason-working-style` notes list breakfast hosts as *Tim Ahemt (Mon–Tue), Lillian Stone (Wed), Craig Stott (Thu), Di Hunter (Fri)*, but the current `src/data/programGuide.ts` (matching `AGENTS.md`'s truth-data table) has *Tim Ahemt, The Big G, Ralph Whitehead, Josh Revens*. Left as-is since `AGENTS.md` is the mandatory source of truth for this repo and no instruction in this run asked for a roster change — flagging so Jay can confirm which roster is current before anyone edits `programGuide.ts`.

---

## Cross-agent note (Agent A ↔ Agent C, resolved during rebase)

Agent A's `NEED JAY #1` (`NETLIFY_AUTH_TOKEN` unauthorized, blocking all auto-deploy) is the most urgent outstanding item across both runs — it blocks Agent C's fixes (and everyone else's) from reaching the live site even after merge to `main`. See `ENV_NEED_JAY.md` for the consolidated env var list; the Netlify auth token issue is a GitHub Actions repo secret, not a Netlify site env var, and needs to be fixed separately in **Settings → Secrets and variables → Actions**.
