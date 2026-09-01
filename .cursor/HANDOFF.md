# ONE FM 98.5 — paste this into the next agent (Cloud / Claude Opus)

**Who we are:** Goulburn Valley Community Radio Inc. (ONE FM 98.5, callsign 3ONE). Licensed community broadcaster. **Never invent stats, people, logos, sponsors, or “live now” counts.**

**Repo:** `jaydubbya985-ops/onefm-985-platform`  
**Live:** https://onefmops.netlify.app  
**GitHub `main` is source of truth.** Always `git pull origin main` first.  
**Do not merge PRs unless Jay says EXE.** Never merge PR **#13**.

**CONTINUOUS RUN IS ON.** Read `.cursor/CONTINUOUS.md`. Keep shipping.

## Already true on GitHub `main` (`e9ce482`)

- PR **#28–#41** and the Sep 1 truth/security batch through **#137** are on `main`.
- Netlify deploy works. `npm run build` stays green even if Cloud `VITE_SUPABASE_*` is a project-ref or `sb_secret_` (those stay DEMO).
- Browser provider keys have been removed/guarded: OpenAI, Resend, PlayHQ, Google Maps literal fallback, fake Stripe placeholder.
- PR **#25** Invoice Design Lab — design **A · Broadcast Letter** is locked for batch sends.
- Coverage: **39,375** weekly / **189,680** people / **25 towns** / **100km**.
- Standard 30s: **$25 plus GST**. GVL is premium — never “from $25”.

## Open PRs (do not merge)

Ready as of this handoff: **#135 #121 #51**. Review before EXE because `main` has moved fast.

Stale/conflicting: **#1 #3 #4 #8 #10 #11** — close manually. **#13** never merge (regresses ops).

## NEED JAY (one action)

`RESEND_API_KEY` in Netlify for live invoice email — test send one invoice to `jasonstv1@bigpond.com` in Test Mode first.

Do **not** ask about `VITE_SUPABASE_*` every run. Wrong Cloud values stay DEMO and no longer fail the build. One-time pair: `.cursor/SECRETS.md`.

## Invoice design (locked)

**A · Broadcast Letter** — Jay confirmed Sep 2026. All batch sends use navy & gold (`STATION_INVOICE_DESIGN_CHOICE` in `invoiceDesignVariants.ts`).

## Next desks

- Public home/listen craft polish from `programGuide.ts` + `/public/brand/` only.
- `RESEND_API_KEY` for live invoice email (Test Mode first).
- Ops LIVE only if Jay pastes the pair in `.cursor/SECRETS.md` once. Not an every-run ask.
