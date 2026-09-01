# ONE FM 98.5 — paste this into the next agent (Cloud / Claude Opus)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**Netlify site ID:** `8df4de74-d9a8-42ce-9316-61bd06475c94`  
**GitHub `main` is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.**

## Already true on live (`main` `6c9fb0d`)

- GitHub **Deploy to Netlify** is green (PR #19 site ID + PR #20 live-check retry).
- `#/ops` is LIVE when Netlify has real `VITE_SUPABASE_*` (anon key, not `sb_secret_`).
- Standard 30s spots: **$25 plus GST** (`src/lib/inventoryCopy.ts`). GVL / live reads / breakfast are premium — never “from $25”.
- Coverage / listenership: **39,375** weekly / **189,680** people / **25 towns** / **100km** via `src/lib/coverageCopy.ts` + `townData.ts`.
- Named portraits only: Di Hunter, Sally Nayler (`src/lib/presenterAssets.ts`). Everyone else = station photography, labelled as such.
- FOOTT `ONEFM-2026-011` PDF send proven. Do not email `peter@foott.com.au` unless Jay asks.
- Resend probe is read-only. Do not POST verify. Do not change Outlook MX.

## Do this run

1. New branch `cursor/<name>-c24f` off latest `main`.
2. `npm run build` must pass (truth + ops-config + tsc).
3. Do not merge without **EXE**. Do not merge PR **#13** as-is (CONFLICTING; would regress `#/ops` to DEMO).
4. Do not empty-commit to retry CI. Push-to-main deploys.

## Pick one desk (or run them as parallel Cloud Agents)

**A — Coverage map (visual)**  
Proper map upgrade using `townData` + existing glow only. No invented ACMA contours, no fake live listener pulse. Keep the “glow is a visual 100km guide” copy. Merge remaining hardcoded coverage strings into `coverageCopy`.

**B — Photos**  
Scan `/public/assets/images/` and `/public/brand/`. Wire any *filename-verified* presenter/program shots into `presenterAssets` / program cards. Do not invent portraits. If Jay drops new named files, add them to `NAMED_PORTRAITS`.

**C — Marketing inventory**  
Keep the $25+GST floor. Make premiums obvious on SalesProposal, SocialHub, BroadcastExplorer, and any leftover “from $25” near GVL/breakfast. Use `InventoryLadder` / `inventoryCopy`. Community Supporter $25/wk = name-read, not a GVL commercial.

**D — Stale PR audit (no merge)**  
Open drafts #1 #3 #4 #8 #10 #11 vs current `main`. List what is already shipped vs leftover. Recommend **close** or **rebase-then-EXE**. Never merge #13 as-is.

## NEED JAY (one action)

Start the next Cloud Agent as **Claude Opus** and paste this whole file.  
Optional: in Cursor Cloud secrets, set `VITE_SUPABASE_URL` to the full `https://….supabase.co` API URL and `VITE_SUPABASE_ANON_KEY` to the **anon / publishable** key (never `sb_secret_`).

## Do not

- Force-push. Invent portraits or stats. Market GVL as from $25. Merge #13 as-is. Restart Resend verification. Email Peter at FOOTT unless Jay asks. Bake `sb_secret_` into the browser bundle.
