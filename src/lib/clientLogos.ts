/**
 * Client logos for sponsorship proposals.
 *
 * Rule: only a real file the operator drops, or a path already on disk.
 * Never generate, never Unsplash, never a made-up wordmark.
 */

export const CLIENT_LOGO_MAX_BYTES = 400_000
export const CLIENT_LOGO_ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml'

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])

export interface ClientLogo {
  dataUrl: string
  fileName: string
  mime: string
  width: number
  height: number
}

export function assertClientLogoFile(file: Pick<File, 'type' | 'size'>): void {
  if (!ALLOWED.has(file.type)) {
    throw new Error('Use a PNG, JPG, WebP or SVG of the real client logo.')
  }
  if (file.size > CLIENT_LOGO_MAX_BYTES) {
    throw new Error('Logo must be under 400 KB. Export a tight PNG or JPG from Canva/InDesign.')
  }
}

/** jsPDF embeds JPEG/PNG. SVG and WebP stay on-screen only. */
export function pdfImageFormat(dataUrl: string): 'JPEG' | 'PNG' | null {
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG'
  if (dataUrl.startsWith('data:image/png')) return 'PNG'
  return null
}

function measureDataUrl(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve({ width: 400, height: 200 })
      return
    }
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth || 400, height: img.naturalHeight || 200 })
    img.onerror = () => resolve({ width: 400, height: 200 })
    img.src = dataUrl
  })
}

export async function readClientLogoFile(file: File): Promise<ClientLogo> {
  assertClientLogoFile(file)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read that file'))
    }
    reader.onerror = () => reject(new Error('Could not read that file'))
    reader.readAsDataURL(file)
  })
  const { width, height } = await measureDataUrl(dataUrl)
  return { dataUrl, fileName: file.name, mime: file.type, width, height }
}
