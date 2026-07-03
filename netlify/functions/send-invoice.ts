import type { Handler, HandlerEvent } from '@netlify/functions'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'ONE FM 98.5 <accounts@fm985.com.au>'
const REPLY_TO = 'accounts@fm985.com.au'

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) }
  }

  let body: {
    to: string
    subject: string
    html: string
    pdfBase64?: string
    filename?: string
    replyTo?: string
  }

  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!body.to || !body.subject || !body.html) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: to, subject, html' }) }
  }

  const payload: Record<string, unknown> = {
    from: FROM,
    to: [body.to],
    subject: body.subject,
    html: body.html,
    reply_to: body.replyTo ?? REPLY_TO,
  }

  if (body.pdfBase64 && body.filename) {
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

    const data = await res.json() as { id?: string; message?: string }

    if (!res.ok) {
      console.error('[send-invoice] Resend error:', data)
      return { statusCode: res.status, body: JSON.stringify({ error: data.message ?? 'Send failed' }) }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, messageId: data.id }),
    }
  } catch (err) {
    console.error('[send-invoice] Fetch error:', err)
    return { statusCode: 502, body: JSON.stringify({ error: 'Email service unreachable' }) }
  }
}
