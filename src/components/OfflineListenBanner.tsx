import { useEffect, useState } from 'react'
import { OFFLINE_LISTEN_COPY, subscribeOffline } from '@/lib/offlineListen'

/**
 * Shown only when the browser reports offline.
 * 98.5 stays on the dial — the Radio.co stream does not.
 */
export function OfflineListenBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => subscribeOffline(setOffline), [])

  if (!offline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-[4.75rem] inset-x-0 z-[250] px-3 sm:px-4 pointer-events-none"
    >
      <p className="mx-auto max-w-3xl rounded-xl border border-white/15 bg-[#0A0A0A]/95 px-4 py-3 text-[13px] leading-relaxed text-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        {OFFLINE_LISTEN_COPY}
      </p>
    </div>
  )
}
