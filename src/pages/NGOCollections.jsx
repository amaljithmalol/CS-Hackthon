import { useMemo, useState } from 'react'
import { CheckCircle2, PackageCheck, Truck, UserCheck, Users } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import { Modal } from '../components/Modal'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import StatusTimeline from '../components/StatusTimeline'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../context/ToastContext'
import { assignVolunteer, getMyRequests, getVolunteers } from '../services/donations'
import { ngoNav } from '../utils/dashNav'
import { formatDateTime, timeRemaining } from '../utils/formatDate'
import { cn } from '../utils/cn'
import { EMPTY_LIST } from '../utils/constants'

const STAGES = [
  { id: 'awaiting', label: 'Awaiting volunteer', statuses: ['requested'], bar: 'bg-amber-soft-500' },
  { id: 'assigned', label: 'Volunteer assigned', statuses: ['assigned', 'collecting'], bar: 'bg-info-500' },
  { id: 'transit', label: 'In transit', statuses: ['collected', 'delivered'], bar: 'bg-brand-500' },
]

const ACTIVE_STATUSES = ['requested', 'assigned', 'collecting', 'collected', 'delivered']

const STEPS = [
  { title: 'Request', body: 'You reserve an open donation from a partner hotel.' },
  { title: 'Assign', body: 'A verified volunteer collects the food at the pickup window.' },
  { title: 'Deliver', body: 'The volunteer hands the food over at your centre.' },
  { title: 'Distribute', body: 'Record the people reached and your impact updates.' },
]

export default function NGOCollections() {
  const toast = useToast()
  const [assigning, setAssigning] = useState(null)
  const [busy, setBusy] = useState(false)
  const requests = useAsync(() => getMyRequests(), [])
  const volunteers = useAsync(() => getVolunteers(), [])

  const active = useMemo(
    () =>
      (requests.data?.requests ?? EMPTY_LIST)
        .map((r) => r.donation)
        .filter((d) => d && ACTIVE_STATUSES.includes(d.status))
        .sort((a, b) => new Date(a.pickup_start) - new Date(b.pickup_start)),
    [requests.data],
  )

  const handleAssign = async (volunteerId) => {
    setBusy(true)
    try {
      await assignVolunteer(assigning.id, volunteerId)
      const name = volunteers.data?.volunteers?.find((v) => v.id === volunteerId)?.name ?? 'The volunteer'
      toast.success(`${name} has been notified of the pickup.`, { title: 'Pickup arranged' })
      setAssigning(null)
      requests.reload()
    } catch (error) {
      toast.error(error?.message ?? 'We could not assign that volunteer.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout
      title="Active collections"
      subtitle={`${active.length} collection${active.length === 1 ? '' : 's'} in progress`}
      nav={ngoNav}
      actions={
        <Button to="/volunteer/map" size="sm" variant="outline">
          <Truck className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Open map</span>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {STAGES.map((stage) => {
          const count = active.filter((d) => stage.statuses.includes(d.status)).length
          return (
            <Card key={stage.id} className="p-5">
              <p className="text-sm font-medium text-forest-500">{stage.label}</p>
              <p className="mt-2 text-2xl font-bold text-forest-900">{count}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-forest-100">
                <div
                  className={cn('h-full rounded-full transition-all', stage.bar)}
                  style={{ width: `${active.length ? (count / active.length) * 100 : 0}%` }}
                />
              </div>
            </Card>
          )
        })}
      </div>

      {requests.loading ? (
        <div className="mt-6 space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : requests.error ? (
        <ErrorState className="mt-6" message={requests.error} onRetry={requests.reload} />
      ) : active.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={PackageCheck}
          title="No active collections"
          description="When you request a donation it appears here so you can assign a volunteer and track the pickup."
          action={
            <Button to="/ngo/donations">
              <Users className="h-4 w-4" aria-hidden="true" />
              Find available food
            </Button>
          }
        />
      ) : (
        <div className="mt-6 space-y-4">
          {active.map((donation) => (
            <Card key={donation.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <img
                    src={donation.image}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-forest-900">{donation.food_name}</h2>
                      <StatusBadge status={donation.status} />
                      <Badge tone={timeRemaining(donation.pickup_end).urgent ? 'warning' : 'neutral'}>
                        {timeRemaining(donation.pickup_end).label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-forest-500">
                      {donation.meals} meals from {donation.donor?.name}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="subtle" to={`/donations/${donation.id}`}>
                  Details
                </Button>
              </div>

              <div className="mt-4">
                <StatusTimeline status={donation.status} orientation="horizontal" />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-forest-50 p-4 text-sm">
                  <p className="text-xs font-medium text-forest-500">Pickup window</p>
                  <p className="mt-1 font-medium text-forest-800">
                    {formatDateTime(donation.pickup_start)} – {formatDateTime(donation.pickup_end)}
                  </p>
                  <p className="mt-2 text-sm text-forest-600">{donation.pickup_address}</p>
                </div>
                <div className="rounded-xl bg-brand-50 p-4 text-sm">
                  <p className="text-xs font-medium text-brand-700">Assigned volunteer</p>
                  {donation.volunteer ? (
                    <>
                      <p className="mt-1 font-semibold text-forest-900">{donation.volunteer.name}</p>
                      <p className="mt-1 text-forest-600">{donation.volunteer.phone}</p>
                    </>
                  ) : (
                    <p className="mt-1 font-semibold text-amber-soft-700">
                      Not assigned yet — choose a volunteer to arrange the pickup.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {['requested', 'assigned'].includes(donation.status) ? (
                  <Button
                    size="sm"
                    variant={donation.status === 'requested' ? 'primary' : 'outline'}
                    onClick={() => setAssigning(donation)}
                  >
                    <UserCheck className="h-4 w-4" aria-hidden="true" />
                    {donation.status === 'assigned' ? 'Change volunteer' : 'Assign a volunteer'}
                  </Button>
                ) : null}
                {donation.status === 'delivered' ? (
                  <Button size="sm" to="/ngo/beneficiaries">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Record beneficiaries
                  </Button>
                ) : null}
                <Button size="sm" variant="subtle" to="/ngo/requests">
                  All requests
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6 p-5">
        <SectionHeading
          align="left"
          eyebrow="How it works"
          title="From request to distribution"
          description="Every step is tracked so partners know exactly where the food is."
        />
        <ol className="mt-4 grid gap-4 sm:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-forest-100 p-4">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {index + 1}
              </span>
              <p className="mt-2 text-sm font-semibold text-forest-900">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-forest-500">{step.body}</p>
            </li>
          ))}
        </ol>
      </Card>

      <AssignVolunteerModal
        donation={assigning}
        volunteers={volunteers.data?.volunteers ?? EMPTY_LIST}
        loading={busy || volunteers.loading}
        onClose={() => setAssigning(null)}
        onConfirm={handleAssign}
      />
    </DashboardLayout>
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
          <Button
            disabled={!selected}
            loading={loading}
            onClick={() => {
              onConfirm(selected)
              setSelected('')
            }}
          >
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
                  name="ngo-volunteer"
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
