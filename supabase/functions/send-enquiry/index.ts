import { CORS_HEADERS, jsonResponse, sendViaResend } from '../_shared/resend.ts'

const STATION_EMAIL = Deno.env.get('STATION_EMAIL') ?? 'admin@fm985.com.au'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const {
      name,
      email,
      phone,
      organization,
      enquiryType,
      message,
      preferredContact,
      stationHtml,
      confirmationHtml,
    } = body as {
      name: string
      email: string
      phone?: string
      organization?: string
      enquiryType: string
      message: string
      preferredContact?: string
      stationHtml: string
      confirmationHtml: string
    }

    if (!name || !email || !enquiryType || !message || !stationHtml || !confirmationHtml) {
      return jsonResponse({ error: 'Missing required enquiry fields' }, 400)
    }

    const stationResult = await sendViaResend({
      to: STATION_EMAIL,
      subject: `New ${enquiryType} Enquiry — ${name}`,
      html: stationHtml,
      replyTo: email,
    })

    if (stationResult.error) {
      return jsonResponse({ error: stationResult.error }, 502)
    }

    const confirmResult = await sendViaResend({
      to: email,
      subject: `We've received your message — ONE FM 98.5`,
      html: confirmationHtml,
      replyTo: STATION_EMAIL,
    })

    if (confirmResult.error) {
      return jsonResponse({ error: confirmResult.error }, 502)
    }

    return jsonResponse({
      success: true,
      stationMessageId: stationResult.id,
      confirmationMessageId: confirmResult.id,
    })
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      500,
    )
  }
})
