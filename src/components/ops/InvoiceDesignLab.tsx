/**
 * Invoice Design Lab — preview three invoice skins.
 * Live send is locked to STATION_INVOICE_DESIGN_CHOICE (A · Broadcast Letter).
 * Previewing B / C does not change batch send. Do not invent a switch-before-send.
 */
import { useCallback, useMemo, useState } from 'react'
import { Check, Download, Mail, Palette, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  getInvoiceDesignPreviewVariant,
  getVariantMeta,
  INVOICE_DESIGN_VARIANTS,
  setInvoiceDesignPreviewVariant,
  STATION_INVOICE_DESIGN_CHOICE,
  type InvoiceDesignVariantId,
} from '@/lib/invoiceDesignVariants'
import { generateVariantInvoiceEmailHtml } from '@/lib/invoiceVariantEmail'
import { generateVariantInvoicePdf } from '@/lib/invoiceVariantPdf'
import {
  BANK_ACCOUNT,
  BANK_ACCOUNT_NAME,
  BANK_BSB,
  type InvoiceEmailData,
} from '@/components/ops/InvoiceEmailTemplate'
import { BATCH_INVOICES, DEFAULT_EMAIL_BODY } from '@/components/ops/data/invoices'
import { useOpsStore } from '@/components/ops/store'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

const SAMPLE = BATCH_INVOICES[0]

function toEmailData(): InvoiceEmailData {
  return {
    contactName: SAMPLE.contactName,
    company: SAMPLE.company,
    invoiceNumber: SAMPLE.number,
    amountExclGst: SAMPLE.amountExclGst,
    gst: SAMPLE.gst,
    total: SAMPLE.total,
    dueDate: new Date(SAMPLE.dueDate).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    customMessage: SAMPLE.emailBody,
    campaign: SAMPLE.description,
  }
}

function toPdfData() {
  return {
    number: SAMPLE.number,
    company: SAMPLE.company,
    contactName: SAMPLE.contactName,
    email: SAMPLE.email,
    description: SAMPLE.description,
    period: SAMPLE.period,
    amountExclGst: SAMPLE.amountExclGst,
    gst: SAMPLE.gst,
    total: SAMPLE.total,
    dueDate: SAMPLE.dueDate,
    issueDate: SAMPLE.createdAt,
  }
}

export default function InvoiceDesignLab() {
  const { invoiceDesignVariant } = useOpsStore()
  const [preview, setPreview] = useState<InvoiceDesignVariantId>(
    () => getInvoiceDesignPreviewVariant(),
  )
  const [previewScale, setPreviewScale] = useState<'fit' | 'full'>('fit')

  const emailData = useMemo(() => toEmailData(), [])

  const selectPreview = useCallback((id: InvoiceDesignVariantId) => {
    setPreview(id)
    setInvoiceDesignPreviewVariant(id)
  }, [])

  const activeHtml = useMemo(
    () =>
      generateVariantInvoiceEmailHtml(
        emailData,
        preview,
        BANK_BSB,
        BANK_ACCOUNT,
        BANK_ACCOUNT_NAME,
        DEFAULT_EMAIL_BODY,
      ),
    [emailData, preview],
  )

  const downloadPdf = async (id: InvoiceDesignVariantId) => {
    const pdf = await generateVariantInvoicePdf(toPdfData(), id)
    pdf.save(`${SAMPLE.number}-${id}.pdf`)
  }

  return (
    <div className="min-h-screen bg-[#101010] text-[#F4F1EA]">
      <div className="relative overflow-hidden border-b border-[#2A2A2A]">
        {/* Unused Tungamah silo-art birds — station archive, not a presenter portrait. */}
        <img
          src={STATION_PHOTOS.cultureSiloArtBirds}
          alt=""
          aria-hidden
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#101010]/78 via-[#101010]/88 to-[#101010]"
        />
        <div className="relative z-10 p-6 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E51636] to-[#B8860B] flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Invoice Design Lab</h1>
              <p className="text-sm text-[#F4F1EA]/50">
                Preview only · Sample: {SAMPLE.company} ({SAMPLE.number})
              </p>
            </div>
          </div>
          <p className="text-sm text-[#F4F1EA]/60 max-w-3xl mt-3">
            Live send is locked to{' '}
            <strong className="text-[#B8860B]">A · Broadcast Letter</strong> (navy &amp; gold) —
            email HTML and PDF attachments. Previewing B or C does not change what FOOTT is sent.
          </p>
          <p className="text-xs text-[#F4F1EA]/50 mt-2">
            Coverage: {formatCoverageShort()} (ABS 2021 via townData). Invoice payments: NAB BSB{' '}
            {BANK_BSB} · {BANK_ACCOUNT_NAME}. This lab is not a Stripe receipt.
          </p>
          <p className="text-xs text-[#F4F1EA]/40 mt-2">
            Batch send uses: {getVariantMeta(invoiceDesignVariant).name} — not this preview.
          </p>
        </div>
      </div>
      <div className="p-6 max-w-[1600px] mx-auto">

        {/* Option cards */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          {INVOICE_DESIGN_VARIANTS.map((v) => {
            const selected = preview === v.id
            const isStationChoice = v.id === STATION_INVOICE_DESIGN_CHOICE
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => selectPreview(v.id)}
                className={`text-left rounded-xl border-2 p-5 transition-all ${
                  selected
                    ? 'border-[#E51636] bg-[#1A1A1A] shadow-lg shadow-[#E51636]/10'
                    : 'border-[#2A2A2A] bg-[#141414] hover:border-[#444]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg">{v.name}</h2>
                      {isStationChoice && (
                        <Badge className="bg-[#B8860B] text-[#071D3A] border-0 text-[10px]">
                          <Check className="w-3 h-3 mr-1" /> Station choice
                        </Badge>
                      )}
                      {selected && !isStationChoice && (
                        <Badge className="bg-[#444] text-white border-0 text-[10px]">Preview</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#E51636] font-medium mt-0.5">{v.tagline}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {[v.palette.primary, v.palette.accent, v.palette.surface].map((c) => (
                      <span
                        key={c}
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#F4F1EA]/70 mb-3 leading-relaxed">{v.description}</p>
                <div className="space-y-1.5 text-xs text-[#F4F1EA]/45">
                  <p><Sparkles className="w-3 h-3 inline mr-1 text-[#B6FF00]" />{v.mood}</p>
                  <p><Mail className="w-3 h-3 inline mr-1" />Best for: {v.bestFor}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={selected ? 'default' : 'outline'}
                    className={selected ? 'bg-[#E51636] hover:bg-[#c4122f]' : 'border-[#444]'}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectPreview(v.id)
                    }}
                  >
                    {selected ? 'Previewing' : 'Preview'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-[#444] text-[#F4F1EA]"
                    onClick={(e) => {
                      e.stopPropagation()
                      void downloadPdf(v.id)
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" /> PDF
                  </Button>
                </div>
              </button>
            )
          })}
        </div>

        {/* Live preview */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#2A2A2A] bg-[#141414]">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#F4F1EA]/40">
                {preview === STATION_INVOICE_DESIGN_CHOICE ? 'Station send preview' : 'Preview only — not sent'}
              </span>
              <span className="ml-2 font-semibold text-[#E51636]">
                {INVOICE_DESIGN_VARIANTS.find((v) => v.id === preview)?.name}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewScale('fit')}
                className={`text-xs px-3 py-1 rounded ${previewScale === 'fit' ? 'bg-[#E51636] text-white' : 'text-[#F4F1EA]/50'}`}
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => setPreviewScale('full')}
                className={`text-xs px-3 py-1 rounded ${previewScale === 'full' ? 'bg-[#E51636] text-white' : 'text-[#F4F1EA]/50'}`}
              >
                100%
              </button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#444] text-xs"
                onClick={() => void downloadPdf(preview)}
              >
                <Download className="w-3 h-3 mr-1" /> Download PDF
              </Button>
            </div>
          </div>
          <div className="p-4 overflow-auto max-h-[70vh] bg-[#888]">
            <div
              className="mx-auto bg-white shadow-2xl origin-top transition-transform"
              style={{
                width: 600,
                transform: previewScale === 'fit' ? 'scale(0.85)' : 'scale(1)',
                transformOrigin: 'top center',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: activeHtml }} />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-[#F4F1EA]/35 text-center">
          Batch Send emails and PDF attachments stay on A · Broadcast Letter. This desk cannot unlock B or C.
        </p>
      </div>
    </div>
  )
}
