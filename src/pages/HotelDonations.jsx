import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, History, Inbox, PlusCircle, UserCheck, XCircle } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState } from '../components/Card'
import { ConfirmDialog, Modal } from '../components/Modal'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import StatusTimeline from '../components/StatusTimeline'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../context/ToastContext'
import {
  assignVolunteer,
  getMyDonations,
  getVolunteers,
  updateDonationStatus,
} from '../services/donations'
import { hotelNav } from '../utils/dashNav'
import { donationMetrics } from '../utils/metrics'
import { formatDateTime, timeRemaining } from '../utils/formatDate'
import { EMPTY_LIST, STATUS_LABEL } from '../utils/constants'
import { cn } from '../utils/cn'

const TABS = [
  { id: 'active', label: 'Active', statuses: ['posted', 'requested', 'assigned', 'collecting'] },
  { id: 'collected', label: 'Collected', statuses: ['collected', 'delivered'] },
  { id: 'completed', label: 'Completed', statuses: ['completed'] },
  { id: 'closed', label: 'Cancelled / expired', statuses: ['cancelled', 'expired'] },
  { id: 'all', label: 'All', statuses: null },
]

export default function HotelDonations() {
  const toast = useToast()
  const [tab, setTab] = useState('active')
  const [assigning, setAssigning] = useState(null)
  const [completing, setCompleting] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, loading, error, reload } = useAsync(() => getMyDonations('donor'), [])
  const volunteers = useAsync(() => getVolunteers(), [])
  const donations = data?.donations ?? EMPTY_LIST
  const metrics = useMemo(() => donationMetrics(donations), [donations])

  const counts = useMemo(
    () =>
      TABS.reduce((acc, item) => {
        acc[item.id] = item.statuses ? donations.filter((d) => item.statuses.includes(d.status)).length : donations.length
        return acc
      }, {}),
    [donations],
  )

  const current = TABS.find((t) => t.id === tab)
  const list = current?.statuses ? donations.filter((d) => current.statuses.includes(d.status)) : donations

  const handleAssign = async (volunteerId) => {
    setBusy(true)
    try {
      await assignVolunteer(assigning.id, volunteerId)
      const name = volunteers.data?.volunteers?.find((v) => v.id === volunteerId)?.name ?? 'the volunteer'
      toast.success(`${name} has been assigned and notified of the pickup.`, { title: 'Volunteer assigned' })
      setAssigning(null)
      reload()
    } catch (err) {
      toast.error(err?.message ?? 'We could not assign that volunteer.')
    } finally {
      setBusy(false)
    }
  }

  const handleComplete = async (beneficiaries) => {
    setBusy(true)
    try {
      await updateDonationStatus(completing.id, 'completed', { beneficiaries })
      toast.success('Donation marked as completed. Thank you for rescuing this food!', {
        title: 'Completed',
      })
      setCompleting(null)
      reload()
    } catch (err) {
      toast.error(err?.message ?? 'We could not complete this donation.')
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = async () => {
    setBusy(true)
    try {
      await updateDonationStatus(cancelling.id, 'cancelled')
      toast.info('Donation cancelled and partners have been notified.')
      setCancelling(null)
      reload()
    } catch (err) {
      toast.error(err?.message ?? 'We could not cancel this donation.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout
      title="My donations"
      subtitle={`${metrics.active} active · ${metrics.meals.toLocaleString('en-IN')} meals rescued`}
      nav={hotelNav}
      actions={
        <Button to="/hotel/create-donation" size="sm">
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New donation</span>
        </Button>
      }
    >
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter donations by status"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition',
              tab === item.id
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
            )}
          >
            {item.label}
            <span className="rounded-full bg-forest-100 px-1.5 text-[10px] font-bold text-forest-700">
              {counts[item.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-6" message={error} onRetry={reload} />
      ) : list.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={tab === 'completed' ? CheckCircle2 : Inbox}
          title={EMPTY[tab]?.title ?? 'No donations here'}
          description={EMPTY[tab]?.description ?? 'Try another tab to see more of your donation history.'}
          action={
            <Button to="/hotel/create-donation">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Post surplus food
            </Button>
          }
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((donation) => (
            <li key={donation.id}>
              <DonationRow
                donation={donation}
                onAssign={() => setAssigning(donation)}
                onComplete={() => setCompleting(donation)}
                onCancel={() => setCancelling(donation)}
              />
            </li>
          ))}
        </ul>
      )}

      <AssignVolunteerModal
        donation={assigning}
        volunteers={volunteers.data?.volunteers ?? EMPTY_LIST}
        loading={volunteers.loading || busy}
        onClose={() => setAssigning(null)}
        onConfirm={handleAssign}
      />

      <CompleteModal
        donation={completing}
        loading={busy}
        onClose={() => setCompleting(null)}
        onConfirm={handleComplete}
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={handleCancel}
        loading={busy}
        tone="danger"
        title="Cancel this donation?"
        confirmLabel="Cancel donation"
        message={
          cancelling
            ? `${cancelling.food_name} (${cancelling.meals} meals) will be removed from the available list and any assigned volunteer will be unassigned.`
            : ''
        }
      />
    </DashboardLayout>
  )
}

const EMPTY = {
  active: {
    title: 'No active donations',
    description: 'When you post surplus food it will appear here until it has been delivered.',
  },
  collected: {
    title: 'Nothing waiting for delivery',
    description: 'Donations that have been collected but not yet delivered will show here.',
  },
  completed: {
    title: 'No completed donations yet',
    description: 'Once a volunteer delivers your donation you can confirm it and it will be counted in your impact.',
  },
  closed: {
    title: 'Nothing cancelled or expired',
    description: 'Donations that could not be collected in time appear here for your records.',
  },
  all: { title: 'No donations yet', description: 'Post your first donation to start rescuing food.' },
}

function DonationRow({ donation, onAssign, onComplete, onCancel }) {
  const deadline = timeRemaining(donation.pickup_end)
  const canAssign = ['requested', 'assigned'].includes(donation.status)
  const canComplete = donation.status === 'delivered'

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr]">
        <img
          src={donation.image}
          alt=""
          className="h-28 w-full rounded-xl object-cover sm:h-28 sm:w-36"
          loading="lazy"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/donations/${donation.id}`}
                  className="text-base font-semibold text-forest-900 hover:text-brand-700"
                >
                  {donation.food_name}
                </Link>
                <StatusBadge status={donation.status} />
              </div>
              <p className="mt-1 text-sm text-forest-500">
                {donation.meals} meals · {donation.quantity} {donation.unit} · {donation.category_label}
              </p>
            </div>
            {donation.status !== 'completed' ? (
              <Badge tone={deadline.urgent ? 'warning' : 'neutral'} icon={History}>
                {deadline.label}
              </Badge>
            ) : null}
          </div>

          <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="text-forest-500">Pickup window</dt>
              <dd className="font-medium text-forest-800">
                {formatDateTime(donation.pickup_start)} – {formatDateTime(donation.pickup_end)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-forest-500">Pickup point</dt>
              <dd className="truncate font-medium text-forest-800">{donation.pickup_address}</dd>
            </div>
            {donation.requester ? (
              <div className="flex gap-2">
                <dt className="text-forest-500">Requested by</dt>
                <dd className="font-medium text-forest-800">{donation.requester.name}</dd>
              </div>
            ) : null}
            {donation.volunteer ? (
              <div className="flex gap-2">
                <dt className="text-forest-500">Volunteer</dt>
                <dd className="font-medium text-forest-800">{donation.volunteer.name}</dd>
              </div>
            ) : null}
            {donation.status === 'completed' && donation.beneficiaries ? (
              <div className="flex gap-2">
                <dt className="text-forest-500">People reached</dt>
                <dd className="font-medium text-forest-800">{donation.beneficiaries}</dd>
              </div>
            ) : null}
          </dl>

          {['requested', 'assigned', 'collecting', 'collected', 'delivered'].includes(donation.status) ? (
            <div className="mt-4">
              <StatusTimeline status={donation.status} orientation="horizontal" />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {canAssign ? (
              <Button size="sm" variant="outline" onClick={onAssign}>
                <UserCheck className="h-4 w-4" aria-hidden="true" />
                {donation.status === 'assigned' ? 'Change volunteer' : 'Assign volunteer'}
              </Button>
            ) : null}
            {canComplete ? (
              <Button size="sm" onClick={onComplete}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Confirm delivery
              </Button>
            ) : null}
            {['posted', 'requested', 'assigned'].includes(donation.status) ? (
              <Button size="sm" variant="ghost" onClick={onCancel}>
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Button>
            ) : null}
            <Button size="sm" variant="subtle" to={`/donations/${donation.id}`}>
              View details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function AssignVolunteerModal({ donation, volunteers, loading, onClose, onConfirm }) {
  const [selected, setSelected] = useState('')

  return (
    <Modal
      open={Boolean(donation)}
      onClose={() => {
        setSelected('')
        onClose()
      }}
      title="Assign a volunteer"
      description={
        donation
          ? `Choose who will collect ${donation.meals} meals of ${donation.food_name} from ${donation.pickup_address}.`
          : ''
      }
      size="md"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setSelected('')
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button disabled={!selected} loading={loading} onClick={() => onConfirm(selected)}>
            Assign volunteer
          </Button>
        </>
      }
    >
      {loading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : volunteers.length ? (
        <ul className="space-y-2">
          {volunteers.map((volunteer) => (
            <li key={volunteer.id}>
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition',
                  selected === volunteer.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-forest-200 hover:border-brand-300',
                )}
              >
                <input
                  type="radio"
                  name="volunteer"
                  value={volunteer.id}
                  checked={selected === volunteer.id}
                  onChange={() => setSelected(volunteer.id)}
                  className="h-4 w-4 accent-brand-600"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-forest-900">{volunteer.name}</p>
                  <p className="truncate text-xs text-forest-500">
                    {volunteer.area} · {volunteer.completed_tasks ?? 0} pickups completed
                    {volunteer.vehicle ? ` · ${volunteer.vehicle}` : ''}
                  </p>
                </div>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-forest-500">No verified volunteers are available right now.</p>
      )}
    </Modal>
  )
}

function CompleteModal({ donation, loading, onClose, onConfirm }) {
  const [beneficiaries, setBeneficiaries] = useState('')

  return (
    <Modal
      open={Boolean(donation)}
      onClose={onClose}
      title="Confirm delivery"
      description="Let us know how many people benefited so your impact totals stay accurate."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not yet
          </Button>
          <Button
            loading={loading}
            onClick={() => onConfirm(Number(beneficiaries) || donation?.meals || 0)}
          >
            Mark as completed
          </Button>
        </>
      }
    >
      <div className="rounded-xl bg-forest-50 p-4 text-sm text-forest-700">
        <p className="font-medium text-forest-900">{donation?.food_name}</p>
        <p className="mt-0.5">
          {donation?.meals} meals · {donation?.volunteer?.name ?? 'No volunteer assigned'}
        </p>
      </div>
      <label className="mt-4 block text-sm font-medium text-forest-700" htmlFor="beneficiaries">
        People reached
      </label>
      <input
        id="beneficiaries"
        type="number"
        min="0"
        inputMode="numeric"
        value={beneficiaries}
        onChange={(e) => setBeneficiaries(e.target.value)}
        placeholder={String(donation?.meals ?? '')}
        className="input-base mt-1.5"
      />
      <p className="mt-2 text-xs text-forest-500">
        Leave blank to use the meal count. Status moves to {STATUS_LABEL.completed.toLowerCase()}.
      </p>
    </Modal>
  )
}
