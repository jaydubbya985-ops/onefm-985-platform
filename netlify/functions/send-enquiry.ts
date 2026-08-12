import type { Handler, HandlerEvent } from '@netlify/functions'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const STATION_EMAIL = process.env.STATION_EMAIL ?? 'admin@fm985.com.au'
const FROM = 'ONE FM 98.5 <accounts@fm985.com.au>'

interface EnquiryBody {
  name: string
  email: string
  enquiryType: string
  message: string
  stationHtml: string
  confirmationHtml: string
}

async function sendViaResend(payload: {
  to: string
  subject: string
  html: string
  replyTo: string
}): Promise<{ id?: string; error?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
    }),
  })
  const data = (await res.json()) as { id?: string; message?: string }
  if (!res.ok) return { error: data.message ?? 'Send failed' }
  return { id: data.id }
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) }
  }

  let body: EnquiryBody
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!body.name || !body.email || !body.enquiryType || !body.message || !body.stationHtml || !body.confirmationHtml) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required enquiry fields' }) }
  }

  try {
    const stationResult = await sendViaResend({
      to: STATION_EMAIL,
      subject: `New ${body.enquiryType} Enquiry — ${body.name}`,
      html: body.stationHtml,
      replyTo: body.email,
    })
    if (stationResult.error) {
      return { statusCode: 502, body: JSON.stringify({ error: stationResult.error }) }
    }

    const confirmResult = await sendViaResend({
      to: body.email,
      subject: `We've received your message — ONE FM 98.5`,
      html: body.confirmationHtml,
      replyTo: STATION_EMAIL,
    })
    if (confirmResult.error) {
      return { statusCode: 502, body: JSON.stringify({ error: confirmResult.error }) }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        stationMessageId: stationResult.id,
        confirmationMessageId: confirmResult.id,
      }),
    }
  } catch (err) {
    console.error('[send-enquiry] Resend unreachable:', err)
    return { statusCode: 502, body: JSON.stringify({ error: 'Email service unreachable' }) }
  }
}
