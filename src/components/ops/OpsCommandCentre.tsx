import {
  AlertTriangle,
  Banknote,
  BookOpen,
  Clock,
  FileWarning,
  Landmark,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useMemo } from 'react'
import {
  AUGUST_BATCH_INVOICES,
  BATCH_INVOICES,
  RENEWALS_DUE,
  RENEWAL_PROPOSALS,
  batchTotals,
} from '@/components/ops/data/invoices'
import { CBF_NEED_JAY, CBF_PROGRAMS } from '@/components/ops/data/cbfGrants'
import {
  billedCollectTotal,
  COLLECT_LADDER,
  nextCollectStep,
} from '@/components/ops/data/collectQueue'
import { useOpsStore } from '@/components/ops/store'
import { ageInvoice } from '@/lib/invoiceAging'
import {
  JUNE_BATCH_CREATED,
  JUNE_BATCH_DUE,
  calendarDaysBetween,
  formatAuDate,
  formatElapsed,
  todayISO,
} from '@/lib/opsClock'
import { Button } from '@/components/ui/button'

function aud(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
}

export function OpsCommandCentre() {
  const { invoices, setActiveTab } = useOpsStore()
  const today = todayISO()
  const daysSinceJune = calendarDaysBetween(JUNE_BATCH_CREATED, today)
  const daysPastJuneDue = calendarDaysBetween(JUNE_BATCH_DUE, today)

  const sentNumbers = useMemo(() => {
    return new Set(
      invoices
        .filter((invoice) => invoice.status === 'sent' || invoice.status === 'paid')
        .map((invoice) => invoice.number),
    )
  }, [invoices])

  const next = nextCollectStep({ paperDone: true, sentNumbers })
  const billedTotal = billedCollectTotal()
  const openCbf = CBF_PROGRAMS.filter((program) => program.status === 'open')

  const june = useMemo(() => {
    const rows = invoices.filter(
      (i) => i.batchId === 'june-2026' || (!i.batchId && BATCH_INVOICES.some((b) => b.id === i.id)),
    )
    const unsent = rows.filter((i) => i.status !== 'sent' && i.status !== 'paid')
    const stale = unsent.filter(
      (i) => ageInvoice({ status: i.status, dueDate: i.dueDate }, today) === 'unsent_stale',
    )
    return {
      count: rows.length,
      unsent: unsent.length,
      stale: stale.length,
      total: unsent.reduce((s, i) => s + i.total, 0),
    }
  }, [invoices, today])

  const august = useMemo(() => {
    const rows = invoices.filter((i) => i.batchId === 'aug-2026')
    const seed = rows.length ? rows : AUGUST_BATCH_INVOICES
    const totals = rows.length
      ? { count: rows.length, total: rows.reduce((s, i) => s + i.total, 0) }
      : { count: seed.length, total: batchTotals(AUGUST_BATCH_INVOICES).total }
    return totals
  }, [invoices])

  return (
    <section className="mb-6 rounded-xl border border-[#D4A84B]/30 bg-[#16120A] p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4A84B] font-semibold">
            Command centre
          </p>
          <h2 className="text-lg md:text-xl font-bold text-[#F4F1EA] mt-0.5">
            Today is {formatAuDate(today)}. Last batch was {formatElapsed(daysSinceJune)}.
          </h2>
          <p className="text-sm text-[#F4F1EA]/60 mt-1 max-w-3xl">
            The 9 June 2026 batch was accurate on that day. It has not been sent. Original due date
            was {formatAuDate(JUNE_BATCH_DUE)} — {daysPastJuneDue} days ago. Those invoices are stale
            drafts, not customer-overdue AR, until they actually go out.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            onClick={() => setActiveTab('batch')}
            className="bg-[#D4A84B] text-[#101010] hover:bg-[#C49A3B] font-semibold"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Open batch send
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab('proposals')}
            className="border-[#D4A84B]/40 text-[#D4A84B] hover:bg-[#D4A84B]/10"
          >
            {RENEWAL_PROPOSALS.length} renewal drafts
          </Button>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-[#1B458F] bg-[#0B1220] px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#7EB6FF] font-semibold flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5" />
          Next dollar — one at a time
        </p>
        <p className="text-base font-semibold text-[#F4F1EA] mt-1">
          {next.title}
          {next.amountIncGst != null ? ` · ${aud(next.amountIncGst)}` : ''}
        </p>
        <p className="text-sm text-[#F4F1EA]/70 mt-1 leading-relaxed">{next.detail}</p>
        {next.invoiceNumber ? (
          <p className="text-xs font-mono text-[#D4A84B] mt-1">{next.invoiceNumber}</p>
        ) : null}
        {next.blocker ? <p className="text-xs text-amber-400 mt-2">{next.blocker}</p> : null}
        <p className="text-[11px] text-[#F4F1EA]/45 mt-2">
          Send-guide total on this ladder: {aud(billedTotal)} inc GST ·{' '}
          {COLLECT_LADDER.filter((s) => s.amountIncGst).length} invoices · CBF $ is Data pending
        </p>
      </div>

      <div className="mb-4 rounded-lg border border-[#D4A84B]/25 bg-[#101010] px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-[#D4A84B] font-semibold flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Xero is the books
        </p>
        <p className="text-xs text-[#F4F1EA]/70 mt-1 leading-relaxed">
          Jay has Xero open. This last ops batch is a <span className="text-[#F4F1EA]">send guide
          only</span> — not live AR. A couple of payments have come in and will come off later.
          Do not mark invoices paid here until Jay allocates them in Xero.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-amber-700/40 bg-amber-950/30 p-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            June batch
          </div>
          <p className="text-2xl font-bold text-[#F4F1EA] mt-1 tabular-nums">{daysSinceJune}d</p>
          <p className="text-xs text-[#F4F1EA]/50 mt-1">
            {june.unsent} of {june.count} still unsent · {aud(june.total)}
          </p>
        </div>
        <div className="rounded-lg border border-red-800/40 bg-red-950/20 p-3">
          <div className="flex items-center gap-2 text-red-400 text-xs uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            Stale unsent
          </div>
          <p className="text-2xl font-bold text-[#F4F1EA] mt-1 tabular-nums">{june.stale}</p>
          <p className="text-xs text-[#F4F1EA]/50 mt-1">
            Due date passed · never emailed to sponsors
          </p>
        </div>
        <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 p-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-wider">
            <FileWarning className="w-3.5 h-3.5" />
            August catch-up
          </div>
          <p className="text-2xl font-bold text-[#F4F1EA] mt-1 tabular-nums">{august.count}</p>
          <p className="text-xs text-[#F4F1EA]/50 mt-1">
            {aud(august.total)} · Peppermill Jul–Aug + Aussie Ag Jul + Aug
          </p>
        </div>
        <div className="rounded-lg border border-[#2A2A2A] bg-[#101010] p-3">
          <div className="flex items-center gap-2 text-[#D4A84B] text-xs uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Do not re-bill
          </div>
          <p className="text-sm font-semibold text-[#F4F1EA] mt-2 leading-snug">
            FOOTT ONEFM-2026-011 already covers Jun–Nov 2026.
          </p>
          <p className="text-xs text-[#F4F1EA]/50 mt-1">
            {RENEWALS_DUE.length} ended contracts wait for Jay before a new invoice.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[#2A2A2A] bg-[#101010]/80 px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-[#7EB6FF] font-semibold flex items-center gap-1.5 mb-2">
          <Landmark className="w-3.5 h-3.5" />
          CBF grants — every possible dollar, no invented figures
        </p>
        <ul className="space-y-1.5">
          {CBF_PROGRAMS.map((program) => (
            <li key={program.id} className="text-xs text-[#F4F1EA]/75 leading-relaxed">
              <span
                className={
                  program.status === 'open' ? 'text-emerald-400 font-semibold' : 'text-[#F4F1EA]/40'
                }
              >
                {program.status === 'open' ? 'OPEN' : 'CLOSED'}
              </span>
              {' · '}
              <span className="text-[#F4F1EA]">{program.name}</span>
              {' · '}
              {program.closesNote}
              {' · '}
              <span className="text-amber-300/80">Data pending</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-amber-400/90 mt-2">{CBF_NEED_JAY}</p>
        <p className="text-[11px] text-[#F4F1EA]/40 mt-1">
          {openCbf.length} round{openCbf.length === 1 ? '' : 's'} still open. Vision Australia rental
          is blocked until the last Xero invoice is pasted.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-[#2A2A2A] bg-[#101010]/80 px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-[#F4F1EA]/40 mb-1">
          Renewals to confirm — not invoiced
        </p>
        <p className="text-xs text-[#F4F1EA]/70 leading-relaxed">
          {RENEWALS_DUE.map((r) => r.company).join(' · ')}
        </p>
        <p className="text-[10px] text-[#F4F1EA]/40 mt-1">
          Peppermill September (final month of the 6-month GVL Major) is not invoiced
          yet — that month has not elapsed. FOOTT Jun–Nov is already on ONEFM-2026-011.
        </p>
      </div>
    </section>
  )
}
