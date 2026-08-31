# ONE FM 98.5 — paste this into the next agent (Cloud / Claude / Kimi)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**Netlify site ID:** `8df4de74-d9a8-42ce-9316-61bd06475c94`  
**GitHub is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.**

## This swarm (station truth)

Branch `cursor/station-truth-swarm-c24f` — images, rates, coverage SSOT.

| Rule | Source |
|------|--------|
| Weekly listeners **39,375** | `src/data/townData.ts` / `stationStats` via `src/lib/coverageCopy.ts` |
| Broadcast-area population **189,680** | same |
| **25 towns**, **100km** | same — do not hardcode |
| Standard 30s spot **$25 plus GST** | `src/lib/inventoryCopy.ts` |
| GVL / live reads / breakfast | **premium — never “from $25”** |
| Named portraits only | Di Hunter, Sally Nayler in `src/lib/presenterAssets.ts` |

## Do this run

1. Stay on `cursor/station-truth-swarm-c24f` unless starting new work.
2. `npm run build` must pass (truth + ops-config + tsc).
3. Do not merge without **EXE**.
4. GitHub Actions deploy on `main` still 401s on `NETLIFY_AUTH_TOKEN` — deploy via Netlify CLI if needed.

## NEED JAY (one action)

Open the swarm PR. Say **EXE** to merge. Then check `/#/football` is not selling GVL from $25, `/#/programs` shows Di Hunter’s archive portrait, `/#/coverage` uses 189,680 / 39,375 from townData.

## Do not

- Force-push. Invent portraits. Market GVL as from $25. Merge PR #13 as-is (conflicts + would regress `#/ops` to DEMO). Restart Resend verification. Email `peter@foott.com.au` unless Jay asks.
