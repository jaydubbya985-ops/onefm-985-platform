import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import type { ElementType } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { WordReveal } from '@/components/WordReveal'
import { Marquee } from '@/components/Marquee'
import { MagneticButton } from '@/components/MagneticButton'
import { TiltCard } from '@/components/TiltCard'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { StripeProvider } from '@/components/StripeProvider'
import { BRAND } from '@/lib/brand'
import { stationStats } from '@/data/pricing'
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
/*  Section 1 — Hero                                                  */
/* ------------------------------------------------------------------ */

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-[#050D1A]" data-cursor-label="SUPPORT US">
      <div className="absolute inset-0 z-0">
        <motion.div
          style={{ y: heroImgY, position: 'absolute', top: '-28%', bottom: 0, left: 0, right: 0, willChange: 'transform' }}
        >
          <img
            src="/assets/images/studio-exterior-rainbow.jpg"
            alt=""
            aria-hidden
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover"
            style={{ opacity: 0.32 }}
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(212,150,58,0.12) 0%, rgba(5,13,26,0.9) 45%, rgba(5,13,26,0.98) 100%)',
          }}
        />
      </div>
      <div aria-hidden className="grain-overlay" />
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: 'rgba(212,168,75,0.15)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-32 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <span className="section-label">Community radio since 1989</span>
          </div>
          <div className="flex justify-center items-end gap-[1.5px] mb-5" aria-hidden>
            {Array.from({ length: 18 }, (_, i) => (
              <div
                key={i}
                className="w-[1.5px] rounded-sm"
                style={{
                  height: 3 + Math.floor(Math.abs(Math.sin(i * 0.6 + 0.5)) * 11 + 2),
                  backgroundColor: 'rgba(212,168,75,0.3)',
                  animation: `freq-bar ${0.72 + (i % 6) * 0.12}s ${(i * 0.085) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
          <h1 className="font-hero text-one-white mb-5 tracking-tight">
            SUPPORT{' '}
            <span className="text-gradient-spectrum">ONE FM</span>
          </h1>
          <p className="font-body text-one-white/50 italic max-w-2xl mx-auto mb-12">
            Community radio thrives because of community support. Every dollar
            keeps local voices on air.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: stationStats.weeklyListeners, label: 'Weekly Listeners', suffix: '' },
            { value: stationStats.nfpsSupported, label: 'NFPs Supported', suffix: '+' },
            { value: stationStats.totalTowns, label: 'Communities', suffix: '' },
            { value: stationStats.yearsBroadcasting, label: 'Years on Air', suffix: '' },
          ].map((stat, i) => (
            <TiltCard key={stat.label} maxTilt={6} className="h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3 + i * 0.1,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="glass-card p-6 text-center h-full group relative overflow-hidden"
            >
              <div aria-hidden className="explore-tile-scan" />
              <div className="font-stat text-gold-gradient mb-1">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-label text-muted">{stat.label}</div>
            </motion.div>
            </TiltCard>
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
            <span className="font-stat text-gold-gradient">
              <AnimatedNumber prefix="$" value={124580} />
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
    <section className="section-padding section-bleed-top bg-surface-mid" data-cursor-label="WHY SUPPORT">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <WordReveal text="Why Support ONE FM?" className="font-h2 text-one-white mb-4 block" as="h2" stagger={0.05} />
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
                <TiltCard maxTilt={5} className="h-full">
                <div className="glass-card p-6 h-full transition-all duration-300 hover:border-one-gold/30 group relative overflow-hidden">
                  <div aria-hidden className="explore-tile-scan" />
                  <div className="w-12 h-12 rounded-lg bg-one-gold/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-one-gold" />
                  </div>
                  <h3 className="font-h4 text-one-white mb-2">{card.title}</h3>
                  <p className="font-body-small text-one-white">{card.desc}</p>
                </div>
                </TiltCard>
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
      data-cursor-label="DONATE"
    >
      <TiltCard maxTilt={5} className="h-full">
      <div
        className={`glass-card p-6 h-full relative overflow-hidden group transition-all duration-300 hover:border-one-gold/30 ${
          tier.popular ? 'ring-2 ring-one-gold/40' : ''
        }`}
      >
        <div aria-hidden className="explore-tile-scan" />
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
            <span className="font-stat text-gold-gradient">${tier.amount}</span>
            <span className="font-body-small text-one-white">/month</span>
          </div>
          <p className="font-body-small text-one-white mb-6">{tier.benefits}</p>
          <button
            onClick={() => onSelect(tier.id)}
            data-cursor-label="SELECT"
            className="w-full btn-primary"
          >
            Select <ChevronRight size={16} />
          </button>
        </div>
      </div>
      </TiltCard>
    </motion.div>
  )
}

function TiersSection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <section className="section-padding section-bleed-top bg-surface-lift" data-cursor-label="SUPPORT">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <WordReveal text="Choose Your Impact" className="font-h2 text-one-white mb-4 block" as="h2" stagger={0.05} />
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
            <div className="glass-card p-6 h-full relative overflow-hidden group transition-all duration-300 hover:border-one-gold/30 hover:scale-[1.01]">
              <div aria-hidden className="explore-tile-scan" />
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
                  <span className="font-stat text-gold-gradient">Any</span>
                  <span className="font-body-small text-one-white">amount</span>
                </div>
                <p className="font-body-small text-one-white mb-6">
                  {oneOffTier.benefits}
                </p>
                <button
                  onClick={() => onSelect(oneOffTier.id)}
                  data-cursor-label="SELECT"
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

  const update = useCallback(
    (field: keyof FormData, value: unknown) => {
      setForm((f) => ({ ...f, [field]: value }))
    },
    []
  )

  return (
    <section className="section-padding section-bleed-top bg-surface-deep" data-cursor-label="DONATE NOW">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <WordReveal text="Complete Your Donation" className="font-h2 text-one-white mb-4 block" as="h2" stagger={0.05} />
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
                            ? 'bg-one-gold/20 text-one-gold ring-1 ring-one-gold'
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
                    Enquiry Sent!
                  </h3>
                  <p className="font-body text-one-white max-w-md mx-auto mb-6">
                    We'll be in touch with bank transfer details shortly. Thank you for supporting community radio in the Goulburn Valley.
                  </p>
                  <div className="glass-card inline-flex items-center gap-3 px-6 py-3">
                    <Heart size={16} className="text-one-gold" />
                    <span className="font-label text-one-white">
                      {BRAND.email}
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
                          data-cursor-label="MONTHLY"
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
                          data-cursor-label="ONE-OFF"
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
                          <div className="font-stat text-gold-gradient">
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
                          data-cursor-label="CONTINUE"
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
                          data-cursor-label="CONTINUE"
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

                      {/* Donation contact options */}
                      <div className="glass-card p-5 space-y-5 border border-one-gold/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Heart size={18} className="text-one-gold" />
                          <span className="font-label text-one-white">
                            HOW TO DONATE
                          </span>
                        </div>
                        <p className="font-body-small text-one-muted">
                          Online card payments are being set up. In the meantime, you can support us directly:
                        </p>
                        <div className="space-y-3">
                          <a
                            href={`mailto:${BRAND.email}?subject=Donation%20Enquiry&body=Hi%20ONE%20FM%2C%0A%0AI%20would%20like%20to%20donate%20%24${totalAmount.toFixed(2)}%20AUD%20to%20support%20community%20radio.%0A%0APlease%20send%20me%20your%20bank%20transfer%20details.%0A%0AThank%20you.`}
                            data-cursor-label="EMAIL"
                            className="flex items-center gap-3 p-4 rounded-xl border border-one-gold/30 bg-one-gold/5 hover:bg-one-gold/10 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-full bg-one-gold/10 flex items-center justify-center shrink-0">
                              <CreditCard size={18} className="text-one-gold" />
                            </div>
                            <div>
                              <div className="font-label text-one-white text-xs mb-0.5">Bank Transfer</div>
                              <div className="font-body-small text-one-muted">Email us and we'll send account details for a direct bank transfer</div>
                            </div>
                            <ArrowRight size={16} className="text-one-gold/50 ml-auto group-hover:translate-x-1 transition-transform" />
                          </a>
                          <a
                            href={`tel:${BRAND.phone.replace(/\s/g, '')}`}
                            data-cursor-label="CALL"
                            className="flex items-center gap-3 p-4 rounded-xl border border-one-border bg-transparent hover:bg-one-navy/30 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-full bg-one-white/5 flex items-center justify-center shrink-0">
                              <Radio size={18} className="text-one-muted" />
                            </div>
                            <div>
                              <div className="font-label text-one-white text-xs mb-0.5">Call the Station</div>
                              <div className="font-body-small text-one-muted">{BRAND.phone} — our team can take card payments over the phone</div>
                            </div>
                            <ArrowRight size={16} className="text-one-muted/50 ml-auto group-hover:translate-x-1 transition-transform" />
                          </a>
                        </div>
                        <p className="font-micro text-muted pt-1">
                          All donations are tax-deductible. You'll receive a receipt via email.
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
                        <a
                          href={`mailto:${BRAND.email}?subject=Donation%20Enquiry%20-%20%24${totalAmount.toFixed(2)}%20AUD&body=Hi%20ONE%20FM%2C%0A%0AI%20would%20like%20to%20donate%20%24${totalAmount.toFixed(2)}%20AUD%20to%20support%20community%20radio%20in%20the%20Goulburn%20Valley.%0A%0APlease%20send%20me%20your%20bank%20transfer%20details.%0A%0AThank%20you.`}
                          data-cursor-label="EMAIL"
                          className="btn-primary"
                        >
                          Send Donation Enquiry <ArrowRight size={16} />
                        </a>
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
    <section className="section-padding section-bleed-top bg-surface-peak" data-cursor-label="OTHER WAYS">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <WordReveal text="Not Ready to Donate?" className="font-h2 text-one-white mb-4 block" as="h2" stagger={0.05} />
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
                data-cursor-label={way.action.toUpperCase()}
                className="glass-card p-6 h-full transition-all duration-300 hover:border-one-gold/30 hover:scale-[1.02] group relative overflow-hidden"
              >
                <div aria-hidden className="explore-tile-scan" />
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
              <Link key={way.title} to={way.href} data-cursor-label={way.action.toUpperCase()} className="block">
                {inner}
              </Link>
            ) : (
              <a key={way.title} href={way.href} data-cursor-label={way.action.toUpperCase()} className="block">
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
    <section className="section-padding section-bleed-top bg-surface-warm" data-cursor-label="OUR PATRONS">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <WordReveal text="Our Community Patrons" className="font-h2 text-one-white mb-4 block" as="h2" stagger={0.05} />
          <p className="font-body text-one-white">
            The families, businesses, and groups making local radio possible.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {patronNames.map((name, i) => (
            <TiltCard key={name} maxTilt={8} className="h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="glass-card px-4 py-5 text-center h-full"
            >
              <p className="font-body-small text-one-white">{name}</p>
            </motion.div>
            </TiltCard>
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
    <section className="section-padding section-bleed-top bg-surface-lift" data-cursor-label="IMPACT">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <WordReveal text="Where Your Money Goes" className="font-h2 text-one-white mb-6 block" as="h2" stagger={0.05} />
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
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-label text-xs text-one-gold hover:text-one-gold transition-colors link-hover"
              >
                <FileText size={16} />
                Request Annual Report
              </Link>
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
                <div className="font-stat text-gold-gradient">100%</div>
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
    <section className="py-24 md:py-32 bg-surface-glow section-bleed-top relative overflow-hidden" data-cursor-label="AMPLIFY">
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
                data-cursor-label={`$${amount}`}
                className="px-6 py-3 rounded-full font-label text-sm bg-one-navy text-one-white hover:bg-one-gold hover:text-one-navy transition-all duration-300"
              >
                ${amount}
              </button>
            ))}
            <button
              onClick={onSelectCustom}
              data-cursor-label="CUSTOM"
              className="px-6 py-3 rounded-full font-label text-sm btn-secondary"
            >
              Custom
            </button>
          </div>

          <MagneticButton strength={10} cursorLabel="DONATE">
            <button
              onClick={() => onSelectTier('silver')}
              className="btn-primary text-base px-10 py-4"
            >
              Support ONE FM <ArrowRight size={18} />
            </button>
          </MagneticButton>
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

      {/* ── Support Marquee Strip ── */}
      <div className="bg-[#020810] border-y border-one-gold/15 py-3 overflow-hidden">
        <Marquee
          speed={32}
          items={[
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">KEEP LOCAL RADIO ALIVE</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/50">98.5 FM · SHEPPARTON</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">COMMUNITY SUPPORTED · SINCE 1989</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/50">{stationStats.weeklyListeners.toLocaleString()} WEEKLY LISTENERS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">TAX-DEDUCTIBLE DONATIONS</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/50">{stationStats.totalTowns} COMMUNITIES SERVED · GOULBURN VALLEY</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-gold/60">FROM $10/MONTH</span>,
            <span className="font-label text-[10px] tracking-[0.22em] text-one-muted/50">NOT-FOR-PROFIT · ACMA LICENSED</span>,
          ]}
        />
      </div>

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
