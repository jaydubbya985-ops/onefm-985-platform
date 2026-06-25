/**
 * Mailchimp bridge — export helpers only (no API key required).
 * Resend = transactional · Mailchimp = marketing (audience "One FM Sales")
 */

import type { Enquiry } from '@/components/ops/data/enquiries'
import { buildEnquiryEmailHtml, type EnquiryEmailData } from '@/lib/email'
import { BRAND } from '@/lib/brand'

export interface MailchimpLeadRow {
  email: string
  firstName: string
  lastName: string
  company: string
  phone: string
  source: string
  tags: string
  notes: string
}

const CSV_HEADERS: (keyof MailchimpLeadRow)[] = [
  'email',
  'firstName',
  'lastName',
  'company',
  'phone',
  'source',
  'tags',
  'notes',
]

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length <= 1) return { firstName: parts[0] ?? '', lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** Convert enquiry records to Mailchimp-importable CSV rows. */
export function enquiriesToMailchimpRows(enquiries: Enquiry[]): MailchimpLeadRow[] {
  return enquiries.map((e) => {
    const { firstName, lastName } = splitName(e.name)
    return {
      email: e.email,
      firstName,
      lastName,
      company: e.company ?? '',
      phone: e.phone,
      source: e.source,
      tags: `enquiry,${e.source},${e.status}`,
      notes: `${e.subject} — ${e.message.slice(0, 200)}`,
    }
  })
}

/** Build CSV string for Mailchimp audience import. */
export function buildMailchimpLeadsCsv(enquiries: Enquiry[]): string {
  const rows = enquiriesToMailchimpRows(enquiries)
  const lines = [
    CSV_HEADERS.join(','),
    ...rows.map((row) => CSV_HEADERS.map((h) => escapeCsv(row[h])).join(',')),
  ]
  return lines.join('\n')
}

/** Trigger browser download of Mailchimp-ready CSV. */
export function downloadMailchimpLeadsCsv(enquiries: Enquiry[], filename = 'one-fm-sales-leads.csv'): void {
  const csv = buildMailchimpLeadsCsv(enquiries)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Static sample row format for manual ops export. */
export function sampleMailchimpCsv(): string {
  const sample: MailchimpLeadRow = {
    email: 'sponsor@example.com.au',
    firstName: 'Alex',
    lastName: 'Taylor',
    company: 'Example Pty Ltd',
    phone: '0400 000 000',
    source: 'sponsorship',
    tags: 'enquiry,sponsorship,new',
    notes: 'Interested in Q3 breakfast sponsorship',
  }
  return [CSV_HEADERS.join(','), CSV_HEADERS.map((h) => escapeCsv(sample[h])).join(',')].join('\n')
}

/** Generate Mailchimp-ready HTML from existing enquiry email template. */
export function buildMailchimpHtmlFromEnquiry(data: EnquiryEmailData): string {
  return buildEnquiryEmailHtml(data)
}

/** Minimal branded newsletter snippet for Mailchimp drag-and-drop HTML block. */
export function buildMailchimpNewsletterSnippet(opts: {
  headline: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
}): string {
  const cta = opts.ctaLabel && opts.ctaUrl
    ? `<a href="${opts.ctaUrl}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#1B458F;color:#FFFFFF;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">${opts.ctaLabel}</a>`
    : ''

  return `<!-- ONE FM 98.5 · Mailchimp HTML block · ${BRAND.fullName} -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  <tr>
    <td style="background:#071D3A;padding:32px 40px;text-align:center;">
      <div style="font-size:22px;font-weight:700;color:#D4AF37;letter-spacing:0.02em;">ONE FM 98.5</div>
      <div style="font-size:11px;color:#8A9199;letter-spacing:0.12em;text-transform:uppercase;margin-top:6px;">Goulburn Valley Community Radio</div>
    </td>
  </tr>
  <tr>
    <td style="background:#FFFFFF;padding:36px 40px;">
      <h1 style="margin:0 0 16px;font-size:24px;color:#071D3A;">${opts.headline}</h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#333333;">${opts.body}</p>
      ${cta}
    </td>
  </tr>
  <tr>
    <td style="background:#F5F5F5;padding:20px 40px;text-align:center;font-size:11px;color:#666666;">
      ${BRAND.org} · ${BRAND.address} · <a href="https://fm985.com.au" style="color:#1B458F;">fm985.com.au</a>
    </td>
  </tr>
</table>`
}

/** Copy HTML snippet to clipboard (ops workflow). */
export async function copyMailchimpSnippetToClipboard(snippet: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(snippet)
    return true
  } catch {
    return false
  }
}
