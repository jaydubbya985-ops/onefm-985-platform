-- ONE FM 98.5 Complete Schema
-- Paste entire file into Supabase SQL Editor

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
--  ONE FM 98.5 â€” Supabase Schema
--  Run this in: Supabase Dashboard â†’ SQL Editor â†’ New Query
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Enable RLS on all tables
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- â”€â”€ Contact Enquiries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table if not exists contact_enquiries (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  email            text not null,
  phone            text,
  organization     text,
  enquiry_type     text not null,
  message          text not null,
  preferred_contact text default 'email',
  status           text default 'new' check (status in ('new','in_progress','resolved')),
  notes            text,
  assigned_to      uuid references auth.users(id),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
alter table contact_enquiries enable row level security;
drop policy if exists "Staff can manage enquiries" on contact_enquiries;
drop policy if exists "Public can insert enquiries" on contact_enquiries;
create policy "Staff can manage enquiries" on contact_enquiries
  for all using (auth.role() = 'authenticated');
create policy "Public can insert enquiries" on contact_enquiries
  for insert with check (true);

-- â”€â”€ CRM Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table if not exists crm_contacts (
  id              uuid primary key default uuid_generate_v4(),
  first_name      text not null,
  last_name       text,
  email           text unique,
  phone           text,
  company         text,
  job_title       text,
  industry        text,
  website         text,
  address         text,
  city            text,
  state           text,
  country         text default 'Australia',
  tags            text[] default '{}',
  source          text default 'manual' check (source in ('manual','website','referral','event','cold_outreach','inbound')),
  lifecycle_stage text default 'lead' check (lifecycle_stage in ('lead','qualified','proposal','customer','lost','inactive')),
  owner_id        uuid references auth.users(id),
  notes           text,
  avatar_url      text,
  total_spent     numeric(10,2) default 0,
  last_contact_at timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table crm_contacts enable row level security;
drop policy if exists "Authenticated users manage contacts" on crm_contacts;
create policy "Authenticated users manage contacts" on crm_contacts
  for all using (auth.role() = 'authenticated');

-- â”€â”€ CRM Deals / Pipeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table if not exists crm_deals (
  id          uuid primary key default uuid_generate_v4(),
  contact_id  uuid references crm_contacts(id) on delete cascade,
  title       text not null,
  value       numeric(10,2) default 0,
  currency    text default 'AUD',
  stage       text default 'prospecting' check (stage in (
    'prospecting','qualified','proposal_sent','negotiation','won','lost'
  )),
  probability int default 0 check (probability between 0 and 100),
  close_date  date,
  package     text,
  notes       text,
  owner_id    uuid references auth.users(id),
  won_at      timestamptz,
  lost_at     timestamptz,
  lost_reason text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table crm_deals enable row level security;
drop policy if exists "Authenticated users manage deals" on crm_deals;
create policy "Authenticated users manage deals" on crm_deals
  for all using (auth.role() = 'authenticated');

-- â”€â”€ CRM Activities (calls, emails, meetings, notes) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table if not exists crm_activities (
  id           uuid primary key default uuid_generate_v4(),
  contact_id   uuid references crm_contacts(id) on delete cascade,
  deal_id      uuid references crm_deals(id) on delete set null,
  type         text not null check (type in ('call','email','meeting','note','task','proposal')),
  subject      text not null,
  body         text,
  outcome      text,
  due_at       timestamptz,
  completed_at timestamptz,
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now()
);
alter table crm_activities enable row level security;
drop policy if exists "Authenticated users manage activities" on crm_activities;
create policy "Authenticated users manage activities" on crm_activities
  for all using (auth.role() = 'authenticated');

-- â”€â”€ Proposals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table if not exists proposals (
  id            uuid primary key default uuid_generate_v4(),
  contact_id    uuid references crm_contacts(id) on delete set null,
  deal_id       uuid references crm_deals(id) on delete set null,
  customer_name text not null,
  company_name  text,
  industry      text,
  email         text,
  phone         text,
  campaign_goal text,
  budget        text,
  duration      text,
  tier          text,
  tier_price    numeric(10,2) default 0,
  add_ons       jsonb default '[]',
  sections      jsonb default '[]',
  total         numeric(10,2) default 0,
  status        text default 'draft' check (status in ('draft','sent','viewed','accepted','rejected')),
  sent_at       timestamptz,
  viewed_at     timestamptz,
  accepted_at   timestamptz,
  created_by    uuid references auth.users(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table proposals enable row level security;
drop policy if exists "Authenticated users manage proposals" on proposals;
create policy "Authenticated users manage proposals" on proposals
  for all using (auth.role() = 'authenticated');

-- â”€â”€ Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table if not exists invoices (
  id              uuid primary key default uuid_generate_v4(),
  invoice_number  text unique not null,
  contact_id      uuid references crm_contacts(id) on delete set null,
  deal_id         uuid references crm_deals(id) on delete set null,
  proposal_id     uuid references proposals(id) on delete set null,
  customer_name   text not null,
  customer_email  text,
  company_name    text,
  line_items      jsonb default '[]',
  subtotal        numeric(10,2) default 0,
  gst             numeric(10,2) default 0,
  total           numeric(10,2) default 0,
  currency        text default 'AUD',
  status          text default 'draft' check (status in ('draft','sent','paid','overdue','cancelled')),
  due_date        date,
  paid_at         timestamptz,
  stripe_payment_intent_id text,
  stripe_payment_link text,
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table invoices enable row level security;
drop policy if exists "Authenticated users manage invoices" on invoices;
create policy "Authenticated users manage invoices" on invoices
  for all using (auth.role() = 'authenticated');

-- â”€â”€ Donations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create table if not exists donations (
  id                      uuid primary key default uuid_generate_v4(),
  amount                  numeric(10,2) not null,
  currency                text default 'AUD',
  donor_name              text,
  email                   text,
  tier                    text,
  is_anonymous            boolean default false,
  message                 text,
  status                  text default 'pending' check (status in ('pending','completed','failed','refunded')),
  stripe_payment_intent_id text,
  created_at              timestamptz default now()
);
alter table donations enable row level security;
drop policy if exists "Authenticated users view donations" on donations;
drop policy if exists "Public can insert donations" on donations;
create policy "Authenticated users view donations" on donations
  for select using (auth.role() = 'authenticated');
create policy "Public can insert donations" on donations
  for insert with check (true);

-- â”€â”€ Auto-update updated_at â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on contact_enquiries;
create trigger set_updated_at before update on contact_enquiries
  for each row execute function update_updated_at();
drop trigger if exists set_updated_at on crm_contacts;
create trigger set_updated_at before update on crm_contacts
  for each row execute function update_updated_at();
drop trigger if exists set_updated_at on crm_deals;
create trigger set_updated_at before update on crm_deals
  for each row execute function update_updated_at();
drop trigger if exists set_updated_at on proposals;
create trigger set_updated_at before update on proposals
  for each row execute function update_updated_at();
drop trigger if exists set_updated_at on invoices;
create trigger set_updated_at before update on invoices
  for each row execute function update_updated_at();

-- â”€â”€ Indexes for common queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create index if not exists idx_contacts_email         on crm_contacts(email);
create index if not exists idx_contacts_company       on crm_contacts(company);
create index if not exists idx_contacts_stage         on crm_contacts(lifecycle_stage);
create index if not exists idx_deals_stage            on crm_deals(stage);
create index if not exists idx_deals_contact          on crm_deals(contact_id);
create index if not exists idx_activities_contact     on crm_activities(contact_id);
create index if not exists idx_enquiries_status       on contact_enquiries(status);
create index if not exists idx_proposals_status       on proposals(status);
create index if not exists idx_invoices_status        on invoices(status);
create index if not exists idx_invoices_number        on invoices(invoice_number);


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
--  ONE FM 98.5 â€” Phase 2 Migration
--  Run AFTER supabase-schema.sql in Supabase Dashboard â†’ SQL Editor
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â”€â”€ Extend contact_enquiries for Ops portal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
drop policy if exists "Public can insert enquiries" on contact_enquiries;
create policy "Staff can manage enquiries" on contact_enquiries
  for all using (auth.role() = 'authenticated');
create policy "Public can insert enquiries" on contact_enquiries
  for insert with check (true);

-- â”€â”€ Ops Proposals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
alter table ops_proposals enable row level security;
drop policy if exists "Staff manage ops_proposals" on ops_proposals;
create policy "Staff manage ops_proposals" on ops_proposals
  for all using (auth.role() = 'authenticated');

-- â”€â”€ Ops Contracts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
drop policy if exists "Staff manage ops_contracts" on ops_contracts;
create policy "Staff manage ops_contracts" on ops_contracts
  for all using (auth.role() = 'authenticated');

-- â”€â”€ Ops Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
drop policy if exists "Staff manage ops_invoices" on ops_invoices;
create policy "Staff manage ops_invoices" on ops_invoices
  for all using (auth.role() = 'authenticated');

-- â”€â”€ Auto-update triggers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
drop trigger if exists set_updated_at on ops_proposals;
create trigger set_updated_at before update on ops_proposals
  for each row execute function update_updated_at();
drop trigger if exists set_updated_at on ops_contracts;
create trigger set_updated_at before update on ops_contracts
  for each row execute function update_updated_at();
drop trigger if exists set_updated_at on ops_invoices;
create trigger set_updated_at before update on ops_invoices
  for each row execute function update_updated_at();

-- â”€â”€ Indexes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create index if not exists idx_ops_proposals_enquiry  on ops_proposals(enquiry_id);
create index if not exists idx_ops_proposals_status   on ops_proposals(status);
create index if not exists idx_ops_contracts_proposal on ops_contracts(proposal_id);
create index if not exists idx_ops_invoices_contract  on ops_invoices(contract_id);
create index if not exists idx_ops_invoices_batch     on ops_invoices(in_batch);
create index if not exists idx_enquiries_source       on contact_enquiries(source);
create index if not exists idx_enquiries_priority     on contact_enquiries(priority);

-- â”€â”€ Realtime (Ops inbox live updates) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$ begin
  alter publication supabase_realtime add table contact_enquiries;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table ops_proposals;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table ops_contracts;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table ops_invoices;
exception when duplicate_object then null;
end $$;


-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
--  ONE FM 98.5 â€” Phase 3 Migration (email delivery tracking)
--  Run AFTER supabase-schema-phase2.sql
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

alter table ops_invoices
  add column if not exists sent_at           timestamptz,
  add column if not exists resend_message_id text,
  add column if not exists email_sent_to     text;

create index if not exists idx_ops_invoices_sent_at on ops_invoices(sent_at);

