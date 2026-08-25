/**
 * ONE FM pay-to details — single source for invoices, email, PDF, donate page.
 *
 * BSB and account number are the live NAB details already used on station paper.
 * Account name is the licensed legal entity so transfers land cleanly.
 * Do not invent a different BSB, account, or bank.
 */
import { BRAND } from '@/lib/brand'

export const BANK_INSTITUTION = 'National Australia Bank'
export const BANK_INSTITUTION_SHORT = 'NAB'
export const BANK_BSB = '083-894'
export const BANK_ACCOUNT = '553 219 432'
/** NAB payee — legal entity, not a nickname. */
export const BANK_ACCOUNT_NAME = BRAND.org
export const BANK_TRADING_AS = BRAND.fullName

export const BANK_REFERENCE_HINT =
  'Please use the invoice number as the payment reference so we can thank you quickly.'
