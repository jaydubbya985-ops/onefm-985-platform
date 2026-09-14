import { lazy, Suspense } from 'react'
import {
  BarChart3,
  ChevronRight,
  CreditCard,
  FileText,
  Inbox,
  LogOut,
  Palette,
  Radio,
  Receipt,
  RotateCcw,
  Send,
  Settings,
  Users,
} from 'lucide-react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { Button } from '@/components/ui/button'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { ToastProvider, useToast } from '@/components/ops/Toast'
import { OpsProvider, useOpsStore, type OpsTab } from '@/components/ops/store'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'

const EnquiryDashboard = lazy(() => import('@/components/ops/EnquiryDashboard'))
const ProposalBuilder = lazy(() => import('@/components/ops/ProposalBuilder'))
const ContractManager = lazy(() => import('@/components/ops/ContractManager'))
const SponsorCRM = lazy(() => import('@/components/ops/SponsorCRM'))
const BroadcastSchedule = lazy(() => import('@/components/ops/BroadcastSchedule'))
const InvoiceGenerator = lazy(() => import('@/components/ops/InvoiceGenerator'))
const InvoiceBatchSender = lazy(() => import('@/components/ops/InvoiceBatchSender'))
const BillingEngine = lazy(() => import('@/components/ops/BillingEngine'))
const InvoiceDesignLab = lazy(() => import('@/components/ops/InvoiceDesignLab'))
const PaymentsModule = lazy(() => import('@/components/ops/PaymentsModule'))

function OpsTabPanel({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SkeletonLoader variant="table" count={1} />}>
      {children}
    </Suspense>
  )
}

interface OpsTabDef {
  id: OpsTab
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

/** Tabs grouped by job — Sales pipeline, Money, Broadcast — instead of ten
 *  flat tabs overflowing the bar. */
const TAB_GROUPS: { label: string; tabs: OpsTabDef[] }[] = [
  {
    label: 'Sales',
    tabs: [
      { id: 'enquiries', label: 'Enquiries', icon: Inbox, description: 'Manage incoming enquiries' },
      { id: 'proposals', label: 'Proposals', icon: FileText, description: 'Build & track proposals' },
      { id: 'contracts', label: 'Contracts', icon: Settings, description: 'Sponsorship contracts' },
      { id: 'sponsors', label: 'Sponsors', icon: Users, description: 'CRM, contacts & pipeline' },
    ],
  },
  {
    label: 'Money',
    tabs: [
      { id: 'invoices', label: 'Invoices', icon: Receipt, description: 'Create, send & track invoices' },
      { id: 'batch', label: 'Batch', icon: Send, description: 'Send a batch of invoices' },
      { id: 'design', label: 'Design', icon: Palette, description: 'Invoice design variants' },
      { id: 'billing', label: 'Billing', icon: BarChart3, description: 'Payments, aging & reports' },
      { id: 'payments', label: 'Payments', icon: CreditCard, description: 'Donations & memberships' },
    ],
  },
  {
    label: 'Broadcast',
    tabs: [
      { id: 'schedule', label: 'Schedule', icon: Radio, description: 'Broadcast & ad schedule' },
    ],
  },
]

function PipelineIndicator() {
  const { enquiries, proposals, contracts, invoices, activeTab, setActiveTab } = useOpsStore()

  const stages: { id: OpsTab; label: string; count: number }[] = [
    { id: 'enquiries', label: 'Enquiries', count: enquiries.length },
    { id: 'proposals', label: 'Proposals', count: proposals.length },
    { id: 'contracts', label: 'Contracts', count: contracts.length },
    { id: 'invoices', label: 'Invoices', count: invoices.length },
    { id: 'batch', label: 'Batch', count: invoices.filter((i) => i.inBatch).length },
  ]

  return (
    <div className="flex items-center gap-1 flex-wrap mt-3">
      {stages.map((stage, idx) => (
        <div key={stage.id} className="flex items-center gap-1">
          {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-one-muted/85" />}
          <button
            onClick={() => setActiveTab(stage.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-colors ${
              activeTab === stage.id
                ? 'border-one-gold/50 bg-one-gold/10 text-one-gold'
                : 'border-one-border text-one-white/60 hover:text-one-white hover:border-one-gold/30'
            }`}
          >
            <span>{stage.label}</span>
            <span className="tabular-nums font-semibold">{stage.count}</span>
          </button>
        </div>
      ))}
    </div>
  )
}

function OpsResumeCard() {
  const { proposals, focusProposalId, setActiveTab, setFocusProposalId } = useOpsStore()
  const focused = proposals.find((p) => p.id === focusProposalId)
  const oldestDraft = [...proposals]
    .filter((p) => p.status === 'draft')
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))[0]
  const next = focused?.status === 'draft' ? focused : oldestDraft

  if (!next) {
    return (
      <div className="mt-4 rounded-lg border border-one-border bg-[#0D1E36]/50 px-4 py-3 max-w-2xl flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-one-white">
          Next: build a sponsorship proposal and download the PDF.
        </p>
        <Button
          size="sm"
          onClick={() => setActiveTab('proposals')}
          className="bg-one-gold text-one-navy hover:bg-one-gold/90 min-h-10"
        >
          Open Proposals
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-lg border border-one-gold/40 bg-one-gold/8 px-4 py-3 max-w-2xl flex items-center justify-between gap-3 flex-wrap">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-one-gold">Pick up where you left off</p>
        <p className="text-sm text-one-white mt-0.5">
          Finish the PDF for {next.company ?? next.clientName}
          {next.number ? ` (${next.number})` : ''}.
        </p>
      </div>
      <Button
        size="sm"
        onClick={() => {
          setFocusProposalId(next.id)
          setActiveTab('proposals')
        }}
        className="bg-one-gold text-one-navy hover:bg-one-gold/90 min-h-10"
      >
        Continue
      </Button>
    </div>
  )
}

function OpsPortalContent() {
  const { activeTab, setActiveTab, resetDemoData, invoices } = useOpsStore()
  const draftCount = invoices.filter((i) => i.status === 'draft').length
  const draftTotal = invoices
    .filter((i) => i.status === 'draft')
    .reduce((sum, i) => sum + i.total, 0)
  const { toast } = useToast()
  const { logout, user } = useAuth()
  const live = isSupabaseConfigured()

  return (
    <div className="min-h-screen bg-[#101010]">
      {/* Compact utility header — a work tool, not a landing page */}
      <div className="border-b border-[#2A2A2A]/40 bg-[#0C0C0C]">
        <div className="px-6 md:px-12 lg:px-20 pt-20 pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Settings className="w-5 h-5 text-one-gold shrink-0" />
              <h1 className="font-h1 text-one-white text-xl md:text-2xl whitespace-nowrap">Operations</h1>
              {live ? (
                <span className="px-2 py-0.5 rounded font-label text-[10px] tracking-widest bg-emerald-900/40 text-emerald-400 border border-emerald-700/40">
                  LIVE
                </span>
              ) : (
                <span
                  className="px-2 py-0.5 rounded font-label text-[10px] tracking-widest bg-one-gold/10 text-one-gold border border-one-gold/30"
                  title={`Data is on this device only. The invoice book is real (${draftCount} drafts, none sent yet); enquiries, contracts and CRM entries are still sample data. To go live add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in Netlify.`}
                >
                  LOCAL
                </span>
              )}
              {live && user && (
                <span className="text-one-muted text-xs truncate">{user.email}</span>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="font-label text-[9px] tracking-widest text-one-white/40 uppercase">Drafted · unsent</p>
                  <p className="font-h1 text-one-gold text-lg leading-tight tabular-nums">
                    ${draftTotal.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="font-label text-[9px] tracking-widest text-one-white/40 uppercase">Invoices</p>
                  <p className="font-h1 text-one-white text-lg leading-tight tabular-nums">{invoices.length}</p>
                </div>
              </div>
              {live ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="border-one-border text-one-white/60 hover:text-one-white bg-transparent"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetDemoData()
                    toast('Demo data reset', 'success')
                  }}
                  className="border-one-border text-one-white/60 hover:text-one-white bg-transparent"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
          <OpsResumeCard />
          <PipelineIndicator />
        </div>

        {/* Grouped nav — Sales · Money · Broadcast */}
        <div className="px-6 md:px-12 lg:px-20 pb-3">
          <div className="flex gap-5 overflow-x-auto">
            {TAB_GROUPS.map((group) => (
              <div key={group.label} className="shrink-0">
                <p className="font-label text-[9px] tracking-[0.2em] text-one-white/35 uppercase mb-1.5 pl-1">
                  {group.label}
                </p>
                <div className="flex gap-1.5">
                  {group.tabs.map((t) => {
                    const Icon = t.icon
                    const active = activeTab === t.id
                    return (
                      <Button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        title={t.description}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label text-xs tracking-wider transition-all whitespace-nowrap min-w-0 shrink-0 ${
                          active
                            ? 'bg-one-gold text-one-navy hover:bg-one-gold/90'
                            : 'bg-transparent text-one-white/60 border border-[#2A2A2A]/40 hover:text-one-white hover:border-one-gold/30'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{t.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-8">
        {activeTab === 'enquiries' && (
          <OpsTabPanel><EnquiryDashboard /></OpsTabPanel>
        )}
        {activeTab === 'proposals' && (
          <OpsTabPanel><ProposalBuilder /></OpsTabPanel>
        )}
        {activeTab === 'contracts' && (
          <OpsTabPanel><ContractManager /></OpsTabPanel>
        )}
        {activeTab === 'sponsors' && (
          <OpsTabPanel><SponsorCRM /></OpsTabPanel>
        )}
        {activeTab === 'schedule' && (
          <OpsTabPanel><BroadcastSchedule /></OpsTabPanel>
        )}
        {activeTab === 'invoices' && (
          <OpsTabPanel><InvoiceGenerator /></OpsTabPanel>
        )}
        {activeTab === 'batch' && (
          <OpsTabPanel><InvoiceBatchSender /></OpsTabPanel>
        )}
        {activeTab === 'design' && (
          <OpsTabPanel><InvoiceDesignLab /></OpsTabPanel>
        )}
        {activeTab === 'billing' && (
          <OpsTabPanel><BillingEngine /></OpsTabPanel>
        )}
        {activeTab === 'payments' && (
          <OpsTabPanel><PaymentsModule /></OpsTabPanel>
        )}
      </div>
    </div>
  )
}

export default function OpsPortal() {
  return (
    <ToastProvider>
      <OpsProvider>
        <Layout hideFooter>
          <SEO
            title="Operations Portal"
            description="ONE FM 98.5 operations dashboard — enquiries, sponsors, invoices, revenue."
          />
          <OpsPortalContent />
        </Layout>
      </OpsProvider>
    </ToastProvider>
  )
}
