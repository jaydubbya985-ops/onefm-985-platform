import { useMemo, useState } from 'react'
import { Check, FileText, Plus, Send, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { PROPOSAL_PACKAGES } from './data/sponsors'
import { formatDate } from './data/enquiries'
import { useOpsStore, type ProposalStatus } from './store'
import { useToast } from './Toast'

const PROPOSAL_STATUS_STYLES: Record<ProposalStatus, string> = {
  draft: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  sent: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  accepted: 'bg-green-500/15 text-green-300 border-green-500/30',
  rejected: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

export default function ProposalBuilder() {
  const { proposals, addProposal, sendProposal, acceptProposal, declineProposal } = useOpsStore()
  const { toast } = useToast()
  const [selectedId, setSelectedId] = useState(PROPOSAL_PACKAGES[0].id)
  const [clientName, setClientName] = useState('')
  const [extras, setExtras] = useState<Record<string, boolean>>({})

  const pkg = PROPOSAL_PACKAGES.find((p) => p.id === selectedId) ?? PROPOSAL_PACKAGES[0]

  const total = useMemo(() => {
    let sum = pkg.basePrice
    for (const d of pkg.deliverables) {
      if (extras[d.id] && !d.included) {
        sum += d.unitPrice * Math.max(d.qty, 1)
      }
    }
    return sum
  }, [pkg, extras])

  const saveProposal = () => {
    if (!clientName.trim()) {
      toast('Client name required', 'warning')
      return
    }
    addProposal({
      clientName: clientName.trim(),
      company: clientName.trim(),
      packageName: pkg.name,
      tier: pkg.tier,
      value: total,
    })
    toast(`Draft proposal saved for ${clientName.trim()}`, 'success')
    setClientName('')
    setExtras({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-one-gold" />
        <div>
          <h2 className="text-xl font-bold text-one-white">Proposal Builder</h2>
          <p className="text-sm text-one-muted">Build & track sponsorship proposals</p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90">
        Five renewal drafts are loaded from last billed invoices (Jason&apos;s TV, McRae,
        Cleave&apos;s, Burkes, Natural Approach). Amounts are last period — not a new 2026/27
        quote. Confirm with Jay before send. Rows marked DEMO are synthetic CRM and must not
        be emailed. Vision Australia rental is waiting on the last Xero invoice.
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {PROPOSAL_PACKAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${
                selectedId === p.id
                  ? 'border-one-gold bg-one-gold/10'
                  : 'border-one-border hover:border-one-gold/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-one-white">{p.name}</span>
                <Badge variant="outline">{p.tier}</Badge>
              </div>
              <p className="text-xs text-one-muted mt-1">{p.description}</p>
              <p className="text-sm text-one-gold mt-2">${p.basePrice.toLocaleString()}</p>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-2 bg-[#0D1E36]/60 border-one-border">
          <CardHeader>
            <CardTitle className="text-one-white">{pkg.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-one-muted">Client Name</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Company or contact name"
                className="mt-1 bg-one-navy border-one-border"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-one-muted">Deliverables</p>
              {pkg.deliverables.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-one-border p-3"
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
                        ${d.unitPrice} {d.unit} × {d.qty || 1}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-one-border">
              <div>
                <p className="text-xs text-one-muted">Estimated Total (ex GST)</p>
                <p className="text-2xl font-bold text-one-gold">${total.toLocaleString()}</p>
              </div>
              <Button onClick={saveProposal} className="bg-one-gold text-one-navy hover:bg-one-gold/90">
                <Plus className="w-4 h-4 mr-2" />
                Save Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-one-muted">
          Proposals ({proposals.length})
        </h3>
        <div className="rounded-xl border border-one-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-one-border hover:bg-transparent">
                <TableHead className="text-one-muted">Client</TableHead>
                <TableHead className="text-one-muted">Package</TableHead>
                <TableHead className="text-one-muted">Linked Enquiry</TableHead>
                <TableHead className="text-one-muted">Value</TableHead>
                <TableHead className="text-one-muted">Updated</TableHead>
                <TableHead className="text-one-muted">Status</TableHead>
                <TableHead className="text-one-muted text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.length === 0 && (
                <TableRow className="border-one-border">
                  <TableCell colSpan={7} className="text-center text-sm text-one-muted py-8">
                    No proposals yet — build one above or create one from an enquiry.
                  </TableCell>
                </TableRow>
              )}
              {proposals.map((p) => (
                <TableRow key={p.id} className="border-one-border hover:bg-white/5">
                  <TableCell>
                    <div className="font-medium text-one-white">{p.company ?? p.clientName}</div>
                    <div className="text-xs text-one-muted">{p.clientName}</div>
                  </TableCell>
                  <TableCell className="text-sm text-one-white/80">
                    <div>{p.packageName ?? 'Custom'}</div>
                    {p.notes && (
                      <p className="text-[11px] text-one-muted mt-0.5 max-w-sm leading-snug">{p.notes}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-one-muted">
                    {p.enquiryId ?? '—'}
                  </TableCell>
                  <TableCell className="tabular-nums">${p.value.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-one-muted">{formatDate(p.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant="outline" className={cn('text-[10px] capitalize', PROPOSAL_STATUS_STYLES[p.status])}>
                        {p.status}
                      </Badge>
                      {p.kind === 'demo' && (
                        <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-300">
                          DEMO
                        </Badge>
                      )}
                      {p.kind === 'renewal' && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300">
                          Confirm with Jay
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {p.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-one-border"
                          onClick={() => {
                            sendProposal(p.id)
                            toast(`Proposal sent to ${p.company ?? p.clientName}`, 'success')
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
                            className="h-7 px-2 text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
                            onClick={() => {
                              acceptProposal(p.id)
                              toast('Proposal accepted — contract created', 'success')
                            }}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs border-one-border text-one-muted hover:text-red-300"
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
