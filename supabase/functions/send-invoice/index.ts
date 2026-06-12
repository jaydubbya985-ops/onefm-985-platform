import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS_HEADERS, jsonResponse, sendViaResend } from '../_shared/resend.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const body = await req.json()
    const {
      to,
      subject,
      html,
      pdfBase64,
      filename,
      replyTo,
      invoiceId,
    } = body as {
      to: string
      subject: string
      html: string
      pdfBase64?: string
      filename?: string
      replyTo?: string
      invoiceId?: string
    }

    if (!to || !subject || !html) {
      return jsonResponse({ error: 'Missing required fields: to, subject, html' }, 400)
    }

    const result = await sendViaResend({
      to,
      subject,
      html,
      replyTo: replyTo ?? 'accounts@fm985.com.au',
      attachments: pdfBase64
        ? [{ filename: filename ?? 'invoice.pdf', content: pdfBase64 }]
        : undefined,
    })

    if (result.error) {
      return jsonResponse({ error: result.error }, 502)
    }

    if (invoiceId) {
      await supabase
        .from('ops_invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_message_id: result.id ?? null,
          email_sent_to: to,
        })
        .eq('id', invoiceId)
    }

    return jsonResponse({ success: true, messageId: result.id })
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      500,
    )
  }
})
