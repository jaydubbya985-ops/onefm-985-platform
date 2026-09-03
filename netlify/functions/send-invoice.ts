import type { Handler, HandlerEvent } from '@netlify/functions'
import { invoiceDryRunPayload } from '../../src/lib/invoiceDryRun'
import { INVOICE_FROM, probeResend } from '../lib/resendProbe'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = INVOICE_FROM
const REPLY_TO = 'accounts@fm985.com.au'

type InvoiceSendBody = {
  to: string
  subject: string
  html: string
  pdfBase64?: string
  filename?: string
  replyTo?: string
  dryRun?: boolean
}

function json(statusCode: number, payload: object) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(payload),
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!RESEND_API_KEY) {
    return json(500, { error: 'Email service not configured' })
  }

  let body: InvoiceSendBody
  try {
    body = JSON.parse(event.body ?? '{}') as InvoiceSendBody
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  if (!body.to || !body.subject || !body.html) {
    return json(400, { error: 'Missing required fields: to, subject, html' })
  }

  const hasPdf = Boolean(body.pdfBase64 && body.filename)

  // Dry-run: prove the pipeline can reach Resend, never call /emails.
  if (body.dryRun === true) {
    const probe = await probeResend(RESEND_API_KEY)
    return json(
      200,
      invoiceDryRunPayload(probe, {
        to: body.to,
        hasPdf,
        filename: body.filename ?? null,
        from: FROM,
      }),
    )
  }

  const payload: Record<string, unknown> = {
    from: FROM,
    to: [body.to],
    subject: body.subject,
    html: body.html,
    reply_to: body.replyTo ?? REPLY_TO,
  }

  if (hasPdf) {
    payload.attachments = [{ filename: body.filename, content: body.pdfBase64 }]
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = (await res.json()) as { id?: string; message?: string }

    if (!res.ok) {
      console.error('[send-invoice] Resend error:', data)
      return json(res.status, { error: data.message ?? 'Send failed', sent: false })
    }

    return json(200, { success: true, sent: true, messageId: data.id })
  } catch (err) {
    console.error('[send-invoice] Fetch error:', err)
    return json(502, { error: 'Email service unreachable', sent: false })
  }
}
