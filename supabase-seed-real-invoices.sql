-- REAL sponsor invoices only. Run in Supabase SQL Editor after supabase-schema-all.sql.
-- Do NOT insert the 19-row DEMO batch.
-- FOOTT ONEFM-2026-011 and Jason's TV ONEFM-2026-012.

insert into ops_invoices (
  id, number, company, contact_name, email,
  amount, gst, total, description, period,
  issue_date, due_date, status, in_batch, notes
) values
  (
    'inv-001',
    'ONEFM-2026-011',
    'FOOTT Waste Solutions',
    'Peter Foott',
    'peter@foott.com.au',
    5000.00,
    500.00,
    5500.00,
    'FOOTT Waste Solutions – Community Partnership & Sponsorship Package (Jun–Nov 2026)',
    'Jun 2026 – Nov 2026',
    '2026-06-09',
    '2026-06-23',
    'draft',
    true,
    'Real FOOTT tax invoice — not DEMO'
  ),
  (
    'inv-002',
    'ONEFM-2026-012',
    'Jason''s TV Pty Ltd',
    'Jason Aspland',
    'jasonstv1@bigpond.com',
    7800.00,
    780.00,
    8580.00,
    'LT Image – 12 Month Clean Slate Sponsorship (Jun 2025–Jun 2026)',
    'Jun 2025 – Jun 2026',
    '2026-06-09',
    '2026-06-23',
    'draft',
    true,
    'Real Jason''s TV tax invoice — not DEMO'
  )
on conflict (id) do nothing;
