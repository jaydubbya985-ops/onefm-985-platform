/**
 * Invoice + receipt email dispatch — Resend via Edge Function (preferred),
 * direct Resend API (dev), or mailto fallback.
 */
import type { jsPDF } from 'jspdf'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import {
  BANK_ACCOUNT,
  BANK_ACCOUNT_NAME,
  BANK_BSB,
  generateInvoiceEmailHtml,
  generateInvoicePdf,
  generateReceiptEmailHtml,
  type PdfInvoiceData,
} from '@/components/ops/InvoiceEmailTemplate'

export interface InvoiceSendPayload extends PdfInvoiceData {
  to: string
  emailSubject: string
  emailBody?: string
  invoiceId?: string
  testMode?: boolean
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
}

function pdfToBase64(pdf: jsPDF): string {
  return pdf.output('datauristring').split(',')[1] ?? ''
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

/** Send invoice email with PDF attachment via Edge Function or Resend. */
export async function dispatchInvoiceEmail(
  payload: InvoiceSendPayload,
): Promise<SendResult> {
  const recipient = payload.to
  const subject = payload.emailSubject
  const html = buildInvoiceHtml(payload)

  let pdfBase64: string | undefined
  try {
    const pdf = await generateInvoicePdf(payload)
    pdfBase64 = pdfToBase64(pdf)
  } catch (err) {
    console.warn('[InvoiceSend] PDF generation failed:', err)
  }

  // 1. Supabase Edge Function (production — API key stays server-side)
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: {
          to: recipient,
          subject,
          html,
          pdfBase64,
          filename: `${payload.number}.pdf`,
          replyTo: 'accounts@fm985.com.au',
          invoiceId: payload.invoiceId,
        },
      })

      if (!error && data?.success) {
        return { success: true, messageId: data.messageId }
      }

      if (error) {
        console.warn('[InvoiceSend] Edge function failed:', error.message)
      } else if (data?.error) {
        console.warn('[InvoiceSend] Edge function error:', data.error)
      }
    } catch (err) {
      console.warn('[InvoiceSend] Edge function unavailable:', err)
    }
  }

  // 2. Direct Resend (dev / staging with VITE_RESEND_API_KEY)
  const directResult = await sendEmail({
    to: recipient,
    subject,
    html,
    replyTo: 'accounts@fm985.com.au',
    attachments: pdfBase64
      ? [{ filename: `${payload.number}.pdf`, content: pdfBase64 }]
      : undefined,
  })

  if (directResult.success && directResult.messageId) {
    return { success: true, messageId: directResult.messageId }
  }

  if (directResult.success && !import.meta.env.VITE_RESEND_API_KEY) {
    // Dev log mode — treat as success for UX testing
    return { success: true }
  }

  return {
    success: false,
    usedMailtoFallback: true,
    error: directResult.error ?? 'Email service unavailable',
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

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: {
          to: payload.to,
          subject,
          html,
          replyTo: 'accounts@fm985.com.au',
        },
      })
      if (!error && data?.success) {
        return { success: true, messageId: data.messageId }
      }
    } catch {
      // fall through
    }
  }

  const result = await sendEmail({
    to: payload.to,
    subject,
    html,
    replyTo: 'accounts@fm985.com.au',
  })

  if (result.success) return { success: true, messageId: result.messageId }
  return { success: false, usedMailtoFallback: true, error: result.error }
}

/** Build mailto URL as last-resort fallback when Resend is unavailable. */
export function buildMailtoInvoiceUrl(payload: InvoiceSendPayload): string {
  const html = buildInvoiceHtml(payload)
  const body = encodeURIComponent(`Hi ${payload.contactName || 'there'},

Please find your invoice from ONE FM 98.5 attached.

INVOICE DETAILS:
• Invoice #: ${payload.number}
• Company: ${payload.company}
• Amount: $${payload.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })} (inc GST)
• Due Date: ${payload.dueDate}

PAYMENT — Bank Transfer (Preferred):
  NAB | BSB: ${BANK_BSB} | Account: ${BANK_ACCOUNT}
  Account Name: ${BANK_ACCOUNT_NAME}
  Reference: ${payload.number}

---
${html}
---

Jason Welsh
Station Manager, ONE FM 98.5`)

  return `mailto:${payload.to}?subject=${encodeURIComponent(payload.emailSubject)}&body=${body}`
}

/** Sequential batch send with rate-limit spacing. */
export async function dispatchInvoiceBatch(
  items: InvoiceSendPayload[],
  onProgress?: (index: number, total: number, result: SendResult) => void,
): Promise<{ sent: number; failed: number; mailtoFallback: number }> {
  let sent = 0
  let failed = 0
  let mailtoFallback = 0

  for (let i = 0; i < items.length; i++) {
    const result = await dispatchInvoiceEmail(items[i])
    onProgress?.(i + 1, items.length, result)

    if (result.success) {
      sent++
    } else if (result.usedMailtoFallback) {
      mailtoFallback++
      window.open(buildMailtoInvoiceUrl(items[i]), '_blank')
    } else {
      failed++
    }

    // Resend rate limit: ~2/sec on free tier
    if (i < items.length - 1) {
      await new Promise((r) => setTimeout(r, 600))
    }
  }

  return { sent, failed, mailtoFallback }
}
