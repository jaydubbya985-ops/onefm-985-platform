/* eslint-disable react-refresh/only-export-components */
// ---------------------------------------------------------------------------
// InvoiceEmailTemplate — ONE FM 98.5 Broadcast Letter System
//
//   • generateInvoiceEmailHtml   — navy hero + 64px gold amount + white body
//   • generateReceiptEmailHtml   — same shell, "PAYMENT RECEIVED"
//   • generateInvoicePdf         — pure vector jsPDF (no html2canvas)
//   • InvoiceEmailTemplate       — interactive ops portal preview component
// ---------------------------------------------------------------------------
import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { Check, Copy } from 'lucide-react'
import { useToast } from './Toast'
import { useOpsStore } from './store'
import { DEFAULT_EMAIL_BODY } from './data/invoices'
import { DS } from '@/lib/invoiceDesignSystem'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from '@/lib/bankDetails'
import { formatCoverageShort } from '@/lib/coverageCopy'
import {
  getInvoiceDesignVariant,
  getVariantMeta,
  type InvoiceDesignVariantId,
} from '@/lib/invoiceDesignVariants'
import { generateVariantInvoiceEmailHtml } from '@/lib/invoiceVariantEmail'
import { generateInvoicePdfForVariant } from '@/lib/invoiceVariantPdf'

export { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB }

// ---------------------------------------------------------------------------
// Data interfaces
// ---------------------------------------------------------------------------

export interface InvoiceEmailData {
  contactName: string
  company: string
  invoiceNumber: string
  amountExclGst: number
  gst: number
  total: number
  dueDate: string
  customMessage: string
  campaign?: string
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
}

export interface ReceiptEmailData {
  contactName: string
  company: string
  invoiceNumber: string
  amount: number
  paymentDate: string
  paymentMethod: string
  reference: string
}

export interface PdfInvoiceData {
  number: string
  company: string
  contactName?: string
  email?: string
  description: string
  period?: string
  amountExclGst: number
  gst: number
  total: number
  dueDate: string
  /** Actual invoice issue date (ISO). Falls back to today if omitted. */
  issueDate?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v?: string) =>
  (v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ---------------------------------------------------------------------------
// generateInvoiceEmailHtml — Broadcast Letter
// Table-based, Outlook-safe, max 600px.
// ---------------------------------------------------------------------------

export function generateInvoiceEmailHtml(
  data: InvoiceEmailData,
  bsb: string = BANK_BSB,
  account: string = BANK_ACCOUNT,
  accountName: string = BANK_ACCOUNT_NAME,
  variantId?: InvoiceDesignVariantId,
): string {
  const variant = variantId ?? getInvoiceDesignVariant()
  return generateVariantInvoiceEmailHtml(
    data,
    variant,
    bsb,
    account,
    accountName,
    DEFAULT_EMAIL_BODY,
  )
}


// ---------------------------------------------------------------------------
// generateReceiptEmailHtml — same shell, "PAYMENT RECEIVED"
// ---------------------------------------------------------------------------

export function generateReceiptEmailHtml(data: ReceiptEmailData): string {
  const { contactName, company, invoiceNumber, amount, paymentDate, paymentMethod, reference } = data

  const amountFmt = amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const name      = esc(contactName) || 'there'
  const ref       = esc(invoiceNumber)

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Payment Receipt &mdash; ${ref}</title>
<style type="text/css">
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block;}
  body{margin:0!important;padding:0!important;background-color:#D8D8D8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;}
  @media screen and (max-width:480px){.mp{padding-left:20px!important;padding-right:20px!important;}}
</style>
</head>
<body style="margin:0;padding:0;background-color:#D8D8D8;">

  <!--[if mso]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" align="center"><tr><td><![endif]-->
  <div style="max-width:600px;margin:0 auto;">

    <!-- HERO — navy with green tick -->
    <!--[if mso]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" bgcolor="#071D3A"><tr><td><![endif]-->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
           style="background-color:#071D3A;">
      <tr>
        <td style="padding:40px 40px 36px 40px;" class="mp">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="vertical-align:middle;">
                <img src="${DS.logoUrl}" alt="ONE FM 98.5" width="110" height="auto"
                     style="width:110px;height:auto;display:block;border:0;" />
              </td>
              <td style="vertical-align:middle;text-align:right;">
                <div style="color:rgba(255,255,255,0.45);font-size:12px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </td>
            </tr>
          </table>

          <div style="margin-top:28px;color:rgba(255,255,255,0.45);font-size:10px;text-transform:uppercase;letter-spacing:4px;font-weight:600;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Payment Received
          </div>

          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
                 style="margin-top:12px;">
            <tr>
              <td style="padding:28px 32px;background-color:rgba(0,0,0,0.28);border:1px solid rgba(255,255,255,0.07);">
                <div style="color:rgba(255,255,255,0.45);font-size:9px;text-transform:uppercase;letter-spacing:3.5px;font-weight:700;margin-bottom:10px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  Amount Received
                </div>
                <div style="font-size:64px;font-weight:800;color:#4ADE80;letter-spacing:-2px;line-height:1;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  $${amountFmt}
                </div>
                <div style="margin-top:14px;color:rgba(255,255,255,0.5);font-size:13px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  Invoice&nbsp;<span style="color:#4ADE80;font-weight:600;">${ref}</span>
                  &nbsp;&middot;&nbsp;${esc(paymentDate)}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->

    <!-- SOLID GREEN RULE -->
    <div style="height:3px;background-color:#4ADE80;font-size:0;line-height:0;">&nbsp;</div>

    <!-- WHITE BODY -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
           style="background-color:#FAFAF8;">
      <tr>
        <td style="padding:40px 40px 0 40px;" class="mp">
          <div style="color:#1A1A1A;font-size:18px;font-weight:700;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Hi ${name},
          </div>
          <p style="margin:16px 0 0 0;color:#1A1A1A;font-size:15px;line-height:1.75;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Thank you — we've received your payment of
            <strong style="color:#1A1A1A;">$${amountFmt}</strong>
            for invoice <strong>${ref}</strong> from
            <strong>${esc(company)}</strong>.
            Your support keeps community radio alive in the Goulburn Valley.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 40px 0 40px;" class="mp">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
                 style="border:1px solid rgba(26,26,26,0.1);background-color:#FFFFFF;">
            <tr>
              <td style="padding:22px 24px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  ${[
                    ['Invoice', ref],
                    ['Company', esc(company)],
                    ['Amount Paid', `$${amountFmt}`],
                    ['Payment Date', esc(paymentDate)],
                    ['Payment Method', esc(paymentMethod)],
                    ['Reference', esc(reference)],
                  ].map(([label, val]) => `
                  <tr>
                    <td style="padding:7px 20px 7px 0;border-bottom:1px solid rgba(26,26,26,0.05);color:#6B6B6B;font-size:11px;text-transform:uppercase;letter-spacing:1px;width:140px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                      ${label}
                    </td>
                    <td style="padding:7px 0;border-bottom:1px solid rgba(26,26,26,0.05);color:#1A1A1A;font-size:14px;font-weight:600;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                      ${val}
                    </td>
                  </tr>`).join('')}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 40px 48px 40px;" class="mp">
          <div style="width:36px;height:3px;background-color:#D4AF37;margin-bottom:18px;"></div>
          <div style="color:#1A1A1A;font-size:15px;font-weight:700;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">Jason Welsh</div>
          <div style="color:#D4AF37;font-size:13px;margin-top:3px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">Vice Chair, ONE FM 98.5</div>
          <div style="color:#6B6B6B;font-size:13px;margin-top:10px;line-height:1.7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            (03) 5831 3131 &nbsp;|&nbsp; accounts@fm985.com.au
          </div>
        </td>
      </tr>
    </table>

    <!-- NAVY FOOTER -->
    <!--[if mso]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" bgcolor="#071D3A"><tr><td><![endif]-->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
           style="background-color:#071D3A;">
      <tr>
        <td style="padding:28px 40px;text-align:center;" class="mp">
          <div style="color:rgba(255,255,255,0.45);font-size:12px;line-height:1.9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            <strong style="color:#D4AF37;">ONE FM 98.5</strong>
            &nbsp;&middot;&nbsp;Goulburn Valley Community Radio Inc.<br>
            ABN 92 117 291 771 &nbsp;&middot;&nbsp; (03) 5831 3131 &nbsp;&middot;&nbsp; accounts@fm985.com.au<br>
            ${esc(formatCoverageShort())} &nbsp;&middot;&nbsp; ABS 2021 via townData
          </div>
        </td>
      </tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->

  </div>
  <!--[if mso]></td></tr></table><![endif]-->

</body>
</html>`
}

// ---------------------------------------------------------------------------
// generateInvoicePdf — pure vector jsPDF (no html2canvas)
// A4, 20mm margins, Helvetica, matches email header/footer geometry.
// ---------------------------------------------------------------------------

export async function generateInvoicePdf(
  invoice: PdfInvoiceData,
  variantId?: InvoiceDesignVariantId,
): Promise<jsPDF> {
  return generateInvoicePdfForVariant(invoice, variantId)
}

// ---------------------------------------------------------------------------
// InvoiceEmailTemplate — interactive preview component (ops portal)
// ---------------------------------------------------------------------------

interface InvoiceEmailTemplateProps {
  data: InvoiceEmailData
  onMessageChange?: (message: string) => void
}

export default function InvoiceEmailTemplate({ data, onMessageChange }: InvoiceEmailTemplateProps) {
  const { toast }    = useToast()
  const { invoiceDesignVariant, setActiveTab } = useOpsStore()
  const variantMeta = getVariantMeta(invoiceDesignVariant)
  const [editing, setEditing]       = useState(false)
  const [message, setMessage]       = useState(data.customMessage)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [copiedHtml, setCopiedHtml] = useState(false)

  const handleMessageChange = (value: string) => {
    setMessage(value)
    onMessageChange?.(value)
  }

  const copyField = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    })
  }

  const copyHtml = () => {
    const html = generateInvoiceEmailHtml(
      { ...data, customMessage: message },
      BANK_BSB, BANK_ACCOUNT, BANK_ACCOUNT_NAME,
      invoiceDesignVariant,
    )
    navigator.clipboard.writeText(html).then(() => {
      setCopiedHtml(true)
      toast('HTML copied to clipboard!', 'success')
      setTimeout(() => setCopiedHtml(false), 2000)
    })
  }

  const emailHtml = generateInvoiceEmailHtml(
    { ...data, customMessage: message },
    BANK_BSB, BANK_ACCOUNT, BANK_ACCOUNT_NAME,
    invoiceDesignVariant,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="font-label text-xs text-one-muted uppercase tracking-wider">
            Email Preview
          </h4>
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className="text-xs text-[#E51636] hover:underline mt-0.5"
          >
            Design: {variantMeta.name} — change
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyHtml}
            className={`font-label text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              copiedHtml
                ? 'bg-emerald-500 text-white'
                : 'bg-one-slate text-one-white hover:bg-one-border'
            }`}
          >
            {copiedHtml ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedHtml ? 'Copied!' : 'Copy HTML'}
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className={`font-label text-xs px-3 py-1.5 rounded transition-colors ${
              editing
                ? 'bg-one-gold text-one-navy'
                : 'bg-one-slate text-one-white hover:bg-one-border'
            }`}
          >
            {editing ? 'Done Editing' : 'Edit Message'}
          </button>
        </div>
      </div>

      {editing && (
        <div className="space-y-2">
          <label className="font-label text-xs text-one-muted uppercase">
            Custom Message for {data.company}
          </label>
          <textarea
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            className="w-full bg-one-navy border border-one-border rounded-lg p-4 font-body text-sm text-one-white placeholder-one-muted focus:border-one-gold focus:outline-none resize-y"
            rows={6}
            placeholder="Write a personal message for this sponsor..."
          />
          <p className="font-micro text-one-muted">
            Tip: Keep it personal. Mention their campaign, the community impact, or your relationship.
          </p>
        </div>
      )}

      <div className="bg-[#0F1D32] border border-[#1E293B] rounded-lg p-3 flex flex-wrap items-center gap-3 text-xs">
        <span className="text-one-muted uppercase tracking-wider font-label">NAB pay — no Stripe:</span>
        {[
          { label: 'BSB', value: BANK_BSB, key: 'bsb', mono: true },
          { label: 'Acct', value: BANK_ACCOUNT, key: 'acct', mono: true },
          { label: 'Name', value: BANK_ACCOUNT_NAME, key: 'name', mono: false },
        ].map(({ label, value, key, mono }) => (
          <button
            key={key}
            onClick={() => copyField(value, key)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#2A3A52] transition-colors group"
          >
            <span className="text-one-muted">{label}:</span>
            <span className={`${mono ? 'font-mono' : ''} text-one-gold ${key === 'name' ? 'truncate max-w-[180px]' : ''}`}>
              {value}
            </span>
            {copiedField === key
              ? <Check className="w-3 h-3 text-emerald-400" />
              : <Copy className="w-3 h-3 text-one-muted group-hover:text-one-gold transition-colors" />
            }
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden border border-one-border">
        <div data-invoice-email dangerouslySetInnerHTML={{ __html: emailHtml }} />
      </div>

      <details className="group">
        <summary className="font-label text-xs text-one-muted uppercase tracking-wider cursor-pointer hover:text-one-gold transition-colors py-2">
          View Raw HTML (for Mailchimp/Outlook)
        </summary>
        <pre className="bg-one-navy border border-one-border rounded-lg p-4 font-mono text-xs text-one-muted overflow-x-auto max-h-60 overflow-y-auto">
          {emailHtml}
        </pre>
      </details>
    </div>
  )
}
