import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ElementType } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { StripeProvider } from '@/components/StripeProvider'
import {
  Heart,
  Radio,
  AlertTriangle,
  GraduationCap,
  Users,
  Megaphone,
  Share2,
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  Lock,
  ArrowRight,
  Sparkles,
  FileText,
  Shield,
  Star,
  Award,
  Trophy,
  Crown,
  DollarSign,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

interface Tier {
  id: string
  name: string
  amount: number
  icon: ElementType
  benefits: string
  popular?: boolean
}

const tiers: Tier[] = [
  {
    id: 'bronze',
    name: 'Bronze Supporter',
    amount: 10,
    icon: Award,
    benefits: 'Community supporter badge, newsletter access',
  },
  {
    id: 'silver',
    name: 'Silver Supporter',
    amount: 25,
    icon: Star,
    benefits: '+ Shoutout on air, exclusive event invites',
    popular: true,
  },
  {
    id: 'gold',
    name: 'Gold Supporter',
    amount: 50,
    icon: Trophy,
    benefits: '+ Name on sponsor wall, quarterly meet & greet',
  },
  {
    id: 'patron',
    name: 'Community Patron',
    amount: 100,
    icon: Crown,
    benefits: '+ On-air thanks monthly, VIP event access, station tour',
  },
]

const oneOffTier: Tier = {
  id: 'oneoff',
  name: 'One-off Donation',
  amount: 0,
  icon: DollarSign,
  benefits: 'Any amount helps. Tax deductible.',
}

const pieData = [
  { name: 'Programming & Broadcasting', value: 45, color: '#D4963A' },
  { name: 'Community Projects', value: 25, color: '#2EC4B6' },
  { name: 'Equipment & Technology', value: 15, color: '#00BBF9' },
  { name: 'Training & Youth Programs', value: 10, color: '#9B5DE5' },
  { name: 'Administration', value: 5, color: '#6B6B75' },
]

const patronNames = [
  'Margaret & John Thompson',
  'Shepparton Rotary Club',
  'The Chen Family',
  'Goulburn Valley Health',
  'Mooroopna Lions Club',
  'The Paterson Family',
  'Kyabram Community Bank',
  'Tatura Mens Shed',
  'The Williams Family',
  'Numurkah Golf Club',
  'The Nguyen Family',
  'Goulburn Valley Grammar',
]

const impactCards = [
  {
    icon: Heart,
    title: 'Keep Local Voices Alive',
    desc: 'Without local radio, the Valley loses its voice.',
  },
  {
    icon: Radio,
    title: 'Support 100+ NFPs',
    desc: 'We donate airtime to charities and community groups.',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Broadcasting',
    desc: '24/7 emergency alerts during bushfires and floods.',
  },
  {
    icon: GraduationCap,
    title: 'Youth & Education',
    desc: 'Training the next generation of broadcasters.',
  },
]

const otherWays = [
  {
    icon: Users,
    title: 'Volunteer at the station',
    desc: 'Join our crew and go behind the mic.',
    action: 'Learn more',
    href: '#',
  },
  {
    icon: Megaphone,
    title: 'Sponsor a program',
    desc: 'Partner with a show that aligns with your brand.',
    action: 'View packages',
    href: '/sponsorship',
  },
  {
    icon: Share2,
    title: 'Spread the word on social',
    desc: 'Follow, share, and tag us to grow our reach.',
    action: 'Follow ONE FM',
    href: '#',
  },
  {
    icon: Calendar,
    title: 'Attend fundraising events',
    desc: 'Meet the community at our next gathering.',
    action: 'See events',
    href: '#',
  },
]

/* ------------------------------------------------------------------ */
/*  Animated Counter                                                   */
/* ------------------------------------------------------------------ */

function AnimatedCounter({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
}: {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true)
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    let raf: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [started, end, duration])

  const formatted = count.toLocaleString()
  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 1 — Hero                                                  */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(212,150,58,0.25) 0%, rgba(10,22,40,1) 40%, rgba(13,13,13,1) 100%)',
        }}
      />
      <div className="absolute inset-0 z-0 opacity-30">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: 'rgba(212,168,75,0.2)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-32 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center"
        >
          <span className="inline-block font-label text-one-gold mb-4 tracking-widest">
            COMMUNITY RADIO SINCE 1989
          </span>
          <h1 className="font-hero text-one-white mb-6 tracking-tight">
            SUPPORT{' '}
            <span className="text-gradient-spectrum">ONE FM</span>
          </h1>
          <p className="font-body text-one-white max-w-2xl mx-auto mb-12">
            Community radio thrives because of community support. Every dollar
            keeps local voices on air.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: 39375, label: 'Weekly Listeners', suffix: '' },
            { value: 100, label: 'NFPs Supported', suffix: '+' },
            { value: 25, label: 'Communities', suffix: '' },
            { value: 37, label: 'Years on Air', suffix: '' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3 + i * 0.1,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="glass-card p-6 text-center"
            >
              <div className="font-stat text-one-gold mb-1">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-label text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.8,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 glass-card px-8 py-4">
            <TrendingUp size={20} className="text-one-gold" />
            <span className="font-label text-one-white">
              TOTAL COMMUNITY SUPPORT
            </span>
            <span className="font-stat text-one-white">
              <AnimatedCounter prefix="$" end={124580} />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 2 — Why Support                                           */
/* ------------------------------------------------------------------ */

function WhySupportSection() {
  return (
    <section className="section-padding bg-one-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-one-white mb-4">Why Support ONE FM?</h2>
          <p className="font-body text-one-white max-w-xl mx-auto">
            Your contribution directly strengthens the Goulburn Valley&rsquo;s
            most trusted community voice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
              >
                <div className="glass-card p-6 h-full transition-all duration-300 hover:border-one-gold/30 hover:scale-[1.01]">
                  <div className="w-12 h-12 rounded-lg bg-one-gold/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-one-gold" />
                  </div>
                  <h3 className="font-h4 text-one-white mb-2">{card.title}</h3>
                  <p className="font-body-small text-one-white">{card.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 3 — Supporter Tiers                                       */
/* ------------------------------------------------------------------ */

function TierCard({
  tier,
  onSelect,
}: {
  tier: Tier
  onSelect: (id: string) => void
}) {
  const Icon = tier.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      <div
        className={`glass-card p-6 h-full relative overflow-hidden transition-all duration-300 hover:border-one-gold/30 hover:scale-[1.01] ${
          tier.popular ? 'ring-2 ring-amber/40' : ''
        }`}
      >
        {tier.popular && (
          <div className="absolute top-0 right-0 bg-one-gold text-one-navy font-label text-xs px-3 py-1 rounded-bl-lg">
            Most Popular
          </div>
        )}
        <div className="absolute top-0 left-0 bg-sage/80 text-one-navy font-label text-xs px-3 py-1 rounded-br-lg">
          Tax Deductible
        </div>
        <div className="pt-4">
          <div className="w-12 h-12 rounded-full bg-one-gold/10 flex items-center justify-center mb-4">
            <Icon size={24} className="text-one-gold" />
          </div>
          <h3 className="font-h3 text-one-white mb-1">{tier.name}</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="font-stat text-one-gold">${tier.amount}</span>
            <span className="font-body-small text-one-white">/month</span>
          </div>
          <p className="font-body-small text-one-white mb-6">{tier.benefits}</p>
          <button
            onClick={() => onSelect(tier.id)}
            className="w-full btn-primary"
          >
            Select <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function TiersSection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <section className="section-padding bg-one-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-one-white mb-4">Choose Your Impact</h2>
          <p className="font-body text-one-white max-w-xl mx-auto">
            Monthly supporters power our station year-round. Every tier is
            fully tax-deductible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} onSelect={onSelect} />
          ))}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
          >
            <div className="glass-card p-6 h-full relative overflow-hidden transition-all duration-300 hover:border-one-gold/30 hover:scale-[1.01]">
              <div className="absolute top-0 left-0 bg-sage/80 text-one-navy font-label text-xs px-3 py-1 rounded-br-lg">
                Tax Deductible
              </div>
              <div className="pt-4">
                <div className="w-12 h-12 rounded-full bg-one-gold/10 flex items-center justify-center mb-4">
                  <DollarSign size={24} className="text-one-gold" />
                </div>
                <h3 className="font-h3 text-one-white mb-1">
                  {oneOffTier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-stat text-one-gold">Any</span>
                  <span className="font-body-small text-one-white">amount</span>
                </div>
                <p className="font-body-small text-one-white mb-6">
                  {oneOffTier.benefits}
                </p>
                <button
                  onClick={() => onSelect(oneOffTier.id)}
                  className="w-full btn-secondary"
                >
                  Donate Once <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 4 — Donation Form (Stripe-Ready)                            */
/* ------------------------------------------------------------------ */

interface FormData {
  tier: string | null
  amount: number
  donationType: 'monthly' | 'one-off'
  name: string
  email: string
  phone: string
  address: string
  state: string
  coverFees: boolean
  anonymous: boolean
  giftInHonor: string
}

function DonationFormSection({
  selectedTier,
  initialAmount,
}: {
  selectedTier: string | null
  initialAmount?: number
}) {
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const tierMap = useMemo(() => {
    const map: Record<string, number> = {}
    tiers.forEach((t) => (map[t.id] = t.amount))
    map['oneoff'] = 50
    return map
  }, [])

  const defaultAmount = selectedTier
    ? (initialAmount !== undefined ? initialAmount : (tierMap[selectedTier] || 50))
    : 50
  const defaultType = selectedTier === 'oneoff' ? 'one-off' : 'monthly'

  const [form, setForm] = useState<FormData>({
    tier: selectedTier,
    amount: defaultAmount,
    donationType: defaultType,
    name: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    coverFees: false,
    anonymous: false,
    giftInHonor: '',
  })

  useEffect(() => {
    if (selectedTier) {
      const amt =
        initialAmount !== undefined
          ? initialAmount
          : (tierMap[selectedTier] || 50)
      const typ = selectedTier === 'oneoff' ? 'one-off' : 'monthly'
      setForm((f) => ({
        ...f,
        tier: selectedTier,
        amount: amt,
        donationType: typ,
      }))
      setStep(1)
      setIsSuccess(false)
    }
  }, [selectedTier, tierMap, initialAmount])

  const totalAmount =
    form.amount + (form.coverFees && form.donationType === 'one-off' ? 1.5 : 0)

  const handleNext = () => setStep((s) => Math.min(s + 1, 4))
  const handleBack = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = useCallback(() => {
    setIsProcessing(true)
    // Stripe backend integration required — connect to your Stripe account and backend API
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
      setStep(4)
    }, 2500)
  }, [])

  const update = useCallback(
    (field: keyof FormData, value: unknown) => {
      setForm((f) => ({ ...f, [field]: value }))
    },
    []
  )

  return (
    <section className="section-padding bg-one-navy">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-h2 text-one-white mb-4">Complete Your Donation</h2>
          <p className="font-body text-one-white">
            Secure, tax-deductible, and powering local radio.
          </p>
        </div>

        <StripeProvider>
          <div className="glass-card p-6 md:p-10">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-10">
              {['Amount', 'Details', 'Payment', 'Confirm'].map((label, idx) => {
                const s = idx + 1
                const active = s === step
                const done = s < step || isSuccess
                return (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-label text-xs transition-colors ${
                        done
                          ? 'bg-one-gold text-one-navy'
                          : active
                            ? 'bg-one-gold/20 text-one-gold ring-1 ring-amber'
                            : 'bg-one-navy text-muted'
                      }`}
                    >
                      {done ? <Check size={14} /> : s}
                    </div>
                    <span
                      className={`font-micro hidden sm:block ${
                        active || done ? 'text-one-white' : 'text-muted'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              {isSuccess && step === 4 ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 rounded-full bg-one-gold/10 flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={32} className="text-one-gold" />
                  </div>
                  <h3 className="font-h3 text-one-white mb-3">
                    Thank You!
                  </h3>
                  <p className="font-body text-one-white max-w-md mx-auto mb-6">
                    Your support keeps the Valley connected. A tax-deductible
                    receipt has been sent to your email.
                  </p>
                  <div className="glass-card inline-flex items-center gap-3 px-6 py-3">
                    <Lock size={16} className="text-sage" />
                    <span className="font-label text-one-white">
                      Receipt #{' '}
                      {Math.random().toString(36).slice(2, 10).toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: Amount */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <button
                          onClick={() => update('donationType', 'monthly')}
                          className={`px-5 py-2 rounded-full font-label text-xs transition-all ${
                            form.donationType === 'monthly'
                              ? 'bg-one-gold text-one-navy'
                              : 'bg-one-navy text-one-white hover:bg-one-navy/80'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => update('donationType', 'one-off')}
                          className={`px-5 py-2 rounded-full font-label text-xs transition-all ${
                            form.donationType === 'one-off'
                              ? 'bg-one-gold text-one-navy'
                              : 'bg-one-navy text-one-white hover:bg-one-navy/80'
                          }`}
                        >
                          One-off
                        </button>
                      </div>

                      {form.tier && form.tier !== 'oneoff' ? (
                        <div className="text-center py-4">
                          <div className="font-h3 text-one-white mb-2">
                            {tiers.find((t) => t.id === form.tier)?.name}
                          </div>
                          <div className="font-stat text-one-gold">
                            ${form.amount}/month
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Label className="font-label text-muted mb-2 block">
                            Enter Amount (AUD)
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-one-white">
                              $
                            </span>
                            <Input
                              type="number"
                              min={5}
                              value={form.amount || ''}
                              onChange={(e) =>
                                update('amount', Number(e.target.value))
                              }
                              className="pl-8 glass-card border-one-border text-one-white"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="coverFees"
                          checked={form.coverFees}
                          onCheckedChange={(checked) =>
                            update('coverFees', Boolean(checked))
                          }
                        />
                        <Label
                          htmlFor="coverFees"
                          className="font-body-small text-one-white cursor-pointer"
                        >
                          I&rsquo;d like to cover the transaction fee (+$1.50)
                        </Label>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          onClick={handleNext}
                          className="btn-primary"
                        >
                          Continue <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Personal Details */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <Label className="font-label text-muted mb-2 block">
                          Full Name
                        </Label>
                        <Input
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          placeholder="Your name"
                          className="glass-card border-one-border text-one-white"
                        />
                      </div>
                      <div>
                        <Label className="font-label text-muted mb-2 block">
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="you@example.com"
                          className="glass-card border-one-border text-one-white"
                        />
                      </div>
                      <div>
                        <Label className="font-label text-muted mb-2 block">
                          Phone
                        </Label>
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          placeholder="+61 ..."
                          className="glass-card border-one-border text-one-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-label text-muted mb-2 block">
                            Address
                          </Label>
                          <Input
                            value={form.address}
                            onChange={(e) => update('address', e.target.value)}
                            placeholder="Street, City"
                            className="glass-card border-one-border text-one-white"
                          />
                        </div>
                        <div>
                          <Label className="font-label text-muted mb-2 block">
                            State / Territory
                          </Label>
                          <Select
                            value={form.state}
                            onValueChange={(v) => update('state', v)}
                          >
                            <SelectTrigger className="glass-card border-one-border text-one-white">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vic">Victoria</SelectItem>
                              <SelectItem value="nsw">
                                New South Wales
                              </SelectItem>
                              <SelectItem value="qld">Queensland</SelectItem>
                              <SelectItem value="sa">
                                South Australia
                              </SelectItem>
                              <SelectItem value="wa">
                                Western Australia
                              </SelectItem>
                              <SelectItem value="tas">Tasmania</SelectItem>
                              <SelectItem value="act">ACT</SelectItem>
                              <SelectItem value="nt">
                                Northern Territory
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Switch
                            id="anonymous"
                            checked={form.anonymous}
                            onCheckedChange={(checked) =>
                              update('anonymous', Boolean(checked))
                            }
                          />
                          <Label
                            htmlFor="anonymous"
                            className="font-body-small text-one-white cursor-pointer"
                          >
                            Make this donation anonymous
                          </Label>
                        </div>
                      </div>
                      <div>
                        <Label className="font-label text-muted mb-2 block">
                          Gift in honor / memory of (optional)
                        </Label>
                        <Input
                          value={form.giftInHonor}
                          onChange={(e) =>
                            update('giftInHonor', e.target.value)
                          }
                          placeholder="Name"
                          className="glass-card border-one-border text-one-white"
                        />
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button
                          onClick={handleBack}
                          variant="ghost"
                          className="text-one-white hover:text-one-white"
                        >
                          Back
                        </Button>
                        <button
                          onClick={handleNext}
                          className="btn-primary"
                        >
                          Continue <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Payment */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Lock size={16} className="text-sage" />
                        <span className="font-label text-sage">
                          SSL SECURE PAYMENT
                        </span>
                      </div>

                      {/* Stripe Elements placeholder */}
                      <div className="glass-card p-5 space-y-4 border border-one-border">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard size={18} className="text-one-gold" />
                          <span className="font-label text-one-white">
                            CARD DETAILS
                          </span>
                        </div>
                        <div>
                          <Label className="font-label text-muted mb-2 block">
                            Card Number
                          </Label>
                          <Input
                            placeholder="0000 0000 0000 0000"
                            className="glass-card border-one-border text-one-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-label text-muted mb-2 block">
                              Expiry
                            </Label>
                            <Input
                              placeholder="MM / YY"
                              className="glass-card border-one-border text-one-white"
                            />
                          </div>
                          <div>
                            <Label className="font-label text-muted mb-2 block">
                              CVC
                            </Label>
                            <Input
                              placeholder="123"
                              className="glass-card border-one-border text-one-white"
                            />
                          </div>
                        </div>
                        <p className="font-micro text-muted pt-2">
                          {/* Stripe backend integration required — connect to your Stripe account and backend API */}
                          Stripe Elements placeholder — backend integration
                          required for live processing.
                        </p>
                      </div>

                      <div className="glass-card p-4 flex items-center justify-between">
                        <div>
                          <div className="font-label text-muted">
                            {form.donationType === 'monthly'
                              ? 'Monthly Donation'
                              : 'One-off Donation'}
                          </div>
                          <div className="font-h3 text-one-white">
                            ${totalAmount.toFixed(2)} AUD
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-body-small text-one-white">
                            {form.coverFees && form.donationType === 'one-off'
                              ? 'Includes $1.50 fee'
                              : 'Tax deductible'}
                          </div>
                        </div>
                      </div>

                      <Card className="bg-transparent border-one-border">
                        <CardContent className="p-4 flex items-start gap-2">
                          <FileText
                            size={16}
                            className="text-one-gold mt-0.5 shrink-0"
                          />
                          <span className="font-body-small text-one-white">
                            You&rsquo;ll receive a tax-deductible receipt via
                            email after confirmation.
                          </span>
                        </CardContent>
                      </Card>

                      <div className="pt-4 flex justify-between">
                        <Button
                          onClick={handleBack}
                          variant="ghost"
                          className="text-one-white hover:text-one-white"
                        >
                          Back
                        </Button>
                        <button
                          onClick={handleSubmit}
                          disabled={isProcessing}
                          className={`btn-primary ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                              Processing...
                            </>
                          ) : (
                            <>
                              Donate ${totalAmount.toFixed(2)}{' '}
                              <Lock size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </StripeProvider>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 5 — Other Ways to Support                                  */
/* ------------------------------------------------------------------ */

function OtherWaysSection() {
  return (
    <section className="section-padding bg-one-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-one-white mb-4">
            Not Ready to Donate?
          </h2>
          <p className="font-body text-one-white">
            You can still help keep local radio alive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherWays.map((way, i) => {
            const Icon = way.icon
            const inner = (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="glass-card p-6 h-full transition-all duration-300 hover:border-one-gold/30 hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-lg bg-one-gold/10 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-one-gold" />
                </div>
                <h3 className="font-h4 text-one-white mb-2">{way.title}</h3>
                <p className="font-body-small text-one-white mb-4">{way.desc}</p>
                <span className="inline-flex items-center gap-1 font-label text-xs text-one-gold hover:text-one-gold transition-colors">
                  {way.action} <ArrowRight size={14} />
                </span>
              </motion.div>
            )

            return way.href.startsWith('/') ? (
              <Link key={way.title} to={way.href} className="block">
                {inner}
              </Link>
            ) : (
              <a key={way.title} href={way.href} className="block">
                {inner}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 6 — Supporter Wall                                         */
/* ------------------------------------------------------------------ */

function SupporterWallSection() {
  return (
    <section className="section-padding bg-one-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-one-white mb-4">Our Community Patrons</h2>
          <p className="font-body text-one-white">
            The families, businesses, and groups making local radio possible.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {patronNames.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="glass-card px-4 py-5 text-center"
            >
              <p className="font-body-small text-one-white">{name}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="font-h4 text-one-white mb-3">
            And 500+ supporters like you
          </p>
          <p className="font-label text-one-gold">Join the family</p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 7 — Transparency                                           */
/* ------------------------------------------------------------------ */

function TransparencySection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section className="section-padding bg-one-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-h2 text-one-white mb-6">
              Where Your Money Goes
            </h2>
            <p className="font-body text-one-white mb-8">
              We believe in radical transparency. Every dollar is accounted for
              and directed toward keeping community radio on air and serving
              the Goulburn Valley.
            </p>

            <div className="space-y-4">
              {pieData.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center gap-4"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div
                    className="w-4 h-4 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body-small text-one-white">
                        {item.name}
                      </span>
                      <span className="font-label text-one-gold">
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-one-navy overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1,
                          delay: i * 0.1,
                          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-2 font-label text-xs text-one-gold hover:text-one-gold transition-colors"
              >
                <FileText size={16} />
                Download Annual Report
              </a>
              <div className="flex items-center gap-2 glass-card px-4 py-2">
                <Shield size={16} className="text-sage" />
                <span className="font-label text-xs text-one-white">
                  ACNC Registered Charity
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={3}
                  dataKey="value"
                  activeIndex={activeIndex ?? undefined}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    background: 'rgba(26,26,31,0.95)',
                    border: '1px solid #2A2A30',
                    borderRadius: '8px',
                    color: '#F4F1EA',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#F4F1EA' }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="font-stat text-one-white">100%</div>
                <div className="font-label text-muted">Accountable</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 8 — Final CTA                                              */
/* ------------------------------------------------------------------ */

function FinalCTASection({
  onSelectTier,
  onSelectCustom,
}: {
  onSelectTier: (tierId: string) => void
  onSelectCustom: () => void
}) {
  const quickTiers = [
    { amount: 10, tierId: 'bronze' },
    { amount: 25, tierId: 'silver' },
    { amount: 50, tierId: 'gold' },
    { amount: 100, tierId: 'patron' },
  ]

  return (
    <section className="py-24 md:py-32 bg-one-navy relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(212,150,58,0.25) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <Heart size={32} className="text-one-gold mx-auto mb-6" />
          <h2 className="font-h1 text-one-white mb-6">
            Every dollar amplifies a local voice.
          </h2>
          <p className="font-body text-one-white max-w-xl mx-auto mb-10">
            Choose a quick amount below or scroll up to explore our supporter
            tiers and benefits.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {quickTiers.map(({ amount, tierId }) => (
              <button
                key={tierId}
                onClick={() => onSelectTier(tierId)}
                className="px-6 py-3 rounded-full font-label text-sm bg-one-navy text-one-white hover:bg-one-gold hover:text-one-navy transition-all duration-300"
              >
                ${amount}
              </button>
            ))}
            <button
              onClick={onSelectCustom}
              className="px-6 py-3 rounded-full font-label text-sm btn-secondary"
            >
              Custom
            </button>
          </div>

          <button
            onClick={() => onSelectTier('silver')}
            className="btn-primary text-base px-10 py-4"
          >
            Support ONE FM <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export default function Support() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [initialAmount, setInitialAmount] = useState<number | undefined>(
    undefined
  )
  const formRef = useRef<HTMLDivElement>(null)

  const scrollToForm = useCallback(
    (tierId: string) => {
      setSelectedTier(tierId)
      setInitialAmount(undefined)
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    },
    []
  )

  const handleCustom = useCallback(() => {
    setSelectedTier('oneoff')
    setInitialAmount(undefined)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  return (
    <Layout>
      <SEO title="Support ONE FM" description="Donate to ONE FM 98.5 community radio. Monthly tiers from $10. Tax deductible. Keep local voices alive." />
      <HeroSection />
      <WhySupportSection />
      <TiersSection onSelect={scrollToForm} />
      <div ref={formRef}>
        <DonationFormSection
          selectedTier={selectedTier}
          initialAmount={initialAmount}
        />
      </div>
      <OtherWaysSection />
      <SupporterWallSection />
      <TransparencySection />
      <FinalCTASection
        onSelectTier={scrollToForm}
        onSelectCustom={handleCustom}
      />
    </Layout>
  )
}
