# ONE FM mobile control room

Use this when you are on the Fold and the project feels stuck.

## Keep agents building

Paste this into a new Cloud Agent:

```text
Read .cursor/CONTINUOUS.md. Pull origin main first. Do not merge PRs unless I say EXE. Keep shipping the next unblocked ONE FM improvement. If blocked, say NEED JAY in one line, then keep coding independent work. Build must pass.
```

## When an agent needs a secret

1. Open `cursor.com/dashboard/cloud-agents?view=my-secrets`.
2. Click `Add Secrets`.
3. Add the exact secret name the agent gave you.
4. Paste the value from the service dashboard.
5. Save.
6. Reply `done`.

Never paste secret values into chat.

## Supabase key check

- `VITE_SUPABASE_URL` must be the full Supabase project API URL from Supabase Project Settings -> API.
- `VITE_SUPABASE_ANON_KEY` must start with `eyJ...` or `sb_publishable_...`.
- Never use `sb_secret...`, `sb_s...`, or `service_role` in a `VITE_*` secret.

## Merge command

Only write this when you are ready for agents to merge a PR:

```text
EXE PR #__
```

No `EXE`, no merge.
