import { lazy, Suspense } from 'react'
import {
  BarChart3,
  ChevronRight,
  CreditCard,
  FileText,
  Inbox,
  LogOut,
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
  { id: 'batch', label: 'Batch Send', icon: Send, description: '$58K invoice batch — June 2026' },
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
          {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-one-muted/50" />}
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

function OpsPortalContent() {
  const { activeTab, setActiveTab, resetDemoData } = useOpsStore()
  const { toast } = useToast()
  const { logout, user } = useAuth()

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <div className="px-6 md:px-12 lg:px-20 pt-24 pb-6 border-b border-[#1E3A5F]/30">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-7 h-7 text-one-gold" />
              <h1 className="font-h1 text-one-white text-3xl md:text-4xl">Operations Portal</h1>
            </div>
            <p className="text-one-white/50 text-sm max-w-2xl">
              Manage enquiries, sponsors, invoices, and revenue — all in one place. This portal
              replaces spreadsheets and Word docs with a professional system.
            </p>
            {isSupabaseConfigured() && user && (
              <p className="text-one-muted text-xs mt-1">Signed in as {user.email}</p>
            )}
            {!isSupabaseConfigured() && (
              <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 max-w-2xl">
                <strong>Demo mode.</strong> Set{' '}
                <code className="text-amber-100">VITE_SUPABASE_URL</code> and{' '}
                <code className="text-amber-100">VITE_SUPABASE_ANON_KEY</code> in Netlify to enable
                live invoices and payments.
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
          </div>
        </div>
        <PipelineIndicator />
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-4 border-b border-[#1E3A5F]/20">
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
                    : 'bg-transparent text-one-white/60 border border-[#1E3A5F]/30 hover:text-one-white hover:border-one-gold/30'
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
