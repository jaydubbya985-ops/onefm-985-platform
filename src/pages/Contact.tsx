import { useState, useRef } from 'react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { HeadlinePop } from '@/components/motion/PosterReveal'
import { Marquee } from '@/components/Marquee'
import { MagneticButton } from '@/components/MagneticButton'
import { TiltCard } from '@/components/TiltCard'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { submitEnquiry } from '@/lib/enquiries'
import { stationStats } from '@/data/pricing'
import { STATION_PHOTOS } from '@/lib/stationPhotos'
import { FACEBOOK_PAGE_URL, SOUNDCLOUD_PROFILE_URL } from '@/lib/socialLinks'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Music,
  Send,
  Loader2,
  CheckCircle2,
  Flame,
  ExternalLink,
  Radio,
  Headphones,
  Mic2,
  Megaphone,
  Wrench,
  HelpCircle,
  Heart,
} from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/* ─── Section 1: Hero ─── */
function ContactHero() {
  // Official channels only — Instagram / Twitter / YouTube URLs are not confirmed (socialLinks.ts).
  const socials = [
    { icon: Facebook, label: 'Facebook', href: FACEBOOK_PAGE_URL, external: true },
    { icon: Music, label: 'SoundCloud', href: SOUNDCLOUD_PROFILE_URL, external: true },
  ]

  const marqueeItems = [
    { text: 'Phone: (03) 5831 3131', cls: 'text-one-gold/60' },
    { text: 'Email: admin@fm985.com.au', cls: 'text-one-white/40' },
    { text: 'Shepparton · Victoria · Australia', cls: 'text-one-gold/60' },
    { text: 'Sponsorship · Volunteering · Programming', cls: 'text-one-white/40' },
    { text: 'On air 24/7', cls: 'text-one-gold/60' },
  ]

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY = useTransform(heroScroll, [0, 1], ['0%', '20%'])

  return (
    <>
      <section ref={heroRef} className="relative min-h-[78vh] flex items-end overflow-hidden bg-[#101010]" data-cursor-label="GET IN TOUCH">
        <div className="absolute inset-0 z-0">
          <motion.div
            style={{ y: heroImgY, position: 'absolute', top: '-28%', bottom: 0, left: 0, right: 0, willChange: 'transform' }}
          >
            <img
              src={STATION_PHOTOS.studioPresenterMic}
              alt=""
              aria-hidden
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover object-center"
              style={{ opacity: 0.55 }}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/65 via-transparent to-transparent" />
        </div>
        <div aria-hidden className="grain-overlay" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 pb-40">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-label text-[10px] tracking-[0.28em] text-gold-gradient uppercase block mb-3"
          >
            47 Parkside Drive · Shepparton
          </motion.span>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="flex items-end gap-[1.5px] mb-5"
            aria-hidden
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="w-[1.5px] rounded-sm" style={{
                height: 3 + Math.floor(Math.abs(Math.sin(i * 0.61 + 0.6)) * 12 + 2),
                backgroundColor: 'rgba(201,162,39,0.35)',
                animation: `freq-bar ${0.7 + (i % 6) * 0.13}s ${(i * 0.086) % 1}s ease-in-out infinite`,
              }} />
            ))}
          </motion.div>

          <h1
            className="font-heading font-black leading-none mb-8"
            style={{ fontSize: 'clamp(3.2rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
          >
            <span className="block text-one-white">
              <HeadlinePop>Get in</HeadlinePop>
            </span>
            <span className="block text-one-gold">
              <HeadlinePop delay={0.08}>Touch.</HeadlinePop>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-body text-one-white/50 italic max-w-xl mb-10"
          >
            Whether you want to sponsor, volunteer, or just say g'day — we'd love to hear from you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="flex flex-wrap gap-x-8 gap-y-3 mb-10"
          >
            <a href="tel:+61358313131" data-cursor-label="CALL" className="flex items-center gap-2.5 group">
              <Phone size={13} className="text-one-gold flex-shrink-0" />
              <span className="font-label text-[11px] tracking-[0.15em] text-one-white/60 group-hover:text-one-white transition-colors">(03) 5831 3131</span>
            </a>
            <a href="mailto:admin@fm985.com.au" data-cursor-label="EMAIL" className="flex items-center gap-2.5 group">
              <Mail size={13} className="text-one-gold flex-shrink-0" />
              <span className="font-label text-[11px] tracking-[0.15em] text-one-white/60 group-hover:text-one-white transition-colors">admin@fm985.com.au</span>
            </a>
            <div className="flex items-center gap-2.5">
              <MapPin size={13} className="text-one-gold flex-shrink-0" />
              <span className="font-label text-[11px] tracking-[0.15em] text-one-white/40">Shepparton, Victoria</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap items-center gap-6"
          >
            <MagneticButton>
              <a href="#contact-form" data-cursor-label="ENQUIRY" className="btn-primary px-8 py-3.5 rounded-full font-label text-[11px] tracking-[0.2em] uppercase">
                Send an Enquiry
              </a>
            </MagneticButton>
            <MagneticButton>
              <a href="tel:+61358313131" data-cursor-label="CALL" className="btn-ghost px-8 py-3.5 rounded-full font-label text-[11px] tracking-[0.2em] uppercase">
                Call the Studio
              </a>
            </MagneticButton>
            <div className="flex items-center gap-5 ml-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  data-cursor-label={social.label.toUpperCase()}
                  {...('external' in social && social.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="text-one-muted hover:text-one-gold transition-colors duration-300"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="py-4 bg-[#101010] border-y border-one-gold/10 overflow-hidden">
        <Marquee
          speed={35}
          items={marqueeItems.map((item) => (
            <span className={`mx-12 font-label text-[10px] tracking-[0.25em] uppercase ${item.cls}`}>
              {item.text}
            </span>
          ))}
        />
      </div>
    </>
  )
}

/* ─── Form Schema ─── */
const enquirySchema = z.object({
  enquiryType: z.string().min(1, 'Please select an enquiry type'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  organization: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  preferredContact: z.enum(['email', 'phone', 'either']),
})

type EnquiryForm = z.infer<typeof enquirySchema>

const enquiryIcons: Record<string, React.ElementType> = {
  General: HelpCircle,
  Sponsorship: Heart,
  Volunteering: Send,
  Programming: Mic2,
  Advertising: Megaphone,
  'Technical Issue': Wrench,
}

/* ─── Section 2: Multi-Pathway Enquiry Form ─── */
function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<EnquiryForm>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      enquiryType: '',
      name: '',
      email: '',
      phone: '',
      organization: '',
      message: '',
      preferredContact: 'email',
    },
  })

  const onSubmit = async (data: EnquiryForm) => {
    setLoading(true)
    try {
      await submitEnquiry({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.organization,
        subject: data.enquiryType,
        message: data.message,
        source: 'contact',
        enquiryType: data.enquiryType,
        preferredContact: data.preferredContact,
      })

      setSubmitted(true)
      toast.success('Message sent! We\'ll be in touch within 24 hours.')
    } catch (err) {
      console.error('[Contact] Submission error:', err)
      toast.error('Something went wrong. Please try again or call us directly.')
    } finally {
      setLoading(false)
    }
  }

  const enquiryTypes = [
    'General',
    'Sponsorship',
    'Volunteering',
    'Programming',
    'Advertising',
    'Technical Issue',
  ]

  if (submitted) {
    return (
      <section className="section-padding bg-surface-mid">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-12"
          >
            <CheckCircle2 size={64} className="text-one-gold mx-auto mb-6" />
            <h2 className="font-h2 text-one-white mb-4">
              <HeadlinePop>Thanks for reaching out!</HeadlinePop>
            </h2>
            <p className="font-body text-one-muted">
              We'll get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact-form" className="section-padding section-bleed-top bg-surface-mid" data-cursor-label="SEND MESSAGE">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="inline-block font-label text-one-electric mb-3">
            SEND A MESSAGE
          </span>
          <div aria-hidden className="flex justify-center items-end gap-[2.5px] mb-4" style={{ height: 16 }}>
            {[5, 8, 6, 12, 7, 10, 5, 9, 7, 11, 6, 8, 5, 10, 7].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 2, height: h, borderRadius: 1,
                  background: 'rgba(46,196,182,0.32)',
                  transformOrigin: 'bottom',
                  animation: `freq-bar ${0.8 + (i % 5) * 0.15}s ${(i * 0.09) % 1}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
          <h2 className="font-h2 text-one-white mb-4">
            <HeadlinePop>Multi-Pathway Enquiry</HeadlinePop>
          </h2>
          <p className="font-body text-one-muted max-w-xl mx-auto">
            Choose the path that fits your needs and we'll route your message to the
            right team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 md:p-10"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="enquiryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-label text-one-muted">
                      Enquiry Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-one-navy border-one-border text-one-white focus:ring-one-gold/20 focus:border-one-gold h-11">
                          <SelectValue placeholder="Select enquiry type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-one-navy border-one-border">
                        {enquiryTypes.map((type) => {
                          const Icon = enquiryIcons[type] || HelpCircle
                          return (
                            <SelectItem
                              key={type}
                              value={type}
                              className="text-one-white focus:bg-one-gold/10 focus:text-one-white"
                            >
                              <div className="flex items-center gap-2">
                                <Icon size={16} className="text-one-gold" />
                                <span>{type}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-one-red" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-label text-one-muted">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          {...field}
                          className="bg-one-navy border-one-border text-one-white placeholder:text-one-muted focus:ring-one-gold/20 focus:border-one-gold h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-one-red" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-label text-one-muted">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          className="bg-one-navy border-one-border text-one-white placeholder:text-one-muted focus:ring-one-gold/20 focus:border-one-gold h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-one-red" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-label text-one-muted">
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(03) 5000 0000"
                          {...field}
                          className="bg-one-navy border-one-border text-one-white placeholder:text-one-muted focus:ring-one-gold/20 focus:border-one-gold h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-one-red" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-label text-one-muted">
                        Organization{' '}
                        <span className="text-one-muted/60">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Business or group name"
                          {...field}
                          className="bg-one-navy border-one-border text-one-white placeholder:text-one-muted focus:ring-one-gold/20 focus:border-one-gold h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-one-red" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-label text-one-muted">
                      Message
                    </FormLabel>
                    <FormControl>
                      <textarea
                        rows={5}
                        placeholder="Tell us what's on your mind..."
                        {...field}
                        className="w-full bg-one-navy border border-one-border rounded-md px-3 py-2 font-body text-sm text-one-white placeholder:text-one-muted focus:outline-none focus:ring-1 focus:ring-one-gold/20 focus:border-one-gold transition-all resize-y"
                      />
                    </FormControl>
                    <FormMessage className="text-one-red" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-label text-one-muted">
                      Preferred Contact Method
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="email"
                            id="email"
                            className="border-one-border text-one-gold"
                          />
                          <Label
                            htmlFor="email"
                            className="font-body-small text-one-white cursor-pointer"
                          >
                            Email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="phone"
                            id="phone"
                            className="border-one-border text-one-gold"
                          />
                          <Label
                            htmlFor="phone"
                            className="font-body-small text-one-white cursor-pointer"
                          >
                            Phone
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="either"
                            id="either"
                            className="border-one-border text-one-gold"
                          />
                          <Label
                            htmlFor="either"
                            className="font-body-small text-one-white cursor-pointer"
                          >
                            Either
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-one-red" />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={loading}
                data-cursor-label="SEND"
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Enquiry
                  </>
                )}
              </button>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 3: FAQ Accordion ─── */
function FAQSection() {
  const faqs = [
    {
      question: 'How do I become a sponsor?',
      answer:
        'Head to our Sponsorship page to explore packages, or select "Sponsorship" in the enquiry form above. We aim to reply within one working day.',
    },
    {
      question: 'Can I volunteer at the station?',
      answer:
        'Yes. We welcome volunteers for programming, events, technical support, and administration. Select "Volunteering" in the form above, or email admin@fm985.com.au. Training is provided.',
    },
    {
      question: 'How do I request a song?',
      answer:
        'Call the studio line on (03) 5831 3131 during live programming (6:00 AM–10:00 PM), or message the station on Facebook. Overnight hours are automated.',
    },
    {
      question: 'What area does ONE FM cover?',
      answer:
        `ONE FM broadcasts to ${stationStats.totalTowns} towns across the Goulburn Valley and surrounding regions, with a combined 2026 est. population of ${stationStats.broadcastPopulation.toLocaleString()} people within a ${stationStats.broadcastRadiusKm}km radius of Shepparton.`,
    },
    {
      question: 'How do I submit community news?',
      answer:
        'Email your news, events, or announcements to admin@fm985.com.au, or use the General enquiry form above. We read community bulletins throughout the day.',
    },
    {
      question: 'What are your broadcast hours?',
      answer:
        'ONE FM broadcasts 24 hours a day, 7 days a week. Live programming runs from 6:00 AM to 10:00 PM daily, with automated music and syndicated content overnight.',
    },
    {
      question: 'How do I advertise my business?',
      answer:
        'We offer radio spots, sponsorships, digital packages, and event partnerships. Select "Advertising" in the enquiry form and our sales team will prepare a custom proposal for your budget.',
    },
    {
      question: 'Can I listen online?',
      answer:
        'Yes — stream ONE FM live on this site (Listen) or at fm985.com.au/audio-player/. The Radio.co stream works worldwide.',
    },
  ]

  return (
    <section className="section-padding section-bleed-top bg-surface-lift" data-cursor-label="FAQ">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block font-label text-one-electric mb-4">
            QUESTIONS?
          </span>
          <h2 className="font-h2 text-one-white mb-4">
            <HeadlinePop>Frequently Asked</HeadlinePop>
          </h2>
          <p className="font-body text-one-muted max-w-xl mx-auto">
            Everything you need to know about connecting with ONE FM.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass-card border-one-border rounded-xl px-6 overflow-hidden data-[state=open]:border-one-gold/30"
              >
                <AccordionTrigger data-cursor-label="EXPAND" className="font-h4 text-one-white hover:text-one-gold py-5 transition-colors [&>svg]:text-one-gold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-body-small text-one-muted pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 4: Emergency Info ─── */
function EmergencyInfo() {
  return (
    <section className="section-padding section-bleed-top bg-surface-deep">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-one-red/30 bg-gradient-to-br from-[#1A0A0A] to-[#0D0D0D] p-8 md:p-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-one-red/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0 w-16 h-16 rounded-full bg-one-red/10 flex items-center justify-center">
              <Flame size={32} className="text-one-red" />
            </div>
            <div className="flex-1">
              <h2 className="font-h2 text-one-white mb-4">
                <HeadlinePop>Emergency Broadcasting</HeadlinePop>
              </h2>
              <p className="font-body text-one-muted mb-6 max-w-xl">
                During emergencies, ONE FM is your official emergency broadcaster
                for the Goulburn Valley. We work directly with emergency services to
                deliver real-time warnings, evacuation orders, and recovery
                information.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.cfa.vic.gov.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-one-red/40 text-one-red font-label text-xs hover:bg-one-red/10 transition-colors"
                >
                  <ExternalLink size={14} />
                  CFA Victoria
                </a>
                <a
                  href="https://ses.vic.gov.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-one-red/40 text-one-red font-label text-xs hover:bg-one-red/10 transition-colors"
                >
                  <ExternalLink size={14} />
                  SES Victoria
                </a>
                <a
                  href="https://www.bom.gov.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-one-red/40 text-one-red font-label text-xs hover:bg-one-red/10 transition-colors"
                >
                  <ExternalLink size={14} />
                  Bureau of Meteorology
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 5: Map Mini ─── */
function MapMini() {
  return (
    <section id="map-mini" className="section-padding section-bleed-top bg-surface-peak">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block font-label text-one-electric mb-4">
            FIND US
          </span>
          <h2 className="font-h2 text-one-white mb-4">
            <HeadlinePop>Studio Location</HeadlinePop>
          </h2>
          <p className="font-body text-one-muted max-w-xl mx-auto">
            ONE FM 98.5, Shepparton, Victoria, Australia
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="glass-card overflow-hidden p-1"
        >
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-one-navy">
            <iframe
              title="ONE FM Studio Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=145.35%2C-36.42%2C145.45%2C-36.34&layer=mapnik&marker=-36.3805%2C145.3987"
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
            />
            <div className="absolute bottom-4 left-4 glass-card px-4 py-3 flex items-center gap-3">
              <MapPin size={18} className="text-one-red" />
              <div>
                <div className="font-h4 text-one-white text-sm">ONE FM 98.5</div>
                <div className="font-body-small text-one-muted">
                  Shepparton, Victoria
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4" data-cursor-label="STATION INFO">
          <TiltCard maxTilt={5} className="h-full">
          <div className="glass-card p-5 text-center h-full group relative overflow-hidden">
            <div aria-hidden className="explore-tile-scan" />
            <Clock size={20} className="text-one-gold mx-auto mb-3" />
            <div className="font-label text-one-muted mb-1">Live programming</div>
            <div className="font-body-small text-one-white">
              6:00 AM – 10:00 PM
            </div>
          </div>
          </TiltCard>
          <TiltCard maxTilt={5} className="h-full">
          <div className="glass-card p-5 text-center h-full group relative overflow-hidden">
            <div aria-hidden className="explore-tile-scan" />
            <Radio size={20} className="text-one-gold mx-auto mb-3" />
            <div className="font-label text-one-muted mb-1">Broadcast Hours</div>
            <div className="font-body-small text-gold-gradient">24 / 7 / 365</div>
          </div>
          </TiltCard>
          <TiltCard maxTilt={5} className="h-full">
          <div className="glass-card p-5 text-center h-full group relative overflow-hidden">
            <div aria-hidden className="explore-tile-scan" />
            <Headphones size={20} className="text-one-gold mx-auto mb-3" />
            <div className="font-label text-one-muted mb-1">Studio Line</div>
            <div className="font-body-small text-one-white">(03) 5831 3131</div>
          </div>
          </TiltCard>
        </div>

        <TiltCard maxTilt={3} className="mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-one-muted">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-one-gold" />
              <span className="font-label text-xs">Callsign: 3ONE</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink size={16} className="text-one-gold" />
              <span className="font-label text-xs">ACMA License: 1385226/1</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-one-gold" />
              <span className="font-label text-xs">APRA AMCOS Licensed</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-one-gold" />
              <span className="font-label text-xs">Goulburn Valley Community Radio Inc.</span>
            </div>
          </div>
        </motion.div>
        </TiltCard>
      </div>
    </section>
  )
}

/* ─── Page ─── */
export default function Contact() {
  return (
    <Layout>
      <SEO title="Contact Us" description="Get in touch with ONE FM 98.5. Phone: (03) 5831 3131. Email: admin@fm985.com.au. Sponsorship, volunteering, programming, or general enquiries." />
      <ContactHero />
      <ContactForm />
      <FAQSection />
      <EmergencyInfo />
      <MapMini />
    </Layout>
  )
}
