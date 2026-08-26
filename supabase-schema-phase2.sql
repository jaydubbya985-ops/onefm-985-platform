-- ═══════════════════════════════════════════════════════════════
--  ONE FM 98.5 — Phase 2 Migration
--  Run AFTER supabase-schema.sql in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── Extend contact_enquiries for Ops portal ───────────────────
alter table contact_enquiries
  add column if not exists source    text default 'contact',
  add column if not exists subject   text,
  add column if not exists priority  text default 'medium',
  add column if not exists notes     jsonb default '[]',
  add column if not exists value     numeric(10,2),
  add column if not exists company   text;

-- Back-fill subject from enquiry_type for existing rows
update contact_enquiries
set subject = coalesce(subject, enquiry_type)
where subject is null;

-- Expand status values to match Ops pipeline
alter table contact_enquiries drop constraint if exists contact_enquiries_status_check;
alter table contact_enquiries add constraint contact_enquiries_status_check
  check (status in (
    'new', 'in_progress', 'proposal_sent', 'negotiating',
    'closed_won', 'closed_lost', 'resolved'
  ));

-- Staff can read enquiries (needed for Ops inbox + realtime)
drop policy if exists "Staff can manage enquiries" on contact_enquiries;
create policy "Staff can manage enquiries" on contact_enquiries
  for all using (auth.role() = 'authenticated');
create policy "Public can insert enquiries" on contact_enquiries
  for insert with check (true);

-- ── Ops Proposals ─────────────────────────────────────────────
create table if not exists ops_proposals (
  id           text primary key,
  enquiry_id   text,
  client_name  text not null,
  company      text,
  email        text,
  source       text,
  package_name text,
  tier         text,
  value        numeric(10,2) default 0,
  status       text default 'draft' check (status in ('draft','sent','accepted','rejected')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table ops_proposals add column if not exists proposal_number text;
alter table ops_proposals add column if not exists package_id text;
alter table ops_proposals add column if not exists duration_weeks integer;
alter table ops_proposals add column if not exists notes text;
alter table ops_proposals add column if not exists valid_until date;
alter table ops_proposals add column if not exists details jsonb default '{}'::jsonb;
alter table ops_proposals enable row level security;
create policy "Staff manage ops_proposals" on ops_proposals
  for all using (auth.role() = 'authenticated');

-- ── Ops Contracts ─────────────────────────────────────────────
create table if not exists ops_contracts (
  id              text primary key,
  proposal_id     text,
  contract_number text unique not null,
  company_name    text not null,
  primary_contact text not null,
  email           text default '',
  campaign_name   text,
  description     text,
  contract_value  numeric(10,2) default 0,
  start_date      date,
  end_date        date,
  status          text default 'pending',
  tier            text,
  invoices        jsonb default '[]',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table ops_contracts enable row level security;
create policy "Staff manage ops_contracts" on ops_contracts
  for all using (auth.role() = 'authenticated');

-- ── Ops Invoices ──────────────────────────────────────────────
create table if not exists ops_invoices (
  id             text primary key,
  number         text unique not null,
  company        text not null,
  contact_name   text not null,
  email          text default '',
  amount         numeric(10,2) default 0,
  gst            numeric(10,2) default 0,
  total          numeric(10,2) default 0,
  description    text default '',
  period         text default '',
  issue_date     date,
  due_date       date,
  status         text default 'draft',
  in_batch       boolean default false,
  contract_id    text,
  email_subject  text,
  email_body     text,
  story          text,
  notes          text,
  paid_date      date,
  paid_amount    numeric(10,2),
  payment_method text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
alter table ops_invoices enable row level security;
create policy "Staff manage ops_invoices" on ops_invoices
  for all using (auth.role() = 'authenticated');

-- ── Auto-update triggers ──────────────────────────────────────
create trigger set_updated_at before update on ops_proposals
  for each row execute function update_updated_at();
create trigger set_updated_at before update on ops_contracts
  for each row execute function update_updated_at();
create trigger set_updated_at before update on ops_invoices
  for each row execute function update_updated_at();

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_ops_proposals_enquiry  on ops_proposals(enquiry_id);
create index if not exists idx_ops_proposals_status   on ops_proposals(status);
create index if not exists idx_ops_contracts_proposal on ops_contracts(proposal_id);
create index if not exists idx_ops_invoices_contract  on ops_invoices(contract_id);
create index if not exists idx_ops_invoices_batch     on ops_invoices(in_batch);
create index if not exists idx_enquiries_source       on contact_enquiries(source);
create index if not exists idx_enquiries_priority     on contact_enquiries(priority);

-- ── Realtime (Ops inbox live updates) ─────────────────────────
alter publication supabase_realtime add table contact_enquiries;
alter publication supabase_realtime add table ops_proposals;
alter publication supabase_realtime add table ops_contracts;
alter publication supabase_realtime add table ops_invoices;
