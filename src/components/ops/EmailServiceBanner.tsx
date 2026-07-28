import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react'
import { useEmailServiceStatus } from '@/hooks/useEmailServiceStatus'

/**
 * Persistent, honest status strip for the invoice send path.
 * Never fabricates "sent" — tells ops staff exactly what will happen
 * when they click Send, and what Jay needs to do to turn on live email.
 */
export function EmailServiceBanner() {
  const status = useEmailServiceStatus()

  if (status === 'checking') return null

  if (status === 'live') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-700/50 bg-emerald-900/20 px-3 py-2 text-xs text-emerald-400 mb-4">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>Live email is ON — sends go out via Resend with the invoice PDF attached.</span>
      </div>
    )
  }

  if (status === 'off') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-700/50 bg-amber-900/20 px-3 py-2 text-xs text-amber-400 mb-4">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>
          Live email is OFF — <code className="font-mono">RESEND_API_KEY</code> is not set on Netlify. Sends will
          download the PDF and open your email client instead. NEED JAY: add <code className="font-mono">RESEND_API_KEY</code> in
          Netlify → Site settings → Environment variables.
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#161616] px-3 py-2 text-xs text-[#F4F1EA]/50 mb-4">
      <HelpCircle className="w-3.5 h-3.5 shrink-0" />
      <span>Email service status unknown here (function unreachable — expected in local `npm run dev`). PDF + mailto fallback will be used.</span>
    </div>
  )
}
