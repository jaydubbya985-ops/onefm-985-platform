/**
 * On-screen invoice — same language as the PDF kit.
 * Real brand lockup from /public/brand/ (never the fake gold-98.5 master SVG).
 */
import { BrandLogo } from '@/components/BrandLogo'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from '@/lib/bankDetails'
import { DS } from '@/lib/invoiceDesignSystem'

export interface OpsInvoiceSheetLine {
  description: string
  amount: number
  detail?: string
}

export interface OpsInvoiceSheetData {
  number: string
  company: string
  contactName?: string
  email?: string
  description: string
  period?: string
  items?: OpsInvoiceSheetLine[]
  notes?: string
  amountExclGst: number
  gst: number
  total: number
  issueDate: string
  dueDate: string
}

const aud = (n: number) =>
  `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function OpsInvoiceSheet({ invoice }: { invoice: OpsInvoiceSheetData }) {
  return (
    <div className="relative bg-white text-[#1A1A1A] overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-[3.2px] bg-[#E51636]" />
      <div className="pl-6 pr-6 pt-5 pb-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#E51636] pb-4">
          <BrandLogo variant="primary" className="h-14 w-auto object-contain" />
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E51636]">
              Tax invoice
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-[#071D3A]">{invoice.number}</p>
            <p className="text-xs text-[#6B6B6B]">{DS.station.name}</p>
          </div>
        </div>

        <p className="mt-5 text-4xl font-bold leading-none text-[#E51636]">{aud(invoice.total)}</p>
        <p className="mt-2 text-sm text-[#6B6B6B]">
          AUD due {invoice.dueDate} · includes GST of {aud(invoice.gst)}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E51636]">Bill to</p>
            <p className="mt-1 font-semibold text-[#071D3A]">{invoice.contactName || invoice.company}</p>
            <p className="text-[#6B6B6B]">{invoice.company}</p>
            {invoice.email && <p className="text-[#6B6B6B]">{invoice.email}</p>}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E51636]">From</p>
            <p className="mt-1 font-semibold text-[#071D3A]">{DS.station.name}</p>
            <p className="text-[#6B6B6B]">{DS.station.address}</p>
            <p className="text-[#6B6B6B]">
              {DS.station.phone} · {DS.station.accountsEmail}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E51636]">Issue date</p>
            <p className="mt-1 font-semibold text-[#071D3A]">{invoice.issueDate}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E51636]">Due date</p>
            <p className="mt-1 font-semibold text-[#E51636]">{invoice.dueDate}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E51636]">Reference</p>
            <p className="mt-1 font-semibold text-[#071D3A]">{invoice.number}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-3">
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B6B6B]">
            <span>Description</span>
            <span>Amount</span>
          </div>
          {(invoice.items && invoice.items.length > 0
            ? invoice.items
            : [{ description: invoice.description, amount: invoice.amountExclGst, detail: invoice.period }]
          ).map((line, i) => (
            <div key={`${line.description}-${i}`} className="mt-3 flex justify-between gap-4 text-sm">
              <div>
                <p className="font-medium text-[#1A1A1A]">{line.description}</p>
                {line.detail && <p className="text-xs text-[#6B6B6B]">{line.detail}</p>}
              </div>
              <p className="shrink-0 font-medium">{aud(line.amount)}</p>
            </div>
          ))}
          <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-sm">
            <div className="flex justify-between text-[#6B6B6B]">
              <span>Subtotal (ex GST)</span>
              <span className="text-[#1A1A1A]">{aud(invoice.amountExclGst)}</span>
            </div>
            <div className="flex justify-between text-[#6B6B6B]">
              <span>GST (10%)</span>
              <span className="text-[#1A1A1A]">{aud(invoice.gst)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-md bg-[#071D3A] px-4 py-3">
          <span className="text-sm text-white">Total due</span>
          <span className="text-2xl font-bold text-[#E51636]">{aud(invoice.total)}</span>
        </div>

        {invoice.notes && (
          <p className="mt-4 text-sm text-[#6B6B6B]">{invoice.notes}</p>
        )}

        <div className="mt-4 rounded-md bg-[#F8F8FA] px-4 py-3 text-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E51636]">
            Pay by bank transfer
          </p>
          <p className="mt-1 font-medium text-[#3C6E2D]">National Australia Bank</p>
          <p className="mt-1 font-semibold text-[#071D3A]">
            BSB {BANK_BSB} · Acc {BANK_ACCOUNT} · {BANK_ACCOUNT_NAME}
          </p>
          <p className="mt-1 text-xs text-[#6B6B6B]">
            Reference {invoice.number} · payment due within 14 days
          </p>
        </div>

        <p className="mt-4 text-xs text-[#6B6B6B]">
          Goulburn Valley Community Radio Inc. · ABN {DS.station.abn} · {DS.station.phone}
        </p>
      </div>
    </div>
  )
}
