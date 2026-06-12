-- ═══════════════════════════════════════════════════════════════
--  ONE FM 98.5 — Phase 3 Migration (email delivery tracking)
--  Run AFTER supabase-schema-phase2.sql
-- ═══════════════════════════════════════════════════════════════

alter table ops_invoices
  add column if not exists sent_at           timestamptz,
  add column if not exists resend_message_id text,
  add column if not exists email_sent_to     text;

create index if not exists idx_ops_invoices_sent_at on ops_invoices(sent_at);
