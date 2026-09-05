# ONE FM 98.5 — paste this into the next agent (Cloud / Claude Opus)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**GitHub `main` is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.** Never merge PR **#13**. Never merge **#28** or **#29**.

**ULTRA IS ON.** Read `.cursor/ULTRA.md`. World class is the only pass mark. One deep PR — not the stamp factory.

**CONTINUOUS RUN IS ON.** Read `.cursor/CONTINUOUS.md`. Keep shipping.

## Already true on GitHub `main` (`5a39882`)

- Latest on `main`: Explore heading names listen and the guide (#478).
- Coverage: **39,375** weekly / **189,680** people / **25 towns** / **100km** — always via `coverageCopy.ts`.
- Standard 30s: **$25 plus GST**. GVL is premium — never “from $25”.
- Breakfast is ONE FM Breakfast with rotating hosts (Tim Ahemt, The Big G, Ralph Whitehead, Josh Revens) — not Plemo.
- Photos: `/public/assets/images/` and `/public/brand/` only.

## Waiting for Jay EXE (do not merge)

These are ready, Bugbot-green, not on `main` until EXE:

- **#516** Programs featured cards from `FULL_SCHEDULE` (not handwritten slogans)
- **#526** 404 names the live show and plays the stream
- **#530** Remaining time ticks from the guide clock (15s), Radio.co stays 60s

Also still open and not EXE: Listen remaining aria-live **#475**, Home play **#235** (prefer over parked #510), Listen stream/grid parked **#508**.

## Open PRs (do not merge)

The leftover-slogan band is the stamp factory. Recommend **close** (do not merge): one-line remaps on Programs (#440 #492 #509 #513 and siblings), plus stale/conflicting **#1 #3 #4 #8 #10 #11**. **#13** never merge.

## NEED JAY (one action)

Say **EXE** on #516, #526, or #530 — those are the listener ships waiting on `main`.

Phone: `.cursor/MOBILE.md`.

Secrets still: Cloud `VITE_SUPABASE_URL` + **anon** key (never `sb_secret_`). Named host JPGs only if Jay drops them into `/public/photos/hosts/`.

## Next desks

- Named portraits only after Jay drops filename-verified files
- Guide Saturday-evening gaps (#523) — Overnight Mix is the leftover fallthrough
- Do **not** stamp coverage onto another chrome component
- Do **not** remap leftover strings owned by other PRs
