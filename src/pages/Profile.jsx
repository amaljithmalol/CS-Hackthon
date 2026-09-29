import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'g
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  HandHeart,
  HeartHandshake,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Trophy,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import Badge, { VerifiedBadge } from '../components/Badge'
import StatCard from '../components/StatCard'
import { Card, Divider, SectionHeading } from '../components/Card'
import { Input, Select, Textarea } from '../components/Input'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMyDonations } from '../services/donations'
import { CITIES, EMPTY_LIST, ROLE_LABELS, ROLE_SHORT } from '../utils/constants'
import { donationMetrics } from '../utils/metrics'
import { formatDate, formatDateTime } from '../utils/formatDate'
import { hasErrors, validate, validators } from '../utils/validation'
import { roleHome } from '../utils/dashNav'

const AVAILABILITY = ['Weekday mornings', 'Weekday evenings', 'Weekends', 'Flexible', 'On call']
const VEHICLES = ['Walk / cycle', 'Bicycle', 'Two-wheeler', 'Car', 'Public transport']

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()

  const [values, setValues] = useState({
    name: '',
    phone: '',
    address: '',
    area: '',
    city: 'Kozhikode',
    bio: '',
    availability: '',
    vehicle: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!user) return
    setValues({
      name: user.name ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      area: user.area ?? '',
      city: user.city ?? 'Kozhikode',
      bio: user.bio ?? '',
      availability: user.availability ?? '',
      vehicle: user.vehicle ?? '',
    })
  }, [user])

  const rules = useMemo(
    () => ({
      name: (v) => validators.required(v, 'Please enter your name.') || validators.minLength(v, 3),
      phone: validators.phone,
      address: (v) => validators.minLength(v, 8, 'Please enter your full address.'),
      area: (v) => validators.required(v, 'Please enter your area.'),
    }),
    [],
  )

  const stats = useAsync(
    () => (user ? getMyDonations('all', { sort: 'newest' }) : Promise.resolve({ donations: [] })),
    [user?.id],
  )
  const donations = stats.data?.donations ?? EMPTY_LIST

  const totals = useMemo(() => {
    const m = donationMetrics(donations)
    return {
      donations: m.total,
      meals: m.meals,
      kg: m.kg,
      co2: m.co2,
      people: m.beneficiaries,
      completed: m.completed,
    }
  }, [donations])

  if (!user) return null

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
    setSaving(true)
    try {
      await updateProfile(values)
      toast.success('Your profile has been updated.', { title: 'Saved' })
    } catch (error) {
      setFormError(error?.message ?? 'We could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const joined = user.created_at ? formatDate(user.created_at) : '—'

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Keep your contact and location details current so pickups run smoothly."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Profile' }]}
        action={
          <div className="flex gap-3">
            <Button to="/settings" variant="outline">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Settings
            </Button>
            <Button to={roleHome[user.role] ?? '/dashboard'}>
              Go to dashboard
            </Button>
          </div>
        }
      />

      <div className="container-page grid gap-6 py-10 lg:grid-cols-[20rem_1fr]">
        {/* ------------------------------------------------------- sidebar */}
        <aside className="space-y-5">
          <Card className="p-6 text-center">
            <div className="flex justify-center">
              <Avatar name={user.organization_name ?? user.name} size="xl" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">{user.organization_name ?? user.name}</h2>
            <p className="text-sm text-forest-500">{user.name}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge tone="brand">{ROLE_LABELS[user.role]}</Badge>
              <VerifiedBadge status={user.verification_status ?? 'pending'} />
            </div>
            <ul className="mt-6 space-y-3 text-left text-sm">
              <li className="flex items-center gap-2.5 text-forest-600">
                <Mail className="h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                <span className="truncate">{user.email}</span>
              </li>
              <li className="flex items-center gap-2.5 text-forest-600">
                <Phone className="h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                {user.phone ?? '—'}
              </li>
              <li className="flex items-center gap-2.5 text-forest-600">
                <MapPin className="h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block">
                    {user.area}
                    {user.city ? `, ${user.city}` : ''}
                  </span>
                  <span className="block truncate text-xs text-forest-400">{user.address}</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-forest-600">
                <Calendar className="h-4 w-4 shrink-0 text-forest-400" aria-hidden="true" />
                Member since {joined}
              </li>
            </ul>
            <Button to="/settings" variant="subtle" className="mt-6 w-full">
              Edit details
            </Button>
          </Card>

          {user.role === 'hotel' ? (
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
                Organisation
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-forest-500">Name</dt>
                  <dd className="font-medium text-forest-800">
                    {user.organization?.organization_name ?? user.organization_name ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-forest-500">Type</dt>
                  <dd className="font-medium text-forest-800">
                    {user.organization?.organization_type ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-forest-500">Registration no.</dt>
                  <dd className="font-medium text-forest-800">
                    {user.organization?.registration_number ?? '—'}
                  </dd>
                </div>
                {user.organization?.document_name ? (
                  <div>
                    <dt className="text-xs text-forest-500">Document on file</dt>
                    <dd className="truncate font-medium text-forest-800">
                      {user.organization.document_name}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </Card>
          ) : null}

          {user.role === 'volunteer' ? (
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <HandHeart className="h-4 w-4 text-brand-600" aria-hidden="true" />
                Volunteering
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-forest-500">Availability</dt>
                  <dd className="font-medium text-forest-800">{user.availability ?? '—'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-forest-500">Transport</dt>
                  <dd className="font-medium text-forest-800">{user.vehicle ?? '—'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-forest-500">Completed pickups</dt>
                  <dd className="font-medium text-forest-800">{user.completed_tasks ?? 0}</dd>
                </div>
              </dl>
            </Card>
          ) : null}

          {user.role === 'ngo' ? (
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <HeartHandshake className="h-4 w-4 text-brand-600" aria-hidden="true" />
                Our work
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-forest-500">People supported</dt>
                  <dd className="font-medium text-forest-800">{(user.beneficiaries ?? 0).toLocaleString('en-IN')}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-forest-500">Donations received</dt>
                  <dd className="font-medium text-forest-800">{donations.length}</dd>
                </div>
              </dl>
            </Card>
          ) : null}
        </aside>

        {/* --------------------------------------------------------- main */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.loading
              ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
              : [
                  {
                    label: ROLE_SHORT[user.role] === 'Hotel' ? 'Donations posted' : 'Donations involved',
                    value: totals.donations,
                    icon: PackageCheck,
                    tone: 'brand',
                  },
                  { label: 'Meals rescued', value: totals.meals, icon: Sparkles, tone: 'success' },
                  { label: 'Food diverted', value: totals.kg, unit: 'kg', icon: TrendingDown, tone: 'amber' },
                  { label: 'CO₂ avoided', value: totals.co2, unit: 'kg', icon: Trophy, tone: 'info' },
                ].map((stat, index) => (
                  <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    unit={stat.unit}
                    icon={stat.icon}
                    tone={stat.tone}
                    index={index}
                    hint={`${totals.completed} completed donations`}
                  />
                ))}
          </div>

          <Card className="p-6 sm:p-7">
            <h2 className="text-lg font-semibold">Edit your details</h2>
            <p className="mt-1 text-sm text-forest-600">
              These details appear on your donation listings and pickup instructions.
            </p>
            <Divider className="my-6" />
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  name="name"
                  required
                  value={values.name}
                  onChange={(e) => setField('name', e.target.value)}
                  error={errors.name}
                />
                <Input
                  label="Phone number"
                  name="phone"
                  type="tel"
                  required
                  value={values.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  error={errors.phone}
                />
                <Input
                  label="Area"
                  name="area"
                  required
                  value={values.area}
                  onChange={(e) => setField('area', e.target.value)}
                  error={errors.area}
                />
                <Select
                  label="City"
                  name="city"
                  value={values.city}
                  onChange={(e) => setField('city', e.target.value)}
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Address"
                  name="address"
                  required
                  wrapperClassName="sm:col-span-2"
                  value={values.address}
                  onChange={(e) => setField('address', e.target.value)}
                  error={errors.address}
                />
                <Textarea
                  label="About you"
                  name="bio"
                  rows={3}
                  wrapperClassName="sm:col-span-2"
                  value={values.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                  placeholder={
                    user.role === 'volunteer'
                      ? 'Which areas can you collect from, and when?'
                      : user.role === 'ngo'
                        ? 'Which programmes do you run, and who do you serve?'
                        : 'Tell NGOs a little about your kitchen.'
                  }
                  hint="Shown to partners who contact you about a donation."
                />
                {user.role === 'volunteer' ? (
                  <>
                    <Select
                      label="Availability"
                      name="availability"
                      value={values.availability}
                      onChange={(e) => setField('availability', e.target.value)}
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
                  </>
                ) : null}
              </div>

              {formError ? (
                <div
                  className="flex items-start gap-2 rounded-xl border border-danger-500/25 bg-danger-50 p-3.5 text-sm text-danger-700"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button to="/settings" variant="ghost">
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 sm:p-7">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <p className="mt-1 text-sm text-forest-600">The latest donations you have been part of.</p>
            <div className="mt-5">
              {stats.loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : donations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-forest-200 p-8 text-center">
                  <UtensilsCrossed className="mx-auto h-8 w-8 text-forest-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-forest-700">No activity yet</p>
                  <p className="mt-1 text-sm text-forest-500">
                    {user.role === 'hotel'
                      ? 'Post your first donation to see it here.'
                      : 'Request a donation to see it appear here.'}
                  </p>
                  <Button
                    to={user.role === 'hotel' ? '/hotel/create-donation' : '/donations'}
                    className="mt-4"
                  >
                    {user.role === 'hotel' ? 'Post surplus food' : 'Find food'}
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {donations.slice(0, 6).map((donation) => (
                    <li key={donation.id}>
                      <Link
                        to={`/donations/${donation.id}`}
                        className="flex items-center gap-4 rounded-xl border border-forest-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                      >
                        <img
                          src={donation.image}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-forest-900">
                            {donation.food_name}
                          </p>
                          <p className="truncate text-xs text-forest-500">
                            {donation.meals} meals · {formatDateTime(donation.pickup_start)}
                          </p>
                        </div>
                        <Badge tone="neutral">{donation.status}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className="p-6 sm:p-7">
            <SectionHeading
              eyebrow="Milestones"
              title="Your contribution so far"
              description="Numbers based on completed donations you have been part of."
              align="left"
            />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: CheckCircle2, text: `${totals.completed} donations completed` },
                { icon: Users, text: `${totals.people.toLocaleString('en-IN')} people reached` },
                { icon: BadgeCheck, text: `Status: ${user.verification_status ?? 'pending'}` },
                { icon: PackageCheck, text: `${totals.meals} meals rescued` },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <li
                    key={item.text}
                    className="flex items-center gap-2.5 rounded-xl bg-forest-50 px-4 py-3 text-sm text-forest-700"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {item.text}
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
