/**
 * Shared enquiry submission — used by Contact, Football, SponsorshipKit, etc.
 * Inserts into Supabase contact_enquiries and sends email notifications.
 */
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
  error?: string
}

export async function submitEnquiry(
  input: SubmitEnquiryInput,
): Promise<SubmitEnquiryResult> {
  const enquiryType = input.enquiryType ?? input.subject

  let insertedId: string | undefined

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
    }
  }

  // Always attempt email notification (works in dev log mode without API key)
  await sendEnquiryNotification({
    name: input.name,
    email: input.email,
    phone: input.phone ?? '',
    organization: input.company,
    enquiryType,
    message: input.message,
    preferredContact: input.preferredContact ?? 'email',
  })

  return { success: true, id: insertedId }
}
