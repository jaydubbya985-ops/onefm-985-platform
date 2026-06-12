-- ═══════════════════════════════════════════════════════════════
--  ONE FM 98.5 — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Contact Enquiries ──────────────────────────────────────────
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
create policy "Staff can manage enquiries" on contact_enquiries
  for all using (auth.role() = 'authenticated');
create policy "Public can insert enquiries" on contact_enquiries
  for insert with check (true);

-- ── CRM Contacts ──────────────────────────────────────────────
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
create policy "Authenticated users manage contacts" on crm_contacts
  for all using (auth.role() = 'authenticated');

-- ── CRM Deals / Pipeline ──────────────────────────────────────
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
create policy "Authenticated users manage deals" on crm_deals
  for all using (auth.role() = 'authenticated');

-- ── CRM Activities (calls, emails, meetings, notes) ───────────
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
create policy "Authenticated users manage activities" on crm_activities
  for all using (auth.role() = 'authenticated');

-- ── Proposals ────────────────────────────────────────────────
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
create policy "Authenticated users manage proposals" on proposals
  for all using (auth.role() = 'authenticated');

-- ── Invoices ─────────────────────────────────────────────────
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
create policy "Authenticated users manage invoices" on invoices
  for all using (auth.role() = 'authenticated');

-- ── Donations ────────────────────────────────────────────────
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
create policy "Authenticated users view donations" on donations
  for select using (auth.role() = 'authenticated');
create policy "Public can insert donations" on donations
  for insert with check (true);

-- ── Auto-update updated_at ────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on contact_enquiries
  for each row execute function update_updated_at();
create trigger set_updated_at before update on crm_contacts
  for each row execute function update_updated_at();
create trigger set_updated_at before update on crm_deals
  for each row execute function update_updated_at();
create trigger set_updated_at before update on proposals
  for each row execute function update_updated_at();
create trigger set_updated_at before update on invoices
  for each row execute function update_updated_at();

-- ── Indexes for common queries ────────────────────────────────
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
