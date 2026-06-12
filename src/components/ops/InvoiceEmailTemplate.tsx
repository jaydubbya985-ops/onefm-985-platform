/* eslint-disable react-refresh/only-export-components */
// ---------------------------------------------------------------------------
// InvoiceEmailTemplate — restored at full fidelity from the deployed bundle.
//
//   • generateInvoiceEmailHtml (bundle `mo`)  — branded HTML invoice letter
//   • generateReceiptEmailHtml (bundle `$i`)  — branded payment receipt email
//   • generateInvoicePdf       (bundle `dp`)  — html2canvas + jsPDF A4 invoice
//   • InvoiceEmailTemplate     (bundle `Oi`)  — interactive email preview with
//     editable custom message, copy-to-clipboard bank details and raw HTML.
// ---------------------------------------------------------------------------
import { useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Check, Copy, CreditCard } from 'lucide-react'
import { useToast } from './Toast'
import { DEFAULT_EMAIL_BODY } from './data/invoices'

// ---------------------------------------------------------------------------
// Bank + Stripe configuration (verbatim from bundle)
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
  needsSetup: false,
  publishableKey: 'pk_live_placeholder',
  currency: 'aud',
  successUrl: 'https://vuvsbxc5bsqi2.kimi.page/#/payment/success',
  cancelUrl: 'https://vuvsbxc5bsqi2.kimi.page/#/payment/cancel',
}

/**
 * Pre-configured Stripe payment links keyed by invoice number (bundle `Vt`).
 * When a link exists for an invoice the email renders a live "Pay via Stripe"
 * button; otherwise the bank-transfer-preferred fallback is shown.
 */
export const PAYMENT_LINKS: Record<string, string> = {}

/** Builds (or returns the cached) Stripe payment link for an invoice. */
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
      cancel_url: `${cancelUrl}?ref=${encodeURIComponent(invoiceNumber)}`,
    }).toString()}`
  }
  return `https://dashboard.stripe.com/payment-links/create?amount=${Math.round(total * 100)}&currency=${currency}`
}

// ---------------------------------------------------------------------------
// Data shapes
// ---------------------------------------------------------------------------

export interface InvoiceEmailData {
  contactName: string
  company: string
  invoiceNumber: string
  amountExclGst: number
  gst: number
  total: number
  /** Pre-formatted display date, e.g. "23 Jun 2026". */
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

/** Invoice fields required by the A4 PDF generator. */
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

const formatDisplayDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

// ---------------------------------------------------------------------------
// Branded HTML invoice email (bundle `mo`) — verbatim template
// ---------------------------------------------------------------------------

export function generateInvoiceEmailHtml(
  data: InvoiceEmailData,
  bsb: string = BANK_BSB,
  account: string = BANK_ACCOUNT,
  accountName: string = BANK_ACCOUNT_NAME,
): string {
  const {
    contactName,
    company,
    invoiceNumber,
    total,
    dueDate,
    customMessage,
    campaign,
    addressLine1,
    addressLine2,
    addressLine3,
  } = data

  const payLink = getStripePaymentLink(invoiceNumber, total, company)
  const hasPaymentLink = !!PAYMENT_LINKS[invoiceNumber]

  const today = new Date()
  const day = today.getDate()
  const monthName = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][today.getMonth()]
  const year = today.getFullYear()
  const dateLine = `${day} ${monthName} ${year}`

  const esc = (value?: string): string =>
    (value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const name = esc(contactName) || 'there'
  const companyName = esc(company) || ''
  const campaignLabel = esc(campaign) || 'Sponsorship'
  const ref = esc(invoiceNumber)
  const addr1 = esc(addressLine1)
  const addr2 = esc(addressLine2)
  const addr3 = esc(addressLine3)
  const message = esc(customMessage || DEFAULT_EMAIL_BODY).replace(
    /\n/g,
    "</p><p style='margin:0 0 12px 0;color:#C8C4BC;font-size:15px;line-height:1.75;'>",
  )
  const totalFormatted = total.toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  let addressBlock = ''
  if (companyName) addressBlock += `<div style="color:#C8C4BC;font-size:14px;line-height:1.7;">${companyName}</div>`
  if (addr1) addressBlock += `<div style="color:#C8C4BC;font-size:14px;line-height:1.7;">${addr1}</div>`
  if (addr2) addressBlock += `<div style="color:#C8C4BC;font-size:14px;line-height:1.7;">${addr2}</div>`
  if (addr3) addressBlock += `<div style="color:#C8C4BC;font-size:14px;line-height:1.7;">${addr3}</div>`

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Invoice ${ref} &mdash; ONE FM 98.5</title>
<!--[if mso]>
<noscript>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
</noscript>
<![endif]-->
<style type="text/css">
  :root { color-scheme: light dark; }
  /* Reset */
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  /* Body */
  body {
    margin: 0 !important; padding: 0 !important;
    background-color: #070E1A;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  /* Wrapper */
  .letter-wrapper {
    max-width: 640px;
    margin: 0 auto;
    background-color: #0A1628;
  }
  /* Letterhead gold line */
  .letterhead-line {
    height: 2px;
    background-color: #D4A853;
    font-size: 0; line-height: 0;
  }
  /* Typography */
  .date-ref-text {
    color: #9A9590; font-size: 13px; line-height: 1.8;
  }
  .salutation-text {
    color: #F4F1EA; font-size: 18px; font-weight: 700;
  }
  .subject-line {
    border-left: 3px solid #D4A853;
    padding: 10px 16px;
    background-color: rgba(212,168,83,0.05);
  }
  .body-text {
    color: #C8C4BC; font-size: 15px; line-height: 1.75;
  }
  .body-text p {
    margin: 0 0 12px 0;
  }
  .closing-text {
    color: #C8C4BC; font-size: 15px; line-height: 1.75; margin: 0;
  }
  /* Invoice card */
  .invoice-card {
    background-color: rgba(244,241,234,0.025);
    border: 1px solid rgba(244,241,234,0.08);
    border-radius: 12px;
  }
  .invoice-total {
    color: #D4A853; font-size: 36px; font-weight: 700;
  }
  .invoice-meta-label {
    color: rgba(244,241,234,0.35); font-size: 11px;
    text-transform: uppercase; letter-spacing: 1.5px;
  }
  .invoice-meta-value {
    color: #F4F1EA; font-size: 14px; font-weight: 600;
  }
  /* Payment */
  .payment-option {
    background-color: rgba(244,241,234,0.015);
    border: 1px solid rgba(244,241,234,0.08);
    border-radius: 10px;
  }
  .bank-label {
    color: rgba(244,241,234,0.35); font-size: 11px;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .bank-value {
    color: #F4F1EA; font-size: 14px;
    font-family: 'Courier New', Courier, monospace;
  }
  .pay-button {
    display: inline-block;
    background: linear-gradient(135deg, #D4A853 0%, #C49A4A 100%);
    color: #0A1628 !important;
    padding: 16px 40px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 700; font-size: 14px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    box-shadow: 0 4px 20px rgba(212,168,83,0.25);
  }
  /* Signature */
  .signature-name {
    color: #F4F1EA; font-size: 16px; font-weight: 700;
  }
  .signature-title {
    color: #D4A853; font-size: 13px;
  }
  .signature-contact {
    color: rgba(244,241,234,0.45); font-size: 13px; line-height: 1.7;
  }
  /* Footer */
  .footer-text {
    color: rgba(244,241,234,0.25); font-size: 12px; line-height: 1.7;
  }
  .footer-legal {
    color: rgba(244,241,234,0.18); font-size: 11px;
  }
  /* Gold accent text */
  .gold { color: #D4A853; }
  .muted { color: rgba(244,241,234,0.35); }

  /* Mobile */
  @media screen and (max-width: 480px) {
    .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    .mobile-stack { display: block !important; width: 100% !important; }
    .mobile-center { text-align: center !important; }
    .salutation-text { font-size: 16px !important; }
    .invoice-total { font-size: 28px !important; }
  }

  /* Light mode */
  @media (prefers-color-scheme: light) {
    body { background-color: #E8E8E8 !important; }
    .letter-wrapper { background-color: #FFFFFF !important; }
    .subject-line { background-color: rgba(212,168,83,0.06) !important; border-left-color: #D4A853 !important; }
    .body-text, .body-text p { color: #3D3D3D !important; }
    .closing-text { color: #3D3D3D !important; }
    .date-ref-text { color: #6B6B6B !important; }
    .salutation-text { color: #1A1A1A !important; }
    .invoice-card { background-color: rgba(0,0,0,0.02) !important; border-color: rgba(0,0,0,0.06) !important; }
    .invoice-meta-label { color: rgba(0,0,0,0.4) !important; }
    .invoice-meta-value { color: #1A1A1A !important; }
    .payment-option { background-color: rgba(0,0,0,0.015) !important; border-color: rgba(0,0,0,0.06) !important; }
    .bank-label { color: rgba(0,0,0,0.4) !important; }
    .bank-value { color: #1A1A1A !important; }
    .signature-name { color: #1A1A1A !important; }
    .signature-contact { color: rgba(0,0,0,0.5) !important; }
    .footer-text { color: rgba(0,0,0,0.35) !important; }
    .footer-legal { color: rgba(0,0,0,0.2) !important; }
    .muted { color: rgba(0,0,0,0.4) !important; }
    .gold { color: #B08A35 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#070E1A;">

  <!--[if mso]>
  <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="640" align="center" style="width:640px;">
  <tr><td>
  <![endif]-->

  <div class="letter-wrapper" style="max-width:640px;margin:0 auto;background-color:#0A1628;">

    <!-- ===========================================
         1. LETTERHEAD HEADER
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding:40px 40px 12px 40px;" class="mobile-padding">
          <img src="https://vuvsbxc5bsqi2.kimi.page/one-fm-logo-master.png"
               alt="ONE FM 98.5"
               width="auto" height="56"
               style="height:56px;width:auto;display:block;border:0;outline:none;" />
          <div style="margin-top:10px;color:rgba(244,241,234,0.45);font-size:12px;letter-spacing:3px;text-transform:uppercase;">
            Goulburn Valley's Community Radio
          </div>
        </td>
      </tr>
      <tr><td class="letterhead-line" style="height:2px;background-color:#D4A853;font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <!-- ===========================================
         2. DATE & REFERENCE BLOCK  (right-aligned)
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="right" style="padding:32px 40px 0 40px;" class="mobile-padding">
          <div class="date-ref-text">
            <div>${dateLine}</div>
            <div style="margin-top:4px;">Invoice Ref: <span style="color:#D4A853;font-weight:600;">${ref}</span></div>
            <div style="margin-top:4px;">Our ABN: 92 117 291 771</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- ===========================================
         3. RECIPIENT ADDRESS BLOCK  (left-aligned)
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="left" style="padding:32px 40px 0 40px;" class="mobile-padding">
          <div style="color:#F4F1EA;font-size:14px;font-weight:600;margin-bottom:6px;">
            Attention: ${name}
          </div>
          ${addressBlock}
        </td>
      </tr>
    </table>

    <!-- ===========================================
         4. SALUTATION
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding:40px 40px 0 40px;" class="mobile-padding">
          <div class="salutation-text">Dear ${name},</div>
        </td>
      </tr>
    </table>

    <!-- ===========================================
         5. SUBJECT LINE  (gold left border accent)
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding:24px 40px 0 40px;" class="mobile-padding">
          <div class="subject-line">
            <div style="color:#F4F1EA;font-size:16px;font-weight:700;">
              RE: Invoice ${ref} &mdash; ${campaignLabel}
            </div>
            <div style="color:rgba(244,241,234,0.35);font-size:12px;margin-top:4px;">
              Please find attached your invoice for ${campaignLabel}
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- ===========================================
         6. BODY  (custom message)
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding:32px 40px 0 40px;" class="mobile-padding">
          <div class="body-text">
            <p style="margin:0 0 12px 0;color:#C8C4BC;font-size:15px;line-height:1.75;">${message}</p>
          </div>
        </td>
      </tr>
    </table>

    <!-- ===========================================
         7. INVOICE SUMMARY CARD
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding:36px 40px 0 40px;" class="mobile-padding">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="invoice-card">
            <tr><td style="padding:32px;">

              <!-- Invoice number row -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom:20px;border-bottom:1px solid rgba(244,241,234,0.08);">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left: invoice number -->
                        <td style="vertical-align:top;" class="mobile-stack">
                          <div class="invoice-meta-label">Invoice Number</div>
                          <div style="color:#F4F1EA;font-size:16px;font-weight:700;margin-top:6px;">${ref}</div>
                        </td>
                        <!-- Right: campaign tag -->
                        <td style="vertical-align:top;text-align:right;" class="mobile-stack mobile-center" style="padding-top:12px;">
                          <span style="display:inline-block;background:rgba(212,168,83,0.12);color:#D4A853;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;padding:7px 16px;border-radius:20px;">
                            ${campaignLabel}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Total Amount -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:28px 0 20px 0;">
                    <div class="invoice-meta-label" style="margin-bottom:10px;">Total Amount Due</div>
                    <div class="invoice-total">$${totalFormatted}</div>
                    <div style="color:rgba(244,241,234,0.35);font-size:13px;margin-top:8px;">Inc. GST</div>
                  </td>
                </tr>
              </table>

              <!-- Meta row: Due Date + Amount -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-top:20px;border-top:1px solid rgba(244,241,234,0.08);">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:10px 0;vertical-align:top;" class="mobile-stack">
                          <div class="invoice-meta-label">Due Date</div>
                          <div class="invoice-meta-value" style="margin-top:4px;">${dueDate}</div>
                        </td>
                        <td style="padding:10px 0;vertical-align:top;text-align:right;" class="mobile-stack mobile-center">
                          <div class="invoice-meta-label">Reference</div>
                          <div class="invoice-meta-value" style="margin-top:4px;">${ref}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- ===========================================
         8. PAYMENT OPTIONS
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding:32px 40px 0 40px;" class="mobile-padding">

          <!-- Section label -->
          <div style="color:rgba(244,241,234,0.35);font-size:11px;text-transform:uppercase;letter-spacing:2.5px;font-weight:600;margin-bottom:20px;">
            Payment Options
          </div>

          <!-- Option A: Bank Transfer -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="payment-option">
            <tr><td style="padding:24px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="mobile-stack">
                    <div style="margin-bottom:4px;">
                      <span style="color:#D4A853;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Option A</span>
                      <span style="color:rgba(244,241,234,0.6);font-size:13px;margin-left:8px;font-weight:600;">Bank Transfer &mdash; Preferred</span>
                    </div>
                    <div style="color:rgba(212,168,83,0.7);font-size:11px;margin-bottom:14px;">National Australia Bank</div>

                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:5px 24px 5px 0;">
                          <div class="bank-label">BSB</div>
                          <div class="bank-value" style="margin-top:2px;">${bsb}</div>
                        </td>
                        <td style="padding:5px 24px 5px 0;">
                          <div class="bank-label">Account</div>
                          <div class="bank-value" style="margin-top:2px;">${account}</div>
                        </td>
                        <td style="padding:5px 0;">
                          <div class="bank-label">Reference</div>
                          <div class="bank-value" style="margin-top:2px;color:#D4A853;">${ref}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:10px;">
                    <div style="color:rgba(244,241,234,0.3);font-size:11px;">
                      Account Name: <span style="color:rgba(244,241,234,0.6);">${accountName}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Spacer between options -->
          <div style="height:16px;"></div>

          <!-- Option B: Pay Online via Stripe -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="payment-option">
            <tr><td style="padding:24px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="mobile-stack" style="vertical-align:middle;">
                    <div style="margin-bottom:4px;">
                      <span style="color:#D4A853;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Option B</span>
                      <span style="color:rgba(244,241,234,0.6);font-size:13px;margin-left:8px;font-weight:600;">Pay Online</span>
                      
                    </div>
                    ${hasPaymentLink ? '<div style="color:rgba(244,241,234,0.35);font-size:12px;">Secure card payment processed instantly by Stripe</div>' : '<div style="color:rgba(244,241,234,0.35);font-size:12px;">Online payment via Stripe — currently being configured</div>'}
                  </td>
                  <td class="mobile-stack mobile-center" style="vertical-align:middle;text-align:right;padding-top:12px;">
                    ${hasPaymentLink ? `<a href="${payLink}" class="pay-button">Pay $${totalFormatted} via Stripe</a>` : '<div style="display:inline-block;background:rgba(244,241,234,0.06);color:rgba(244,241,234,0.3);padding:16px 40px;border-radius:50px;font-weight:700;font-size:14px;letter-spacing:0.5px;text-transform:uppercase;border:1px solid rgba(244,241,234,0.1);">Stripe — Setup Required</div>'}
                  </td>
                </tr>
              </table>
              <!-- Stripe footer note -->
              <div style="color:rgba(244,241,234,0.2);font-size:11px;text-align:center;margin-top:14px;letter-spacing:1px;">
                ${hasPaymentLink ? `Powered by Stripe &middot; SSL Encrypted &middot; Account: ${STRIPE_CONFIG.accountId}` : 'Bank transfer (Option A) is the preferred payment method until Stripe links are configured. Contact us for assistance.'}
              </div>
            </td></tr>
          </table>

          <!-- Spacer between options -->
          <div style="height:16px;"></div>

          <!-- Option C: Direct Debit (BECS) -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="payment-option">
            <tr><td style="padding:24px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="mobile-stack" style="vertical-align:middle;">
                    <div style="margin-bottom:4px;">
                      <span style="color:#D4A853;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Option C</span>
                      <span style="color:rgba(244,241,234,0.6);font-size:13px;margin-left:8px;font-weight:600;">Direct Debit</span>
                      <span style="display:inline-block;background:rgba(74,222,128,0.12);color:#4ADE80;font-size:9px;text-transform:uppercase;letter-spacing:1px;font-weight:600;padding:3px 10px;border-radius:10px;margin-left:8px;vertical-align:middle;">Recommended for ongoing sponsors</span>
                    </div>
                    <div style="color:rgba(244,241,234,0.35);font-size:12px;">Set up automatic payment from your bank account — no more invoices!</div>
                  </td>
                  <td class="mobile-stack mobile-center" style="vertical-align:middle;text-align:right;padding-top:12px;">
                    <a href="https://dashboard.stripe.com/settings/payment_methods" class="pay-button" style="background:rgba(74,222,128,0.08);color:#4ADE80;border:1px solid rgba(74,222,128,0.3);">Set Up Direct Debit</a>
                  </td>
                </tr>
              </table>
              <div style="color:rgba(244,241,234,0.2);font-size:11px;text-align:center;margin-top:14px;letter-spacing:1px;">
                Processed by Stripe BECS &middot; 3-5 business days &middot; Advance notice given
              </div>
            </td></tr>
          </table>

        </td>
      </tr>
    </table>

    <!-- ===========================================
         9. CLOSING PARAGRAPH
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding:36px 40px 0 40px;" class="mobile-padding">
          <p class="closing-text" style="margin:0 0 10px 0;">
            If you have any questions, please don't hesitate to contact me.
          </p>
          <p class="closing-text" style="margin:0;">
            Thank you for your continued support of community radio.
          </p>
        </td>
      </tr>
    </table>

    <!-- ===========================================
         10. SIGNATURE BLOCK
         =========================================== -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding:40px 40px 0 40px;" class="mobile-padding">
          <!-- Gold accent line above signature -->
          <div style="width:48px;height:2px;background-color:#D4A853;margin-bottom:20px;"></div>
          <div class="signature-name">Jason Welsh</div>
          <div class="signature-title" style="margin-top:4px;">Station Manager, ONE FM 98.5</div>
          <div class="signature-contact" style="margin-top:10px;">
            (03) 5831 3131 &nbsp;|&nbsp; jason@onefm.com.au
          </div>
          <div class="signature-contact">
            47 Parkside Drive, Shepparton VIC 3630
          </div>
        </td>
      </tr>
    </table>

    <!-- =========================================
         11. FOOTER
         ========================================= -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding:48px 40px 36px 40px;text-align:center;" class="mobile-padding">
          <!-- Gold separator -->
          <div style="height:1px;background-color:rgba(244,241,234,0.08);margin-bottom:28px;"></div>
          <div class="footer-text">
            <strong style="color:#D4A853;letter-spacing:1px;">ONE FM 98.5</strong> &middot; Goulburn Valley Community Radio Inc.
          </div>
          <div class="footer-text" style="margin-top:4px;">
            ABN 92 117 291 771
          </div>
          <div class="footer-legal" style="margin-top:16px;">
            This email was sent via the ONE FM Operations Portal
          </div>
        </td>
      </tr>
    </table>

  </div><!-- /.letter-wrapper -->

  <!--[if mso]>
  </td></tr></table>
  <![endif]-->

</body>
</html>`
}

// ---------------------------------------------------------------------------
// Payment receipt email (bundle `$i`) — verbatim template
// ---------------------------------------------------------------------------

export function generateReceiptEmailHtml(data: ReceiptEmailData): string {
  const { contactName, company, invoiceNumber, amount, paymentDate, paymentMethod, reference } = data

  const esc = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const amountFormatted = amount.toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>Payment Receipt — ${esc(invoiceNumber)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
  body { margin:0; padding:0; background:linear-gradient(180deg,#0A0E1A 0%,#0F1D32 100%); font-family:'Space Grotesk',sans-serif; }
  .wrapper { max-width:600px; margin:0 auto; background:linear-gradient(180deg,#0A1628 0%,#0F1D32 100%); }
  .banner { height:4px; background:linear-gradient(90deg,#D4A853 0%,#F0C96C 50%,#D4A853 100%); }
  .header { padding:40px; text-align:center; border-bottom:1px solid rgba(212,168,83,0.15); }
  .logo { color:#F4F1EA; font-size:28px; font-weight:800; letter-spacing:-1px; margin:0; }
  .logo span { color:#D4A853; }
  .subtitle { color:rgba(244,241,234,0.45); font-size:11px; text-transform:uppercase; letter-spacing:3px; margin-top:8px; }
  .body { padding:40px; }
  .receipt-title { color:#4ADE80; font-size:14px; text-transform:uppercase; letter-spacing:3px; font-weight:600; margin-bottom:8px; }
  .amount { color:#D4A853; font-size:56px; font-weight:800; letter-spacing:-2px; margin:0; }
  .label { color:rgba(244,241,234,0.35); font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:600; }
  .details { background:rgba(244,241,234,0.025); border:1px solid rgba(244,241,234,0.08); border-radius:12px; padding:28px; margin:28px 0; }
  .row { display:table; width:100%; margin-bottom:10px; }
  .row:last-child { margin-bottom:0; }
  .label-cell { display:table-cell; color:rgba(244,241,234,0.35); font-size:11px; text-transform:uppercase; letter-spacing:1px; font-weight:600; width:140px; }
  .value-cell { display:table-cell; color:#F4F1EA; font-size:14px; font-weight:600; }
  .footer { padding:32px 40px; text-align:center; border-top:1px solid rgba(244,241,234,0.06); background:rgba(0,0,0,0.15); }
  .footer-logo { color:#D4A853; font-size:16px; font-weight:800; letter-spacing:2px; margin-bottom:8px; }
  .footer-text { color:rgba(244,241,234,0.3); font-size:12px; }
  .check { width:64px; height:64px; border:3px solid #4ADE80; border-radius:50%; margin:0 auto 20px; display:flex; align-items:center; justify-content:center; color:#4ADE80; font-size:32px; }
  @media (prefers-color-scheme: light) {
    body { background:#F0F0F0; }
    .wrapper { background:#FFFFFF; }
    .header { border-bottom-color:rgba(0,0,0,0.08); }
    .logo { color:#0A1628; }
    .body { color:#0A1628; }
    .details { background:rgba(0,0,0,0.02); border-color:rgba(0,0,0,0.06); }
    .label-cell { color:rgba(10,22,40,0.35); }
    .value-cell { color:#0A1628; }
    .footer { border-top-color:rgba(0,0,0,0.06); background:rgba(0,0,0,0.03); }
  }
</style>
</head>
<body>
<div class="wrapper">
  <div class="banner"></div>
  <div class="header">
    <h1 class="logo">ONE FM <span>98.5</span></h1>
    <div class="subtitle">Goulburn Valley Community Radio</div>
  </div>
  <div class="body">
    <div style="text-align:center; margin-bottom:32px;">
      <div class="check">&#10003;</div>
      <div class="receipt-title">Payment Received</div>
      <div class="amount">$${amountFormatted}</div>
    </div>
    <p style="color:rgba(244,241,234,0.82); font-size:15px; line-height:1.75; margin-bottom:28px;">
      Hi ${esc(contactName || 'there')},<br><br>
      Thank you for your payment. We've received <strong style="color:#D4A853;">$${amountFormatted}</strong> for invoice <strong>${esc(invoiceNumber)}</strong>.
    </p>
    <div class="details">
      <div class="row"><span class="label-cell">Invoice</span><span class="value-cell">${esc(invoiceNumber)}</span></div>
      <div class="row"><span class="label-cell">Company</span><span class="value-cell">${esc(company)}</span></div>
      <div class="row"><span class="label-cell">Amount Paid</span><span class="value-cell" style="color:#4ADE80;">$${amountFormatted}</span></div>
      <div class="row"><span class="label-cell">Payment Date</span><span class="value-cell">${esc(paymentDate)}</span></div>
      <div class="row"><span class="label-cell">Payment Method</span><span class="value-cell">${esc(paymentMethod)}</span></div>
      <div class="row"><span class="label-cell">Reference</span><span class="value-cell">${esc(reference)}</span></div>
    </div>
    <p style="color:rgba(244,241,234,0.6); font-size:13px; line-height:1.7;">
      Your support keeps community radio alive in the Goulburn Valley. If you have any questions about this receipt, please contact us anytime.
    </p>
  </div>
  <div class="footer">
    <div class="footer-logo">ONE FM 98.5</div>
    <div class="footer-text">(03) 5831 3131 &middot; accounts@fm985.com.au<br>47 Parkside Drive, Shepparton VIC 3630</div>
  </div>
</div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// A4 PDF generation (bundle `dp`) — html2canvas (scale 2, width 794px) into
// jsPDF portrait/mm/A4, image placed at full 210mm width.
// ---------------------------------------------------------------------------

export async function generateInvoicePdf(invoice: PdfInvoiceData): Promise<jsPDF> {
  const host = document.createElement('div')
  host.style.position = 'absolute'
  host.style.left = '-9999px'
  host.style.top = '0'
  host.style.width = '210mm'
  host.style.background = 'white'
  host.style.color = '#1a1a1a'
  host.style.fontFamily = 'Arial, sans-serif'
  host.style.padding = '20mm'
  document.body.appendChild(host)

  host.innerHTML = `
    <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 170mm; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; border-bottom: 3px solid #D4A853; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="font-size: 28px; font-weight: 900; color: #0A1628; margin: 0;">ONE FM <span style="color: #D4A853;">98.5</span></h1>
          <p style="font-size: 11px; color: #666; margin: 4px 0 0 0;">Goulburn Valley's Community Radio</p>
          <p style="font-size: 10px; color: #999; margin: 2px 0 0 0;">ABN: 92 117 291 771</p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 22px; font-weight: 700; color: #0A1628; margin: 0;">TAX INVOICE</h2>
          <p style="font-size: 14px; font-weight: 700; color: #D4A853; margin: 4px 0 0 0;">${invoice.number}</p>
        </div>
      </div>

      <!-- Address Block -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 11px; line-height: 1.6;">
        <div>
          <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 4px 0;">BILL TO</p>
          <p style="font-weight: 700; margin: 0;">${invoice.contactName || ''}</p>
          <p style="margin: 0;">${invoice.company}</p>
          <p style="margin: 0; color: #666;">${invoice.email || ''}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 4px 0;">FROM</p>
          <p style="font-weight: 700; margin: 0;">ONE FM 98.5</p>
          <p style="margin: 0;">47 Parkside Drive</p>
          <p style="margin: 0;">Shepparton VIC 3630</p>
          <p style="margin: 0;">(03) 5831 3131</p>
          <p style="margin: 0;">accounts@fm985.com.au</p>
        </div>
      </div>

      <!-- Meta -->
      <div style="display: flex; gap: 40px; margin-bottom: 30px; padding: 12px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; font-size: 11px;">
        <div><span style="color: #999; text-transform: uppercase; font-size: 9px; letter-spacing: 1px;">Issue Date</span><br/><strong>${formatDisplayDate(new Date().toISOString())}</strong></div>
        <div><span style="color: #999; text-transform: uppercase; font-size: 9px; letter-spacing: 1px;">Due Date</span><br/><strong style="color: #c00;">${formatDisplayDate(invoice.dueDate)}</strong></div>
        <div><span style="color: #999; text-transform: uppercase; font-size: 9px; letter-spacing: 1px;">Reference</span><br/><strong>${invoice.number}</strong></div>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 30px;">
        <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 4px 0;">DESCRIPTION</p>
        <p style="font-size: 12px; margin: 0; line-height: 1.5;">${invoice.description}</p>
        ${invoice.period ? `<p style="font-size: 10px; color: #666; margin: 4px 0 0 0;">Period: ${invoice.period}</p>` : ''}
      </div>

      <!-- Amount Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px;">
        <thead>
          <tr style="border-bottom: 2px solid #D4A853;">
            <th style="text-align: left; padding: 8px 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Description</th>
            <th style="text-align: right; padding: 8px 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Amount (excl GST)</th>
            <th style="text-align: right; padding: 8px 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #999;">GST (10%)</th>
            <th style="text-align: right; padding: 8px 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;">${invoice.description}</td>
            <td style="text-align: right; padding: 10px 0;">$${invoice.amountExclGst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right; padding: 10px 0;">$${invoice.gst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right; padding: 10px 0; font-weight: 700;">$${invoice.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals -->
      <div style="text-align: right; margin-bottom: 30px;">
        <div style="display: inline-block; text-align: right;">
          <div style="display: flex; justify-content: space-between; gap: 40px; padding: 6px 0; font-size: 11px;">
            <span style="color: #666;">Subtotal (excl GST)</span>
            <span>$${invoice.amountExclGst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 40px; padding: 6px 0; font-size: 11px;">
            <span style="color: #666;">GST 10%</span>
            <span>$${invoice.gst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 40px; padding: 12px 0; border-top: 2px solid #D4A853; font-size: 18px; font-weight: 800; color: #D4A853;">
            <span>TOTAL</span>
            <span>$${invoice.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
          </div>
          <p style="font-size: 9px; color: #999; margin: 4px 0 0 0;">Total includes GST of $${invoice.gst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <!-- Payment -->
      <div style="background: #f9f9f9; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
        <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 12px 0;">HOW TO PAY</p>
        <div style="font-size: 11px; line-height: 1.8;">
          <p style="margin: 0;"><strong>Bank Transfer (Preferred)</strong></p>
          <p style="margin: 0;">NAB | BSB: ${BANK_BSB} | Account: ${BANK_ACCOUNT}</p>
          <p style="margin: 0;">Account Name: ${BANK_ACCOUNT_NAME}</p>
          <p style="margin: 0; color: #c00;">Reference: ${invoice.number}</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 15px;">
        <p style="margin: 0;">Thank you for supporting community radio in the Goulburn Valley.</p>
        <p style="margin: 4px 0 0 0;">Payment due within 14 days. Please email remittance advice to accounts@fm985.com.au</p>
      </div>
    </div>
  `

  const canvas = await html2canvas(host, { scale: 2, useCORS: true, logging: false, width: 794 })
  document.body.removeChild(host)

  const pdf = new jsPDF('p', 'mm', 'a4')
  const imageData = canvas.toDataURL('image/png')
  const pageWidthMm = 210
  const imageHeightMm = (canvas.height * pageWidthMm) / canvas.width
  pdf.addImage(imageData, 'PNG', 0, 0, pageWidthMm, imageHeightMm)
  return pdf
}

// ---------------------------------------------------------------------------
// Interactive email preview component (bundle `Oi`)
// ---------------------------------------------------------------------------

interface InvoiceEmailTemplateProps {
  data: InvoiceEmailData
  onMessageChange?: (message: string) => void
}

export default function InvoiceEmailTemplate({ data, onMessageChange }: InvoiceEmailTemplateProps) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState(data.customMessage)
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
      BANK_BSB,
      BANK_ACCOUNT,
      BANK_ACCOUNT_NAME,
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
    BANK_BSB,
    BANK_ACCOUNT,
    BANK_ACCOUNT_NAME,
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
        <button
          onClick={() => copyField(BANK_BSB, 'bsb')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#2A3A52] transition-colors group"
        >
          <span className="text-one-muted">BSB:</span>
          <span className="font-mono text-one-gold">{BANK_BSB}</span>
          {copiedField === 'bsb' ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-one-muted group-hover:text-one-gold transition-colors" />
          )}
        </button>
        <button
          onClick={() => copyField(BANK_ACCOUNT, 'acct')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#2A3A52] transition-colors group"
        >
          <span className="text-one-muted">Acct:</span>
          <span className="font-mono text-one-gold">{BANK_ACCOUNT}</span>
          {copiedField === 'acct' ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-one-muted group-hover:text-one-gold transition-colors" />
          )}
        </button>
        <button
          onClick={() => copyField(BANK_ACCOUNT_NAME, 'name')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#2A3A52] transition-colors group"
        >
          <span className="text-one-muted">Name:</span>
          <span className="font-mono text-one-white truncate max-w-[180px]">{BANK_ACCOUNT_NAME}</span>
          {copiedField === 'name' ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-one-muted group-hover:text-one-gold transition-colors" />
          )}
        </button>
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
