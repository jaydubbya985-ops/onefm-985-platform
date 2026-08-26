# NEXT CLOUD AGENT — paste this as the whole prompt

You are continuing ONE FM 98.5 (`jaydubbya985-ops/onefm-985-platform`). Jay works in bursts; do not wait. Pull latest, ship the next ops slice, commit, push, update the PR.

## Already shipped on this branch

- Ops Proposals: Community/Champion/Premier/Signature weekly rates + football packages → branded PDF + mailto. Stats 39,375 / 25 towns / 100km (ABS 2021 via townData).
- Accept proposal → contract PDF (same letterhead). BSB 083-894 on invoices and on the agreement payment note.

## Next, in order

1. Confirm invoice send path still uses BSB 083-894 (InvoiceEmailTemplate + Batch Send). Do not regress it.
2. If PR #9 is not merged, keep committing onto that branch.
3. Stripe test payment on live URL only if `VITE_STRIPE_PUBLISHABLE_KEY` is set; otherwise `NEED JAY: VITE_STRIPE_PUBLISHABLE_KEY on Netlify`.
4. Truth grep `src/` for Plemo, unsplash, fake listener millions, AI-Enhanced.
5. `npm run build` must pass.

## Rules

- Government community broadcaster: never fabricate stats, sponsors, or people photos
- Mark ops demo CRM as DEMO
- If blocked on secrets: `NEED JAY:` plus one line. Do not invent workarounds.
- Desktop session — do not spend time on Galaxy Fold/mobile workflow

## Non-stop

When the current slice is in a PR, leave the next slice started (commit) rather than a planning doc. Copy this file again for the following agent.
