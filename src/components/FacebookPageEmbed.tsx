import { FacebookPanel } from '@/components/social/FacebookPanel'

/** Legacy name — iframe embed removed in favour of branded FacebookPanel. */
export function FacebookPageEmbed({
  height: _height,
  compact,
  className,
}: {
  height?: number
  compact?: boolean
  className?: string
}) {
  return <FacebookPanel compact={compact} className={className} />
}
