/**
 * On-screen invoice pay line. Never invent a 14-day window.
 * The due date on the sheet is the due date — print it.
 */
export function invoicePayReference(number: string, dueDate: string): string {
  const ref = number.trim() || 'invoice'
  const due = dueDate.trim()
  if (!due) return `Reference ${ref} · due date pending`
  return `Reference ${ref} · payment due ${due}`
}
