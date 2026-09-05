/**
 * On-screen sponsorship proposal — same language as the PDF kit.
 * Real brand lockup. Sourced stats only (ABS 2021 via townData).
 */
import { BrandLogo } from '@/components/BrandLogo'
import { BRAND } from '@/lib/brand'
import { formatCoverageShort, formatRadius, townCountValue, weeklyListenersValue } from '@/lib/coverageCopy'
import { DS } from '@/lib/invoiceDesignSystem'
import { formatAud, type ProposalDocData } from '@/lib/proposalDocument'

export function OpsProposalSheet({ data }: { data: ProposalDocData }) {
  return (
    <div className="relative bg-white text-[#1A1A1A] overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-[3.2px] bg-[#E51636]" />
      <div className="pl-6 pr-6 pt-5 pb-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#E51636] pb-4">
          <BrandLogo variant="primary" className="h-14 w-auto object-contain" />
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E51636]">
              Sponsorship proposal
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-one-navy">{data.number}</p>
            <p className="text-xs text-[#6B6B6B]">{DS.station.name}</p>
          </div>
        </div>

        <p className="mt-5 text-4xl font-bold leading-none text-[#E51636]">
          {formatAud(data.money.total)}
        </p>
        <p className="mt-2 text-sm text-[#6B6B6B]">
          AUD incl. GST of {formatAud(data.money.gst)} · {data.term}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E51636]">
              Prepared for
            </p>
            <p className="mt-1 font-semibold text-one-navy">{data.clientName}</p>
            <p className="text-[#6B6B6B]">{data.company}</p>
            {data.email && <p className="text-[#6B6B6B]">{data.email}</p>}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E51636]">From</p>
            <p className="mt-1 font-semibold text-one-navy">{DS.station.name}</p>
            <p className="text-[#6B6B6B]">{DS.station.address}</p>
            <p className="text-[#6B6B6B]">
              {DS.station.phone} · {BRAND.email}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 rounded-md bg-[#F8F8FA] px-4 py-3 text-sm">
          <div>
            <p className="text-lg font-bold text-one-navy">
              {weeklyListenersValue()}
            </p>
            <p className="text-[11px] text-[#6B6B6B]">est. weekly listeners</p>
          </div>
          <div>
            <p className="text-lg font-bold text-one-navy">{townCountValue()}</p>
            <p className="text-[11px] text-[#6B6B6B]">towns</p>
          </div>
          <div>
            <p className="text-lg font-bold text-one-navy">{formatRadius()}</p>
            <p className="text-[11px] text-[#6B6B6B]">radius</p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-[#6B6B6B]">
          Source: ABS 2021 via townData — {formatCoverageShort()}, not national stream totals
        </p>

        <div className="mt-5">
          <p className="font-semibold text-one-navy">{data.packageName}</p>
          <p className="text-xs text-[#6B6B6B]">{data.tier} package</p>
        </div>

        <div className="mt-4 space-y-2">
          {data.deliverables.map((line) => (
            <div key={line.name} className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm">
              <span>{line.name}</span>
              <span className="shrink-0 text-[#6B6B6B]">{line.detail}</span>
            </div>
          ))}
        </div>

        {data.notes && <p className="mt-4 text-sm text-[#6B6B6B]">{data.notes}</p>}

        <div className="mt-5 flex items-center justify-between rounded-md bg-one-navy px-4 py-3">
          <span className="text-sm text-white">
            {data.weeklyPrice ? `${formatAud(data.weeklyPrice)} / wk` : 'Total incl. GST'}
          </span>
          <span className="text-2xl font-bold text-[#E51636]">{formatAud(data.money.total)}</span>
        </div>
        <p className="mt-2 text-xs text-[#6B6B6B]">
          Ex GST {formatAud(data.money.exGst)} + GST {formatAud(data.money.gst)} · valid until{' '}
          {data.validUntil} · this is a proposal, not a tax invoice
        </p>
      </div>
    </div>
  )
}
