// ---------------------------------------------------------------------------
// Xero CSV export — unified module for InvoiceBatchSender, ContractManager,
// and BillingEngine. Matches Xero "Sales Invoices" import format with
// validation and UTF-8 BOM for Excel compatibility.
// ---------------------------------------------------------------------------

import type { Contract } from '../data/sponsors'

export interface XeroExportableInvoice {
  number: string
  company: string
  contactName?: string
  email?: string
  description: string
  period?: string
  amountExclGst: number
  gst?: number
  total?: number
  dueDate: string
  createdAt?: string
}

export interface XeroExportSummary {
  totalInvoices: number
  totalExclGst: number
  totalGst: number
  totalIncGst: number
}

export interface XeroValidationIssue {
  invoiceNumber: string
  field: string
  message: string
}

export interface XeroValidationResult {
  valid: boolean
  errors: XeroValidationIssue[]
  warnings: XeroValidationIssue[]
}

/** Xero account + tax defaults — override via env in future if needed. */
export const XERO_ACCOUNT_CODE = '200'
export const XERO_TAX_TYPE = 'GST on Income'
export const XERO_TRACKING_NAME = 'Department'
export const XERO_TRACKING_OPTION = 'Sponsorship'
export const XERO_CURRENCY = 'AUD'

const XERO_HEADERS = [
  '*ContactName',
  '*InvoiceNumber',
  'Reference',
  'EmailAddress',
  '*InvoiceDate',
  '*DueDate',
  '*Description',
  '*Quantity',
  '*UnitAmount',
  '*AccountCode',
  '*TaxType',
  'TrackingName1',
  'TrackingOption1',
  'Currency',
] as const

const UTF8_BOM = '\uFEFF'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Formats an ISO date as DD/MM/YYYY (Xero's expected date format). */
export function toXeroDate(value: string): string {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

function escapeCsv(value: string | number): string {
  const str = String(value)
  return str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

function toXeroRow(invoice: XeroExportableInvoice): (string | number)[] {
  return [
    invoice.company,
    invoice.number,
    `${invoice.number} — ${invoice.contactName || invoice.company}`,
    invoice.email ?? '',
    toXeroDate(invoice.createdAt || new Date().toISOString()),
    toXeroDate(invoice.dueDate),
    `${invoice.description}${invoice.period ? ` (${invoice.period})` : ''}`,
    1,
    round2(invoice.amountExclGst),
    XERO_ACCOUNT_CODE,
    XERO_TAX_TYPE,
    XERO_TRACKING_NAME,
    XERO_TRACKING_OPTION,
    XERO_CURRENCY,
  ]
}

/** Validate invoices before Xero import. */
export function validateXeroExport(
  invoices: XeroExportableInvoice[],
): XeroValidationResult {
  const errors: XeroValidationIssue[] = []
  const warnings: XeroValidationIssue[] = []
  const seenNumbers = new Set<string>()

  for (const inv of invoices) {
    if (!inv.company?.trim()) {
      errors.push({
        invoiceNumber: inv.number,
        field: 'company',
        message: 'Contact name is required',
      })
    }
    if (!inv.number?.trim()) {
      errors.push({
        invoiceNumber: inv.number || '(blank)',
        field: 'number',
        message: 'Invoice number is required',
      })
    }
    if (seenNumbers.has(inv.number)) {
      errors.push({
        invoiceNumber: inv.number,
        field: 'number',
        message: 'Duplicate invoice number',
      })
    }
    seenNumbers.add(inv.number)

    if (inv.amountExclGst <= 0) {
      errors.push({
        invoiceNumber: inv.number,
        field: 'amountExclGst',
        message: 'Amount must be greater than zero',
      })
    }

    const expectedGst = round2(inv.amountExclGst * 0.1)
    if (inv.gst !== undefined && Math.abs(inv.gst - expectedGst) > 0.02) {
      warnings.push({
        invoiceNumber: inv.number,
        field: 'gst',
        message: `GST ${inv.gst} differs from expected ${expectedGst}`,
      })
    }

    if (!inv.dueDate || isNaN(new Date(inv.dueDate).getTime())) {
      errors.push({
        invoiceNumber: inv.number,
        field: 'dueDate',
        message: 'Valid due date is required',
      })
    }

    if (!inv.email?.trim()) {
      warnings.push({
        invoiceNumber: inv.number,
        field: 'email',
        message: 'No email address — Xero contact may need manual update',
      })
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function buildXeroCsv(invoices: XeroExportableInvoice[]): string {
  let csv = XERO_HEADERS.map(escapeCsv).join(',') + '\n'
  for (const invoice of invoices) {
    csv += toXeroRow(invoice).map(escapeCsv).join(',') + '\n'
  }
  return UTF8_BOM + csv
}

export function downloadXeroCsv(
  invoices: XeroExportableInvoice[],
  filename?: string,
): XeroValidationResult {
  const validation = validateXeroExport(invoices)
  if (!validation.valid) return validation

  const csv = buildXeroCsv(invoices)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download =
    filename || `onefm-xero-export-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return validation
}

export function summariseXeroExport(
  invoices: XeroExportableInvoice[],
): XeroExportSummary {
  return {
    totalInvoices: invoices.length,
    totalExclGst: invoices.reduce((sum, i) => sum + (i.amountExclGst || 0), 0),
    totalGst: invoices.reduce(
      (sum, i) => sum + (i.gst ?? round2(i.amountExclGst * 0.1)),
      0,
    ),
    totalIncGst: invoices.reduce(
      (sum, i) => sum + (i.total ?? round2(i.amountExclGst * 1.1)),
      0,
    ),
  }
}

// Alias used by ContractManager (legacy import path)
export const summarizeXeroExport = summariseXeroExport

/** Format date for contract period labels. */
function formatPeriodDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Flatten contracts into Xero invoice lines: one line per linked invoice, or
 * a single line for the full contract value when nothing has been invoiced yet.
 */
export function buildXeroLinesFromContracts(
  contracts: Contract[],
): XeroExportableInvoice[] {
  const lines: XeroExportableInvoice[] = []
  contracts.forEach((contract) => {
    if (contract.invoices.length === 0) {
      lines.push({
        company: contract.companyName,
        contactName: contract.primaryContact,
        email: contract.email,
        number: contract.contractNumber,
        description: contract.campaignName || contract.description || 'Sponsorship',
        amountExclGst: contract.contractValue,
        gst: round2(contract.contractValue * 0.1),
        total: round2(contract.contractValue * 1.1),
        dueDate: contract.endDate,
        createdAt: contract.startDate,
        period: `${formatPeriodDate(contract.startDate)} — ${formatPeriodDate(contract.endDate)}`,
      })
    } else {
      contract.invoices.forEach((invoice) => {
        lines.push({
          company: contract.companyName,
          contactName: contract.primaryContact,
          email: contract.email,
          number: invoice.invoiceNumber,
          description: contract.campaignName || contract.description || 'Sponsorship',
          amountExclGst: invoice.amount,
          gst: round2(invoice.amount * 0.1),
          total: round2(invoice.amount * 1.1),
          dueDate: invoice.dueDate,
          createdAt: invoice.date,
          period: invoice.periodLabel,
        })
      })
    }
  })
  return lines
}

// Legacy type alias
export type XeroInvoiceLine = XeroExportableInvoice
