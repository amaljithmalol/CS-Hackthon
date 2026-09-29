import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  HandHeart,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react'
import Button from '../components/Button'
import Logo from '../components/Logo'
import { Input, PasswordInput, RadioCard, Select, Textarea } from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { hasErrors, validate, validators } from '../utils/validation'
import { CITIES, ROLE_LABELS } from '../utils/constants'
import { cn } from '../utils/cn'

const ROLE_CARDS = [
  {
    value: 'hotel',
    title: 'Hotel / Restaurant',
    description: 'Post surplus food from your kitchen',
    icon: UtensilsCrossed,
  },
  { value: 'ngo', title: 'NGO', description: 'Collect food for your community', icon: HeartHandshake },
  { value: 'volunteer', title: 'Volunteer', description: 'Help collect and deliver meals', icon: HandHeart },
]

const AVAILABILITY = ['Weekday mornings', 'Weekday evenings', 'Weekends', 'Flexible', 'On call']
const VEHICLES = ['Walk / cycle', 'Bicycle', 'Two-wheeler', 'Car', 'Public transport']

const baseValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'hotel',
  address: '',
  area: '',
  city: 'Kozhikode',
  organization_name: '',
  organization_type: 'Restaurant',
  registration_number: '',
  document_name: '',
  availability: '',
  vehicle: '',
}

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [values, setValues] = useState(() => ({
    ...baseValues,
    role: params.get('role') ?? 'hotel',
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const role = params.get('role')
    if (role && ['hotel', 'ngo', 'volunteer'].includes(role)) {
      setValues((v) => ({ ...v, role }))
    }
  }, [params])

  const rules = useMemo(
    () => ({
      name: (v) => validators.required(v, 'Please enter your full name.') || validators.minLength(v, 3),
      email: validators.email,
      phone: validators.phone,
      password: (v) => validators.required(v, 'Please create a password.') || validators.minLength(v, 8, 'Password must be at least 8 characters.'),
      confirmPassword: (v) => validators.match(v, values.password),
      address: (v) => validators.minLength(v, 8, 'Please enter your full address.'),
      area: (v) => validators.required(v, 'Please enter your area.'),
      organization_name: (v) =>
        values.role === 'volunteer' ? null : validators.required(v, 'Please enter your organisation name.'),
      registration_number: (v) =>
        values.role === 'volunteer' ? null : validators.required(v, 'Please enter your registration number.'),
      availability: (v) => (values.role === 'volunteer' ? validators.required(v, 'Please choose your availability.') : null),
    }),
    [values.password, values.role],
  )

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
      setFormError('Please correct the highlighted fields before continuing.')
      return
    }

    setLoading(true)
    try {
      await register({ ...values, role: values.role })
      toast.success('Your account has been created. Please sign in to continue.', {
        title: 'Welcome to FoodBridge',
      })
      navigate(`/login?redirect=/${values.role}/dashboard`, { replace: true })
    } catch (error) {
      setFormError(error?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <Logo className="mx-auto w-fit" />
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-3xl font-semibold sm:text-4xl"
          >
            Join the FoodBridge community
          </motion.h1>
          <p className="mx-auto mt-3 max-w-2xl text-forest-600">
            Whether you run a kitchen, run a shelter or want to volunteer an evening — you can make a real
            difference in under two minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
          {/* role */}
          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold">1. Choose your role</h2>
            <p className="mt-1 text-sm text-forest-500">This decides which dashboard you will see after signing in.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {ROLE_CARDS.map((card) => (
                <RadioCard
                  key={card.value}
                  name="role"
                  value={card.value}
                  checked={values.role === card.value}
                  onChange={(value) => setField('role', value)}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                />
              ))}
            </div>
          </section>

          {/* personal */}
          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold">2. Your details</h2>
            <p className="mt-1 text-sm text-forest-500">We only use these details to coordinate pickups.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                name="name"
                required
                autoComplete="name"
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
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
              />
              <Input
                label="Phone number"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => setField('phone', e.target.value)}
                error={errors.phone}
                placeholder="+91 98470 00000"
              />
              <Select label="City" name="city" value={values.city} onChange={(e) => setField('city', e.target.value)}>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
              <Input
                label="Area"
                name="area"
                required
                value={values.area}
                onChange={(e) => setField('area', e.target.value)}
                error={errors.area}
                placeholder="e.g. MG Road"
              />
              <Input
                label="Address"
                name="address"
                required
                value={values.address}
                onChange={(e) => setField('address', e.target.value)}
                error={errors.address}
                placeholder="Street, landmark, city"
                wrapperClassName="sm:col-span-2"
              />
              <PasswordInput
                label="Password"
                name="password"
                required
                autoComplete="new-password"
                value={values.password}
                onChange={(e) => setField('password', e.target.value)}
                error={errors.password}
                hint="At least 8 characters."
              />
              <PasswordInput
                label="Confirm password"
                name="confirmPassword"
                required
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
              />
            </div>
          </section>

          {/* role specific */}
          {values.role === 'volunteer' ? (
            <section className="card p-5 sm:p-6">
              <h2 className="text-base font-semibold">3. Volunteer details</h2>
              <p className="mt-1 text-sm text-forest-500">
                This helps NGOs assign pickups you can actually complete.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Select
                  label="Availability"
                  name="availability"
                  required
                  value={values.availability}
                  onChange={(e) => setField('availability', e.target.value)}
                  error={errors.availability}
                >
                  <option value="">Select availability</option>
                  {AVAILABILITY.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <Select
                  label="How will you collect?"
                  name="vehicle"
                  value={values.vehicle}
                  onChange={(e) => setField('vehicle', e.target.value)}
                >
                  <option value="">Select an option</option>
                  {VEHICLES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <Textarea
                  label="Anything else we should know?"
                  name="bio"
                  rows={3}
                  wrapperClassName="sm:col-span-2"
                  placeholder="e.g. Available for night pickups near Chevayoor."
                  value={values.bio ?? ''}
                  onChange={(e) => setField('bio', e.target.value)}
                />
              </div>
            </section>
          ) : (
            <section className="card p-5 sm:p-6">
              <h2 className="text-base font-semibold">3. Organisation details</h2>
              <p className="mt-1 text-sm text-forest-500">
                Our admin team verifies every partner before they can post or request donations.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input
                  label={values.role === 'hotel' ? 'Hotel / restaurant name' : 'Organisation name'}
                  name="organization_name"
                  required
                  value={values.organization_name}
                  onChange={(e) => setField('organization_name', e.target.value)}
                  error={errors.organization_name}
                  placeholder={values.role === 'hotel' ? 'e.g. Green Leaf Restaurant' : 'e.g. Snehapooram Trust'}
                  icon={Building2}
                />
                <Select
                  label="Organisation type"
                  name="organization_type"
                  value={values.organization_type}
                  onChange={(e) => setField('organization_type', e.target.value)}
                >
                  {(values.role === 'hotel'
                    ? ['Restaurant', 'Hotel', 'Bakery', 'Supermarket', 'Catering service', 'Event organiser']
                    : ['NGO', 'Charitable trust', 'Community kitchen', 'Shelter', 'Religious group']
                  ).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Registration number"
                  name="registration_number"
                  required
                  value={values.registration_number}
                  onChange={(e) => setField('registration_number', e.target.value)}
                  error={errors.registration_number}
                  placeholder="e.g. KL-TRD-2024-1234"
                />
                <div className="space-y-1.5">
                  <label htmlFor="document" className="block text-sm font-medium text-forest-800">
                    Verification document
                  </label>
                  <label
                    htmlFor="document"
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 transition',
                      values.document_name
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-forest-300 hover:border-brand-400 hover:bg-brand-50/50',
                    )}
                  >
                    <FileText className="h-5 w-5 text-brand-600" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-forest-800">
                        {values.document_name || 'Upload licence or registration'}
                      </span>
                      <span className="block text-xs text-forest-500">PDF or image, up to 2 MB</span>
                    </span>
                    <input
                      id="document"
                      type="file"
                      accept=".pdf,image/*"
                      className="sr-only"
                      onChange={(e) => setField('document_name', e.target.files?.[0]?.name ?? '')}
                    />
                  </label>
                  <p className="text-xs text-forest-500">
                    Documents are reviewed by the admin team. Nothing is published publicly.
                  </p>
                </div>
              </div>
            </section>
          )}

          {formError ? (
            <div
              className="flex items-start gap-2 rounded-xl border border-danger-500/25 bg-danger-50 p-4 text-sm text-danger-700"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-forest-500">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-brand-700 hover:underline">
                Sign in
              </Link>
            </p>
            <Button type="submit" size="lg" loading={loading}>
              Create {ROLE_LABELS[values.role]} account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </form>

        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, text: 'Partners are verified by our admin team' },
            { icon: Leaf, text: 'Free to join — always' },
            { icon: CheckCircle2, text: 'You control your data and can leave anytime' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <li key={item.text} className="flex items-start gap-2.5 rounded-xl bg-white p-4 text-xs text-forest-600 shadow-soft">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                {item.text}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
