# Ops Portal Design Audit — 10 Sept 2026

Full visual + code audit of `#/ops`, all 10 tabs, run locally in demo mode at 1280px.
Verdict up front: **strong bones, broken chrome.** The proposal builder with live PDF
preview and the invoice design lab are genuinely good product ideas. But rendering
bugs, incoherent demo data, and marketing-site styling on a work tool keep it far
from world-class. Ranked hit-list below — work top to bottom.

---

## P0 — Broken (fix before any styling work)

> **Status 10 Sept 2026 (Phase 1 done): all four items resolved or re-diagnosed.
> Corrections below — two of the original claims were wrong.**

### 1. ~~Scroll rendering breakage~~ → CORRECTED: capture artifact, not a site bug
The "black voids / displaced nav" seen at deep scroll positions turned out to be
an artifact of the in-app browser pane's screenshot pipeline — reproduced
identically on the public Heritage page. The site scrolls fine. **Jay: worth a
10-second sanity scroll of `#/ops` in your own Chrome to double-confirm.**
Change kept anyway (deliberate, not a bug fix): the ops route now uses native
scroll — Lenis/ScrollTrigger, the custom cursor, and the consent banner are all
disabled on `#/ops` (`src/App.tsx`, `isOps` gate). A work tool wants instant
native scroll, no cursor theatrics, no consent overlay.

### 2. Nested `<button>` inside `<button>` — FIXED
`InvoiceDesignLab.tsx` option cards are now `<div onClick>` wrappers; the inner
Preview/PDF `<Button>`s provide the real controls and keyboard access.
Hydration errors gone; card click verified working.

### 3. Duplicate React keys — FIXED (two real causes found)
- `PaymentsModule.tsx`: `AnimatePresence` had three keyless `TabsContent`
  children (keys were one level down on the motion.divs). Keys added.
- Site-wide nav/footer: `siteNav.ts` has both "Listen Live" and "Program Guide"
  pointing at `/listen`, and Navbar/Footer keyed items by path. Keys now
  `path-label`. (Content question for later: should Program Guide link to
  `/programs` instead? `FOOTER_RESOURCES` already does.)
Verified: 0 duplicate-key warnings on a clean load.

### 4. ~~Four 404s~~ → CORRECTED: expected local-dev behaviour, no fix needed
The 404s are `/.netlify/functions/email-status` probes — that function only
exists on Netlify, not under `npm run dev`. `useEmailServiceStatus` already
handles it honestly ('unknown' → PDF+mailto fallback messaging). Not a bug;
ignore the console noise locally.

---

## P1 — Truth & data coherence (credibility, even in demo mode)

### 5. The numbers contradict each other across tabs
Invoices tab: Outstanding **$1,926.30**. Payments tab: Total Outstanding
**$27,067.48 / 6 invoices pending**. Billing tab: Total Outstanding **$4,386**.
Batch tab: **$64,187.80**. An ops portal whose own tabs disagree about money is
disqualifying for a tool meant to run real station finances — and for selling
the platform to the sector. Fix: one shared demo dataset module, every tab
derives its stats from it, totals reconcile exactly.

### 6. The timeline is incoherent
Enquiries are all dated **May 2025** (16 months stale); invoices are June 2026;
the broadcast schedule is Sept 2026 (current — good). Generate demo dates
relative to "today" so the portal always looks alive.

### 7. The region is incoherent
Enquiries demo data is all **Geelong** businesses (Geelong Soccer Club, Surf
Coast Tigers, Bellarine FC) while invoices correctly use Goulburn Valley
businesses (GVFL, Shepparton Harness Racing Club). ONE FM is Shepparton/GV —
one region, everywhere. Replace the Geelong set.

---

## P2 — Design quality (the world-class gap)

### 8. Marketing hero on a work tool
The ops header is a full-bleed Christmas-parade photo with white text over it —
poor contrast (fails WCAG on several lines), overlapping text in the demo-mode
banner, and it consumes ~700px before any work surface appears. World-class ops
tools (Linear, Stripe Dashboard) use compact utility headers: ~120px, station
wordmark, key totals, done. The photo hero belongs on the public site, not ops.

### 9. Entrance animations too slow for a daily tool
Content staggers in over 2+ seconds per tab switch; before it lands the tab
looks broken/empty (this is how the Payments tab "bug" turned out to be just
slow reveals). Ops motion budget: 150–250ms micro-transitions, no staggered
whole-page reveals, `prefers-reduced-motion` respected.

### 10. Custom cursor suite active on the ops route
`src/components/CustomCursor.tsx` runs a full-viewport canvas waveform trail
(z-index 99994), spotlight glow, lagging ring and blend-mode dot over the ops
portal. On a marketing page: personality. On a spreadsheet-adjacent work tool:
a distraction and a constant RAF/compositing cost. Disable on `#/ops`.

### 11. Truncated labels everywhere
Contracts stat cards: "CONTRACTD…", "EXPIRING…", "AVG. CON…", "FOO…" — labels
that can't be read aren't labels. Table headers truncate ("VALUE (EXCL)").
Tab bar overflows: 10 tabs, last one clipped to "BILL". Either shorten the
copy, size the cards to the copy, or drop the all-caps letterspacing that
inflates width.

### 12. Ten flat tabs is an information-architecture smell
Enquiries · Proposals · Contracts · Sponsors · Schedule · Invoices · Batch Send ·
Invoice Design · Billing · Payments — flat, overflowing, no hierarchy. Group by
job: **Sales** (Enquiries, Proposals, Contracts, Sponsors) · **Money** (Invoices,
Batch, Invoice Design, Billing, Payments) · **Broadcast** (Schedule). Grouped nav
also fixes the overflow.

### 13. Density and rhythm are inconsistent tab to tab
Sponsors kanban: four skinny columns swimming in dead space. Batch Send: a
wall of 9px rows. Contracts: 3 rows of data then 800px of nothing. There's no
shared spacing scale, card anatomy, or table spec. This is the core "design
system" work: one table component, one stat-card component, one density scale,
used by every tab.

### 14. Typography is working against legibility
JetBrains Mono all-caps at ~9px with wide letterspacing is used for nearly every
label — techy, but below comfortable reading size and shouting everywhere means
hierarchy nowhere. Keep mono-caps as an accent (section eyebrows), move labels
and table text to the sans at readable sizes (12px minimum data, 13–14px body).

### 15. Decorative noise between header and content
Blurred photo marquee strips run between the tab bar and the work surface on
several tabs — pure noise on a work screen. Remove on ops.

### 16. Cookie consent banner on an internal tool
The privacy/consent banner overlays ops content. There are no third-party
analytics here and staff aren't "visitors" — suppress it on the ops route.

---

## What's already good (keep)

- **Proposal builder → live PDF preview** — genuinely strong workflow, right idea.
- **Invoice Design lab** — 3 templates with live preview; fix the button nesting, keep the concept.
- **Invoice/payment demo data on the Money tabs** — real GV businesses, plausible amounts, correct references. This is the standard the rest of the data should meet.
- Color-coded status pills; dark theme direction fits the brand; DEMO MODE honesty banner (keep the honesty, fix the overlap).

## Suggested execution order

1. **Bugs** (items 1–4): scroll, buttons, keys, 404s — plus quick removals: cursor, marquees, consent banner on ops (10, 15, 16).
2. **Truth pass** (5–7): one coherent GV demo dataset, relative dates, reconciled totals.
3. **Design system** (8, 11–14): compact ops header, grouped nav, unified table/stat-card/typography specs, density pass — this is the big token spend, do it as one designed system, not tab-by-tab patches.
4. **Motion polish** (9): fast micro-transitions replacing slow reveals.

Verify every change visually at `http://localhost:3000/#/ops` (demo password `onefm2026`) before calling it done.
