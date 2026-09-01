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
import { BANK_BSB } from '@/lib/bankDetails'
import { formatCoverageShort, formatTowns } from '@/lib/coverageCopy'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { isSupabaseConfigured, getOpsCredentialSource, opsCredentialSourceLabel } from '@/lib/supabase'

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

const TABS: {
  id: OpsTab
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}[] = [
  { id: 'enquiries', label: 'Enquiries', icon: Inbox, description: 'Manage incoming enquiries' },
  { id: 'proposals', label: 'Proposals', icon: FileText, description: 'Build & track proposals' },
  { id: 'contracts', label: 'Contracts', icon: Settings, description: 'Sponsorship contracts' },
  { id: 'sponsors', label: 'Sponsors', icon: Users, description: 'CRM, contacts & pipeline' },
  { id: 'schedule', label: 'Schedule', icon: Radio, description: 'Broadcast & ad schedule' },
  { id: 'invoices', label: 'Invoices', icon: Receipt, description: 'Create, send & track invoices' },
  { id: 'batch', label: 'Batch Send', icon: Send, description: 'Send a batch of invoices' },
  { id: 'design', label: 'Invoice Design', icon: Palette, description: 'Pick from 3 world-class invoice designs' },
  { id: 'billing', label: 'Billing', icon: BarChart3, description: 'Payments, aging & reports' },
  { id: 'payments', label: 'Payments', icon: CreditCard, description: 'Donations & memberships' },
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
  const { activeTab, setActiveTab, resetDemoData } = useOpsStore()
  const { toast } = useToast()
  const { logout, user } = useAuth()

  return (
    <div className="min-h-screen bg-[#101010]">
      <div className="relative overflow-hidden border-b border-[#2A2A2A]/30">
        <img
          src={STATION_PHOTOS.studioChristmasBroadcast}
          alt=""
          aria-hidden
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#101010]/78 via-[#101010]/88 to-[#101010]"
        />
        <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-24 pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-7 h-7 text-one-gold" />
              <h1 className="font-h1 text-one-white text-3xl md:text-4xl">Operations Portal</h1>
            </div>
            <p className="text-one-white/50 text-sm max-w-2xl">
              Station ops for {formatTowns()} — {formatCoverageShort()} (ABS 2021 via townData).
              Invoice payments: NAB BSB {BANK_BSB}. This screen is not a Stripe receipt.
            </p>
            {isSupabaseConfigured() && user && (
              <p className="text-one-muted text-xs mt-1">Signed in as {user.email}</p>
            )}
            {isSupabaseConfigured() ? (
              <div className="mt-4 rounded-lg border border-emerald-700/40 bg-emerald-900/15 px-4 py-3 max-w-2xl">
                <p className="text-sm text-emerald-400 font-semibold">LIVE — enquiries, proposals, contracts and invoices persist to Supabase</p>
                <p className="text-xs text-one-muted mt-0.5">
                  Sponsors, schedule, billing charts and payments start empty in live mode. DEMO seeds stay in DEMO mode only.
                  {getOpsCredentialSource() !== 'none' && (
                    <> Credentials: {opsCredentialSourceLabel()}.</>
                  )}
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-one-gold/30 bg-one-gold/8 px-4 py-3 max-w-2xl flex items-start gap-3">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-one-gold/20 flex items-center justify-center text-one-gold text-xs font-bold">D</span>
                <div>
                  <p className="text-sm text-one-gold font-semibold">DEMO MODE — all data is local &amp; unsaved</p>
                  <p className="text-xs text-one-muted mt-0.5">
                    Invoices, proposals and contacts shown here are sample data. To enable live storage add{' '}
                    <code className="text-one-white/70">VITE_SUPABASE_URL</code> +{' '}
                    <code className="text-one-white/70">VITE_SUPABASE_ANON_KEY</code> in Netlify → Site settings → Environment variables.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isSupabaseConfigured() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="border-one-border text-one-white/60 hover:text-one-white bg-transparent"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign out
              </Button>
            )}
            {!isSupabaseConfigured() && (
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
                Reset demo data
              </Button>
            )}
          </div>
        </div>
        <OpsResumeCard />
        <PipelineIndicator />
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-4 border-b border-[#2A2A2A]/20">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = activeTab === t.id
            return (
              <Button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                title={t.description}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-label text-xs tracking-wider transition-all whitespace-nowrap min-w-0 shrink-0 ${
                  active
                    ? 'bg-one-gold text-one-navy hover:bg-one-gold/90'
                    : 'bg-transparent text-one-white/60 border border-[#2A2A2A]/30 hover:text-one-white hover:border-one-gold/30'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.label}</span>
              </Button>
            )
          })}
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
