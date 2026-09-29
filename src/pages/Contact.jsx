import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  HandHeart,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import { Input, Select, Textarea } from '../components/Input'
import { useToast } from '../context/ToastContext'
import { submitContactForm } from '../services/reports'
import { hasErrors, validate, validators } from '../utils/validation'
import { APP } from '../utils/constants'

const SUBJECTS = [
  { value: 'donate', label: 'I want to donate food' },
  { value: 'request', label: 'I want to request food' },
  { value: 'volunteer', label: 'I want to volunteer' },
  { value: 'partnership', label: 'Partnership enquiry' },
  { value: 'technical', label: 'Technical problem' },
  { value: 'feedback', label: 'Feedback or complaint' },
  { value: 'other', label: 'Something else' },
]

const CHANNELS = [
  {
    icon: Mail,
    title: 'Email us',
    body: APP.email,
    note: 'We reply within one working day',
    href: `mailto:${APP.email}`,
  },
  {
    icon: Phone,
    title: 'Call us',
    body: APP.phone,
    note: 'Mon–Sat, 9:00 am – 7:00 pm IST',
    href: `tel:${APP.phone.replace(/\s/g, '')}`,
  },
  {
    icon: MapPin,
    title: 'Visit the office',
    body: APP.address,
    note: 'Visits by appointment',
  },
]

const FAQS = [
  {
    q: 'How quickly can I collect a donation?',
    a: 'Most pickups are confirmed within 20 minutes of a request. Collection must happen inside the pickup window shown on the donation.',
  },
  {
    q: 'What if I reach the pickup point late?',
    a: 'Message the donor through the in-app chat as early as possible. If the food is no longer safe to share, the donor may cancel the donation and we log it transparently.',
  },
  {
    q: 'Does FoodBridge deliver food?',
    a: 'FoodBridge coordinates donations between partners. Volunteers and NGOs collect the food using their own transport or a partner arrangement.',
  },
  {
    q: 'How do I report a problem?',
    a: 'Open the donation, use the report option and describe what happened. Our admin team reviews every report and can suspend accounts where food safety is at risk.',
  },
]

export default function Contact() {
  const toast = useToast()
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'donate',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const rules = {
    name: validators.required,
    email: validators.email,
    phone: (v) => (v ? validators.phone(v) : null),
    subject: validators.required,
    message: (v) => validators.required(v, 'Please tell us how we can help.') || validators.minLength(v, 15, 'Please add a little more detail (at least 15 characters).'),
  }

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: null }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(values, rules)
    setErrors(nextErrors)
    setFormError('')
    if (hasErrors(nextErrors)) {
      setFormError('Please correct the highlighted fields.')
      return
    }
    setSending(true)
    try {
      await submitContactForm(values)
      setSent(true)
      setValues({ name: '', email: '', phone: '', subject: 'donate', message: '' })
      toast.success('Thank you! Our team will get back to you shortly.', { title: 'Message sent' })
    } catch (error) {
      setFormError(error?.message ?? 'We could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Contact"
        title="We would love to hear from you"
        description="Questions about donating, requesting food, volunteering or anything else — pick whichever channel suits you."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.3fr]">
        {/* channels */}
        <div className="space-y-6">
          <ul className="space-y-4">
            {CHANNELS.map((channel, index) => {
              const Icon = channel.icon
              const content = (
                <>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-forest-900">{channel.title}</p>
                    <p className="mt-0.5 text-sm break-words text-forest-600">{channel.body}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-forest-400">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {channel.note}
                    </p>
                  </div>
                </>
              )
              return (
                <motion.li
                  key={channel.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="card card-hover flex items-start gap-4 p-5 no-underline"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="card flex items-start gap-4 p-5">{content}</div>
                  )}
                </motion.li>
              )
            })}
          </ul>

          <div className="card p-6">
            <h2 className="text-base font-semibold">Quick answers</h2>
            <div className="mt-4 space-y-3">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group rounded-xl border border-forest-100 p-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-forest-900">
                    {faq.q}
                    <span className="text-lg leading-none text-brand-600" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 text-sm leading-relaxed text-forest-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* form */}
        <div className="card p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="h-5 w-5 text-brand-600" aria-hidden="true" />
            Send us a message
          </h2>
          <p className="mt-1.5 text-sm text-forest-600">
            Fields marked with <span className="text-danger-500">*</span> are required. We never share your
            contact details.
          </p>

          {sent ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-success-500/25 bg-success-50 p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-success-700">Message sent</p>
                <p className="mt-1 text-sm text-success-700/90">
                  Thank you for reaching out. Someone from the team will reply within one working day.
                </p>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                name="name"
                required
                icon={UserRound}
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                error={errors.name}
                placeholder="e.g. Rahul Varma"
              />
              <Input
                label="Email address"
                name="email"
                type="email"
                required
                icon={Mail}
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
              />
              <Input
                label="Phone number"
                name="phone"
                type="tel"
                icon={Phone}
                value={values.phone}
                onChange={(e) => setField('phone', e.target.value)}
                error={errors.phone}
                placeholder="+91 98470 00000"
                hint="Optional"
              />
              <Select
                label="What is this about?"
                name="subject"
                required
                value={values.subject}
                onChange={(e) => setField('subject', e.target.value)}
                error={errors.subject}
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea
              label="Message"
              name="message"
              required
              rows={6}
              value={values.message}
              onChange={(e) => setField('message', e.target.value)}
              error={errors.message}
              placeholder="Tell us what you need, which area you are in and any timing that matters."
            />

            {formError ? (
              <div
                className="flex items-start gap-2 rounded-xl border border-danger-500/25 bg-danger-50 p-3.5 text-sm text-danger-700"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {formError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-forest-500">
                By sending this you agree to our{' '}
                <a href="/privacy" className="font-semibold text-brand-700 underline">
                  privacy policy
                </a>
                .
              </p>
              <Button type="submit" size="lg" loading={sending}>
                <Send className="h-4 w-4" aria-hidden="true" />
                Send message
              </Button>
            </div>
          </form>

          <div className="mt-8 grid gap-3 border-t border-forest-100 pt-6 sm:grid-cols-3">
            {[
              { icon: UtensilsCrossed, label: 'Hotel or restaurant', to: '/register?role=hotel' },
              { icon: HeartHandshake, label: 'NGO or community', to: '/register?role=ngo' },
              { icon: HandHeart, label: 'Volunteer with us', to: '/register?role=volunteer' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Button key={item.label} to={item.to} variant="subtle" size="sm" className="justify-start">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-forest-100 bg-white py-10">
        <div className="container-page flex flex-col items-center gap-3 text-center text-sm text-forest-600">
          <Building2 className="h-5 w-5 text-brand-600" aria-hidden="true" />
          <p className="max-w-2xl">
            {APP.name} is a fictional demo platform. All organisations, contact details and addresses shown
            in this app are placeholder data.
          </p>
        </div>
      </div>
    </div>
  )
}
