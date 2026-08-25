import { CheckCircle2 } from 'lucide-react'
import { BRAND, LOGO } from '@/lib/brand'
import {
  BANK_ACCOUNT,
  BANK_ACCOUNT_NAME,
  BANK_BSB,
  BANK_INSTITUTION,
  BANK_REFERENCE_HINT,
  BANK_TRADING_AS,
} from '@/lib/stationBank'

export interface TaxInvoiceView {
  number: string
  company: string
  contactName?: string
  email?: string
  description: string
  period?: string
  issueDate: string
  dueDate: string
  amountExclGst: number
  gst: number
  total: number
}

function money(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
}

function auDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function gstMatches(excl: number, gst: number) {
  return Math.round(excl * 0.1 * 100) / 100 === gst
}

export function TaxInvoiceLetterhead({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <div className="flex justify-between items-start gap-6 border-b-[3px] border-[#1B458F] pb-5 mb-6">
      <div>
        <img
          src={LOGO.invoice}
          alt={`${BRAND.fullName} logo`}
          className="h-[72px] w-auto object-contain object-left"
        />
        <p className="text-[12px] font-semibold text-[#101010] mt-3">{BRAND.org}</p>
        <p className="text-[11px] text-gray-600">ABN {BRAND.abn}</p>
        <p className="text-[11px] text-gray-600">
          {BRAND.address} · {BRAND.phone}
        </p>
        <p className="text-[11px] text-gray-600">{BRAND.accountsEmail}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#1B458F] font-semibold">
          Tax Invoice
        </p>
        <p className="text-xl font-bold font-mono text-[#101010] mt-1">{invoiceNumber}</p>
      </div>
    </div>
  )
}

export function TaxInvoicePayTo({ reference }: { reference: string }) {
  return (
    <div className="border-2 border-[#1B458F] rounded-md p-4 mb-6 bg-[#F4F7FB]">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1B458F] mb-2">
        Pay to this account
      </p>
      <p className="font-semibold text-[#101010] text-base leading-snug">{BANK_ACCOUNT_NAME}</p>
      <p className="text-sm text-gray-600">Trading as {BANK_TRADING_AS}</p>
      <p className="text-sm text-gray-600 mb-4">{BANK_INSTITUTION}</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">BSB</p>
          <p className="font-mono font-bold text-[18px] tracking-wide text-[#101010]">{BANK_BSB}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Account</p>
          <p className="font-mono font-bold text-[18px] tracking-wide text-[#101010]">
            {BANK_ACCOUNT}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Reference</p>
          <p className="font-mono font-bold text-[16px] text-[#E51636]">{reference}</p>
        </div>
      </div>
      <p className="text-[11px] text-gray-500 mt-3">{BANK_REFERENCE_HINT}</p>
    </div>
  )
}

/** White A4 tax invoice — preview must match the PDF a sponsor actually receives. */
export function TaxInvoiceDocument({ invoice }: { invoice: TaxInvoiceView }) {
  const gstOk = gstMatches(invoice.amountExclGst, invoice.gst)
  return (
    <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg max-w-[640px] mx-auto border border-gray-200">
      <TaxInvoiceLetterhead invoiceNumber={invoice.number} />

      <div className="flex justify-between mb-6 text-sm">
        <div>
          <span className="text-gray-500">Issue date</span>
          <span className="ml-2 font-semibold">{auDate(invoice.issueDate)}</span>
        </div>
        <div>
          <span className="text-gray-500">Due date</span>
          <span className="ml-2 font-semibold text-[#E51636]">{auDate(invoice.dueDate)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Bill to</p>
          <p className="font-bold text-base leading-snug">{invoice.company}</p>
          {invoice.contactName ? <p className="text-gray-600 text-sm">Attn: {invoice.contactName}</p> : null}
          {invoice.email ? <p className="text-gray-500 text-sm">{invoice.email}</p> : null}
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">From</p>
          <p className="font-bold text-base leading-snug">{BRAND.org}</p>
          <p className="text-gray-600 text-sm">Trading as {BRAND.fullName}</p>
          <p className="text-gray-500 text-sm">ABN {BRAND.abn}</p>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-[#1B458F]">
            <th className="text-left py-2 text-[10px] uppercase tracking-wider text-gray-500">
              Description
            </th>
            <th className="text-right py-2 text-[10px] uppercase tracking-wider text-gray-500">Qty</th>
            <th className="text-right py-2 text-[10px] uppercase tracking-wider text-gray-500">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-3 text-sm">
              <p className="font-medium">{invoice.description}</p>
              {invoice.period ? <p className="text-gray-500 text-xs mt-0.5">{invoice.period}</p> : null}
            </td>
            <td className="py-3 text-sm text-right">1</td>
            <td className="py-3 text-sm text-right font-medium">{money(invoice.amountExclGst)}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-1 text-sm">
            <span className="text-gray-500">Subtotal (excl GST)</span>
            <span className="font-medium">{money(invoice.amountExclGst)}</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-gray-500">GST (10%)</span>
            <span className="font-medium">{money(invoice.gst)}</span>
          </div>
          {gstOk ? (
            <div className="text-right text-xs text-emerald-700 mt-0.5">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              GST verified
            </div>
          ) : (
            <div className="text-right text-xs text-amber-700 mt-0.5">
              GST kept as billed (does not equal 10% of excl.)
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-[#1B458F] mt-2">
            <span className="font-bold text-lg">Total due</span>
            <span className="font-bold text-lg text-[#1B458F]">{money(invoice.total)}</span>
          </div>
        </div>
      </div>

      <TaxInvoicePayTo reference={invoice.number} />

      <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        <p>
          {BRAND.org} · ABN {BRAND.abn}
        </p>
        <p className="mt-0.5">
          {BRAND.address} · {BRAND.phone} · {BRAND.accountsEmail}
        </p>
      </div>
    </div>
  )
}
