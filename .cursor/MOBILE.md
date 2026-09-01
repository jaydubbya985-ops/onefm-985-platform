# ONE FM mobile control room

Use this when you are on the Fold and the project feels stuck.

## Keep agents building

Paste this into a new Cloud Agent:

```text
Read .cursor/CONTINUOUS.md. Pull origin main first. Do not merge PRs unless I say EXE. Keep shipping the next unblocked ONE FM improvement. If blocked, say NEED JAY in one line, then keep coding independent work. Build must pass.
```

## When an agent needs a secret

Read `.cursor/SECRETS.md` first. Supabase is **not** an every-run blocker.

If you still need to set Ops LIVE (once):

1. Open [Cloud Agent Secrets](https://cursor.com/dashboard/cloud-agents?view=my-secrets).
2. `VITE_SUPABASE_URL` = Project URL (`https://….supabase.co`).
3. `VITE_SUPABASE_ANON_KEY` = **anon public** / publishable key only (`eyJ…` or `sb_publishable_…`).
4. Save. Reply `done`.

Never paste secret values into chat. Never paste `sb_secret_` into a `VITE_*` name.

## Merge command

Only write this when you are ready for agents to merge a PR:

```text
EXE PR #__
```

No `EXE`, no merge.
