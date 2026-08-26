import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Mail,
  Plus,
  RotateCcw,
  Send,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { PROPOSAL_PACKAGES } from './data/sponsors'
import { formatDate } from './data/enquiries'
import { useOpsStore, type Proposal, type ProposalStatus } from './store'
import { useToast } from './Toast'
import { generateContractPdf } from '@/lib/contractDocument'
import { OpsProposalSheet } from '@/components/ops/OpsProposalSheet'
import {
  addDaysIso,
  buildMailtoProposalUrl,
  buildProposalDoc,
  computePackageValue,
  DURATION_OPTIONS,
  formatAud,
  generateProposalPdf,
  gstOn,
  nextProposalNumber,
  proposalEmailBody,
  proposalEmailSubject,
  type ProposalDocData,
} from '@/lib/proposalDocument'

const PROPOSAL_STATUS_STYLES: Record<ProposalStatus, string> = {
  draft: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  sent: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  accepted: 'bg-green-500/15 text-green-300 border-green-500/30',
  rejected: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

const CATEGORY_LABEL: Record<string, string> = {
  partnership: 'Partnership',
  football: 'Football season',
  program: 'Program',
}

function ProposalPreviewSheet({ data }: { data: ProposalDocData }) {
  return (
    <div className="rounded-lg overflow-hidden shadow-xl">
      <OpsProposalSheet data={data} />
    </div>
  )
}

function extrasFromProposal(p: Proposal): Record<string, boolean> {
  const extras: Record<string, boolean> = {}
  const pkg = PROPOSAL_PACKAGES.find((x) => x.id === p.packageId)
  if (!pkg || !p.deliverables) return extras
  for (const d of pkg.deliverables) {
    if (!d.included && p.deliverables.some((x) => x.id === d.id)) extras[d.id] = true
  }
  return extras
}

export default function ProposalBuilder() {
  const {
    proposals,
    addProposal,
    updateProposal,
    sendProposal,
    acceptProposal,
    declineProposal,
    focusProposalId,
    setFocusProposalId,
  } = useOpsStore()
  const { toast } = useToast()

  const [selectedId, setSelectedId] = useState(PROPOSAL_PACKAGES[0].id)
  const [clientName, setClientName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(13)
  const [notes, setNotes] = useState('')
  const [extras, setExtras] = useState<Record<string, boolean>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const pkg = PROPOSAL_PACKAGES.find((p) => p.id === selectedId) ?? PROPOSAL_PACKAGES[0]
  const money = useMemo(
    () => computePackageValue(pkg, durationWeeks, extras),
    [pkg, durationWeeks, extras],
  )

  const focused = proposals.find((p) => p.id === focusProposalId) ?? null

  useEffect(() => {
    if (!focused) return
    setClientName(focused.clientName)
    setCompany(focused.company ?? '')
    setEmail(focused.email ?? '')
    setNotes(focused.notes ?? '')
    setDurationWeeks(focused.durationWeeks ?? 13)
    if (focused.packageId) setSelectedId(focused.packageId)
    setExtras(extrasFromProposal(focused))
  }, [focused])

  const draft = buildProposalDoc({
    number: focused?.number ?? 'PROP-DRAFT',
    clientName: clientName.trim() || 'Client',
    company: company.trim() || undefined,
    email: email.trim() || undefined,
    notes,
    pkg,
    durationWeeks,
    extras,
    validUntil: focused?.validUntil ?? addDaysIso(30),
  })

  const resetForm = () => {
    setFocusProposalId(null)
    setClientName('')
    setCompany('')
    setEmail('')
    setNotes('')
    setExtras({})
    setDurationWeeks(13)
    setSelectedId(PROPOSAL_PACKAGES[0].id)
  }

  const persist = (): { id: string; doc: ProposalDocData } | null => {
    if (!clientName.trim()) {
      toast('Client name required', 'warning')
      return null
    }
    const number =
      focused?.number ?? nextProposalNumber(proposals.map((p) => p.number))
    const doc = buildProposalDoc({
      number,
      clientName: clientName.trim(),
      company: company.trim() || undefined,
      email: email.trim() || undefined,
      notes,
      pkg,
      durationWeeks,
      extras,
      validUntil: focused?.validUntil ?? addDaysIso(30),
    })
    const payload = {
      clientName: clientName.trim(),
      company: company.trim() || clientName.trim(),
      email: email.trim() || undefined,
      packageId: pkg.id,
      packageName: pkg.name,
      tier: pkg.tier,
      durationWeeks,
      notes: notes.trim() || undefined,
      validUntil: doc.validUntil,
      deliverables: pkg.deliverables
        .filter((d) => d.included || extras[d.id])
        .map((d) => ({ id: d.id, name: d.name })),
      value: money.exGst,
      gst: money.gst,
      total: money.total,
      number,
    }
    if (focused) {
      updateProposal(focused.id, payload)
      return { id: focused.id, doc }
    }
    const id = addProposal(payload)
    setFocusProposalId(id)
    return { id, doc }
  }

  const docFromSaved = (p: Proposal): ProposalDocData => {
    const found = PROPOSAL_PACKAGES.find((x) => x.id === p.packageId)
    if (found) {
      return buildProposalDoc({
        number: p.number ?? p.id,
        clientName: p.clientName,
        company: p.company,
        email: p.email,
        notes: p.notes,
        pkg: found,
        durationWeeks: p.durationWeeks ?? 13,
        extras: extrasFromProposal(p),
        validUntil: p.validUntil,
      })
    }
    const moneySaved =
      p.gst != null && p.total != null
        ? { exGst: p.value, gst: p.gst, total: p.total }
        : gstOn(p.value)
    return {
      number: p.number ?? p.id,
      clientName: p.clientName,
      company: p.company ?? p.clientName,
      email: p.email,
      packageName: p.packageName ?? 'Custom package',
      tier: p.tier ?? 'Custom',
      term: p.durationWeeks ? `${p.durationWeeks} weeks` : 'To be confirmed',
      notes: p.notes,
      validUntil: p.validUntil ?? addDaysIso(30),
      preparedOn: new Date().toISOString().split('T')[0],
      deliverables: (p.deliverables ?? []).map((d) => ({
        name: d.name,
        detail: 'Included',
      })),
      money: moneySaved,
    }
  }

  const downloadDoc = async (doc: ProposalDocData) => {
    const pdf = await generateProposalPdf(doc)
    pdf.save(`${doc.number}.pdf`)
  }

  const handleSave = () => {
    const saved = persist()
    if (saved) toast(`Draft ${saved.doc.number} saved`, 'success')
  }

  const handlePdf = async (markSent = false) => {
    const saved = persist()
    if (!saved) return
    setBusy(true)
    try {
      await downloadDoc(saved.doc)
      if (markSent) {
        sendProposal(saved.id)
        toast(`PDF downloaded — marked sent to ${saved.doc.company}`, 'success')
      } else {
        toast(`Downloaded ${saved.doc.number}.pdf`, 'success')
      }
    } catch (err) {
      console.error(err)
      toast('PDF failed — try again', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleEmail = async () => {
    if (!email.trim()) {
      toast('Add an email so we can open a message', 'warning')
      return
    }
    const saved = persist()
    if (!saved) return
    try {
      await navigator.clipboard.writeText(proposalEmailBody(saved.doc))
    } catch {
      // clipboard optional
    }
    setBusy(true)
    try {
      await downloadDoc(saved.doc)
    } catch {
      // still open mailto
    } finally {
      setBusy(false)
    }
    window.location.assign(buildMailtoProposalUrl(saved.doc))
    sendProposal(saved.id)
    toast('PDF downloaded. Attach it in the email that just opened.', 'success')
  }

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(
        `${proposalEmailSubject(draft)}\n\n${proposalEmailBody(draft)}`,
      )
      toast('Email copy on clipboard', 'success')
    } catch {
      toast('Could not copy', 'warning')
    }
  }

  const loadProposal = (p: Proposal) => {
    setFocusProposalId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-one-gold" />
          <div>
            <h2 className="text-xl font-bold text-one-white">Proposal Builder</h2>
            <p className="text-sm text-one-muted">
              Pick a package, save a draft, download a PDF you can send tonight.
            </p>
          </div>
        </div>
        {focused && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetForm}
            className="border-one-border text-one-white/70"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            New proposal
          </Button>
        )}
      </div>

      {focused && (
        <div className="rounded-lg border border-one-gold/30 bg-one-gold/8 px-4 py-3 text-sm text-one-gold">
          Editing {focused.number ?? focused.id} — {focused.company ?? focused.clientName} ({focused.status})
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs uppercase tracking-wider text-one-muted">1. Package</p>
          {PROPOSAL_PACKAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedId(p.id)
                setExtras({})
              }}
              className={cn(
                'w-full text-left rounded-xl border p-4 transition-colors min-h-[72px]',
                selectedId === p.id
                  ? 'border-one-gold bg-one-gold/10'
                  : 'border-one-border hover:border-one-gold/30',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-one-white">{p.name}</span>
                <Badge variant="outline">{p.tier}</Badge>
              </div>
              <p className="text-xs text-one-muted mt-1">{p.description}</p>
              <p className="text-sm text-one-gold mt-2">
                {p.weeklyPrice
                  ? `${formatAud(p.weeklyPrice)} / week`
                  : `${formatAud(p.basePrice)} season`}
                <span className="text-one-muted text-xs ml-2">{CATEGORY_LABEL[p.category]}</span>
              </p>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3 bg-[#0D1E36]/60 border-one-border">
          <CardHeader>
            <CardTitle className="text-one-white text-base">2. Who it is for</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-one-muted">Contact name</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Who we are talking to"
                  className="mt-1 bg-one-navy border-one-border min-h-11"
                />
              </div>
              <div>
                <Label className="text-one-muted">Company</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Business name"
                  className="mt-1 bg-one-navy border-one-border min-h-11"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-one-muted">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="to send the proposal"
                  className="mt-1 bg-one-navy border-one-border min-h-11"
                />
              </div>
              <div>
                <Label className="text-one-muted">Term</Label>
                <Select
                  value={String(durationWeeks)}
                  onValueChange={(v) => setDurationWeeks(Number(v))}
                >
                  <SelectTrigger className="mt-1 bg-one-navy border-one-border min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((o) => (
                      <SelectItem key={o.weeks} value={String(o.weeks)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-one-muted">Deliverables</p>
              {pkg.deliverables.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-one-border p-3 min-h-[56px]"
                >
                  <div className="flex items-center gap-3">
                    {d.included ? (
                      <Badge className="bg-green-500/20 text-green-300">Included</Badge>
                    ) : (
                      <Checkbox
                        checked={!!extras[d.id]}
                        onCheckedChange={(c) =>
                          setExtras((prev) => ({ ...prev, [d.id]: !!c }))
                        }
                      />
                    )}
                    <div>
                      <p className="text-sm text-one-white">{d.name}</p>
                      <p className="text-xs text-one-muted">
                        {d.unitPrice ? `${formatAud(d.unitPrice)} ${d.unit}` : d.unit}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Label className="text-one-muted">Notes (printed on the PDF)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Breakfast spots preferred · start 7 Sep"
                className="mt-1 bg-one-navy border-one-border min-h-20"
              />
            </div>

            <div className="flex items-end justify-between gap-4 pt-4 border-t border-one-border flex-wrap">
              <div>
                <p className="text-xs text-one-muted">Investment incl. GST</p>
                <p className="text-2xl font-bold text-one-gold">{formatAud(money.total)}</p>
                <p className="text-xs text-one-muted">
                  {formatAud(money.exGst)} ex GST + {formatAud(money.gst)} GST
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  className="border-one-border min-h-11"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Save draft
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  className="border-one-border min-h-11"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={() => void handlePdf(false)}
                  disabled={busy}
                  className="bg-one-gold text-one-navy hover:bg-one-gold/90 min-h-11"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => void handleEmail()}
                disabled={busy}
                className="border-one-gold/40 text-one-gold min-h-11"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email (PDF + mailto)
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleCopyEmail()}
                className="border-one-border min-h-11"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy email text
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden xl:block">
        <p className="text-xs uppercase tracking-wider text-one-muted mb-3">Live preview</p>
        <div className="max-w-xl">
          <ProposalPreviewSheet data={draft} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-one-muted">
          Saved proposals ({proposals.length})
        </h3>
        {proposals.length === 0 && (
          <p className="text-sm text-one-muted py-6 text-center border border-one-border rounded-xl">
            No proposals yet — build one above or create one from an enquiry.
          </p>
        )}
        <div className="space-y-2">
          {proposals.map((p) => (
            <div
              key={p.id}
              className={cn(
                'rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3',
                focusProposalId === p.id ? 'border-one-gold/50 bg-one-gold/5' : 'border-one-border',
              )}
            >
              <button type="button" onClick={() => loadProposal(p)} className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-one-white">
                    {p.company ?? p.clientName}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] capitalize', PROPOSAL_STATUS_STYLES[p.status])}
                  >
                    {p.status}
                  </Badge>
                </div>
                <p className="text-xs text-one-muted mt-0.5">
                  {p.number ?? '—'} · {p.packageName ?? 'No package yet'} ·{' '}
                  {formatAud(p.total ?? p.value)} · {formatDate(p.updatedAt)}
                </p>
              </button>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 text-xs border-one-border"
                  onClick={() => loadProposal(p)}
                >
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 text-xs border-one-border"
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      setBusy(true)
                      try {
                        await downloadDoc(docFromSaved(p))
                        toast(`Downloaded ${(p.number ?? p.id)}.pdf`, 'success')
                      } catch (err) {
                        console.error(err)
                        toast('PDF failed — try again', 'error')
                      } finally {
                        setBusy(false)
                      }
                    })()
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                {p.status === 'draft' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3 text-xs border-one-border"
                    disabled={busy}
                    onClick={() => {
                      void (async () => {
                        setBusy(true)
                        try {
                          const doc = docFromSaved(p)
                          await downloadDoc(doc)
                          sendProposal(p.id)
                          toast(`PDF downloaded — marked sent to ${doc.company}`, 'success')
                        } catch (err) {
                          console.error(err)
                          toast('PDF failed — try again', 'error')
                        } finally {
                          setBusy(false)
                        }
                      })()
                    }}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send
                  </Button>
                )}
                {(p.status === 'draft' || p.status === 'sent') && (
                  <>
                    <Button
                      size="sm"
                      className="h-9 px-3 text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
                      onClick={() => {
                        void (async () => {
                          const contract = acceptProposal(p.id)
                          if (!contract) return
                          try {
                            const pdf = await generateContractPdf(contract)
                            pdf.save(`${contract.contractNumber}.pdf`)
                            toast(
                              `Accepted — ${contract.contractNumber}.pdf downloaded`,
                              'success',
                            )
                          } catch (err) {
                            console.error(err)
                            toast(
                              'Contract created — download the PDF from Contracts',
                              'warning',
                            )
                          }
                        })()
                      }}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3 text-xs border-one-border text-one-muted hover:text-red-300"
                      onClick={() => {
                        declineProposal(p.id)
                        toast('Proposal declined', 'info')
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#101010] border-one-border">
          <DialogHeader>
            <DialogTitle className="text-one-white">Proposal preview</DialogTitle>
          </DialogHeader>
          <ProposalPreviewSheet data={draft} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
