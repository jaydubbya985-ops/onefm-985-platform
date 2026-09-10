# Ops Portal Design Audit — 10 Sept 2026

Full visual + code audit of `#/ops`, all 10 tabs, run locally in demo mode at 1280px.
Verdict up front: **strong bones, broken chrome.** The proposal builder with live PDF
preview and the invoice design lab are genuinely good product ideas. But rendering
bugs, incoherent demo data, and marketing-site styling on a work tool keep it far
from world-class. Ranked hit-list below — work top to bottom.

---

## P0 — Broken (fix before any styling work)

### 1. Scroll rendering breakage on the ops route
At deeper scroll positions the page tears: black voids, the nav bar floating
mid-viewport, content crushed to the bottom edge. Cause: Lenis smooth-scroll +
GSAP ScrollTrigger are wired globally in `src/App.tsx:141` and apply to the ops
portal; when switching ops tabs changes the page height, ScrollTrigger's cached
measurements go stale. Fix: exclude the ops route from Lenis/ScrollTrigger
entirely (an ops tool should use native scroll), or at minimum call
`ScrollTrigger.refresh()` on every tab change. Recommendation: **exclude** —
smooth-scroll inertia on a dense data tool feels laggy, not premium.

### 2. Nested `<button>` inside `<button>` — invalid HTML + hydration errors
`src/components/ops/InvoiceDesignLab.tsx:147` renders a card as a `<button>`
containing shadcn `<Button>` children at line 189. React logs hydration errors;
click targets are ambiguous. Make the outer element a `<div>` with an onClick
or restructure so buttons are siblings.

### 3. Duplicate React keys (2 warnings in console)
Two "Encountered two children with the same key" errors on the ops route.
Rows can be duplicated/omitted silently. Find and fix both.

### 4. Four 404s on page load
Four resources fail to load (images). Check DevTools network tab on `#/ops`,
fix or remove the references.

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
