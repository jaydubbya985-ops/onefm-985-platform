# Mailchimp Workflow — ONE FM 98.5

**Strategy:** Resend = transactional (invoices, enquiry receipts) · Mailchimp = marketing (audience **One FM Sales**)

No Mailchimp API key is required for the platform bridge — export and HTML snippet copy only.

---

## 1. Audience setup

1. Log in to [Mailchimp](https://mailchimp.com)
2. Create or open audience: **One FM Sales**
3. Default from name: `ONE FM 98.5`
4. From email: `admin@fm985.com.au` (or verified sender on `fm985.com.au` domain)
5. Enable double opt-in for cold imports; skip for contacts who already enquired via the website

## 2. Domain authentication (fm985.com.au)

1. Mailchimp → **Account → Domains → Authenticate**
2. Add DNS records at your domain host (SPF, DKIM, CNAME for tracking if desired)
3. Verify domain before sending campaigns
4. Set reply-to: `admin@fm985.com.au`

## 3. Export leads from the platform

1. Open **Social Hub** → scroll to **Export for Mailchimp**
2. Click **Export leads CSV** — downloads `one-fm-sales-leads.csv`
3. In Mailchimp: **Audience → Import contacts → Upload file**
4. Map columns:
   - `email` → Email Address
   - `firstName` → First Name
   - `lastName` → Last Name
   - `company` → Company
   - `phone` → Phone
   - `tags` → Tags (comma-separated)
5. Tag imported contacts: `website-lead`, source tag (`sponsorship`, `contact`, etc.)

**Note:** CSV currently exports from ops mock enquiry data. When Supabase enquiries are live, wire `mailchimpBridge.ts` to real enquiry fetch in ops portal.

## 4. Newsletter HTML snippet

1. Social Hub → **Copy HTML snippet**
2. Mailchimp campaign → **Design Email → Code your own** (or custom HTML block)
3. Paste snippet — Brand V3 navy header, gold wordmark, white body
4. Edit headline/body/CTA in `buildMailchimpNewsletterSnippet()` or manually in Mailchimp

## 5. Transactional vs marketing

| Type | Tool | Examples |
|------|------|----------|
| Transactional | Resend (Edge Function) | Invoice PDF, enquiry confirmation |
| Marketing | Mailchimp | Sponsor newsletters, rate card updates, GVL season promos |

**Do not** send invoices through Mailchimp. Use ops portal → Invoice Batch Sender → Resend.

## 6. Template ideas (One FM Sales)

- **New rate card** — link to `#/sponsorship`
- **GVL season opener** — link to `#/football`
- **Coverage spotlight** — link to `#/coverage`
- **Media kit refresh** — link to `#/media-kit`

## 7. Compliance

- Include unsubscribe link (Mailchimp adds automatically)
- Physical address in footer: Goulburn Valley Community Radio Inc., Shepparton VIC
- Only email contacts who enquired or opted in — no purchased lists

## 8. Files in repo

| File | Purpose |
|------|---------|
| `src/lib/mailchimpBridge.ts` | CSV export, HTML snippet builders |
| `src/pages/SocialHub.tsx` | Export UI section |
| `src/lib/email.ts` | Resend transactional templates (reference for HTML style) |

## 9. Checklist for Jay

- [ ] Mailchimp audience **One FM Sales** created
- [ ] `fm985.com.au` domain authenticated in Mailchimp
- [ ] Test import with sample CSV from Social Hub
- [ ] Send test campaign to yourself
- [ ] Confirm Resend still handles invoice emails separately
