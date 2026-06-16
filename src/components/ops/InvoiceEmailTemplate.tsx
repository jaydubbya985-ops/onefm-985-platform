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
import { Check, Copy, CreditCard } from 'lucide-react'
import { useToast } from './Toast'
import { DEFAULT_EMAIL_BODY } from './data/invoices'
import { DS } from '@/lib/invoiceDesignSystem'

// ---------------------------------------------------------------------------
// Bank + Stripe configuration
// ---------------------------------------------------------------------------

export const BANK_BSB = '083-894'
export const BANK_ACCOUNT = '553 219 432'
export const BANK_ACCOUNT_NAME = '98.5 One FM'

export interface StripeConfig {
  accountId: string
  needsSetup: boolean
  publishableKey: string
  currency: string
  successUrl: string
  cancelUrl: string
}

export const STRIPE_CONFIG: StripeConfig = {
  accountId: 'acct_1J696RS3NlaEohlL',
  needsSetup: !(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined)?.startsWith('pk_'),
  publishableKey: (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined) ?? 'pk_live_placeholder',
  currency: 'aud',
  successUrl: 'https://onefmops.netlify.app/#/payment/success',
  cancelUrl:  'https://onefmops.netlify.app/#/payment/cancel',
}

export const PAYMENT_LINKS: Record<string, string> = {}

export function getStripePaymentLink(
  invoiceNumber: string,
  total: number,
  company?: string,
): string {
  if (PAYMENT_LINKS[invoiceNumber]) return PAYMENT_LINKS[invoiceNumber]
  const { publishableKey, currency, successUrl, cancelUrl } = STRIPE_CONFIG
  if (!publishableKey.includes('placeholder')) {
    const amountCents = Math.round(total * 100)
    return `https://checkout.stripe.com/pay?${new URLSearchParams({
      pk: publishableKey,
      amount: amountCents.toString(),
      currency,
      description: `Invoice ${invoiceNumber}${company ? ` — ${company}` : ''}`,
      reference: invoiceNumber,
      success_url: `${successUrl}?ref=${encodeURIComponent(invoiceNumber)}`,
      cancel_url:  `${cancelUrl}?ref=${encodeURIComponent(invoiceNumber)}`,
    }).toString()}`
  }
  return `https://dashboard.stripe.com/payment-links/create?amount=${Math.round(total * 100)}&currency=${currency}`
}

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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v?: string) =>
  (v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const aud = (n: number) =>
  `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ---------------------------------------------------------------------------
// generateInvoiceEmailHtml — Broadcast Letter
// Table-based, Outlook-safe, max 600px.
// ---------------------------------------------------------------------------

export function generateInvoiceEmailHtml(
  data: InvoiceEmailData,
  bsb: string = BANK_BSB,
  account: string = BANK_ACCOUNT,
  accountName: string = BANK_ACCOUNT_NAME,
): string {
  const {
    contactName, company, invoiceNumber, total, dueDate,
    customMessage, campaign, addressLine1, addressLine2, addressLine3,
  } = data

  const payLink       = getStripePaymentLink(invoiceNumber, total, company)
  const hasPaymentLink = !!PAYMENT_LINKS[invoiceNumber]

  const dateLine = new Date().toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const name          = esc(contactName) || 'there'
  const companyName   = esc(company)
  const campaignLabel = esc(campaign) || 'Sponsorship'
  const ref           = esc(invoiceNumber)
  const totalFmt      = total.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const messageHtml = (customMessage || DEFAULT_EMAIL_BODY)
    .split('\n')
    .map(line => `<p style="margin:0 0 14px 0;color:#1A1A1A;font-size:15px;line-height:1.75;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">${esc(line)}</p>`)
    .join('')

  let addressBlock = ''
  if (companyName)       addressBlock += `<div style="font-size:13px;font-weight:600;color:#1A1A1A;line-height:1.7;">${companyName}</div>`
  if (esc(addressLine1)) addressBlock += `<div style="font-size:13px;color:#3D3D3D;line-height:1.7;">${esc(addressLine1)}</div>`
  if (esc(addressLine2)) addressBlock += `<div style="font-size:13px;color:#3D3D3D;line-height:1.7;">${esc(addressLine2)}</div>`
  if (esc(addressLine3)) addressBlock += `<div style="font-size:13px;color:#3D3D3D;line-height:1.7;">${esc(addressLine3)}</div>`

  const payRow = hasPaymentLink ? `
      <!-- PAY NOW — red sharp rect, only when Stripe link exists -->
      <tr>
        <td style="padding:24px 40px 0 40px;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background-color:#E51636;">
                <!--[if mso]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:220px;height:46px;"><v:fill type="solid" color="#E51636"/><v:textbox inset="0,0,0,0"><![endif]-->
                <a href="${payLink}"
                   style="display:inline-block;background-color:#E51636;color:#FFFFFF;padding:13px 32px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  Pay $${totalFmt} via Stripe
                </a>
                <!--[if mso]></v:textbox></v:rect><![endif]-->
              </td>
            </tr>
          </table>
          <div style="margin-top:8px;color:#6B6B6B;font-size:11px;letter-spacing:0.3px;">
            Secure card payment &middot; SSL encrypted &middot; Powered by Stripe
          </div>
        </td>
      </tr>` : ''

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Invoice ${ref} &mdash; ONE FM 98.5</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style type="text/css">
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block;}
  body{margin:0!important;padding:0!important;background-color:#D8D8D8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;}
  .wrapper{max-width:600px;margin:0 auto;}
  @media screen and (max-width:480px){
    .mp{padding-left:20px!important;padding-right:20px!important;}
    .amt{font-size:44px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#D8D8D8;">

  <!-- PREHEADER -->
  <div style="display:none;font-size:1px;color:#D8D8D8;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Invoice ${ref} &mdash; $${totalFmt} due ${dueDate} &middot; ONE FM 98.5
  </div>

  <!--[if mso]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" align="center"><tr><td><![endif]-->
  <div class="wrapper" style="max-width:600px;margin:0 auto;">

    <!-- ══ HERO — NAVY FULL-BLEED ══════════════════════════════════════════ -->
    <!--[if mso]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" bgcolor="#071D3A"><tr><td><![endif]-->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
           style="background-color:#071D3A;">
      <tr>
        <td style="padding:40px 40px 36px 40px;" class="mp">

          <!-- Logo row -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="vertical-align:middle;">
                <img src="${DS.logoUrl}"
                     alt="ONE FM 98.5" width="110" height="auto"
                     style="width:110px;height:auto;display:block;border:0;" />
              </td>
              <td style="vertical-align:middle;text-align:right;">
                <div style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  ${dateLine}
                </div>
                <div style="color:rgba(255,255,255,0.3);font-size:10px;margin-top:2px;letter-spacing:0.5px;">
                  ABN: 92 117 291 771
                </div>
              </td>
            </tr>
          </table>

          <!-- INVOICE caption -->
          <div style="margin-top:30px;color:rgba(255,255,255,0.45);font-size:10px;text-transform:uppercase;letter-spacing:4px;font-weight:600;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Invoice
          </div>

          <!-- AMOUNT CARD — the poster moment -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
                 style="margin-top:12px;">
            <tr>
              <td style="padding:28px 32px;background-color:rgba(0,0,0,0.28);border:1px solid rgba(255,255,255,0.07);">
                <div style="color:rgba(255,255,255,0.45);font-size:9px;text-transform:uppercase;letter-spacing:3.5px;font-weight:700;margin-bottom:10px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  Amount Due
                </div>
                <div class="amt" style="font-size:64px;font-weight:800;color:#D4AF37;letter-spacing:-2px;line-height:1;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  $${totalFmt}
                </div>
                <div style="margin-top:14px;color:rgba(255,255,255,0.5);font-size:13px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  Due&nbsp;${dueDate}&nbsp;&nbsp;&middot;&nbsp;&nbsp;Ref&nbsp;<span style="color:#D4AF37;font-weight:600;">${ref}</span>
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->

    <!-- 3px SOLID GOLD RULE -->
    <div style="height:3px;background-color:#D4AF37;font-size:0;line-height:0;">&nbsp;</div>

    <!-- ══ WHITE BODY ═══════════════════════════════════════════════════════ -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
           style="background-color:#FAFAF8;">

      <!-- Recipient -->
      <tr>
        <td style="padding:40px 40px 0 40px;" class="mp">
          <div style="color:#6B6B6B;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-bottom:8px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Addressed To
          </div>
          <div style="color:#1A1A1A;font-size:14px;font-weight:700;margin-bottom:4px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            ${name}
          </div>
          ${addressBlock}
        </td>
      </tr>

      <!-- Salutation -->
      <tr>
        <td style="padding:32px 40px 0 40px;" class="mp">
          <div style="color:#1A1A1A;font-size:18px;font-weight:700;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Dear ${name},
          </div>
        </td>
      </tr>

      <!-- RE: line -->
      <tr>
        <td style="padding:20px 40px 0 40px;" class="mp">
          <div style="border-left:3px solid #D4AF37;padding:10px 16px;background-color:rgba(212,175,55,0.05);">
            <div style="color:#1A1A1A;font-size:15px;font-weight:700;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
              RE: Invoice ${ref} &mdash; ${campaignLabel}
            </div>
            <div style="color:#6B6B6B;font-size:12px;margin-top:3px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
              Please find your invoice details below.
            </div>
          </div>
        </td>
      </tr>

      <!-- Custom message -->
      <tr>
        <td style="padding:28px 40px 0 40px;" class="mp">
          ${messageHtml}
        </td>
      </tr>

      <!-- Wire-transfer slip -->
      <tr>
        <td style="padding:32px 40px 0 40px;" class="mp">
          <div style="color:#6B6B6B;font-size:10px;text-transform:uppercase;letter-spacing:2.5px;font-weight:600;margin-bottom:14px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Payment by Bank Transfer &mdash; Preferred
          </div>
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
                 style="border:1px solid rgba(26,26,26,0.1);background-color:#FFFFFF;">
            <tr>
              <td style="padding:22px 24px;">
                <div style="color:#3A6E22;font-size:11px;font-weight:600;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  National Australia Bank
                </div>
                <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:0 28px 0 0;vertical-align:top;">
                      <div style="color:#6B6B6B;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">BSB</div>
                      <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#071D3A;">${bsb}</div>
                    </td>
                    <td style="padding:0 28px 0 0;vertical-align:top;">
                      <div style="color:#6B6B6B;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">Account</div>
                      <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#071D3A;">${account}</div>
                    </td>
                    <td style="padding:0;vertical-align:top;">
                      <div style="color:#6B6B6B;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">Reference</div>
                      <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#D4AF37;">${ref}</div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(26,26,26,0.06);color:#6B6B6B;font-size:12px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  Account Name: <span style="color:#1A1A1A;font-weight:600;">${accountName}</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${payRow}

      <!-- Closing -->
      <tr>
        <td style="padding:36px 40px 0 40px;" class="mp">
          <p style="margin:0 0 10px 0;color:#1A1A1A;font-size:15px;line-height:1.7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            If you have any questions, please don't hesitate to contact us.
          </p>
          <p style="margin:0;color:#1A1A1A;font-size:15px;line-height:1.7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Thank you for your continued support of community radio.
          </p>
        </td>
      </tr>

      <!-- Signature -->
      <tr>
        <td style="padding:36px 40px 48px 40px;" class="mp">
          <div style="width:36px;height:3px;background-color:#D4AF37;margin-bottom:18px;"></div>
          <div style="color:#1A1A1A;font-size:15px;font-weight:700;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Jason Welsh
          </div>
          <div style="color:#D4AF37;font-size:13px;margin-top:3px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Vice Chair, ONE FM 98.5
          </div>
          <div style="color:#6B6B6B;font-size:13px;margin-top:10px;line-height:1.7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            (03) 5831 3131 &nbsp;|&nbsp; jason@onefm.com.au<br>
            47 Parkside Drive, Shepparton VIC 3630
          </div>
        </td>
      </tr>

    </table>

    <!-- ══ NAVY FOOTER ══════════════════════════════════════════════════════ -->
    <!--[if mso]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" bgcolor="#071D3A"><tr><td><![endif]-->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
           style="background-color:#071D3A;">
      <tr>
        <td style="padding:28px 40px;text-align:center;" class="mp">
          <div style="color:rgba(255,255,255,0.45);font-size:12px;line-height:1.9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            <strong style="color:#D4AF37;letter-spacing:0.5px;">ONE FM 98.5</strong>
            &nbsp;&middot;&nbsp;Goulburn Valley Community Radio Inc.<br>
            ABN 92 117 291 771 &nbsp;&middot;&nbsp; (03) 5831 3131 &nbsp;&middot;&nbsp; accounts@fm985.com.au
          </div>
          <div style="margin-top:12px;color:rgba(255,255,255,0.18);font-size:10px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            Sent via ONE FM Operations Portal
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
            ABN 92 117 291 771 &nbsp;&middot;&nbsp; (03) 5831 3131 &nbsp;&middot;&nbsp; accounts@fm985.com.au
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

export async function generateInvoicePdf(invoice: PdfInvoiceData): Promise<jsPDF> {
  const doc  = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const W    = 210
  const H    = 297
  const M    = 20
  const CW   = W - M * 2   // 170mm content width

  const today     = new Date()
  const issueDate = today.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  const dueDate   = new Date(invoice.dueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

  // ── colour helpers ───────────────────────────────────────────────────────
  const [nR,nG,nB] = DS.rgb.navy
  const [gR,gG,gB] = DS.rgb.gold
  const [rR,rG,rB] = DS.rgb.red
  const [bR,bG,bB] = DS.rgb.blue

  const fillNavy  = () => doc.setFillColor(nR, nG, nB)
  const fillGold  = () => doc.setFillColor(gR, gG, gB)
  const fillLight = () => doc.setFillColor(245, 247, 250)

  const inkNavy   = () => doc.setTextColor(nR, nG, nB)
  const inkGold   = () => doc.setTextColor(gR, gG, gB)
  const inkRed    = () => doc.setTextColor(rR, rG, rB)
  const inkWhite  = () => doc.setTextColor(255, 255, 255)
  const inkGrey   = () => doc.setTextColor(102, 102, 102)
  const inkSilver = () => doc.setTextColor(160, 160, 160)
  const inkDark   = () => doc.setTextColor(26, 26, 26)
  const inkDim    = () => doc.setTextColor(130, 130, 130)
  const inkNab    = () => doc.setTextColor(DS.rgb.nab[0], DS.rgb.nab[1], DS.rgb.nab[2])

  const ruleLight = () => { doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3) }
  const ruleBlue  = () => { doc.setDrawColor(bR, bG, bB); doc.setLineWidth(1.5) }

  const bold = (sz: number) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(sz) }
  const norm = (sz: number) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(sz) }

  const box = (x: number, y: number, w: number, h: number, style: 'F'|'S'|'FD' = 'F') =>
    doc.rect(x, y, w, h, style)
  const tl  = (t: string, x: number, y: number) => doc.text(t, x, y)
  const tr  = (t: string, x: number, y: number) => doc.text(t, x, y, { align: 'right' })
  const tc  = (t: string, x: number, y: number) => doc.text(t, x, y, { align: 'center' })

  // ── HEADER BAND ─────────────────────────────────────────────────────────
  const HEADER_H = 42
  fillNavy(); box(0, 0, W, HEADER_H)

  // Wordmark
  bold(20); inkWhite(); tl('ONE FM', M, 16.5)
  const oneW = doc.getTextWidth('ONE FM')
  bold(18); inkRed(); tl('98.5', M + oneW + 2, 16.5)

  norm(8); inkSilver(); tl("Goulburn Valley's Community Radio", M, 23)
  norm(7); inkDim();    tl('ABN: 92 117 291 771', M, 28.5)

  // TAX INVOICE label + number (right)
  bold(14); inkWhite(); tr('TAX INVOICE', W - M, 16.5)
  norm(10); inkGold();  tr(invoice.number, W - M, 24.5)

  // ── GOLD RULE (3px, matches email) ──────────────────────────────────────
  fillGold(); box(0, HEADER_H, W, 1.5)

  // ── BODY ────────────────────────────────────────────────────────────────
  let y = HEADER_H + 10

  // BILL TO / FROM
  norm(7); inkDim()
  tl('BILL TO', M, y); tl('FROM', W / 2 + 5, y)
  y += 5.5

  bold(11); inkNavy()
  tl(invoice.contactName || '', M, y)
  tl('ONE FM 98.5', W / 2 + 5, y)
  y += 5

  norm(9.5); inkGrey()
  tl(invoice.company, M, y)
  y += 4.5

  if (invoice.email) { norm(8); inkGrey(); tl(invoice.email, M, y) }
  norm(8); inkGrey()
  tl('47 Parkside Drive, Shepparton VIC 3630', W / 2 + 5, y)
  y += 4.5
  tl('(03) 5831 3131  ·  accounts@fm985.com.au', W / 2 + 5, y)
  y += 12

  // DATES ROW
  ruleLight(); doc.line(M, y, W - M, y); y += 5
  const COL3 = CW / 3
  norm(7); inkDim()
  tl('ISSUE DATE', M, y)
  tl('DUE DATE', M + COL3, y)
  tl('INVOICE REFERENCE', M + COL3 * 2, y)
  y += 5.5

  bold(10); inkNavy(); tl(issueDate, M, y)
  inkRed();            tl(dueDate, M + COL3, y)
  inkNavy();           tl(invoice.number, M + COL3 * 2, y)
  y += 6

  ruleLight(); doc.line(M, y, W - M, y); y += 10

  // LINE ITEMS — header
  fillNavy(); box(M, y, CW, 8)
  bold(7); inkWhite()
  tl('DESCRIPTION', M + 2, y + 5.3)
  tr('QTY',        M + 93,     y + 5.3)
  tr('UNIT PRICE', M + 120,    y + 5.3)
  tr('EXCL. GST',  M + 148,    y + 5.3)
  tr('GST',        W - M - 1,  y + 5.3)
  y += 8

  // LINE ITEMS — row
  ruleLight(); box(M, y, CW, invoice.period ? 18 : 13, 'S')
  norm(10); inkDark()
  tl(invoice.description, M + 2, y + 5.5)
  if (invoice.period) { norm(8); inkGrey(); tl(`Period: ${invoice.period}`, M + 2, y + 11) }
  norm(10); inkDark()
  tr('1',                       M + 93,    y + 5.5)
  tr(aud(invoice.amountExclGst), M + 120,  y + 5.5)
  tr(aud(invoice.amountExclGst), M + 148,  y + 5.5)
  tr(aud(invoice.gst),           W - M - 1, y + 5.5)
  y += (invoice.period ? 18 : 13) + 10

  // TOTALS — right-aligned 72mm block
  const TX = M + CW - 72   // left edge of totals block

  ruleLight(); doc.line(TX, y, W - M, y); y += 5
  norm(9); inkGrey();  tl('Subtotal (excl. GST)', TX, y)
  norm(9); inkDark();  tr(aud(invoice.amountExclGst), W - M, y)
  y += 4
  ruleLight(); doc.line(TX, y, W - M, y); y += 5
  norm(9); inkGrey();  tl('GST (10%)', TX, y)
  norm(9); inkDark();  tr(aud(invoice.gst), W - M, y)
  y += 5.5

  // TOTAL DUE — navy fill, gold figure (matches email hero)
  fillNavy(); box(TX - 2, y, CW - (TX - M) + 2, 11, 'F')
  bold(11.5); inkWhite(); tl('TOTAL DUE', TX, y + 7.5)
  bold(11.5); inkGold();  tr(aud(invoice.total), W - M, y + 7.5)
  y += 16.5

  norm(7); inkDim(); tr(`Total includes GST of ${aud(invoice.gst)}`, W - M, y)
  y += 12

  // PAYMENT DETAILS SLIP
  fillLight(); box(M, y, CW, 30)
  ruleBlue(); doc.line(M, y, M, y + 30)   // blue left accent

  bold(7); inkDim(); tl('PAYMENT DETAILS — BANK TRANSFER (PREFERRED)', M + 4, y + 6.5)
  norm(8.5); inkNab(); tl('National Australia Bank', M + 4, y + 13)

  const BX = [M + 4, M + 30, M + 62, M + 105, M + 143]
  const BY  = y + 20.5
  norm(7); inkDim()
  tl('BSB',          BX[0], BY - 4.5)
  tl('ACCOUNT',      BX[1], BY - 4.5)
  tl('ACCOUNT NAME', BX[2], BY - 4.5)
  tl('REFERENCE',    BX[3], BY - 4.5)

  bold(9.5); inkNavy()
  tl(BANK_BSB,          BX[0], BY + 2)
  tl(BANK_ACCOUNT,      BX[1], BY + 2)
  tl(BANK_ACCOUNT_NAME, BX[2], BY + 2)
  inkRed(); tl(invoice.number, BX[3], BY + 2)
  y += 36

  // ── FOOTER BAND (matches email) ──────────────────────────────────────────
  const FY = H - 15
  fillGold(); box(0, FY - 1, W, 1)    // gold rule above footer
  fillNavy(); box(0, FY, W, 15)

  norm(7.5); inkSilver()
  tl('Goulburn Valley Community Radio Inc.  ·  ABN: 92 117 291 771', M, FY + 5.5)
  tc('Payment due within 14 days  ·  accounts@fm985.com.au', W / 2, FY + 5.5)
  tr('(03) 5831 3131', W - M, FY + 5.5)

  norm(6.5); doc.setTextColor(100, 100, 100)
  tc(
    `ONEFM-${invoice.number}.pdf  ·  Generated ${today.toLocaleDateString('en-AU')}`,
    W / 2, FY + 11
  )

  return doc
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
    )
    navigator.clipboard.writeText(html).then(() => {
      setCopiedHtml(true)
      toast('HTML copied to clipboard!', 'success')
      setTimeout(() => setCopiedHtml(false), 2000)
    })
  }

  const paymentLinkCount = Object.keys(PAYMENT_LINKS).length
  const emailHtml = generateInvoiceEmailHtml(
    { ...data, customMessage: message },
    BANK_BSB, BANK_ACCOUNT, BANK_ACCOUNT_NAME,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-label text-xs text-one-muted uppercase tracking-wider">
          Email Preview
        </h4>
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
        <span className="text-one-muted uppercase tracking-wider font-label">Bank Details:</span>
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

      {!STRIPE_CONFIG.needsSetup && (
        <div className="bg-[#1B2A1B] border border-[#2A3A2A] rounded-lg p-3 flex items-center gap-2 text-xs">
          <CreditCard className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-300">
            Stripe online payments are active. {paymentLinkCount} payment link
            {paymentLinkCount !== 1 ? 's' : ''} configured.
          </span>
        </div>
      )}

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
