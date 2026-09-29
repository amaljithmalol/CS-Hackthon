import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Leaf,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  ShieldAlert,
  Truck,
  UtensilsCrossed,
  Weight,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Badge, { DietBadge, StatusBadge, VerifiedBadge } from '../components/Badge'
import { Card } from '../components/Card'
import StatusTimeline from '../components/StatusTimeline'
import MapView from '../components/MapView'
import ErrorState from '../components/ErrorState'
import { LoadingBlock } from '../components/LoadingSpinner'
import { ConfirmDialog } from '../components/Modal'
import { useAsync } from '../hooks/useAsync'
import { useDonationRequest } from '../hooks/useDonationRequest'
import { getDonationById, updateDonationStatus } from '../services/donations'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate, formatDateTime, formatTimeRange, timeAgo, timeRemaining } from '../utils/formatDate'
import { formatDistance } from '../utils/geo'
import { getCategory } from '../utils/constants'
import { cn } from '../utils/cn'

const NEXT_ACTION = {
  requested: { label: 'Assign a volunteer', status: 'assigned', role: 'hotel/ngo' },
  assigned: { label: 'Start collection', status: 'collecting', role: 'volunteer' },
  collecting: { label: 'Confirm collection', status: 'collected', role: 'volunteer' },
  collected: { label: 'Mark as delivered', status: 'delivered', role: 'volunteer' },
  delivered: { label: 'Mark donation completed', status: 'completed', role: 'ngo/hotel' },
}

export default function DonationDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const { data, loading, error, reload } = useAsync(() => getDonationById(id), [id])
  const request = useDonationRequest({ onSuccess: reload })

  const donation = data?.donation

  const nextAction = donation ? NEXT_ACTION[donation.status] : null
  const allowedRoles = nextAction ? nextAction.role.split('/') : []
  const canAdvance = Boolean(
    donation && nextAction && user && (allowedRoles.includes(user.role) || user.role === 'admin'),
  )

  const handleAdvance = async () => {
    setBusy(true)
    try {
      await updateDonationStatus(donation.id, nextAction.status)
      toast.success(`Status updated to “${nextAction.label.replace('Mark donation ', '')}”.`)
      reload()
    } catch (err) {
      toast.error(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-16">
        <LoadingBlock label="Loading donation details…" />
      </div>
    )
  }

  if (error || !donation) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="We could not find this donation"
          message={error ?? 'This donation may have been removed or is no longer available.'}
          onRetry={reload}
        />
        <div className="mt-6 text-center">
          <Button to="/donations" variant="outline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to donations
          </Button>
        </div>
      </div>
    )
  }

  const category = getCategory(donation.category)
  const deadline = timeRemaining(donation.pickup_end)
  const isClosed = ['completed', 'cancelled', 'expired'].includes(donation.status)

  return (
    <div>
      <PageHeader
        eyebrow={category.label}
        title={donation.food_name}
        description={`Posted by ${donation.donor?.name ?? 'a community partner'} · ${timeAgo(donation.created_at)}`}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Donations', to: '/donations' },
          { label: donation.food_name },
        ]}
        action={
          <>
            <Button variant="outline" to="/donations">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            {donation.status === 'posted' ? (
              <Button onClick={() => request.openRequest(donation)}>Request donation</Button>
            ) : null}
          </>
        }
      />

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_22rem] lg:py-10">
        <div className="space-y-6">
          {/* image + key facts */}
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-forest-50 sm:aspect-[21/9]">
              <img
                src={donation.image || category.image}
                alt={`${donation.food_name} donation`}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <StatusBadge status={donation.status} />
                <DietBadge diet={donation.diet} />
              </div>
            </div>

            <div className="grid gap-px bg-forest-100 sm:grid-cols-2 lg:grid-cols-4">
              <Fact icon={UtensilsCrossed} label="Meals" value={`${donation.meals}`} />
              <Fact icon={Weight} label="Quantity" value={`${donation.quantity} ${donation.unit}`} />
              <Fact icon={Clock} label="Prepared at" value={formatTimeRange(donation.preparation_time, donation.consume_before)} />
              <Fact
                icon={CalendarClock}
                label="Pickup window"
                value={formatTimeRange(donation.pickup_start, donation.pickup_end)}
                tone={deadline.expired && !isClosed ? 'danger' : undefined}
              />
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-forest-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft">
                    <Leaf className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest-900">{donation.donor?.name}</p>
                    <p className="text-xs text-forest-500">
                      {donation.donor?.contact_name} · {donation.donor?.area ?? donation.donor?.city}
                    </p>
                  </div>
                </div>
                {donation.donor ? (
                  <VerifiedBadge
                    status={donation.donor.verification_status}
                    label={donation.donor.verified ? 'Verified Hotel' : 'Verification pending'}
                  />
                ) : null}
              </div>

              <div>
                <h2 className="text-base font-semibold">About this donation</h2>
                <p className="mt-2 text-sm leading-relaxed text-forest-600">{donation.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-forest-100 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldAlert className="h-4 w-4 text-amber-soft-600" aria-hidden="true" />
                    Allergen information
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {donation.allergens?.length ? (
                      donation.allergens.map((allergen) => (
                        <Badge key={allergen} tone={allergen === 'None' ? 'success' : 'amber'}>
                          {allergen}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-forest-500">Not declared</span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-forest-100 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Package className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    Handling notes
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-forest-600">
                    <li>
                      Packaging available:{' '}
                      <span className="font-medium text-forest-900">
                        {donation.packaging_available ? 'Yes' : 'No'}
                      </span>
                    </li>
                    <li>Consume before: {formatDateTime(donation.consume_before)}</li>
                    <li>Diet: {donation.diet}</li>
                  </ul>
                </div>
              </div>

              {donation.special_instructions ? (
                <div className="rounded-xl border border-amber-soft-200 bg-amber-soft-50 p-4">
                  <h3 className="text-sm font-semibold text-amber-soft-700">Special instructions</h3>
                  <p className="mt-1.5 text-sm text-amber-soft-700">{donation.special_instructions}</p>
                </div>
              ) : null}
            </div>
          </Card>

          {/* tracking */}
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Donation tracking</h2>
                <p className="mt-1 text-sm text-forest-500">
                  Every step is recorded so donors and recipients stay on the same page.
                </p>
              </div>
              <StatusBadge status={donation.status} />
            </div>

            <div className="mt-6 hidden md:block">
              <StatusTimeline status={donation.status} donation={donation} orientation="horizontal" />
            </div>
            <div className="mt-6 md:hidden">
              <StatusTimeline status={donation.status} donation={donation} />
            </div>

            {canAdvance ? (
              <div className="mt-6 flex flex-wrap gap-3 border-t border-forest-100 pt-5">
                <Button onClick={handleAdvance} loading={busy}>
                  <Truck className="h-4 w-4" aria-hidden="true" />
                  {nextAction.label}
                </Button>
                {nextAction.status === 'completed' ? (
                  <p className="text-xs text-forest-500">
                    Completing records the donation and adds it to your impact report.
                  </p>
                ) : null}
              </div>
            ) : null}
          </Card>

          {/* map */}
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold">Pickup location</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-forest-600">
              <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
              {donation.pickup_address}
              {donation.distance_km ? ` · ${formatDistance(donation.distance_km)} away` : ''}
            </p>
            <div className="mt-4">
              <MapView
                donations={[donation]}
                activeTypes={['donation']}
                center={[donation.latitude, donation.longitude]}
                zoom={15}
                height="h-72"
                showLegend={false}
                onRequest={request.openRequest}
              />
            </div>
          </Card>
        </div>

        {/* sidebar */}
        <aside className="space-y-4">
          <Card className="sticky top-24 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Donation status</p>
              <StatusBadge status={donation.status} />
            </div>

            <p
              className={cn(
                'mt-3 rounded-xl p-3 text-sm',
                deadline.expired && !isClosed ? 'bg-danger-50 text-danger-700' : 'bg-forest-50 text-forest-700',
              )}
            >
              {isClosed ? `This donation was ${donation.status}.` : deadline.label}
            </p>

            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Requested by" value={donation.requester?.name ?? 'Not yet requested'} />
              <Row label="Volunteer" value={donation.volunteer?.name ?? 'Not assigned'} />
              <Row label="People served" value={donation.beneficiaries ? `${donation.beneficiaries} people` : '—'} />
              <Row label="Pickup date" value={formatDate(donation.pickup_start)} />
            </dl>

            <div className="mt-5 space-y-2.5">
              {donation.status === 'posted' ? (
                <Button className="w-full" onClick={() => request.openRequest(donation)}>
                  Request donation
                </Button>
              ) : null}
              {canAdvance ? (
                <Button className="w-full" onClick={handleAdvance} loading={busy}>
                  {nextAction.label}
                </Button>
              ) : null}
              {user ? (
                <Button variant="subtle" className="w-full" to="/messages">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Message {donation.donor?.name?.split(' ')[0] ?? 'the donor'}
                </Button>
              ) : (
                <Button variant="subtle" className="w-full" to="/login" state={{ from: `/donations/${donation.id}` }}>
                  Sign in to request
                </Button>
              )}
              {donation.donor?.phone ? (
                <a
                  href={`tel:${donation.donor.phone.replace(/\s/g, '')}`}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-forest-200 text-sm font-semibold text-forest-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Contact {donation.donor.contact_name?.split(' ')[0] ?? 'the donor'}
                </a>
              ) : null}
            </div>

            <p className="mt-5 flex items-start gap-2 rounded-xl bg-forest-50 p-3 text-[11px] leading-relaxed text-forest-600">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
              Always follow the{' '}
              <Link to="/food-safety" className="font-semibold text-brand-700 underline">
                food safety guidelines
              </Link>{' '}
              when collecting and distributing. FoodBridge does not certify food as safe to eat.
            </p>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="p-5">
              <h3 className="text-sm font-semibold">Questions about this donation?</h3>
              <p className="mt-2 text-sm text-forest-600">
                Message the donor directly to coordinate timing, packaging or pickup instructions.
              </p>
              <Button to={user ? '/messages' : '/login'} variant="outline" size="sm" className="mt-4">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Open messages
              </Button>
            </Card>
          </motion.div>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(request.pending)}
        onClose={request.cancelRequest}
        onConfirm={request.confirmRequest}
        loading={request.loading}
        title="Send donation request?"
        confirmLabel="Send request"
        message={
          request.pending ? (
            <div className="space-y-3">
              <p>
                Requesting <strong className="text-forest-900">{request.pending.meals} meals</strong> of{' '}
                <strong className="text-forest-900">{request.pending.food_name}</strong> (
                {request.pending.quantity} {request.pending.unit}).
              </p>
              <p className="rounded-xl bg-forest-50 p-3 text-xs">
                Pickup from {formatDateTime(request.pending.pickup_start)} at {request.pending.pickup_address}.
              </p>
            </div>
          ) : null
        }
      />
    </div>
  )
}

function Fact({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-forest-500">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </p>
      <p className={cn('mt-1 text-sm font-semibold text-forest-900', tone === 'danger' && 'text-danger-600')}>
        {value}
      </p>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-forest-500">{label}</dt>
      <dd className="text-right font-medium text-forest-900">{value}</dd>
    </div>
  )
}
