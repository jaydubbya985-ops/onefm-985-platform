import { BRAND } from './brand'

/** Email draft — Contact never read leftover ?subject= and cannot take attachments. */
export function livingArchiveMailto(): string {
  const subject = encodeURIComponent('Living Archive contribution')
  const body = encodeURIComponent(
    `Hi ONE FM,\n\nI have a Living Archive contribution (photo, program guide, clipping, or memory).\n\nPlease find details / attachments below.\n\nThank you.`,
  )
  return `mailto:${BRAND.email}?subject=${subject}&body=${body}`
}
