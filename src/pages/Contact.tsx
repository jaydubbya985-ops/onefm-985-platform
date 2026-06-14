import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { submitEnquiry } from '@/lib/enquiries'
import { FACEBOOK_PAGE_URL } from '@/lib/socialLinks'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
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
  const contactCards = [
    {
      icon: Phone,
      label: 'Phone',
      value: '(+613) 58313131',
      href: 'tel:+61358313131',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'admin@fm985.com.au',
      href: 'mailto:admin@fm985.com.au',
    },
    {
      icon: MapPin,
      label: 'Studio Address',
      value: 'ONE FM 98.5, Shepparton, Victoria, Australia',
      href: '#map-mini',
    },
  ]

  const socials = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Facebook, label: 'Facebook', href: FACEBOOK_PAGE_URL, external: true },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' },
  ]

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, rgba(212,168,75,0.8) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block font-label text-one-gold mb-6"
        >
          STUDIO LINE OPEN
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-h1 text-one-white mb-6"
        >
          GET IN TOUCH
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-body text-one-muted max-w-2xl mx-auto mb-16"
        >
          Whether you want to sponsor, volunteer, or just say g'day — we'd love to
          hear from you.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {contactCards.map((card, i) => (
            <motion.a
              key={card.label}
              href={card.href}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              className="glass-card p-6 text-center hover:border-one-gold/30 transition-all duration-300 group"
            >
              <card.icon
                size={28}
                className="text-one-gold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
              />
              <div className="font-label text-one-muted mb-2">{card.label}</div>
              <div className="font-body-small text-one-white">{card.value}</div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex items-center justify-center gap-6"
        >
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              {...('external' in social && social.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="text-one-muted hover:text-one-gold transition-colors duration-300"
            >
              <social.icon size={22} />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
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
      <section className="section-padding bg-[#070F1C]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-12"
          >
            <CheckCircle2 size={64} className="text-one-gold mx-auto mb-6" />
            <h2 className="font-h2 text-one-white mb-4">Thanks for reaching out!</h2>
            <p className="font-body text-one-muted">
              We'll get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-[#070F1C]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="inline-block font-label text-one-gold mb-4">
            SEND A MESSAGE
          </span>
          <h2 className="font-h2 text-one-white mb-4">Multi-Pathway Enquiry</h2>
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
        'Head to our Sponsorship page to explore packages, or select "Sponsorship" in the enquiry form above. Our partnerships team will reach out within 24 hours to discuss tailored options for your business.',
    },
    {
      question: 'Can I volunteer at the station?',
      answer:
        'Absolutely. We welcome volunteers for programming, events, technical support, and administration. Select "Volunteering" in the form above, or drop by the studio during office hours. Training is provided.',
    },
    {
      question: 'How do I request a song?',
      answer:
        'Call the studio line on (+613) 58313131 during broadcast hours, or message us on social media. Our hosts love taking requests — especially for local artists.',
    },
    {
      question: 'What area does ONE FM cover?',
      answer:
        'ONE FM broadcasts to 25 towns across the Goulburn Valley and surrounding regions, reaching a total population of 185,791 people within a 100km radius of Shepparton.',
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
        'Yes — stream ONE FM live via our website player, or find us on TuneIn, iHeartRadio, and the RadioApp. The stream is available worldwide, so you can take the Valley with you anywhere.',
    },
  ]

  return (
    <section className="section-padding">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block font-label text-one-gold mb-4">
            QUESTIONS?
          </span>
          <h2 className="font-h2 text-one-white mb-4">Frequently Asked</h2>
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
                <AccordionTrigger className="font-h4 text-one-white hover:text-one-gold py-5 transition-colors [&>svg]:text-one-gold">
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
    <section className="section-padding bg-[#070F1C]">
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
                Emergency Broadcasting
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
    <section id="map-mini" className="section-padding">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block font-label text-one-gold mb-4">
            FIND US
          </span>
          <h2 className="font-h2 text-one-white mb-4">Studio Location</h2>
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

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 text-center">
            <Clock size={20} className="text-one-gold mx-auto mb-3" />
            <div className="font-label text-one-muted mb-1">Office Hours</div>
            <div className="font-body-small text-one-white">
              Mon – Fri: 9AM – 5PM
            </div>
          </div>
          <div className="glass-card p-5 text-center">
            <Radio size={20} className="text-one-gold mx-auto mb-3" />
            <div className="font-label text-one-muted mb-1">Broadcast Hours</div>
            <div className="font-body-small text-one-white">24 / 7 / 365</div>
          </div>
          <div className="glass-card p-5 text-center">
            <Headphones size={20} className="text-one-gold mx-auto mb-3" />
            <div className="font-label text-one-muted mb-1">Studio Line</div>
            <div className="font-body-small text-one-white">(+613) 58313131</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 glass-card p-6 text-center"
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
      </div>
    </section>
  )
}

/* ─── Page ─── */
export default function Contact() {
  return (
    <Layout>
      <SEO title="Contact Us" description="Get in touch with ONE FM 98.5. Phone: (+613) 58313131. Email: admin@fm985.com.au. Sponsorship, volunteering, programming, or general enquiries." />
      <ContactHero />
      <ContactForm />
      <FAQSection />
      <EmergencyInfo />
      <MapMini />
    </Layout>
  )
}
