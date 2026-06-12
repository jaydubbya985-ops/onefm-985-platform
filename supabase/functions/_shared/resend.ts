export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

export async function sendViaResend(payload: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  attachments?: { filename: string; content: string }[]
}): Promise<{ id?: string; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    return { error: 'RESEND_API_KEY not configured on server' }
  }

  const from =
    Deno.env.get('RESEND_FROM') ?? 'ONE FM 98.5 <accounts@fm985.com.au>'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
      attachments: payload.attachments?.length ? payload.attachments : undefined,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return { error: err }
  }

  const data = (await res.json()) as { id?: string }
  return { id: data.id }
}
