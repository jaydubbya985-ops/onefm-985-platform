/**
 * Payments-desk income labels.
 *
 * DEMO seeds and LIVE browser rows are not NAB year-to-date.
 * source: opsMode.ts — DEMO seeds vs empty LIVE ledger
 */

export type OpsIncomeCopy = {
  /** Short label beside the dollar figure */
  label: string
  /** One-line source under / beside the figure */
  hint: string
}

export type OpsIncomeKind = 'header' | 'paid-month' | 'donations' | 'membership'

/** Never call seed or browser-only rows "Total Income YTD". */
export function opsIncomeCopy(kind: OpsIncomeKind, live: boolean): OpsIncomeCopy {
  if (kind === 'header') {
    return live
      ? {
          label: 'Recorded in this browser',
          hint: 'Not NAB year-to-date. The LIVE ledger starts empty until a payment is recorded.',
        }
      : {
          label: 'DEMO seed total',
          hint: 'Not NAB year-to-date. Seed rows stay in this browser — not station income.',
        }
  }

  if (kind === 'paid-month') {
    return live
      ? { label: 'Paid this month', hint: 'Recorded in this browser' }
      : { label: 'DEMO paid this month', hint: 'Seed rows — not NAB' }
  }

  if (kind === 'donations') {
    return live
      ? { label: 'Donations recorded', hint: 'This browser — not NAB YTD' }
      : { label: 'DEMO donations', hint: 'Seed rows — not NAB YTD' }
  }

  return live
    ? { label: 'Membership recorded', hint: 'This browser — not NAB' }
    : { label: 'DEMO membership total', hint: 'Seed rows — not NAB' }
}
