# ONE FM — continuous run (paste this as a Cursor Automation prompt)

**Do not idle. Do not wait for Jay to start the next agent.** Pull `origin main`. Read `.cursor/ULTRA.md`. New branch `cursor/<desk>-273d` (or the suffix this run requires). Ship something a listener would feel. Build must pass. Push a PR. Do not merge unless Jay says **EXE**. Never merge PR **#13**. Never merge PR **#28**. Never merge PR **#29**.

## Who

Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. Never invent stats, people, logos, sponsors, or live-now counts.

## Live

https://onefmops.netlify.app — `main` deploys via GitHub Actions. Read `.cursor/HANDOFF.md` for what is already true.

## Ultra (from 3 September 2026)

Jay is on Cursor Ultra. The bar is **6.3×**. **WORLD CLASS** is the only pass mark.

- **One PR per run.** Depth over volume.
- The stamp factory is **closed**: do not add coverage + breakfast + GVL hours to another chrome component (#170–#200 style).
- Would this sit next to ABC Listen without looking like a template? If no, keep working.

## This slice

Pick the first desk that is not already in an open PR:

1. Listen / Home craft — play, remaining time, now-playing, honest presenter line, honest stream errors
2. Programs as a usable weekly grid
3. Named portraits only if Jay drops new filename-verified files into `NAMED_PORTRAITS`
4. Real leftover bugs (invented titles, broken send) — not stamps
5. Stale PR hygiene: recommend **close** on conflicting drafts #1 #3 #4 #8 #10 #11. Never merge #13 / #28 / #29 without EXE.

## Loop rules

- Keep coding after you open a PR. Do not sit waiting for EXE.
- If blocked on secrets: `NEED JAY:` one line, then keep coding independent work.
- If Jay is on mobile or overwhelmed, point him to `.cursor/MOBILE.md` and give one next action.
- GVL is never “from $25”. Standard 30s is $25 plus GST.
- No empty-commit CI retries. No `sb_secret_` in the browser bundle.
- Re-arm a 20-minute continue timer on this conversation if you are a Cloud Agent with `subscribe_timer`.
