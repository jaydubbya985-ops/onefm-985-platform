/**
 * Invoice + receipt email dispatch — Netlify function (production),
 * direct Resend API (dev fallback), or mailto last resort.
 *
 * SAFETY: when `testMode` is true, mail NEVER goes to the sponsor address.
 * It always redirects to `testRecipient` (or DEFAULT_TEST_INBOX) and prefixes [TEST].
 */
import type { jsPDF } from 'jspdf'
import { sendEmail } from '@/lib/email'
import { readFunctionJson } from '@/lib/readFunctionJson'
import {
  BANK_ACCOUNT,
  BANK_ACCOUNT_NAME,
  BANK_BSB,
  generateInvoiceEmailHtml,
  generateInvoicePdf,
  generateReceiptEmailHtml,
  type PdfInvoiceData,
} from '@/components/ops/InvoiceEmailTemplate'

/** Default inbox for test sends — never a sponsor address */
export const DEFAULT_TEST_INBOX = 'jasonstv1@bigpond.com'

export interface InvoiceSendPayload extends PdfInvoiceData {
  to: string
  emailSubject: string
  emailBody?: string
  invoiceId?: string
  /** When true, forces delivery to testRecipient / DEFAULT_TEST_INBOX — never `to`. */
  testMode?: boolean
  /** Override test inbox (defaults to DEFAULT_TEST_INBOX). */
  testRecipient?: string
}

export interface ReceiptSendPayload {
  to: string
  contactName: string
  company: string
  invoiceNumber: string
  amount: number
  paymentDate: string
  paymentMethod: string
  reference?: string
}

export interface SendResult {
  success: boolean
  messageId?: string
  usedMailtoFallback?: boolean
  error?: string
  /** True when no real email service is configured — nothing was actually sent. */
  devMode?: boolean
}

function pdfToBase64(pdf: jsPDF): string {
  return pdf.output('datauristring').split(',')[1] ?? ''
}

/** Dry-run or sent:false must never be treated as a real email. */
function readSendResult(
  data: { success?: boolean; messageId?: string; dryRun?: boolean; sent?: boolean } | null,
): SendResult | null {
  if (!data) return null
  if (data.dryRun || data.sent === false) {
    return { success: false, error: 'Invoice was not emailed (dry-run or send failed).' }
  }
  if (data.success) return { success: true, messageId: data.messageId }
  return null
}

function buildInvoiceHtml(payload: InvoiceSendPayload): string {
  return generateInvoiceEmailHtml(
    {
      contactName: payload.contactName ?? '',
      company: payload.company ?? '',
      invoiceNumber: payload.number,
      amountExclGst: payload.amountExclGst,
      gst: payload.gst,
      total: payload.total,
      dueDate: payload.dueDate,
      customMessage: payload.emailBody ?? '',
      campaign: payload.description,
    },
    BANK_BSB,
    BANK_ACCOUNT,
    BANK_ACCOUNT_NAME,
  )
}

/** Resolve recipient + subject with hard test-mode redirect. */
function resolveDelivery(payload: InvoiceSendPayload): { recipient: string; subject: string } {
  if (payload.testMode) {
    const recipient = (payload.testRecipient || DEFAULT_TEST_INBOX).trim() || DEFAULT_TEST_INBOX
    const subject = payload.emailSubject.startsWith('[TEST]')
      ? payload.emailSubject
      : `[TEST] ${payload.emailSubject}`
    return { recipient, subject }
  }
  return { recipient: payload.to, subject: payload.emailSubject }
}

/** Send invoice email with PDF attachment via Netlify function (production) or Resend direct (dev). */
export async function dispatchInvoiceEmail(
  payload: InvoiceSendPayload,
): Promise<SendResult> {
  const { recipient, subject } = resolveDelivery(payload)
  const html = buildInvoiceHtml(payload)

  let pdfBase64: string | undefined
  try {
    const pdf = await generateInvoicePdf(payload)
    pdfBase64 = pdfToBase64(pdf)
  } catch (err) {
    console.warn('[InvoiceSend] PDF generation failed:', err)
  }

  // 1. Netlify serverless function (production — RESEND_API_KEY stays server-side)
  try {
    const res = await fetch('/.netlify/functions/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipient,
        subject,
        html,
        pdfBase64,
        filename: `${payload.number}.pdf`,
        replyTo: 'accounts@fm985.com.au',
      }),
    })

    const data = await readFunctionJson<{
      success?: boolean
      messageId?: string
      dryRun?: boolean
      sent?: boolean
    }>(res)
    const parsed = readSendResult(data)
    if (parsed) return parsed
    if (!res.ok) {
      console.warn('[InvoiceSend] Netlify function responded:', res.status)
    }
  } catch (err) {
    console.warn('[InvoiceSend] Netlify function unavailable (dev mode?):', err)
  }

  // 2. Browser fallback reports unsent; real email requires the Netlify function.
  const fallbackResult = await sendEmail({
    to: recipient,
    subject,
    html,
    replyTo: 'accounts@fm985.com.au',
    attachments: pdfBase64
      ? [{ filename: `${payload.number}.pdf`, content: pdfBase64 }]
      : undefined,
  })

  if (fallbackResult.success && fallbackResult.messageId) {
    return { success: true, messageId: fallbackResult.messageId }
  }

  if (fallbackResult.devMode) {
    return { success: false, devMode: true }
  }

  return {
    success: false,
    usedMailtoFallback: true,
    error: fallbackResult.error ?? 'Email service unavailable',
  }
}

/** Send payment receipt email. */
export async function dispatchReceiptEmail(
  payload: ReceiptSendPayload,
): Promise<SendResult> {
  const html = generateReceiptEmailHtml({
    contactName: payload.contactName,
    company: payload.company,
    invoiceNumber: payload.invoiceNumber,
    amount: payload.amount,
    paymentDate: payload.paymentDate,
    paymentMethod: payload.paymentMethod,
    reference: payload.reference ?? payload.invoiceNumber,
  })

  const subject = `Payment Received — ${payload.invoiceNumber} | ONE FM 98.5`

  try {
    const res = await fetch('/.netlify/functions/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: payload.to, subject, html, replyTo: 'accounts@fm985.com.au' }),
    })
    const data = await readFunctionJson<{
      success?: boolean
      messageId?: string
      dryRun?: boolean
      sent?: boolean
    }>(res)
    const parsed = readSendResult(data)
    if (parsed) return parsed
  } catch {
    // fall through to browser fallback
  }

  const result = await sendEmail({
    to: payload.to,
    subject,
    html,
    replyTo: 'accounts@fm985.com.au',
  })

  if (result.devMode) return { success: false, devMode: true }
  if (result.success) return { success: true, messageId: result.messageId }
  return { success: false, usedMailtoFallback: true, error: result.error }
}

/** Build mailto URL as last-resort fallback when Resend is unavailable. */
export function buildMailtoInvoiceUrl(payload: InvoiceSendPayload): string {
  const body = encodeURIComponent(`Hi ${payload.contactName || 'there'},

Please find your ONE FM 98.5 invoice attached (PDF downloaded to your Downloads folder).

Invoice #: ${payload.number}
Company: ${payload.company}
Amount: $${payload.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })} (inc GST)
Due: ${payload.dueDate}

Payment by bank transfer:
NAB | BSB: ${BANK_BSB} | Account: ${BANK_ACCOUNT}
Account Name: ${BANK_ACCOUNT_NAME}
Reference: ${payload.number}

Thank you for supporting ONE FM 98.5.

Jason Welsh
Vice Chair, ONE FM 98.5
accounts@fm985.com.au`)

  const { recipient, subject } = resolveDelivery(payload)
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${body}`
}

/** Sequential batch send with rate-limit spacing. */
export async function dispatchInvoiceBatch(
  items: InvoiceSendPayload[],
  onProgress?: (index: number, total: number, result: SendResult) => void,
  options?: { testMode?: boolean; testRecipient?: string },
): Promise<{ sent: number; failed: number; mailtoFallback: number; devMode: number }> {
  let sent = 0
  let failed = 0
  let mailtoFallback = 0
  let devMode = 0

  for (let i = 0; i < items.length; i++) {
    const item: InvoiceSendPayload = options?.testMode
      ? {
          ...items[i],
          testMode: true,
          testRecipient: options.testRecipient || DEFAULT_TEST_INBOX,
        }
      : items[i]
    const result = await dispatchInvoiceEmail(item)
    onProgress?.(i + 1, items.length, result)

    if (result.devMode) {
      devMode++
    } else if (result.success) {
      sent++
    } else if (result.usedMailtoFallback) {
      mailtoFallback++
      window.open(buildMailtoInvoiceUrl(item), '_blank')
    } else {
      failed++
    }

    // Resend rate limit: ~2/sec on free tier
    if (i < items.length - 1) {
      await new Promise((r) => setTimeout(r, 600))
    }
  }

  return { sent, failed, mailtoFallback, devMode }
}
