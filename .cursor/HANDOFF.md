# ONE FM 98.5 — paste this into the next agent (Cloud / Claude Opus)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**GitHub `main` is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.** Never merge PR **#13**.

**CONTINUOUS RUN IS ON.** Read `.cursor/CONTINUOUS.md`. Keep shipping.

## Already true on GitHub `main` (`1b34f20`)

- PR **#28–#41** EXE'd — full truth pass: coverageCopy everywhere public, breakfast from `BREAKFAST_ROSTER`, programGuide hours (GVL Sat, NIRS Fri, multicultural weeknights), map glow from `coverageNumbers`, Di Hunter archive slot, Home dancing hours from guide.
- PR **#25** Invoice Design Lab — 3 variants at `#/ops` → Invoice Design tab.
- Coverage: **39,375** weekly / **189,680** people / **25 towns** / **100km**.
- Standard 30s: **$25 plus GST**. GVL is premium — never “from $25”.

## Open PRs (do not merge)

Stale/conflicting: **#3 #4 #8 #10 #11** — close manually. **#13** never merge (regresses ops).

## NEED JAY (one action)

Pick invoice design **A / B / C** at `#/ops` → Invoice Design tab (default is broadcast).

## Next desks

- Public home/listen craft polish from `programGuide.ts` + `/public/brand/` only.
- `RESEND_API_KEY` for live invoice email (Test Mode first).
