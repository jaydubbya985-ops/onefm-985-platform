import type { Handler, HandlerEvent } from '@netlify/functions'
import { enquiryStationReceipt } from '../../src/lib/enquiryStationReceipt'

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

function json(statusCode: number, payload: Record<string, unknown>) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(payload),
  }
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
    return json(405, { error: 'Method not allowed' })
  }

  if (!RESEND_API_KEY) {
    return json(500, { error: 'Email service not configured' })
  }

  let body: EnquiryBody
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  if (!body.name || !body.email || !body.enquiryType || !body.message || !body.stationHtml || !body.confirmationHtml) {
    return json(400, { error: 'Missing required enquiry fields' })
  }

  let stationResult: { id?: string; error?: string }
  try {
    stationResult = await sendViaResend({
      to: STATION_EMAIL,
      subject: `New ${body.enquiryType} Enquiry — ${body.name}`,
      html: body.stationHtml,
      replyTo: body.email,
    })
  } catch (err) {
    console.error('[send-enquiry] Resend unreachable on station send:', err)
    return json(502, { error: 'Email service unreachable' })
  }

  if (stationResult.error) {
    const receipt = enquiryStationReceipt(
      { ok: false, error: stationResult.error },
      { ok: false },
    )
    return json(receipt.statusCode, receipt.body)
  }

  let confirmResult: { id?: string; error?: string }
  try {
    confirmResult = await sendViaResend({
      to: body.email,
      subject: `We've received your message — ONE FM 98.5`,
      html: body.confirmationHtml,
      replyTo: STATION_EMAIL,
    })
  } catch (err) {
    console.error('[send-enquiry] Resend unreachable on confirmation:', err)
    confirmResult = { error: 'Confirmation email unreachable' }
  }

  const receipt = enquiryStationReceipt(
    { ok: true, id: stationResult.id },
    confirmResult.error
      ? { ok: false, error: confirmResult.error }
      : { ok: true, id: confirmResult.id },
  )
  return json(receipt.statusCode, receipt.body)
}
