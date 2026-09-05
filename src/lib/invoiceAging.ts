import { calendarDaysBetween, todayISO } from '@/lib/opsClock'

export type AgedKind =
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'unsent_stale'
  | 'sent'
  | 'draft'

export interface AgeableInvoice {
  status: string
  dueDate: string
  paidAmount?: number
  total?: number
}

/**
 * Honest aging:
 * - paid stays paid
 * - sent (or partial) past due → overdue
 * - never sent, original due date has passed → unsent_stale (not AR-overdue)
 * - never sent, still inside terms → draft
 */
export function ageInvoice(
  invoice: AgeableInvoice,
  today: string = todayISO(),
): AgedKind {
  if (invoice.status === 'paid') return 'paid'
  if (invoice.status === 'partially_paid' || invoice.status === 'partial') {
    const days = calendarDaysBetween(invoice.dueDate, today)
    return days > 0 ? 'overdue' : 'partial'
  }
  const daysPastDue = calendarDaysBetween(invoice.dueDate, today)
  const sentLike =
    invoice.status === 'sent' ||
    invoice.status === 'previewed' ||
    invoice.status === 'tested' ||
    invoice.status === 'overdue'

  if (sentLike) {
    if (invoice.status === 'overdue' || daysPastDue > 0) return 'overdue'
    return 'sent'
  }

  // draft / unsent
  if (daysPastDue > 0) return 'unsent_stale'
  return 'draft'
}

export function daysPastDue(dueDate: string, today: string = todayISO()): number {
  return Math.max(0, calendarDaysBetween(dueDate, today))
}
