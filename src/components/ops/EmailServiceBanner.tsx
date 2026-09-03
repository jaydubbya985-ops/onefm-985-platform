import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react'
import { BRAND } from '@/lib/brand'
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

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-700/50 bg-amber-900/20 px-3 py-2 text-xs text-amber-400 mb-4">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>
          DNS for <code className="font-mono">fm985.com.au</code> already matches Resend — verification is
          pending. Invoice email is not live yet. Do not change SiteGround DNS. Do not click Verify
          again (that restarts pending). Wait until this banner turns green.
        </span>
      </div>
    )
  }

  if (status === 'unverified') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-700/50 bg-amber-900/20 px-3 py-2 text-xs text-amber-400 mb-4">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>
          Resend has a key, but the three <code className="font-mono">fm985.com.au</code> DNS
          records do not match — invoice email will not send from{' '}
          <code className="font-mono">{BRAND.accountsEmail}</code>.
          NEED JAY: SiteGround DNS — paste the expected TXT <code className="font-mono">resend._domainkey</code>,
          MX <code className="font-mono">send</code>, and TXT <code className="font-mono">send</code> values
          (Resend → Domains, or live <code className="font-mono">email-status</code>). Do not change the Outlook MX. Then click Verify.
        </span>
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
      <span>Email service status unknown — PDF + mailto fallback will be used. Expected in local `npm run dev` when the email-status function is missing or the body does not say whether Resend is configured.</span>
    </div>
  )
}
