/**
 * Email Service — payload builder.
 * Browser code may build payloads, but real sends must go through Netlify
 * functions so provider API keys stay server-side.
 *
 * Production setup:
 *   1. Netlify functions send-enquiry + send-invoice deploy with the site
 *   2. Set RESEND_API_KEY (no VITE_ prefix) in Netlify env — stays server-side
 *
 */

import { BRAND } from '@/lib/brand'
import { readFunctionJson } from '@/lib/readFunctionJson'

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  from?: string
  attachments?: { filename: string; content: string }[]
}

export interface EnquiryEmailData {
  name: string
  email: string
  phone: string
  organization?: string
  enquiryType: string
  message: string
  preferredContact: string
}

export interface ProposalEmailData {
  customerName: string
  customerEmail: string
  companyName: string
  tierName: string
  total: number
  proposalId?: string
}

export interface InvoiceEmailData {
  customerName: string
  customerEmail: string
  invoiceNumber: string
  amount: number
  dueDate: string
  paymentLink: string
}

const STATION_EMAIL = import.meta.env.VITE_STATION_EMAIL || 'admin@fm985.com.au'

/* ── Template builders ──────────────────────────────────── */

export function buildEnquiryEmailHtml(data: EnquiryEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /></head>
    <body style="font-family: 'Inter', Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: #0A1628; padding: 32px 40px;">
          <div style="font-family: 'Space Grotesk', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #D4A84B; letter-spacing: -0.01em;">
            ONE FM 98.5
          </div>
          <div style="color: #8A9199; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px;">
            New Enquiry — ${data.enquiryType}
          </div>
        </div>
        <!-- Body -->
        <div style="padding: 32px 40px;">
          <h2 style="margin: 0 0 24px; font-size: 20px; color: #0A1628;">
            New ${data.enquiryType} Enquiry
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${[
              ['Name',                 data.name],
              ['Email',                data.email],
              ['Phone',                data.phone],
              ['Organisation',         data.organization || '—'],
              ['Enquiry Type',         data.enquiryType],
              ['Preferred Contact',    data.preferredContact],
            ].map(([label, value]) => `
              <tr>
                <td style="padding: 10px 0; color: #6B7280; font-size: 13px; width: 160px; vertical-align: top;">${label}</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 500;">${value}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom: 1px solid #F3F4F6;"></td></tr>
            `).join('')}
          </table>
          <div style="margin-top: 24px; background: #F9FAFB; border-radius: 8px; padding: 20px;">
            <div style="font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Message</div>
            <div style="font-size: 14px; color: #111827; line-height: 1.6;">${data.message.replace(/\n/g, '<br>')}</div>
          </div>
          <div style="margin-top: 32px; padding: 16px 20px; background: #FFF8EE; border-left: 4px solid #D4A84B; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #92400E;">
              Reply directly to this email to respond to ${data.name}.
              Their reply-to address is <strong>${data.email}</strong>.
            </p>
          </div>
        </div>
        <!-- Footer -->
        <div style="background: #F9FAFB; padding: 20px 40px; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
            ONE FM 98.5 · Shepparton, VIC · Australia<br>
            This notification was sent from your website contact form.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function buildEnquiryConfirmationHtml(data: EnquiryEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /></head>
    <body style="font-family: 'Inter', Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: #0A1628; padding: 32px 40px;">
          <div style="font-family: 'Space Grotesk', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #D4A84B;">
            ONE FM 98.5
          </div>
          <div style="color: #8A9199; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px;">
            We've received your message
          </div>
        </div>
        <div style="padding: 32px 40px;">
          <h2 style="margin: 0 0 16px; font-size: 22px; color: #0A1628;">
            Thanks, ${data.name}!
          </h2>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 16px;">
            We've received your <strong>${data.enquiryType.toLowerCase()}</strong> enquiry. Call <strong>${BRAND.phone}</strong> or email <strong>${BRAND.email}</strong> to follow up — this confirmation does not promise a reply time.
          </p>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 32px;">
            In the meantime, listen to ${BRAND.fullName} on ${BRAND.frequency} FM or stream at <a href="${BRAND.website}" style="color: #D4A84B;">fm985.com.au</a>.
          </p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
            <div style="font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Your message</div>
            <div style="font-size: 14px; color: #374151; line-height: 1.6; font-style: italic;">"${data.message.slice(0, 200)}${data.message.length > 200 ? '…' : ''}"</div>
          </div>
        </div>
        <div style="background: #F9FAFB; padding: 20px 40px; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
            ONE FM 98.5 · ${STATION_EMAIL} · Shepparton, VIC<br>
            You received this because you submitted an enquiry on our website.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function buildProposalEmailHtml(data: ProposalEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /></head>
    <body style="font-family: 'Inter', Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: #0A1628; padding: 32px 40px;">
          <div style="font-family: 'Space Grotesk', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #D4A84B;">ONE FM 98.5</div>
          <div style="color: #8A9199; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px;">Sponsorship Proposal</div>
        </div>
        <div style="padding: 32px 40px;">
          <h2 style="margin: 0 0 16px; font-size: 22px; color: #0A1628;">Your Proposal is Ready</h2>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 16px;">
            Hi ${data.customerName}, thank you for your interest in partnering with ONE FM 98.5.
            Your custom sponsorship proposal has been prepared and is attached to this email.
          </p>
          <div style="background: #FFF8EE; border: 1px solid #FCD97D; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <div style="font-size: 13px; color: #92400E; margin-bottom: 8px; font-weight: 600;">Proposal Summary</div>
            <div style="font-size: 14px; color: #78350F;">
              <strong>Company:</strong> ${data.companyName}<br>
              <strong>Package:</strong> ${data.tierName}<br>
              <strong>Investment:</strong> $${data.total.toLocaleString()}
            </div>
          </div>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 24px;">
            Reply to this email, call ${BRAND.phone}, or write to ${BRAND.email} if you have questions.
          </p>
        </div>
        <div style="background: #F9FAFB; padding: 20px 40px; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
            ONE FM 98.5 · ${STATION_EMAIL} · Shepparton, VIC
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/* ── Send function ───────────────────────────────────────── */

/**
 * Browser fallback. It never sends directly because RESEND_API_KEY must stay
 * server-side in Netlify functions.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string; messageId?: string; devMode?: boolean }> {
  console.warn('[EmailService] Email NOT sent from browser; use Netlify function path.', {
    to: payload.to,
    subject: payload.subject,
    attachments: payload.attachments?.length ?? 0,
  })
  return { success: false, devMode: true }
}

/* ── Convenience wrappers ───────────────────────────────── */

export async function sendEnquiryNotification(
  data: EnquiryEmailData,
): Promise<{ success: boolean; devMode?: boolean; error?: string }> {
  const stationHtml = buildEnquiryEmailHtml(data)
  const confirmationHtml = buildEnquiryConfirmationHtml(data)

  // Preferred path: Netlify serverless function (Resend key stays server-side)
  try {
    const res = await fetch('/.netlify/functions/send-enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        enquiryType: data.enquiryType,
        message: data.message,
        stationHtml,
        confirmationHtml,
      }),
    })
    const result = await readFunctionJson<{ success?: boolean }>(res)
    if (result?.success) return { success: true }
    console.warn('[Email] send-enquiry function responded:', res.status)
  } catch (err) {
    console.warn('[Email] send-enquiry function unavailable (dev mode?), falling back:', err)
  }

  const station = await sendEmail({
    to: STATION_EMAIL,
    subject: `New ${data.enquiryType} Enquiry — ${data.name}`,
    html: stationHtml,
    replyTo: data.email,
  })
  if (!station.success) {
    return { success: false, devMode: station.devMode, error: station.error }
  }

  await sendEmail({
    to: data.email,
    subject: `We've received your message — ONE FM 98.5`,
    html: confirmationHtml,
  })
  return { success: true }
}

export async function sendProposalEmail(data: ProposalEmailData) {
  await sendEmail({
    to: data.customerEmail,
    subject: `Your ONE FM 98.5 Sponsorship Proposal — ${data.companyName}`,
    html: buildProposalEmailHtml(data),
    replyTo: STATION_EMAIL,
  })
}
