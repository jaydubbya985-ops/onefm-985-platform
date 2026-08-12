import { useState, useRef, useMemo } from 'react'
import { Reorder, AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Toaster, toast } from 'sonner'
import { cn } from '@/lib/utils'
import { SEO } from '@/components/SEO'
import { WordReveal } from '@/components/WordReveal'
import { TiltCard } from '@/components/TiltCard'
import { proposalTemplates, generalTiers, stationStats } from '@/data/pricing'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import {
  ChevronRight, Check, Search, Eye, FileText, Sparkles, GripVertical, X,
  Mail, Link as LinkIcon, ArrowLeft, FileDown,
  Edit3, Wand2, Database, ZoomIn, ZoomOut, Maximize2, Share2,
  Send, Copy, Shield, QrCode, RotateCcw,
  LayoutTemplate, Briefcase, Award, Zap, CheckCircle2, Loader2, Plus
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Template {
  id: string
  name: string
  description: string
  sections: number
  bestFor: string
  category: string
  badge?: string
}

interface CustomerForm {
  companyName: string
  industry: string
  companySize: string
  contactName: string
  contactTitle: string
  contactEmail: string
  contactPhone: string
  campaignGoal: string
  targetAudience: string
  budgetRange: string
  campaignDuration: string
  previousCustomer: boolean
  notes: string
}

interface ProposalSection {
  id: string
  name: string
  included: boolean
  contentMode: 'default' | 'ai' | 'custom'
  customText: string
  aiText: string
  dataSource: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  { label: 'Template', num: 1 },
  { label: 'Customer', num: 2 },
  { label: 'Package', num: 3 },
  { label: 'Export', num: 4 },
]

const templateMeta: Record<string, { sections: number; bestFor: string; category: string; badge?: string }> = {
  standard: { sections: 8, bestFor: 'General advertising partners', category: 'Sponsorship', badge: 'Most Used' },
  event: { sections: 6, bestFor: 'Festival, concert, and event sponsors', category: 'Events' },
  digital: { sections: 7, bestFor: 'Digital-native brands', category: 'Digital' },
  premium: { sections: 10, bestFor: 'Major brand partnerships', category: 'Partnership' },
  local: { sections: 5, bestFor: 'SMBs and local retailers', category: 'Sponsorship' },
  football: { sections: 8, bestFor: 'Football season sponsors', category: 'Sports' },
}

const TEMPLATES: Template[] = [
  ...proposalTemplates.map((t) => ({
    ...t,
    sections: templateMeta[t.id]?.sections ?? 6,
    bestFor: templateMeta[t.id]?.bestFor ?? 'General partners',
    category: templateMeta[t.id]?.category ?? 'Sponsorship',
    badge: templateMeta[t.id]?.badge,
  })),
  { id: 'blank', name: 'Blank Canvas', description: 'Build from scratch with full custom section control', sections: 0, bestFor: 'Unique or complex proposals', category: 'Custom' },
]

const INDUSTRIES = ['Automotive', 'Retail', 'Food & Beverage', 'Technology', 'Healthcare', 'Finance', 'Education', 'Real Estate', 'Entertainment', 'Travel & Tourism', 'Fitness & Wellness', 'Fashion', 'Home & Garden', 'Sports', 'Non-Profit', 'Energy', 'Media', 'Legal', 'Construction', 'Other']

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+']

const CAMPAIGN_GOALS = ['Brand Awareness', 'Lead Gen', 'Event Promo', 'Product Launch', 'Community Engagement', 'Other']

const TARGET_AUDIENCES = ['18-24 Gen Z', '25-34 Millennials', '35-44 Professionals', '45-54 Established', '55+ Mature', 'Families', 'Business Owners', 'All Demographics']

const BUDGET_RANGES = ['Under $5K', '$5K–$15K', '$15K–$50K', '$50K–$100K', '$100K+']

const DURATIONS = ['1 week', '1 month', '3 months', '6 months', '12 months', 'Ongoing']

const BASE_PACKAGES = [
  { id: 'communityPartner', name: 'Community', price: generalTiers.communityPartner.weeklyPrice * 52 },
  { id: 'championPartner', name: 'Champion', price: generalTiers.championPartner.weeklyPrice * 52 },
  { id: 'premierPartner', name: 'Premier', price: generalTiers.premierPartner.weeklyPrice * 52 },
  { id: 'signaturePartner', name: 'Signature', price: generalTiers.signaturePartner.weeklyPrice * 52 },
  { id: 'custom', name: 'Custom', price: 0 },
  { id: 'event', name: 'Event', price: generalTiers.championPartner.weeklyPrice * 52 },
  { id: 'digital', name: 'Digital-First', price: generalTiers.communityPartner.weeklyPrice * 52 },
]

const DEFAULT_SECTIONS: ProposalSection[] = [
  { id: 'exec-summary', name: 'Executive Summary', included: true, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'about', name: 'About ONE FM', included: true, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'audience', name: 'Audience Overview', included: true, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'platform', name: 'Platform Reach', included: true, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'package', name: 'Proposed Package', included: true, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'pricing', name: 'Pricing & Rates', included: true, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'case-studies', name: 'Case Studies', included: true, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'timeline', name: 'Timeline & Next Steps', included: true, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'terms', name: 'Terms & Conditions', included: true, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'regional-map', name: 'Regional Map & Coverage', included: false, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'social-strategy', name: 'Social Media Strategy', included: false, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'podcast', name: 'Podcast Integration', included: false, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'event-activation', name: 'Event Activation Plan', included: false, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'competitive', name: 'Competitive Analysis', included: false, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
  { id: 'roi', name: 'ROI Projection', included: false, contentMode: 'default', customText: '', aiText: '', dataSource: 'Latest Data' },
]

const DATA_TOKENS = [
  { token: '[CURRENT_LISTENERS]', label: 'Weekly Listeners (est.)', value: stationStats.weeklyListeners.toLocaleString() },
  { token: '[WEEKLY_REACH]', label: 'Weekly Reach', value: `~${Math.round(stationStats.weeklyListeners / 1000)}K` },
  { token: '[AUDIENCE_AGE_25_34]', label: 'Audience 25-34', value: '38%' },
  { token: '[PACKAGE_PRICE]', label: 'Package Price', value: '$0' },
  { token: '[CUSTOMER_NAME]', label: 'Customer Name', value: '' },
  { token: '[CAMPAIGN_DURATION]', label: 'Campaign Duration', value: '' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeOutBack = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const navH = 72
    const y = el.getBoundingClientRect().top + window.scrollY - navH - 16
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

function formatCurrency(n: number) {
  if (n === 0) return '$0'
  return '$' + n.toLocaleString()
}

/* ------------------------------------------------------------------ */
/*  Floating Document Icons (background decoration)                    */
/* ------------------------------------------------------------------ */

function FloatingDocs() {
  const docs = useMemo(() => [
    { icon: FileText, x: 8, y: 15, delay: 0, size: 28 },
    { icon: LayoutTemplate, x: 85, y: 25, delay: 3, size: 22 },
    { icon: Briefcase, x: 15, y: 65, delay: 6, size: 24 },
    { icon: FileDown, x: 75, y: 70, delay: 9, size: 26 },
    { icon: Award, x: 50, y: 10, delay: 12, size: 20 },
    { icon: Zap, x: 92, y: 50, delay: 4, size: 18 },
  ], [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {docs.map((d, i) => (
        <motion.div
          key={i}
          className="absolute text-one-white/[0.04]"
          style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: d.size }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, -5, 8, 0],
            rotate: [0, 5, -5, 3, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            delay: d.delay,
            ease: 'easeInOut',
          }}
        >
          <d.icon size={d.size} />
        </motion.div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function SalesProposal() {
  /* ── State ── */
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')

  const [customer, setCustomer] = useState<CustomerForm>({
    companyName: '', industry: '', companySize: '',
    contactName: '', contactTitle: '', contactEmail: '', contactPhone: '',
    campaignGoal: '', targetAudience: '', budgetRange: '', campaignDuration: '',
    previousCustomer: false, notes: '',
  })

  const [sections, setSections] = useState<ProposalSection[]>(DEFAULT_SECTIONS)
  const [basePackage, setBasePackage] = useState('custom')
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'edit' | 'ai' | 'data'>('edit')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiTone, setAiTone] = useState('Professional')
  const [aiLength, setAiLength] = useState([50])
  const [aiGenerating, setAiGenerating] = useState(false)

  const [previewZoom, setPreviewZoom] = useState(1)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const [shareExpiry, setShareExpiry] = useState('30 days')
  const [sharePassword, setSharePassword] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const proposalRef = useRef<HTMLDivElement>(null)

  /* ── Derived ── */
  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterCategory === 'All' || t.category === filterCategory
    return matchesSearch && matchesFilter
  })

  const includedSections = sections.filter((s) => s.included)
  const packagePrice = BASE_PACKAGES.find((p) => p.id === basePackage)?.price || 0
  const totalPrice = packagePrice

  const customerComplete = customer.companyName && customer.industry && customer.contactName && customer.contactEmail

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  /* ── Actions ── */
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    // Pre-configure sections based on template
    let newSections = [...DEFAULT_SECTIONS]
    if (template.id === 'blank') {
      newSections = newSections.map((s) => ({ ...s, included: false }))
    } else if (template.id === 'local') {
      newSections = newSections.map((s) => ({ ...s, included: ['exec-summary', 'about', 'audience', 'platform', 'pricing'].includes(s.id) }))
    } else if (template.id === 'event') {
      newSections = newSections.map((s) => ({ ...s, included: ['exec-summary', 'about', 'audience', 'platform', 'event-activation', 'pricing'].includes(s.id) }))
    } else if (template.id === 'digital') {
      newSections = newSections.map((s) => ({ ...s, included: ['exec-summary', 'about', 'audience', 'platform', 'social-strategy', 'podcast', 'pricing'].includes(s.id) }))
    } else if (template.id === 'premium') {
      newSections = newSections.map((s) => ({ ...s, included: true }))
    }
    setSections(newSections)
    setTimeout(() => {
      setCurrentStep(2)
      scrollToId('customer-section')
    }, 600)
  }

  const handleGenerateAI = async (sectionId: string) => {
    setAiGenerating(true)
    setTimeout(() => {
      const section = sections.find((s) => s.id === sectionId)
      const generated = generateAIContent(section?.name || '', aiTone, aiLength[0], customer)
      setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, aiText: generated, contentMode: 'ai' } : s))
      setAiGenerating(false)
      toast.success('AI content generated successfully')
    }, 1200)
  }

  const handleExportPDF = async () => {
    if (!proposalRef.current) return
    setPdfGenerating(true)
    try {
      const canvas = await html2canvas(proposalRef.current, { scale: 2, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0
      let heightLeft = imgHeight * ratio
      let position = 0

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      heightLeft -= pdfHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight * ratio
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio)
        heightLeft -= pdfHeight
      }

      pdf.save(`ONE-FM-Proposal-${customer.companyName || 'Draft'}.pdf`)
      toast.success('PDF downloaded successfully!')
    } catch {
      toast.error('Failed to generate PDF')
    }
    setPdfGenerating(false)
  }

  const handleGenerateShareLink = () => {
    const url = `https://fm985.com.au/proposal/share/${Date.now().toString(36)}`
    setShareUrl(url)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard')
  }

  const handleSendEmail = () => {
    toast.success(`Proposal sent to ${customer.contactEmail}`)
    setEmailModalOpen(false)
    setSuccessState(true)
  }

  const handleReorder = (newOrder: ProposalSection[]) => {
    setSections(newOrder)
  }

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, included: !s.included } : s))
  }

  const insertToken = (token: string) => {
    if (!activeSectionId) return
    setSections((prev) => prev.map((s) => {
      if (s.id !== activeSectionId) return s
      const text = s.contentMode === 'custom' ? s.customText : s.aiText
      const newText = text + ' ' + token
      return s.contentMode === 'custom' ? { ...s, customText: newText } : { ...s, aiText: newText }
    }))
    toast.success(`Inserted ${token}`)
  }

  const getSectionContent = (section: ProposalSection) => {
    if (section.contentMode === 'custom' && section.customText) return section.customText
    if (section.contentMode === 'ai' && section.aiText) return section.aiText
    return getDefaultContent(section.id, customer)
  }

  /* ── Render ── */
  return (
    <div className="min-h-[100dvh] bg-one-navy text-one-white">
      <SEO title="Sales Proposal Builder" description="Build custom sponsorship proposals for ONE FM 98.5. Templates, AI content editor, and PDF export." />
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'rgba(26,26,31,0.95)', border: '1px solid #2A2A30', color: '#F4F1EA' } }} />

      {/* ========== SECTION 1: HERO ========== */}
      <section id="proposal-hero" className="relative min-h-[45vh] flex items-center justify-center overflow-hidden" data-cursor-label="PROPOSAL BUILDER">
        <FloatingDocs />
        <div aria-hidden className="grain-overlay" />
        <div className="relative z-10 text-center max-w-[800px] mx-auto px-4 py-24">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-label text-muted mb-4"
          >
            Home / Proposal Builder
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
            className="font-h1 text-one-white mb-4"
          >
            BUILD YOUR PROPOSAL
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
            className="font-body text-one-white max-w-xl mx-auto mb-8"
          >
            AI-assisted, customer-tailored sales proposals in minutes. Select a template, customize every detail, and export a polished PDF ready to present.
          </motion.p>

          {/* Step bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: easeOutExpo }}
            className="flex items-center justify-center gap-2 md:gap-4 mb-10"
          >
            {STEPS.map((step, i) => {
              const isCurrent = currentStep === step.num
              const isCompleted = currentStep > step.num
              return (
                <div key={step.num} className="flex items-center gap-2 md:gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      className={cn(
                        'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-label text-xs border-2 transition-colors',
                        isCurrent && 'bg-one-gold border-one-gold text-one-navy',
                        isCompleted && 'bg-one-gold border-one-gold text-one-navy',
                        !isCurrent && !isCompleted && 'border-muted text-muted'
                      )}
                      animate={isCurrent ? { boxShadow: ['0 0 0 0 rgba(212,150,58,0.4)', '0 0 0 8px rgba(212,150,58,0)', '0 0 0 0 rgba(212,150,58,0.4)'] } : {}}
                      transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
                    >
                      {isCompleted ? <Check size={16} /> : step.num}
                    </motion.div>
                    <span className={cn('font-label text-[10px] hidden md:block', isCurrent ? 'text-one-gold' : isCompleted ? 'text-one-gold' : 'text-muted')}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('w-8 md:w-12 h-0.5 rounded', isCompleted ? 'bg-one-gold' : 'bg-muted/30')} />
                  )}
                </div>
              )
            })}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: easeOutExpo }}
            onClick={() => scrollToId('templates-section')}
            data-cursor-label="START"
            className="btn-primary"
          >
            Start Building <ChevronRight size={16} />
          </motion.button>
        </div>
      </section>

      {/* ========== SECTION 2: TEMPLATES ========== */}
      <section id="templates-section" className="bg-surface-mid section-padding" data-cursor-label="TEMPLATES">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            <WordReveal text="CHOOSE A TEMPLATE" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted mb-8">Start with a pre-built structure, then make it yours</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-one-navy border-one-border text-one-white placeholder:text-muted focus:border-one-gold focus:ring-one-gold/20"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-one-navy border-one-border text-one-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-one-navy border-one-border">
                {['All', 'Sponsorship', 'Events', 'Digital', 'Partnership', 'Custom'].map((c) => (
                  <SelectItem key={c} value={c} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, i) => (
              <TiltCard key={template.id} maxTilt={5} className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: easeOutExpo }}
                data-cursor-label="SELECT"
                className={cn(
                  'glass-card p-6 relative overflow-hidden group cursor-pointer transition-all duration-300 h-full',
                  selectedTemplate?.id === template.id && 'border-one-gold/60'
                )}
                onClick={() => handleSelectTemplate(template)}
              >
                <div aria-hidden className="explore-tile-scan" />
                {template.badge && (
                  <Badge className="absolute top-4 right-4 bg-one-gold/20 text-one-gold border-one-gold/30 font-label text-[10px]">
                    {template.badge}
                  </Badge>
                )}

                <div className="w-full h-32 bg-one-navy rounded-lg mb-4 flex items-center justify-center border border-one-border group-hover:border-one-gold/30 transition-colors overflow-hidden">
                  <div className="flex flex-col gap-2 w-3/4 opacity-50 group-hover:opacity-70 transition-opacity">
                    <div className="h-2 bg-ivory/20 rounded-full w-full" />
                    <div className="h-2 bg-ivory/10 rounded-full w-3/4" />
                    <div className="h-2 bg-ivory/10 rounded-full w-5/6" />
                    <div className="h-2 bg-ivory/20 rounded-full w-full mt-2" />
                    <div className="h-2 bg-ivory/10 rounded-full w-1/2" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-one-navy/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-one-white font-label text-xs">
                      <Eye size={14} /> Quick Preview
                    </div>
                  </div>
                </div>

                <h3 className="font-h4 text-one-white mb-1">{template.name}</h3>
                <p className="font-body-small text-one-white mb-3">{template.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="font-label text-muted">{template.sections} sections</span>
                  <span className="font-micro text-muted">{template.bestFor}</span>
                </div>

                <Button
                  variant="outline"
                  className={cn(
                    'w-full rounded-full font-label text-xs border-ivory/40 text-one-white hover:bg-ivory/10 hover:border-ivory',
                    template.id === 'blank' && 'border-one-gold text-one-gold hover:bg-one-gold/10'
                  )}
                  onClick={(e) => { e.stopPropagation(); handleSelectTemplate(template) }}
                >
                  Use Template
                </Button>
              </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: CUSTOMER FORM ========== */}
      <section id="customer-section" className="bg-surface-lift section-bleed-top section-padding" data-cursor-label="CLIENT DETAILS">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            <WordReveal text="WHO IS THIS FOR?" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.06} />
            <p className="font-body-small text-muted mb-4">Tell us about your customer and we&apos;ll tailor the proposal</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-4 mb-8 border-l-2 border-l-one-gold"
          >
            <div className="flex items-center gap-2 text-one-gold font-label text-xs">
              <Sparkles size={14} />
              AI will personalize content based on these details
            </div>
          </motion.div>

          {/* AI Auto-fill suggestion (simulated) */}
          {customer.contactEmail.includes('@') && customer.contactEmail.length > 6 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-card p-4 mb-6 border-l-2 border-l-data-teal"
            >
              <p className="font-body-small text-one-white mb-3">
                We found <span className="text-data-teal font-medium">{customer.companyName || 'a company'}</span> in your CRM. Auto-fill details?
              </p>
              <div className="flex gap-3">
                <Button size="sm" className="bg-data-teal text-one-navy hover:bg-data-teal/80 font-label text-xs rounded-full"
                  onClick={() => {
                    if (!customer.companyName) setCustomer((c) => ({ ...c, companyName: 'Acme Industries' }))
                    if (!customer.industry) setCustomer((c) => ({ ...c, industry: 'Technology' }))
                    if (!customer.companySize) setCustomer((c) => ({ ...c, companySize: '201-1000' }))
                    toast.success('Auto-filled from CRM')
                  }}
                >
                  <Check size={12} className="mr-1" /> Accept
                </Button>
                <Button size="sm" variant="outline" className="font-label text-xs rounded-full border-ivory/40" onClick={() => {}}>
                  Manual Entry
                </Button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              <FormField label="Company Name" required>
                <Input
                  value={customer.companyName}
                  onChange={(e) => setCustomer((c) => ({ ...c, companyName: e.target.value }))}
                  placeholder="Enter company name"
                  className="bg-one-navy border-one-border text-one-white placeholder:text-muted focus:border-one-gold focus:ring-one-gold/20"
                />
              </FormField>

              <FormField label="Industry" required>
                <Select value={customer.industry} onValueChange={(v) => setCustomer((c) => ({ ...c, industry: v }))}>
                  <SelectTrigger className="bg-one-navy border-one-border text-one-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-one-navy border-one-border max-h-60">
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Company Size" required>
                <Select value={customer.companySize} onValueChange={(v) => setCustomer((c) => ({ ...c, companySize: v }))}>
                  <SelectTrigger className="bg-one-navy border-one-border text-one-white">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-one-navy border-one-border">
                    {COMPANY_SIZES.map((s) => (
                      <SelectItem key={s} value={s} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">{s} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Contact Name" required>
                <Input
                  value={customer.contactName}
                  onChange={(e) => setCustomer((c) => ({ ...c, contactName: e.target.value }))}
                  placeholder="Full name"
                  className="bg-one-navy border-one-border text-one-white placeholder:text-muted focus:border-one-gold focus:ring-one-gold/20"
                />
              </FormField>

              <FormField label="Contact Title">
                <Input
                  value={customer.contactTitle}
                  onChange={(e) => setCustomer((c) => ({ ...c, contactTitle: e.target.value }))}
                  placeholder="Job title"
                  className="bg-one-navy border-one-border text-one-white placeholder:text-muted focus:border-one-gold focus:ring-one-gold/20"
                />
              </FormField>

              <FormField label="Contact Email" required>
                <Input
                  type="email"
                  value={customer.contactEmail}
                  onChange={(e) => setCustomer((c) => ({ ...c, contactEmail: e.target.value }))}
                  placeholder="email@company.com"
                  className="bg-one-navy border-one-border text-one-white placeholder:text-muted focus:border-one-gold focus:ring-one-gold/20"
                />
              </FormField>

              <FormField label="Contact Phone">
                <Input
                  value={customer.contactPhone}
                  onChange={(e) => setCustomer((c) => ({ ...c, contactPhone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className="bg-one-navy border-one-border text-one-white placeholder:text-muted focus:border-one-gold focus:ring-one-gold/20"
                />
              </FormField>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <FormField label="Campaign Goal" required>
                <Select value={customer.campaignGoal} onValueChange={(v) => setCustomer((c) => ({ ...c, campaignGoal: v }))}>
                  <SelectTrigger className="bg-one-navy border-one-border text-one-white">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent className="bg-one-navy border-one-border">
                    {CAMPAIGN_GOALS.map((g) => (
                      <SelectItem key={g} value={g} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Target Audience">
                <Select value={customer.targetAudience} onValueChange={(v) => setCustomer((c) => ({ ...c, targetAudience: v }))}>
                  <SelectTrigger className="bg-one-navy border-one-border text-one-white">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent className="bg-one-navy border-one-border">
                    {TARGET_AUDIENCES.map((a) => (
                      <SelectItem key={a} value={a} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Budget Range" required>
                <Select value={customer.budgetRange} onValueChange={(v) => setCustomer((c) => ({ ...c, budgetRange: v }))}>
                  <SelectTrigger className="bg-one-navy border-one-border text-one-white">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent className="bg-one-navy border-one-border">
                    {BUDGET_RANGES.map((b) => (
                      <SelectItem key={b} value={b} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Campaign Duration" required>
                <Select value={customer.campaignDuration} onValueChange={(v) => setCustomer((c) => ({ ...c, campaignDuration: v }))}>
                  <SelectTrigger className="bg-one-navy border-one-border text-one-white">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="bg-one-navy border-one-border">
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="flex items-center justify-between py-2">
                <Label className="font-label text-muted text-xs">Previous Customer?</Label>
                <Switch
                  checked={customer.previousCustomer}
                  onCheckedChange={(v) => setCustomer((c) => ({ ...c, previousCustomer: v }))}
                  className="data-[state=checked]:bg-one-gold"
                />
              </div>

              <FormField label="Notes">
                <Textarea
                  value={customer.notes}
                  onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))}
                  placeholder="Any specific requirements or context..."
                  rows={4}
                  className="bg-one-navy border-one-border text-one-white placeholder:text-muted focus:border-one-gold focus:ring-one-gold/20 resize-none"
                />
              </FormField>
            </div>
          </div>

          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => { setCurrentStep(1); scrollToId('templates-section') }}
              data-cursor-label="BACK"
              className="font-label text-xs text-muted hover:text-one-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Templates
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!customerComplete) {
                  toast.error('Please fill in all required fields')
                  return
                }
                setCurrentStep(3)
                scrollToId('builder-section')
              }}
              disabled={!customerComplete}
              className={cn(
                'btn-primary transition-all',
                !customerComplete && 'opacity-50 cursor-not-allowed'
              )}
            >
              Next: Build Package <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: PACKAGE BUILDER ========== */}
      <section id="builder-section" className="bg-surface-deep section-bleed-top section-padding" data-cursor-label="BUILD PACKAGE">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            <WordReveal text="BUILD THE PACKAGE" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted mb-8">Customize what goes into this proposal</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left — Builder */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            >
              <div className="glass-card p-5 mb-4">
                <Label className="font-label text-muted text-xs mb-2 block">Base Package</Label>
                <Select value={basePackage} onValueChange={setBasePackage}>
                  <SelectTrigger className="bg-one-navy border-one-border text-one-white">
                    <SelectValue placeholder="Select base package" />
                  </SelectTrigger>
                  <SelectContent className="bg-one-navy border-one-border">
                    {BASE_PACKAGES.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">
                        {p.name} — {formatCurrency(p.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-h4 text-one-white">Proposal Sections</h3>
                  <span className="font-label text-muted text-[10px]">{includedSections.length} included</span>
                </div>

                <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="space-y-2">
                  {sections.map((section) => (
                    <Reorder.Item key={section.id} value={section} className="relative">
                      <motion.div
                        layout
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                          section.included
                            ? 'bg-one-navy/50 border-one-border hover:border-one-gold/30'
                            : 'bg-transparent border-one-border/30 opacity-60 hover:opacity-80'
                        )}
                        onClick={() => { setActiveSectionId(section.id); if (!section.included) toggleSection(section.id) }}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                            section.included ? 'bg-one-gold border-one-gold' : 'border-muted'
                          )}
                          onClick={(e) => { e.stopPropagation(); toggleSection(section.id) }}
                        >
                          {section.included && <Check size={12} className="text-one-navy" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className={cn('font-body-small truncate block', section.included ? 'text-one-white' : 'text-muted')}>
                            {section.name}
                          </span>
                        </div>

                        {section.included && (
                          <>
                            <button
                              className="text-muted hover:text-one-gold transition-colors"
                              onClick={(e) => { e.stopPropagation(); setActiveSectionId(section.id); scrollToId('editor-section') }}
                              data-cursor-label="EDIT"
                              title="Edit content"
                            >
                              <Edit3 size={14} />
                            </button>
                            <div className="cursor-grab active:cursor-grabbing text-muted hover:text-one-white" onPointerDown={(e) => e.stopPropagation()}>
                              <GripVertical size={14} />
                            </div>
                          </>
                        )}
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </motion.div>

            {/* Right — Live Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="lg:sticky lg:top-24"
            >
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-h4 text-one-white">Live Preview</h3>
                  <span className="font-label text-muted text-[10px]">{includedSections.length} sections</span>
                </div>

                <div className="bg-ivory rounded-lg p-4 text-one-navy min-h-[300px] max-h-[500px] overflow-y-auto">
                  <div className="border-b border-border-light pb-3 mb-3">
                    <h4 className="font-display text-xl text-one-navy">ONE FM</h4>
                    <p className="font-label text-[10px] text-muted mt-1">SPONSORSHIP PROPOSAL</p>
                    <p className="font-body-small text-muted mt-0.5">{customer.companyName || 'Customer Name'} — {today}</p>
                  </div>

                  {includedSections.map((section) => (
                    <div key={section.id} className="mb-3 pb-3 border-b border-border-light/50 last:border-0">
                      <h5 className="font-h4 text-one-navy text-sm mb-1">{section.name}</h5>
                      <p className="font-body-small text-muted text-xs line-clamp-2">
                        {getSectionContent(section).slice(0, 120)}...
                      </p>
                    </div>
                  ))}

                  {includedSections.length === 0 && (
                    <div className="text-center py-8 text-muted font-body-small">No sections selected</div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-one-border">
                  <span className="font-label text-muted text-xs">Estimated Total</span>
                  <span className="font-stat text-gold-gradient text-2xl">{formatCurrency(totalPrice)}</span>
                </div>

                {/* AI Suggestion */}
                {includedSections.length > 3 && !sections.find((s) => s.id === 'roi')?.included && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: easeOutBack }}
                    className="mt-4 bg-one-gold/10 border border-one-gold/30 rounded-lg p-3 flex items-start gap-2"
                  >
                    <Sparkles size={14} className="text-one-gold shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-body-small text-one-white text-xs">
                        Add <span className="text-one-gold">ROI Projection</span> — increases close rate by 23%
                      </p>
                    </div>
                    <button
                      className="text-muted hover:text-one-white"
                      data-cursor-label="ADD"
                      onClick={() => setSections((prev) => prev.map((s) => s.id === 'roi' ? { ...s, included: true } : s))}
                    >
                      <Plus size={14} />
                    </button>
                    <button className="text-muted hover:text-one-white" data-cursor-label="DISMISS" onClick={() => {}}>
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-between mt-10 max-w-[1200px]">
            <button
              onClick={() => { setCurrentStep(2); scrollToId('customer-section') }}
              data-cursor-label="BACK"
              className="font-label text-xs text-muted hover:text-one-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Customer
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setCurrentStep(4); scrollToId('preview-section') }}
              data-cursor-label="PREVIEW"
              className="btn-primary"
            >
              Next: Preview & Export <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ========== SECTION 5: CONTENT EDITOR ========== */}
      {activeSectionId && (
        <section id="editor-section" className="bg-surface-peak section-bleed-top py-20 md:py-24" data-cursor-label="EDIT CONTENT">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            >
              <WordReveal text="REFINE THE CONTENT" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
              <p className="font-body-small text-muted mb-8">Edit, generate, or polish every section</p>
            </motion.div>

            <div className="glass-card p-5">
              {/* Section selector tabs */}
              <ScrollArea className="w-full whitespace-nowrap mb-4">
                <div className="flex gap-2 pb-2">
                  {includedSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      data-cursor-label={section.name.toUpperCase().split(' ')[0]}
                      className={cn(
                        'px-4 py-2 rounded-full font-label text-xs transition-all shrink-0',
                        activeSectionId === section.id
                          ? 'bg-one-gold text-one-navy'
                          : 'bg-one-navy text-muted hover:text-one-white'
                      )}
                    >
                      {section.name}
                    </button>
                  ))}
                </div>
              </ScrollArea>

              {/* Editor mode tabs */}
              <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as 'edit' | 'ai' | 'data')}>
                <TabsList className="bg-one-navy mb-4">
                  <TabsTrigger value="edit" className="font-label text-xs data-[state=active]:bg-one-gold data-[state=active]:text-one-navy">
                    <Edit3 size={12} className="mr-1" /> Edit
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="font-label text-xs data-[state=active]:bg-one-gold data-[state=active]:text-one-navy">
                    <Wand2 size={12} className="mr-1" /> AI Generate
                  </TabsTrigger>
                  <TabsTrigger value="data" className="font-label text-xs data-[state=active]:bg-one-gold data-[state=active]:text-one-navy">
                    <Database size={12} className="mr-1" /> Data Insert
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="edit" className="mt-0">
                    <motion.div
                      key={activeSectionId + 'edit'}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-3 bg-one-navy rounded-lg p-2">
                        <button data-cursor-label="BOLD" className="p-1.5 rounded hover:bg-one-gold/20 text-one-white hover:text-one-gold transition-colors font-bold text-sm">B</button>
                        <button data-cursor-label="ITALIC" className="p-1.5 rounded hover:bg-one-gold/20 text-one-white hover:text-one-gold transition-colors italic text-sm">I</button>
                        <button data-cursor-label="HEADING" className="p-1.5 rounded hover:bg-one-gold/20 text-one-white hover:text-one-gold transition-colors text-sm">H</button>
                        <button data-cursor-label="LIST" className="p-1.5 rounded hover:bg-one-gold/20 text-one-white hover:text-one-gold transition-colors text-sm">•</button>
                        <button data-cursor-label="LINK" className="p-1.5 rounded hover:bg-one-gold/20 text-one-white hover:text-one-gold transition-colors text-sm">🔗</button>
                      </div>
                      <Textarea
                        value={sections.find((s) => s.id === activeSectionId)?.customText || ''}
                        onChange={(e) => setSections((prev) => prev.map((s) => s.id === activeSectionId ? { ...s, customText: e.target.value, contentMode: 'custom' } : s))}
                        placeholder={`Write content for ${sections.find((s) => s.id === activeSectionId)?.name}...`}
                        rows={12}
                        className="bg-one-navy border-one-border text-one-white placeholder:text-muted focus:border-one-gold focus:ring-one-gold/20 resize-none font-body"
                      />
                      <div className="flex justify-between mt-2">
                        <span className="font-label text-[10px] text-muted">
                          {(sections.find((s) => s.id === activeSectionId)?.customText || '').length} characters
                        </span>
                        <Button
                          size="sm"
                          className="bg-one-gold text-one-navy hover:bg-one-gold font-label text-xs rounded-full"
                          onClick={() => toast.success('Content saved')}
                        >
                          <Check size={12} className="mr-1" /> Save
                        </Button>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-0">
                    <motion.div
                      key={activeSectionId + 'ai'}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label className="font-label text-muted text-xs mb-2 block">Prompt</Label>
                        <Textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Describe what this section should say..."
                          rows={3}
                          className="bg-one-navy border-one-border text-one-white placeholder:text-muted focus:border-one-gold focus:ring-one-gold/20 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-label text-muted text-xs mb-2 block">Tone</Label>
                          <Select value={aiTone} onValueChange={setAiTone}>
                            <SelectTrigger className="bg-one-navy border-one-border text-one-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-one-navy border-one-border">
                              {['Professional', 'Energetic', 'Formal', 'Casual'].map((t) => (
                                <SelectItem key={t} value={t} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="font-label text-muted text-xs mb-2 block">Length: {aiLength[0]}%</Label>
                          <Slider value={aiLength} onValueChange={setAiLength} max={100} step={10} className="py-2" />
                        </div>
                      </div>
                      <Button
                        className="bg-one-gold text-one-navy hover:bg-one-gold font-label text-xs rounded-full"
                        onClick={() => handleGenerateAI(activeSectionId)}
                        disabled={aiGenerating}
                      >
                        {aiGenerating ? <Loader2 size={14} className="animate-spin mr-1" /> : <Sparkles size={14} className="mr-1" />}
                        {aiGenerating ? 'Generating...' : 'Generate Content'}
                      </Button>

                      {sections.find((s) => s.id === activeSectionId)?.aiText && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4"
                        >
                          <Label className="font-label text-muted text-xs mb-2 block">Generated Content</Label>
                          <div className="bg-one-navy border border-one-border rounded-lg p-4 min-h-[150px] font-body text-one-white text-sm whitespace-pre-wrap">
                            {sections.find((s) => s.id === activeSectionId)?.aiText}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="bg-one-gold text-one-navy hover:bg-one-gold font-label text-xs rounded-full"
                              onClick={() => {
                                const aiText = sections.find((s) => s.id === activeSectionId)?.aiText || ''
                                setSections((prev) => prev.map((s) => s.id === activeSectionId ? { ...s, customText: aiText, contentMode: 'custom' } : s))
                                setEditorMode('edit')
                                toast.success('Content applied')
                              }}
                            >
                              <Check size={12} className="mr-1" /> Use This
                            </Button>
                            <Button size="sm" variant="outline" className="font-label text-xs rounded-full border-ivory/40"
                              onClick={() => handleGenerateAI(activeSectionId)}
                            >
                              <RotateCcw size={12} className="mr-1" /> Regenerate
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="data" className="mt-0">
                    <motion.div
                      key={activeSectionId + 'data'}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="font-body-small text-muted mb-4">Click a token to insert it at cursor position</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {DATA_TOKENS.map((token) => (
                          <button
                            key={token.token}
                            onClick={() => insertToken(token.token)}
                            data-cursor-label="INSERT"
                            className="glass-card p-3 text-left hover:border-one-gold/40 transition-colors group relative overflow-hidden"
                          >
                            <div aria-hidden className="explore-tile-scan" />
                            <span className="font-label text-[10px] text-one-gold group-hover:text-one-gold transition-colors">{token.token}</span>
                            <p className="font-body-small text-one-white text-xs mt-1">{token.label}</p>
                            <p className="font-mono text-[10px] text-muted mt-0.5">
                              {token.token === '[CUSTOMER_NAME]' ? customer.companyName || '—' :
                                token.token === '[CAMPAIGN_DURATION]' ? customer.campaignDuration || '—' :
                                  token.token === '[PACKAGE_PRICE]' ? formatCurrency(totalPrice) : token.value}
                            </p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </div>
          </div>
        </section>
      )}

      {/* ========== SECTION 6: PROPOSAL PREVIEW ========== */}
      <section id="preview-section" className="bg-surface-warm section-bleed-top section-padding" data-cursor-label="PREVIEW">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            <WordReveal text="PREVIEW YOUR PROPOSAL" className="font-h2 text-one-white mb-2 block" as="h2" stagger={0.05} />
            <p className="font-body-small text-muted mb-8">See exactly what your customer will receive</p>
          </motion.div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button
              variant="outline"
              className="rounded-full font-label text-xs border-ivory/40 text-one-white hover:bg-ivory/10"
              onClick={() => scrollToId('editor-section')}
            >
              <Edit3 size={12} className="mr-1" /> Edit Content
            </Button>
            <Button
              variant="outline"
              className="rounded-full font-label text-xs border-ivory/40 text-one-white hover:bg-ivory/10"
              onClick={() => scrollToId('templates-section')}
            >
              <LayoutTemplate size={12} className="mr-1" /> Change Template
            </Button>
            <div className="flex-1" />
            <Button
              className="rounded-full font-label text-xs bg-one-gold text-one-navy hover:bg-one-gold"
              onClick={handleExportPDF}
              disabled={pdfGenerating}
            >
              {pdfGenerating ? <Loader2 size={14} className="animate-spin mr-1" /> : <FileDown size={14} className="mr-1" />}
              {pdfGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
            <Button
              variant="outline"
              className="rounded-full font-label text-xs border-ivory/40 text-one-white hover:bg-ivory/10"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 size={12} className="mr-1" /> Share Link
            </Button>
            <Button
              variant="ghost"
              className="rounded-full font-label text-xs text-muted hover:text-one-white"
              onClick={() => toast.success('Draft saved')}
            >
              Save Draft
            </Button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2 mb-4 justify-end">
            <button onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))} data-cursor-label="ZOOM OUT" className="p-1.5 rounded hover:bg-ivory/10 text-muted hover:text-one-white transition-colors">
              <ZoomOut size={14} />
            </button>
            <span className="font-label text-[10px] text-muted w-12 text-center">{Math.round(previewZoom * 100)}%</span>
            <button onClick={() => setPreviewZoom((z) => Math.min(1.5, z + 0.25))} data-cursor-label="ZOOM IN" className="p-1.5 rounded hover:bg-ivory/10 text-muted hover:text-one-white transition-colors">
              <ZoomIn size={14} />
            </button>
            <button onClick={() => setPreviewZoom(1)} data-cursor-label="FIT" className="p-1.5 rounded hover:bg-ivory/10 text-muted hover:text-one-white transition-colors">
              <Maximize2 size={14} />
            </button>
          </div>

          {/* Document Viewer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
            className="glass-card p-4 overflow-hidden"
          >
            <div
              className="bg-white rounded-lg overflow-y-auto mx-auto origin-top"
              style={{
                width: `${Math.min(100, previewZoom * 100)}%`,
                maxHeight: 800,
                aspectRatio: '210/297',
              }}
            >
              <div ref={proposalRef} className="p-8 md:p-12 text-one-navy" style={{ minHeight: 800 }}>
                {/* Header */}
                <div className="border-b-2 border-onyx pb-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-display text-4xl text-one-navy">ONE FM</h1>
                      <p className="font-label text-[10px] text-muted mt-1">PREMIER HERITAGE BROADCASTER</p>
                    </div>
                    <div className="text-right">
                      <p className="font-label text-[10px] text-muted">PROPOSAL</p>
                      <p className="font-mono text-xs text-one-navy">{today}</p>
                    </div>
                  </div>
                </div>

                {/* Title block */}
                <div className="mb-10">
                  <h2 className="font-h2 text-one-navy mb-2">Sponsorship Proposal</h2>
                  <p className="font-body text-muted">
                    Prepared for: <span className="text-one-navy font-medium">{customer.companyName || '[Company Name]'}</span>
                  </p>
                  <p className="font-body text-muted">
                    Contact: <span className="text-one-navy">{customer.contactName || '[Contact Name]'} {customer.contactTitle ? `(${customer.contactTitle})` : ''}</span>
                  </p>
                  {customer.campaignGoal && (
                    <p className="font-body text-muted mt-1">
                      Campaign Goal: <span className="text-one-navy">{customer.campaignGoal}</span>
                    </p>
                  )}
                </div>

                {/* Sections */}
                {includedSections.map((section, idx) => (
                  <div key={section.id} className="mb-8 pb-6 border-b border-border-light/50">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-stat text-gold-gradient text-2xl">{String(idx + 1).padStart(2, '0')}</span>
                      <h3 className="font-h3 text-one-navy">{section.name}</h3>
                    </div>
                    <div className="font-body text-one-navy/80 leading-relaxed whitespace-pre-wrap">
                      {getSectionContent(section)}
                    </div>
                  </div>
                ))}

                {/* Pricing summary */}
                <div className="mt-10 pt-6 border-t-2 border-one-gold">
                  <h3 className="font-h3 text-one-navy mb-4">Investment Summary</h3>
                  <div className="flex items-center justify-between py-3 border-b border-border-light/30">
                    <span className="font-body text-muted">Base Package ({BASE_PACKAGES.find((p) => p.id === basePackage)?.name})</span>
                    <span className="font-mono text-one-navy">{formatCurrency(packagePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <span className="font-h4 text-one-navy">Total Investment</span>
                    <span className="font-stat text-gold-gradient text-3xl">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-border-light/30 text-center">
                  <p className="font-label text-[10px] text-muted">
                    ONE FM 98.5 • 47 Parkside Drive, Shepparton VIC 3630 • admin@fm985.com.au
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== SECTION 7: EXPORT & SHARE ========== */}
      <section id="export-section" className="bg-surface-glow section-bleed-top py-20 md:py-24" data-cursor-label="EXPORT">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center">
          {!successState ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, ease: easeOutExpo }}
              >
                <WordReveal text="EXPORT & SHARE" className="font-h2 text-one-white mb-3 block" as="h2" stagger={0.06} />
                <p className="font-body text-one-white mb-10">Your proposal is ready. Choose how to deliver it.</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TiltCard maxTilt={5} className="h-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0, ease: easeOutExpo }}
                  className="h-full"
                >
                  <button
                    onClick={handleExportPDF}
                    disabled={pdfGenerating}
                    data-cursor-label={pdfGenerating ? 'GENERATING' : 'PDF'}
                    className="glass-card p-6 w-full h-full flex flex-col items-center gap-3 hover:border-one-gold/40 transition-all group relative overflow-hidden"
                  >
                    <div aria-hidden className="explore-tile-scan" />
                    <div className="w-12 h-12 rounded-full bg-one-gold/20 flex items-center justify-center group-hover:bg-one-gold/30 transition-colors">
                      <FileDown size={24} className="text-one-gold" />
                    </div>
                    <span className="font-label text-xs text-one-white">Download PDF</span>
                    <span className="font-body-small text-muted text-xs">Export as printable document</span>
                  </button>
                </motion.div>
                </TiltCard>

                <TiltCard maxTilt={5} className="h-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
                  className="h-full"
                >
                  <button
                    onClick={() => setEmailModalOpen(true)}
                    data-cursor-label="EMAIL"
                    className="glass-card p-6 w-full h-full flex flex-col items-center gap-3 hover:border-one-gold/40 transition-all group relative overflow-hidden"
                  >
                    <div aria-hidden className="explore-tile-scan" />
                    <div className="w-12 h-12 rounded-full bg-ivory/10 flex items-center justify-center group-hover:bg-ivory/20 transition-colors">
                      <Mail size={24} className="text-one-white" />
                    </div>
                    <span className="font-label text-xs text-one-white">Email to Customer</span>
                    <span className="font-body-small text-muted text-xs">Send directly to {customer.contactEmail || 'customer'}</span>
                  </button>
                </motion.div>
                </TiltCard>

                <TiltCard maxTilt={5} className="h-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2, ease: easeOutExpo }}
                  className="h-full"
                >
                  <button
                    onClick={() => { setShareModalOpen(true); handleGenerateShareLink() }}
                    data-cursor-label="SHARE"
                    className="glass-card p-6 w-full h-full flex flex-col items-center gap-3 hover:border-one-gold/40 transition-all group relative overflow-hidden"
                  >
                    <div aria-hidden className="explore-tile-scan" />
                    <div className="w-12 h-12 rounded-full bg-ivory/10 flex items-center justify-center group-hover:bg-ivory/20 transition-colors">
                      <LinkIcon size={24} className="text-one-white" />
                    </div>
                    <span className="font-label text-xs text-one-white">Generate Share Link</span>
                    <span className="font-body-small text-muted text-xs">Create a shareable preview URL</span>
                  </button>
                </motion.div>
                </TiltCard>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="py-12"
            >
              <div className="w-20 h-20 rounded-full bg-data-teal/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-data-teal" />
              </div>
              <h2 className="font-h2 text-data-teal mb-3">Proposal Sent!</h2>
              <p className="font-body text-one-white mb-8">
                Your proposal has been sent to {customer.contactEmail || 'the customer'} successfully.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => { setSuccessState(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  data-cursor-label="NEW"
                  className="font-label text-xs text-one-gold hover:text-one-gold transition-colors link-hover"
                >
                  Create another proposal
                </button>
                <Link to="/" data-cursor-label="HOME" className="font-label text-xs text-muted hover:text-one-white transition-colors">
                  Back to Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ========== EMAIL MODAL ========== */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="bg-one-navy border-one-border text-one-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-h3 text-one-white">Email Proposal</DialogTitle>
            <DialogDescription className="font-body-small text-muted">
              Send this proposal directly to your customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="font-label text-muted text-xs">To</Label>
              <Input
                value={customer.contactEmail}
                onChange={(e) => setCustomer((c) => ({ ...c, contactEmail: e.target.value }))}
                className="bg-one-navy border-one-border text-one-white mt-1"
              />
            </div>
            <div>
              <Label className="font-label text-muted text-xs">Subject</Label>
              <Input
                value={`ONE FM Sponsorship Proposal for ${customer.companyName || 'Your Company'}`}
                className="bg-one-navy border-one-border text-one-white mt-1"
                readOnly
              />
            </div>
            <div>
              <Label className="font-label text-muted text-xs">Message</Label>
              <Textarea
                rows={5}
                defaultValue={`Hi ${customer.contactName || 'there'},

Thank you for your interest in partnering with ONE FM. Please find attached our tailored sponsorship proposal for ${customer.companyName || 'your company'}.

We're excited about the possibility of working together and look forward to discussing how we can help you achieve your ${customer.campaignGoal || 'marketing goals'}.

Best regards,
The ONE FM Partnerships Team`}
                className="bg-one-navy border-one-border text-one-white mt-1 resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch defaultChecked className="data-[state=checked]:bg-one-gold" />
              <Label className="font-body-small text-one-white text-xs">Attach PDF</Label>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" className="rounded-full font-label text-xs border-ivory/40" onClick={() => setEmailModalOpen(false)}>Cancel</Button>
              <Button className="rounded-full font-label text-xs bg-one-gold text-one-navy hover:bg-one-gold" onClick={handleSendEmail}>
                <Send size={12} className="mr-1" /> Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== SHARE MODAL ========== */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="bg-one-navy border-one-border text-one-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-h3 text-one-white">Share Link</DialogTitle>
            <DialogDescription className="font-body-small text-muted">
              Generate a shareable preview URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {shareUrl && (
              <div className="bg-one-navy border border-one-border rounded-lg p-3 flex items-center gap-2">
                <LinkIcon size={14} className="text-muted shrink-0" />
                <span className="font-mono text-xs text-one-white truncate flex-1">{shareUrl}</span>
                <button onClick={handleCopyLink} data-cursor-label="COPY" className="p-1.5 rounded hover:bg-one-gold/20 text-one-gold transition-colors">
                  <Copy size={14} />
                </button>
              </div>
            )}
            {!shareUrl && (
              <Button className="w-full bg-one-gold text-one-navy hover:bg-one-gold font-label text-xs rounded-full" onClick={handleGenerateShareLink}>
                <LinkIcon size={12} className="mr-1" /> Generate Link
              </Button>
            )}
            <div>
              <Label className="font-label text-muted text-xs mb-2 block">Link Expiry</Label>
              <Select value={shareExpiry} onValueChange={setShareExpiry}>
                <SelectTrigger className="bg-one-navy border-one-border text-one-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-one-navy border-one-border">
                  {['7 days', '30 days', '90 days'].map((d) => (
                    <SelectItem key={d} value={d} className="text-one-white focus:bg-one-gold/10 focus:text-one-gold">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={sharePassword} onCheckedChange={setSharePassword} className="data-[state=checked]:bg-one-gold" />
                <Label className="font-body-small text-one-white text-xs">Password Protection</Label>
              </div>
              <Shield size={14} className="text-muted" />
            </div>
            {sharePassword && (
              <Input
                type="password"
                placeholder="Set password..."
                className="bg-one-navy border-one-border text-one-white"
              />
            )}
            {shareUrl && (
              <div className="flex justify-center py-4">
                <div className="w-32 h-32 bg-ivory rounded-lg flex items-center justify-center">
                  <QrCode size={48} className="text-one-navy" />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-label text-muted text-xs flex items-center gap-1">
        {label}
        {required && <span className="text-one-red">*</span>}
      </Label>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Default content generator                                          */
/* ------------------------------------------------------------------ */

function getDefaultContent(sectionId: string, customer: CustomerForm): string {
  const name = customer.companyName || '[Company]'
  const goal = customer.campaignGoal || 'your campaign goals'
  const duration = customer.campaignDuration || 'the campaign period'

  const contents: Record<string, string> = {
    'exec-summary': `This proposal outlines a strategic partnership between ONE FM 98.5 and ${name} to achieve ${goal}. As the Goulburn Murray's community broadcaster, we reach an estimated ${stationStats.weeklyListeners.toLocaleString()} weekly listeners across ${stationStats.totalTowns} towns within our ${stationStats.broadcastRadiusKm}km broadcast area. We are positioned to deliver genuine regional results for ${duration}.`,
    'about': `ONE FM 98.5 (callsign 3ONE) is operated by Goulburn Valley Community Radio Inc., a not-for-profit organisation licensed since 1989. Broadcasting from Shepparton, we connect communities across the Goulburn Murray region with live local content, community news, sport, and diverse multicultural programming.`,
    'audience': `ONE FM reaches an estimated ${stationStats.weeklyListeners.toLocaleString()} weekly listeners across ${stationStats.totalTowns} towns in the Goulburn Murray region (source: townData census estimates, ABS 2021). Our audience is local, community-focused, and trusts the station to reflect their region.`,
    'platform': `ONE FM delivers reach across:
• FM Broadcast: 98.5 FM, ~${stationStats.broadcastRadiusKm}km radius, ${stationStats.totalTowns} towns
• Live Stream: fm985.com.au · Community Radio Plus app
• Interviews & content: SoundCloud (soundcloud.com/user-570295409)
• Facebook: facebook.com/onefmshepparton`,
    'package': `Based on your ${goal} objectives and ${customer.budgetRange || 'budget range'}, we recommend a package that includes on-air spots, community mentions, and digital integration for ${duration}. All packages are tailored to your business and confirmed in writing.`,
    'pricing': `All pricing is confirmed in your contract. Rate cards are available from our sponsorship team at admin@fm985.com.au or (03) 5831 3131.`,
    'case-studies': `Contact us at admin@fm985.com.au for case studies from current and past sponsors across the Goulburn Murray region.`,
    'timeline': `Proposed timeline:
• Week 1: Contract finalization and creative briefing
• Week 2-3: Asset production and approval
• Week 4: Campaign launch
• Ongoing: Confirmation reports from station

Next steps: Contact admin@fm985.com.au or (03) 5831 3131.`,
    'terms': `Standard terms include:
• 50% deposit upon contract signing
• Balance due 30 days from campaign start
• Cancellation policy: 14 days notice required
• All rates exclude applicable GST`,
    'regional-map': `ONE FM 98.5 covers the Goulburn Murray region from Shepparton, reaching 25 towns within approximately 100km. Key communities include Shepparton, Mooroopna, Cobram, Echuca, Kyabram, Benalla, and surrounds.`,
    'social-strategy': `ONE FM maintains an active community Facebook page at facebook.com/onefmshepparton. Social mentions can be included as part of your sponsorship package.`,
    'podcast': `ONE FM produces local interviews available on SoundCloud (soundcloud.com/user-570295409). Sponsorship of interview segments is available — contact us for current options.`,
    'event-activation': `ONE FM regularly broadcasts live from community events across the Goulburn Murray. Contact us to discuss outside broadcast and event sponsorship packages.`,
    'competitive': `ONE FM is the only locally-owned community radio station broadcasting across the Goulburn Murray region, operated by Goulburn Valley Community Radio Inc.`,
    'roi': `Return on investment varies by campaign. Our sponsorship team can discuss your objectives and provide honest guidance on expected outcomes for your business.`,
  }

  return contents[sectionId] || 'Section content to be customized.'
}

function generateAIContent(sectionName: string, tone: string, length: number, customer: CustomerForm): string {
  const name = customer.companyName || 'your company'
  const goal = customer.campaignGoal || 'marketing goals'
  const industry = customer.industry || 'your industry'

  const toneAdj = tone === 'Energetic' ? 'exciting and dynamic' : tone === 'Formal' ? 'formal and detailed' : tone === 'Casual' ? 'friendly and approachable' : 'professional and polished'

  const lengthFactor = length / 100

  const templates: Record<string, string> = {
    'Executive Summary': `ONE FM 98.5 is proud to present this ${toneAdj} sponsorship opportunity for ${name}. As the Goulburn Murray's community broadcaster (callsign 3ONE, operated by Goulburn Valley Community Radio Inc.), we connect an estimated ${stationStats.weeklyListeners.toLocaleString()} weekly listeners across ${stationStats.totalTowns} towns. This proposal outlines a partnership designed to deliver genuine regional reach over ${customer.campaignDuration || 'the campaign period'}.`,
    'About ONE FM': `ONE FM 98.5 has been serving the Goulburn Murray since 1980, licensed as a community broadcaster since 1989. We are a not-for-profit, volunteer-supported station operated by Goulburn Valley Community Radio Inc. Our programming includes local news, community announcements, sport, multicultural content, and music — live and local every day.`,
    'Audience Overview': `ONE FM reaches an estimated ${stationStats.weeklyListeners.toLocaleString()} weekly listeners across ${stationStats.totalTowns} towns in the Goulburn Murray region (source: townData census estimates based on ABS 2021 population data). Our audience is local, community-connected, and loyal to a station that reflects their region. ${length > 50 ? 'Morning breakfast (6–9am) is our strongest engagement period, with consistent listenership throughout the day.' : ''}`,
    'Platform Reach': `ONE FM 98.5 delivers reach through FM broadcast (98.5 FM, ~${stationStats.broadcastRadiusKm}km radius), live streaming via fm985.com.au and the Community Radio Plus app, community Facebook (facebook.com/onefmshepparton), and SoundCloud interview content. ${length > 60 ? 'Our integrated presence ensures your brand is heard across multiple touchpoints in the Goulburn Murray community.' : ''}`,
    'Proposed Package': `For ${name}, we recommend a ${customer.budgetRange || 'customized'} package that aligns with your ${goal} objectives. This includes prime on-air placement during high-engagement dayparts, digital companion assets for streaming and web, and social media amplification to extend reach beyond the broadcast. ${length > 50 ? 'Optional add-ons include podcast integration, event activation, and regional coverage mapping for enhanced geographic targeting.' : ''}`,
    'Pricing & Rates': `Our pricing structure is transparent and value-driven. The base package investment of ${customer.budgetRange || '$TBD'} includes all core deliverables with volume discounts available for extended campaigns. ${length > 50 ? 'Additional sections such as ROI projections, competitive analysis, and social strategy can be added à la carte. Payment terms are flexible with 50% deposit and balance due 30 days from campaign commencement.' : ''}`,
    'Case Studies': `Contact us at admin@fm985.com.au for case studies and references from current and past sponsors in the Goulburn Murray region. We're happy to connect you with sponsors who can speak to their experience with ONE FM 98.5.`,
    'Timeline & Next Steps': `We propose a streamlined timeline: Week 1 for contract and creative briefing, Weeks 2-3 for production and approvals, and Week 4 for launch. ${length > 50 ? 'Our dedicated account team will provide weekly performance reports and mid-campaign optimization recommendations.' : ''} Ready to move forward? Let's schedule a kickoff call.`,
    'Terms & Conditions': `Standard terms apply: 50% deposit on contract signing, balance due 30 days from campaign start, 14-day cancellation notice. ${length > 50 ? 'All creative assets must be approved 5 business days before air date. ONE FM retains the right to refuse content that does not meet broadcast standards.' : ''}`,
  }

  const base = templates[sectionName] || `This section provides ${toneAdj} content about ${name}'s ${goal} campaign with ONE FM. Our partnership will leverage the station's extensive reach and engaged audience to deliver impactful results for the ${industry} sector. ${length > 50 ? 'The campaign strategy is designed to maximize brand exposure and drive measurable outcomes across all ONE FM platforms.' : ''}`

  // Trim based on length factor
  const words = base.split(' ')
  const targetWords = Math.max(30, Math.floor(words.length * lengthFactor))
  return words.slice(0, targetWords).join(' ') + (targetWords < words.length ? '.' : '')
}
