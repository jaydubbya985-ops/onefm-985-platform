# ONE FM 98.5 — paste this into the next agent (Cloud / Claude Opus)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**Netlify site ID:** `8df4de74-d9a8-42ce-9316-61bd06475c94`  
**GitHub `main` is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.**

## Already true on live (`main` `2d7def3`)

- GitHub **Deploy to Netlify** is green (PR #19 site ID + PR #20 live-check retry).
- `#/ops` is LIVE when Netlify has real `VITE_SUPABASE_*` (anon key, not `sb_secret_`).
- Standard 30s spots: **$25 plus GST** (`src/lib/inventoryCopy.ts`). GVL / live reads / breakfast are premium — never “from $25”.
- Coverage / listenership: **39,375** weekly / **189,680** people / **25 towns** / **100km** via `src/lib/coverageCopy.ts` + `townData.ts`.
- Named portraits only: Di Hunter, Sally Nayler (`src/lib/presenterAssets.ts`). Everyone else = station photography, labelled as such.
- FOOTT `ONEFM-2026-011` PDF send proven. Do not email `peter@foott.com.au` unless Jay asks.
- Resend probe is read-only. Do not POST verify. Do not change Outlook MX.

## Waiting on EXE

**PR #22** `cursor/map-photos-rates-c24f` — GO MAP / GO PHOTOS / GO RATES. Build passed. Do not merge without **EXE**.

- `#/coverage` — listener-scaled dots, Heartland (top 10 by townData), valley photo strip, glow is a visual 100km guide.
- `#/programs` + `#/broadcast` — `programScene()` station photography; host tiles say Archive portrait or Station photography.
- `#/proposal` + `#/social` + `#/broadcast` — `InventoryLadder`. Community Supporter = name-read, not a GVL commercial.
- `#/broadcast` and `#/social` are remounted (they were redirecting to listen/community). Truth check fails the build if those redirects return.

## Do this run

1. New branch `cursor/<name>-c24f` off latest `main` (or EXE #22 first).
2. `npm run build` must pass (truth + ops-config + tsc).
3. Do not merge without **EXE**. Do not merge PR **#13** as-is (CONFLICTING; would regress `#/ops` to DEMO).
4. Do not empty-commit to retry CI. Push-to-main deploys.

## Next desk

**D — Stale PR audit (no merge)**  
Open drafts #1 #3 #4 #8 #10 #11 vs current `main`. List what is already shipped vs leftover. Recommend **close** or **rebase-then-EXE**. Never merge #13 as-is.

If #22 is EXE’d: public-site craft only from `programGuide.ts` + `townData.ts` + `/public/brand/` + `/public/assets/images/`. If Jay drops new named portrait files, add them to `NAMED_PORTRAITS`.

## NEED JAY (one action)

**EXE** PR #22 if map / photos / rates look right.  
Optional: in Cursor Cloud secrets, set `VITE_SUPABASE_URL` to the full `https://….supabase.co` API URL and `VITE_SUPABASE_ANON_KEY` to the **anon / publishable** key (never `sb_secret_`).

## Do not

- Force-push. Invent portraits or stats. Market GVL as from $25. Merge #13 as-is. Restart Resend verification. Email Peter at FOOTT unless Jay asks. Bake `sb_secret_` into the browser bundle.
