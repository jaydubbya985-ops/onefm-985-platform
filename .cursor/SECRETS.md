# ONE FM secrets — set once, then ignore

Wrong or missing `VITE_SUPABASE_*` **does not block the public site**.
`npm run build` stays green. `#/ops` stays DEMO (`onefm2026`).
Agents must **not** ask Jay about this every run.

## The only two values (Ops LIVE)

From **Supabase → Project Settings → API** (copy the fields, do not invent them):

| Name | Paste this | Never paste this |
|------|------------|------------------|
| `VITE_SUPABASE_URL` | **Project URL** — `https://<project-ref>.supabase.co` | The bare project ref with no `https://` (code now expands it, but paste the URL) |
| `VITE_SUPABASE_ANON_KEY` | **anon public** or **publishable** key — starts with `eyJ` or `sb_publishable_` | `sb_secret_…`, `service_role`, or any key labelled secret |

The anon/publishable key is **designed to be in the browser**. The secret key is not. If a secret key is present, the app **drops it** and stays DEMO.

## Where to paste (same pair, once each)

1. [Cloud Agent Secrets](https://cursor.com/dashboard/cloud-agents?view=my-secrets)
2. Netlify → Site settings → Environment variables (production)
3. GitHub → Settings → Secrets and variables → Actions (optional; deploy already works in DEMO)

Do not paste values into chat.

## Agent rules (mandatory)

- Classify `VITE_SUPABASE_*` **without printing values**.
- If the pair is missing or wrong: stay DEMO, **keep shipping the public site**. Do not write `NEED JAY` for this.
- Never tell Jay to put `sb_secret_` in a `VITE_*` variable.
- Full runbook: this file only. Do not invent a third shape.
