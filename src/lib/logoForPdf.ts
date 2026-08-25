/**
 * Official ONE FM wordmark for invoice PDFs.
 * Source: public/brand/one-fm-logo-source.svg → public/brand/one-fm-logo-primary.png
 */
let cache: string | null = null

export const INVOICE_LOGO_PATH = '/brand/one-fm-logo-primary.png'
export const INVOICE_LOGO_SVG = '/brand/one-fm-logo-source.svg'
/** Pixel aspect of the cropped PNG (width / height). */
export const INVOICE_LOGO_ASPECT = 1200 / 555

export async function getInvoiceLogoDataUrl(): Promise<string> {
  if (cache) return cache
  const res = await fetch(INVOICE_LOGO_PATH)
  if (!res.ok) {
    throw new Error(`ONE FM invoice logo missing (${res.status})`)
  }
  const bytes = new Uint8Array(await res.arrayBuffer())
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  cache = `data:image/png;base64,${btoa(binary)}`
  return cache
}
