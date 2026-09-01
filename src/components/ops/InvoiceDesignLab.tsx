/**
 * Invoice Design Lab — compare 3 world-class invoice options side-by-side.
 * Pick one for the June batch; persists to localStorage + ops store.
 */
import { useCallback, useMemo, useState } from 'react'
import { Check, Download, Mail, Palette, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DEFAULT_INVOICE_DESIGN,
  getInvoiceDesignVariant,
  INVOICE_DESIGN_VARIANTS,
  setInvoiceDesignVariant,
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
  const { invoiceDesignVariant, setInvoiceDesignVariant: setStoreVariant } = useOpsStore()
  const [active, setActive] = useState<InvoiceDesignVariantId>(
    invoiceDesignVariant ?? getInvoiceDesignVariant() ?? DEFAULT_INVOICE_DESIGN,
  )
  const [previewScale, setPreviewScale] = useState<'fit' | 'full'>('fit')

  const emailData = useMemo(() => toEmailData(), [])

  const selectVariant = useCallback(
    (id: InvoiceDesignVariantId) => {
      setActive(id)
      setInvoiceDesignVariant(id)
      setStoreVariant(id)
    },
    [setStoreVariant],
  )

  const activeHtml = useMemo(
    () =>
      generateVariantInvoiceEmailHtml(
        emailData,
        active,
        BANK_BSB,
        BANK_ACCOUNT,
        BANK_ACCOUNT_NAME,
        DEFAULT_EMAIL_BODY,
      ),
    [emailData, active],
  )

  const downloadPdf = async (id: InvoiceDesignVariantId) => {
    const pdf = await generateVariantInvoicePdf(toPdfData(), id)
    pdf.save(`${SAMPLE.number}-${id}.pdf`)
  }

  return (
    <div className="min-h-screen bg-[#101010] text-[#F4F1EA] p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E51636] to-[#B8860B] flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Invoice Design Lab</h1>
              <p className="text-sm text-[#F4F1EA]/50">
                Three world-class options · Sample: {SAMPLE.company} ({SAMPLE.number})
              </p>
            </div>
          </div>
          <p className="text-sm text-[#F4F1EA]/60 max-w-3xl mt-3">
            Pick the design language for the June 2026 batch. Your choice applies to email HTML and PDF attachments
            across Batch Send. All three use real bank details and Vice Chair signature.
          </p>
        </div>

        {/* Option cards */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          {INVOICE_DESIGN_VARIANTS.map((v) => {
            const selected = active === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => selectVariant(v.id)}
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
                      {selected && (
                        <Badge className="bg-[#E51636] text-white border-0 text-[10px]">
                          <Check className="w-3 h-3 mr-1" /> Active
                        </Badge>
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
                      selectVariant(v.id)
                    }}
                  >
                    {selected ? 'Selected' : 'Select'}
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
              <span className="text-xs uppercase tracking-wider text-[#F4F1EA]/40">Live preview</span>
              <span className="ml-2 font-semibold text-[#E51636]">
                {INVOICE_DESIGN_VARIANTS.find((v) => v.id === active)?.name}
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
                onClick={() => void downloadPdf(active)}
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
          Design applies to Batch Send emails + PDF attachments. Switch anytime before live send.
        </p>
      </div>
    </div>
  )
}
