/**
 * Shared enquiry submission — used by Contact, Football, SponsorshipKit, etc.
 * Inserts into Supabase contact_enquiries and sends email notifications.
 */
import { BRAND } from '@/lib/brand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { sendEnquiryNotification } from '@/lib/email'
import type { EnquirySource } from '@/components/ops/data/enquiries'

export interface SubmitEnquiryInput {
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  source: EnquirySource
  enquiryType?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  preferredContact?: string
}

export interface SubmitEnquiryResult {
  success: boolean
  id?: string
  stored?: boolean
  emailed?: boolean
  error?: string
}

/** Public fallback when store/send fails — same station contact as the Contact page. */
export function enquiryFallbackContact(): string {
  return `Call ${BRAND.phone} or email ${BRAND.email}.`
}

const NOT_SENT = `Nothing was stored or emailed. ${enquiryFallbackContact()}`

export async function submitEnquiry(
  input: SubmitEnquiryInput,
): Promise<SubmitEnquiryResult> {
  const enquiryType = input.enquiryType ?? input.subject

  let insertedId: string | undefined
  let stored = false

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('contact_enquiries')
      .insert({
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        organization: input.company ?? null,
        company: input.company ?? null,
        enquiry_type: enquiryType,
        message: input.message,
        preferred_contact: input.preferredContact ?? 'email',
        status: 'new',
        source: input.source,
        subject: input.subject,
        priority: input.priority ?? 'medium',
        notes: [],
      })
      .select('id')
      .single()

    if (error) {
      console.warn('[Enquiries] Supabase insert failed:', error.message)
    } else {
      insertedId = data?.id
      stored = true
    }
  }

  const email = await sendEnquiryNotification({
    name: input.name,
    email: input.email,
    phone: input.phone ?? '',
    organization: input.company,
    enquiryType,
    message: input.message,
    preferredContact: input.preferredContact ?? 'email',
  })

  if (stored || email.success) {
    return { success: true, id: insertedId, stored, emailed: !!email.success }
  }

  return {
    success: false,
    stored: false,
    emailed: false,
    error: email.devMode
      ? `Nothing was sent — email is not configured. ${enquiryFallbackContact()}`
      : email.error || NOT_SENT,
  }
}
