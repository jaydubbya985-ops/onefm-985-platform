# ONE FM — Cursor Ultra allocations (from 3 September 2026)

Jay is on **Cursor Ultra**. The bar is **6.3×** the old habit. **WORLD CLASS** is the only pass mark.

Every Cloud / Claude / Kimi / desktop agent reads this before shipping.

## Who we are

Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. Never invent stats, people, logos, sponsors, or live-now counts.

## What Ultra buys (allocation)

| Resource | Old habit — FAIL | Ultra habit — PASS |
|---|---|---|
| Time | Stamp the same GVL / coverage / breakfast line onto 30 pages | One deep ship a listener or FOOTT would feel |
| Volume | 10–30 PRs per run | **One PR.** Then start a *different* desk |
| Model | Fast-and-shallow | Thorough (Opus / Grok high). Review like EXE is tonight |
| Quality | “It compiles” | Would this sit next to ABC Listen or BBC Sounds without looking like a template? |
| Truth | Copy `39,375` by hand | Source once via `coverageCopy.ts` / `programGuide.ts` |
| Photos | Decorative faces | `/public/assets/images/` and `/public/brand/` only. Named portraits only in `NAMED_PORTRAITS` |

## Closed desks (do not open)

- Stamping `formatCoverageShort()` + breakfast roster + GVL hours onto another chrome component (the #170–#200 factory)
- Empty-commit CI retries
- Inventing listener pulses, portraits, Stripe links, or “sent” email states
- Merging anything without Jay saying **EXE**. Never merge **#13**, **#28**, **#29**

## Open desks (pick the first that is not already an open PR)

1. **Listen / Home craft** — play, remaining time, now-playing, honest presenter line, honest stream errors
2. **Programs** — a weekly grid a real listener can use
3. **Real leftover bugs** — invented titles, broken send, missing error states (not stamps)
4. Keep `.cursor/HANDOFF.md` honest to the current `main` SHA

## Loop

Pull `origin main`. Branch `cursor/<desk>-273d` (or the suffix this run requires). Build must pass. Push a PR. Do not merge unless Jay says **EXE**. Keep coding the next *different* desk. Re-arm a 20-minute `onefm-continuous` timer if you are a Cloud Agent with `subscribe_timer`.
