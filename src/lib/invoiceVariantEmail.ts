/**
 * Three invoice email HTML renderers — Outlook-safe, 600px, table-based.
 */
import { DS } from '@/lib/invoiceDesignSystem'
import {
  getVariantMeta,
  INVOICE_STATION,
  type InvoiceDesignVariantId,
} from '@/lib/invoiceDesignVariants'
import type { InvoiceEmailData } from '@/components/ops/InvoiceEmailTemplate'

const esc = (v?: string) =>
  (v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const audFmt = (n: number) =>
  n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface BankCtx {
  bsb: string
  account: string
  accountName: string
}

interface RenderCtx {
  data: InvoiceEmailData
  bank: BankCtx
  messageHtml: string
  addressBlock: string
  dateLine: string
  name: string
  companyName: string
  campaignLabel: string
  ref: string
  totalFmt: string
}

function buildRenderCtx(data: InvoiceEmailData, bank: BankCtx, defaultBody: string): RenderCtx {
  const {
    contactName, company, invoiceNumber, total, campaign,
    addressLine1, addressLine2, addressLine3, customMessage,
  } = data

  const messageHtml = (customMessage || defaultBody)
    .split('\n')
    .map(
      (line) =>
        `<p style="margin:0 0 14px 0;color:#1A1A1A;font-size:15px;line-height:1.75;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">${esc(line)}</p>`,
    )
    .join('')

  let addressBlock = ''
  const companyName = esc(company)
  if (companyName) {
    addressBlock += `<div style="font-size:13px;font-weight:600;color:#1A1A1A;line-height:1.7;">${companyName}</div>`
  }
  if (esc(addressLine1)) {
    addressBlock += `<div style="font-size:13px;color:#3D3D3D;line-height:1.7;">${esc(addressLine1)}</div>`
  }
  if (esc(addressLine2)) {
    addressBlock += `<div style="font-size:13px;color:#3D3D3D;line-height:1.7;">${esc(addressLine2)}</div>`
  }
  if (esc(addressLine3)) {
    addressBlock += `<div style="font-size:13px;color:#3D3D3D;line-height:1.7;">${esc(addressLine3)}</div>`
  }

  return {
    data,
    bank,
    messageHtml,
    addressBlock,
    dateLine: new Date().toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    name: esc(contactName) || 'there',
    companyName,
    campaignLabel: esc(campaign) || 'Sponsorship',
    ref: esc(invoiceNumber),
    totalFmt: audFmt(total),
  }
}

function emailShell(title: string, body: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<title>${title}</title>
<style type="text/css">
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block;}
  body{margin:0!important;padding:0!important;background-color:#D8D8D8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;}
  @media screen and (max-width:480px){.mp{padding-left:20px!important;padding-right:20px!important;}.amt{font-size:48px!important;}}
</style>
</head>
<body style="margin:0;padding:0;background-color:#D8D8D8;">
<!--[if mso]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" align="center"><tr><td><![endif]-->
<div style="max-width:600px;margin:0 auto;">${body}</div>
<!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`
}

function bankSlipBroadcast(ctx: RenderCtx): string {
  const { bank, ref } = ctx
  return `
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px solid rgba(26,26,26,0.1);background-color:#FFFFFF;">
    <tr><td style="padding:22px 24px;">
      <div style="color:#3A6E22;font-size:11px;font-weight:600;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px;">National Australia Bank</div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding:0 28px 0 0;vertical-align:top;">
            <div style="color:#6B6B6B;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px;">BSB</div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#071D3A;">${bank.bsb}</div>
          </td>
          <td style="padding:0 28px 0 0;vertical-align:top;">
            <div style="color:#6B6B6B;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px;">Account</div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#071D3A;">${bank.account}</div>
          </td>
          <td style="padding:0;vertical-align:top;">
            <div style="color:#6B6B6B;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px;">Reference</div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#D4AF37;">${ref}</div>
          </td>
        </tr>
      </table>
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(26,26,26,0.06);color:#6B6B6B;font-size:12px;">
        Account Name: <span style="color:#1A1A1A;font-weight:600;">${bank.accountName}</span>
      </div>
    </td></tr>
  </table>`
}

function bankSlipOnAir(ctx: RenderCtx): string {
  const { bank, ref } = ctx
  return `
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border:2px solid #E51636;background-color:#0A0A0A;">
    <tr><td style="padding:20px 22px;">
      <div style="color:#B6FF00;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:12px;">Pay by bank transfer</div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
        <tr>
          <td style="color:rgba(255,255,255,0.45);font-size:9px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">BSB</td>
          <td style="color:rgba(255,255,255,0.45);font-size:9px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Account</td>
          <td style="color:rgba(255,255,255,0.45);font-size:9px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Reference</td>
        </tr>
        <tr>
          <td style="font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:700;color:#FFFFFF;padding-bottom:8px;">${bank.bsb}</td>
          <td style="font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:700;color:#FFFFFF;padding-bottom:8px;">${bank.account}</td>
          <td style="font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:700;color:#B6FF00;padding-bottom:8px;">${ref}</td>
        </tr>
      </table>
      <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:8px;">${bank.accountName} · NAB</div>
    </td></tr>
  </table>`
}

function bankSlipValley(ctx: RenderCtx): string {
  const { bank, ref } = ctx
  return `
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px solid #C4A265;border-radius:8px;background-color:#FFFCF7;">
    <tr><td style="padding:22px 24px;">
      <div style="color:#2D4A3E;font-size:11px;font-weight:600;margin-bottom:14px;text-transform:uppercase;letter-spacing:1px;">Bank transfer — preferred</div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding:0 24px 0 0;vertical-align:top;">
            <div style="color:#6B6B6B;font-size:9px;text-transform:uppercase;margin-bottom:4px;">BSB</div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#2D4A3E;">${bank.bsb}</div>
          </td>
          <td style="padding:0 24px 0 0;vertical-align:top;">
            <div style="color:#6B6B6B;font-size:9px;text-transform:uppercase;margin-bottom:4px;">Account</div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#2D4A3E;">${bank.account}</div>
          </td>
          <td style="padding:0;vertical-align:top;">
            <div style="color:#6B6B6B;font-size:9px;text-transform:uppercase;margin-bottom:4px;">Reference</div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#B8860B;">${ref}</div>
          </td>
        </tr>
      </table>
      <div style="margin-top:12px;color:#6B6B6B;font-size:12px;">Account name: <strong style="color:#2D4A3E;">${bank.accountName}</strong></div>
    </td></tr>
  </table>`
}

function signatureBlock(accent: string, textColor = '#1A1A1A'): string {
  return `
  <div style="width:36px;height:3px;background-color:${accent};margin-bottom:18px;"></div>
  <div style="color:${textColor};font-size:15px;font-weight:700;">${INVOICE_STATION.sigName}</div>
  <div style="color:${accent};font-size:13px;margin-top:3px;">${INVOICE_STATION.sigTitle}</div>
  <div style="color:#6B6B6B;font-size:13px;margin-top:10px;line-height:1.7;">
    ${INVOICE_STATION.phone} &nbsp;|&nbsp; ${INVOICE_STATION.accountsEmail}<br>
    ${INVOICE_STATION.address}
  </div>`
}

function renderBroadcast(ctx: RenderCtx): string {
  const body = `
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#071D3A;">
    <tr><td style="padding:36px 40px 32px 40px;" class="mp">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="vertical-align:middle;">
            <img src="${DS.logoUrl}" alt="ONE FM 98.5" width="110" style="width:110px;height:auto;display:block;border:0;" />
          </td>
          <td style="vertical-align:middle;text-align:right;">
            <div style="color:rgba(255,255,255,0.5);font-size:12px;">${ctx.dateLine}</div>
            <div style="color:rgba(255,255,255,0.3);font-size:10px;margin-top:2px;">ABN ${INVOICE_STATION.abn}</div>
          </td>
        </tr>
      </table>
      <div style="margin-top:8px;color:rgba(212,175,55,0.55);font-size:9px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">
        Live · Local · Community · Since ${INVOICE_STATION.licensed}
      </div>
      <div style="margin-top:22px;color:rgba(255,255,255,0.45);font-size:10px;text-transform:uppercase;letter-spacing:4px;font-weight:600;">Invoice</div>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:12px;">
        <tr><td style="padding:28px 32px;background-color:rgba(0,0,0,0.28);border:1px solid rgba(255,255,255,0.07);">
          <div style="color:rgba(255,255,255,0.45);font-size:9px;text-transform:uppercase;letter-spacing:3.5px;font-weight:700;margin-bottom:10px;">Amount Due</div>
          <div class="amt" style="font-size:64px;font-weight:800;color:#D4AF37;letter-spacing:-2px;line-height:1;">$${ctx.totalFmt}</div>
          <div style="margin-top:14px;color:rgba(255,255,255,0.5);font-size:13px;">
            Due ${ctx.data.dueDate} &nbsp;·&nbsp; Ref <span style="color:#D4AF37;font-weight:600;">${ctx.ref}</span>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <div style="height:3px;background-color:#D4AF37;font-size:0;line-height:0;">&nbsp;</div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAFAF8;">
    <tr><td style="padding:40px 40px 0 40px;" class="mp">
      <div style="color:#6B6B6B;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-bottom:8px;">Addressed To</div>
      <div style="color:#1A1A1A;font-size:14px;font-weight:700;margin-bottom:4px;">${ctx.name}</div>
      ${ctx.addressBlock}
    </td></tr>
    <tr><td style="padding:32px 40px 0 40px;" class="mp">
      <div style="color:#1A1A1A;font-size:18px;font-weight:700;">Dear ${ctx.name},</div>
    </td></tr>
    <tr><td style="padding:20px 40px 0 40px;" class="mp">
      <div style="border-left:3px solid #D4AF37;padding:10px 16px;background-color:rgba(212,175,55,0.05);">
        <div style="color:#1A1A1A;font-size:15px;font-weight:700;">RE: Invoice ${ctx.ref} — ${ctx.campaignLabel}</div>
      </div>
    </td></tr>
    <tr><td style="padding:28px 40px 0 40px;" class="mp">${ctx.messageHtml}</td></tr>
    <tr><td style="padding:32px 40px 0 40px;" class="mp">
      <div style="color:#6B6B6B;font-size:10px;text-transform:uppercase;letter-spacing:2.5px;font-weight:600;margin-bottom:14px;">Payment by Bank Transfer — Preferred</div>
      ${bankSlipBroadcast(ctx)}
    </td></tr>
    <tr><td style="padding:36px 40px 48px 40px;" class="mp">${signatureBlock('#D4AF37')}</td></tr>
  </table>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#071D3A;">
    <tr><td style="padding:28px 40px;text-align:center;" class="mp">
      <div style="color:rgba(255,255,255,0.45);font-size:12px;line-height:1.9;">
        <strong style="color:#D4AF37;">ONE FM 98.5</strong> · ${INVOICE_STATION.org}<br>
        Callsign ${INVOICE_STATION.callsign} · ABN ${INVOICE_STATION.abn}
      </div>
    </td></tr>
  </table>`
  return emailShell(`Invoice ${ctx.ref} — ONE FM 98.5`, body)
}

function renderOnAir(ctx: RenderCtx): string {
  const body = `
  <div style="height:4px;background-color:#E51636;font-size:0;line-height:0;">&nbsp;</div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0A0A0A;">
    <tr><td style="padding:8px 40px;background-color:#E51636;" class="mp">
      <div style="color:#FFFFFF;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-align:center;">
        ONE FM 98.5 · GOULBURN VALLEY · CALLSIGN 3ONE · LIVE &amp; LOCAL
      </div>
    </td></tr>
    <tr><td style="padding:32px 40px 28px 40px;" class="mp">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td><img src="${DS.logoUrl}" alt="ONE FM" width="100" style="width:100px;height:auto;display:block;" /></td>
          <td style="text-align:right;vertical-align:top;">
            <div style="color:rgba(255,255,255,0.35);font-size:10px;letter-spacing:2px;text-transform:uppercase;">Tax Invoice</div>
            <div style="color:#FFFFFF;font-size:13px;font-weight:700;margin-top:4px;">${ctx.ref}</div>
            <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:4px;">${ctx.dateLine}</div>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:24px;">
        <tr><td style="background-color:#E51636;padding:24px 28px;">
          <div style="color:rgba(255,255,255,0.75);font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">
            <span style="color:#B6FF00;">●</span> Amount Due
          </div>
          <div class="amt" style="font-size:56px;font-weight:800;color:#FFFFFF;letter-spacing:-2px;line-height:1;">$${ctx.totalFmt}</div>
          <div style="margin-top:12px;color:rgba(255,255,255,0.7);font-size:12px;">Due ${ctx.data.dueDate}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAFAFA;">
    <tr><td style="padding:36px 40px 0 40px;" class="mp">
      <div style="color:#E51636;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Bill to</div>
      <div style="color:#0A0A0A;font-size:16px;font-weight:700;">${ctx.name}</div>
      ${ctx.addressBlock}
    </td></tr>
    <tr><td style="padding:28px 40px 0 40px;" class="mp">
      <div style="color:#0A0A0A;font-size:17px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Dear ${ctx.name},</div>
    </td></tr>
    <tr><td style="padding:16px 40px 0 40px;" class="mp">
      <div style="border-left:3px solid #E51636;padding-left:14px;color:#0A0A0A;font-size:14px;font-weight:600;">
        ${ctx.campaignLabel} · ${ctx.ref}
      </div>
    </td></tr>
    <tr><td style="padding:24px 40px 0 40px;" class="mp">${ctx.messageHtml}</td></tr>
    <tr><td style="padding:28px 40px 0 40px;" class="mp">${bankSlipOnAir(ctx)}</td></tr>
    <tr><td style="padding:36px 40px 44px 40px;" class="mp">${signatureBlock('#E51636')}</td></tr>
  </table>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0A0A0A;">
    <tr><td style="padding:24px 40px;text-align:center;" class="mp">
      <div style="color:rgba(255,255,255,0.35);font-size:11px;line-height:1.8;">
        ${INVOICE_STATION.communityLine}<br>
        ${INVOICE_STATION.org}
      </div>
    </td></tr>
  </table>`
  return emailShell(`Invoice ${ctx.ref} — ONE FM 98.5`, body)
}

function renderValley(ctx: RenderCtx): string {
  const body = `
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#2D4A3E;">
    <tr><td style="padding:32px 40px 28px 40px;" class="mp">
      <div style="color:rgba(255,255,255,0.55);font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:8px;">Partners in the Valley</div>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="vertical-align:middle;">
            <div style="color:#FFFFFF;font-size:28px;font-weight:700;letter-spacing:-0.5px;line-height:1.1;">ONE FM 98.5</div>
            <div style="color:#C4A265;font-size:12px;margin-top:6px;letter-spacing:1px;">${INVOICE_STATION.tagline}</div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <div style="color:rgba(255,255,255,0.5);font-size:11px;">${ctx.dateLine}</div>
            <div style="color:rgba(255,255,255,0.35);font-size:10px;margin-top:4px;">Invoice ${ctx.ref}</div>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:20px;background-color:rgba(255,255,255,0.08);border-radius:6px;">
        <tr><td style="padding:22px 26px;">
          <div style="color:rgba(255,255,255,0.55);font-size:9px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Amount due</div>
          <div class="amt" style="font-size:52px;font-weight:800;color:#C4A265;letter-spacing:-1px;line-height:1;">$${ctx.totalFmt}</div>
          <div style="margin-top:10px;color:rgba(255,255,255,0.55);font-size:12px;">Payment due ${ctx.data.dueDate}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <div style="height:2px;background:linear-gradient(90deg,#2D4A3E,#C4A265,#2D4A3E);font-size:0;line-height:0;">&nbsp;</div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F5F0E8;">
    <tr><td style="padding:36px 40px 0 40px;" class="mp">
      <div style="color:#2D4A3E;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Prepared for</div>
      <div style="color:#1A1A1A;font-size:16px;font-weight:700;">${ctx.name}</div>
      ${ctx.addressBlock}
    </td></tr>
    <tr><td style="padding:28px 40px 0 40px;" class="mp">
      <div style="color:#2D4A3E;font-size:17px;font-weight:600;">Dear ${ctx.name},</div>
    </td></tr>
    <tr><td style="padding:18px 40px 0 40px;" class="mp">
      <div style="background-color:#FFFCF7;border:1px solid rgba(196,162,101,0.35);border-radius:6px;padding:14px 18px;">
        <div style="color:#2D4A3E;font-size:14px;font-weight:600;">${ctx.campaignLabel}</div>
        <div style="color:#6B6B6B;font-size:12px;margin-top:4px;">Reference ${ctx.ref}</div>
      </div>
    </td></tr>
    <tr><td style="padding:24px 40px 0 40px;" class="mp">${ctx.messageHtml}</td></tr>
    <tr><td style="padding:28px 40px 0 40px;" class="mp">${bankSlipValley(ctx)}</td></tr>
    <tr><td style="padding:32px 40px 44px 40px;" class="mp">${signatureBlock('#C4A265')}</td></tr>
  </table>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#2D4A3E;">
    <tr><td style="padding:24px 40px;text-align:center;" class="mp">
      <div style="color:rgba(255,255,255,0.5);font-size:11px;line-height:1.9;">
        Licensed ${INVOICE_STATION.licensed} · Callsign ${INVOICE_STATION.callsign}<br>
        ${INVOICE_STATION.org} · ABN ${INVOICE_STATION.abn}
      </div>
    </td></tr>
  </table>`
  return emailShell(`Invoice ${ctx.ref} — ONE FM 98.5`, body)
}

export function generateVariantInvoiceEmailHtml(
  data: InvoiceEmailData,
  variantId: InvoiceDesignVariantId,
  bsb: string,
  account: string,
  accountName: string,
  defaultBody: string,
): string {
  const ctx = buildRenderCtx(data, { bsb, account, accountName }, defaultBody)
  switch (variantId) {
    case 'on-air':
      return renderOnAir(ctx)
    case 'valley':
      return renderValley(ctx)
    default:
      return renderBroadcast(ctx)
  }
}

export function getVariantPreviewLabel(id: InvoiceDesignVariantId): string {
  return getVariantMeta(id).name
}
