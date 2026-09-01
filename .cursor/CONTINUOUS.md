# ONE FM — continuous run (paste this as a Cursor Automation prompt)

**Do not idle. Do not wait for Jay to start the next agent.** Pull `origin main`. New branch `cursor/<desk>-c24f`. Ship something visible. Build must pass. Push a PR. Do not merge unless Jay says **EXE**. Never merge PR **#13**. Never merge PR **#28**. Never merge PR **#29**.

## Who

Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. Never invent stats, people, logos, sponsors, or live-now counts.

## Live

https://onefmops.netlify.app — `main` deploys via GitHub Actions. Read `.cursor/HANDOFF.md` for what is already true.

## This slice

Pick the first desk that is not already in an open PR:

1. Leftover `stationStats` → `coverageCopy.ts` on **ai.ts, proposalDocument, contractDocument, OpsProposalSheet**
2. Public home/listen craft from `programGuide.ts` + `townData.ts` + `/public/brand/` + `/public/assets/images/`
3. Named portraits only if Jay drops new filename-verified files into `NAMED_PORTRAITS`
4. Stale PR hygiene: recommend **close** on conflicting drafts #1 #3 #4 #8 #10 #11. Never merge #13. Never merge #28 or #29 without EXE.

## Loop rules

- Keep coding after you open a PR. Do not sit waiting for EXE.
- If blocked on secrets: `NEED JAY:` one line, then keep coding independent work.
- If Jay is on mobile or overwhelmed, point him to `.cursor/MOBILE.md` and give one next action.
- GVL is never “from $25”. Standard 30s is $25 plus GST.
- No empty-commit CI retries. No `sb_secret_` in the browser bundle.
- Re-arm a 20-minute continue timer on this conversation if you are a Cloud Agent with `subscribe_timer`.
