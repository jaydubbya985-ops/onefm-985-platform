import { BRAND } from '@/lib/brand'

/** ONE FM 98.5 NAB account — used by invoices, receipts, and contract PDFs. */
export const BANK_BSB = '083-894'
export const BANK_ACCOUNT = '553 219 432'
/** Name on the NAB account — do not invent a different trading name. */
export const BANK_ACCOUNT_NAME = '98.5 One FM'

/** Copy-paste bank instruction. Online pay links are not configured. */
export function bankPayLine(reference?: string): string {
  const ref = reference ? ` Reference: ${reference}.` : ''
  return `Pay to ${BANK_ACCOUNT_NAME} (${BRAND.org}). NAB BSB ${BANK_BSB}, account ${BANK_ACCOUNT}.${ref}`
}
