import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Award, CheckCircle2, ListChecks, Map, Package, Search, Truck, UtensilsCrossed } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState } from '../components/Card'
import { ConfirmDialog } from '../components/Modal'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import StatusTimeline from '../components/StatusTimeline'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDonationRequest, requestSummary } from '../hooks/useDonationRequest'
import { getDonations, getMyDonations, updateDonationStatus } from '../services/donations'
import { volunteerNav } from '../utils/dashNav'
import { formatDateTime, timeRemaining } from '../utils/formatDate'
import { formatDistance } from '../utils/geo'
import { cn } from '../utils/cn'
import { EMPTY_LIST } from '../utils/constants'

const NEXT_STEP = {
  assigned: { status: 'collecting', label: 'Start collecting', icon: Truck },
  collecting: { status: 'collected', label: 'Mark as collected', icon: Package },
  collected: { status: 'delivered', label: 'Mark as delivered', icon: CheckCircle2 },
  delivered: { status: 'completed', label: 'Complete task', icon: Award },
}

export default function VolunteerTasks() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'nearby' ? 'nearby' : 'mine'
  const { user } = useAuth()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(null)

  const mine = useAsync(() => getMyDonations('volunteer'), [])
  const nearby = useAsync(
    () =>
      getDonations({
        availability: 'posted',
        sort: 'distance',
        ...(user ? { lat: user.latitude, lng: user.longitude } : {}),
      }),
    [user?.id],
  )

  const { pending, loading: requesting, openRequest, cancelRequest, confirmRequest } = useDonationRequest({
    onSuccess: () => {
      mine.reload()
      nearby.reload()
    },
  })

  const tasks = mine.data?.donations ?? EMPTY_LIST
  const active = tasks.filter((d) => ['assigned', 'collecting', 'collected', 'delivered'].includes(d.status))
  const done = tasks.filter((d) => d.status === 'completed')

  const available = useMemo(
    () =>
      (nearby.data?.donations ?? EMPTY_LIST)
        .filter((d) => !tasks.some((t) => t.id === d.id))
        .filter((d) =>
          query
            ? [d.food_name, d.donor?.name, d.pickup_address]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(query.toLowerCase()))
            : true,
        ),
    [nearby.data, tasks, query],
  )

  const advance = async (donation) => {
    const step = NEXT_STEP[donation.status]
    if (!step) return
    setBusy(donation.id)
    try {
      await updateDonationStatus(donation.id, step.status)
      toast.success(`${donation.food_name} is now ${step.status}.`, { title: 'Task updated' })
      mine.reload()
    } catch (error) {
      toast.error(error?.message ?? 'We could not update that task.')
    } finally {
      setBusy(null)
    }
  }

  const setTab = (next) => setParams(next === 'mine' ? {} : { tab: next }, { replace: true })

  return (
    <DashboardLayout
      title="Pickup tasks"
      subtitle={`${active.length} active · ${done.length} completed`}
      nav={volunteerNav}
      actions={
        <div className="flex gap-1.5" role="group" aria-label="Task filter">
          {[
            { id: 'mine', label: 'My tasks' },
            { id: 'nearby', label: 'Nearby' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTab(option.id)}
              aria-pressed={tab === option.id}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                tab === option.id ? 'bg-brand-600 text-white' : 'bg-forest-50 text-forest-600 hover:bg-forest-100',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    >
      {tab === 'mine' ? (
        mine.loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : mine.error ? (
          <ErrorState message={mine.error} onRetry={mine.reload} />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="You have no pickup tasks yet"
            description="Volunteer for a nearby donation and it will be added to your tasks straight away."
            action={
              <Button onClick={() => setTab('nearby')}>
                <Search className="h-4 w-4" aria-hidden="true" />
                Find nearby donations
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            <TaskGroup
              title="Active tasks"
              description="Update each step as you collect and deliver."
              donations={active}
              busy={busy}
              onAdvance={advance}
            />
            <TaskGroup
              title="Completed"
              description="Pickups you have finished — thank you."
              donations={done}
              busy={busy}
              onAdvance={advance}
            />
          </div>
        )
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-forest-500">
              {available.length} open donation{available.length === 1 ? '' : 's'} within range. Distances are from{' '}
              {user?.area ?? 'your address'}.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-forest-400" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search nearby food"
                  aria-label="Search nearby donations"
                  className="input-base pl-9"
                />
              </div>
              <Button to="/volunteer/map" variant="outline">
                <Map className="h-4 w-4" aria-hidden="true" />
                Map
              </Button>
            </div>
          </div>

          {nearby.loading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : nearby.error ? (
            <ErrorState className="mt-4" message={nearby.error} onRetry={nearby.reload} />
          ) : available.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={UtensilsCrossed}
              title="No open donations nearby"
              description="Nothing is available within range right now. Try the map for a wider view."
              action={
                <Button to="/volunteer/map" variant="outline">
                  <Map className="h-4 w-4" aria-hidden="true" />
                  Open the map
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {available.map((donation) => {
                const deadline = timeRemaining(donation.pickup_end)
                return (
                  <li key={donation.id}>
                    <Card className="flex h-full flex-col p-4">
                      <div className="flex items-start gap-3">
                        <img src={donation.image} alt="" className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-forest-900">{donation.food_name}</p>
                          <p className="mt-0.5 truncate text-xs text-forest-500">{donation.donor?.name}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <Badge tone="neutral">{donation.meals} meals</Badge>
                            {donation.distance_km != null ? (
                              <Badge tone="info">{formatDistance(donation.distance_km)}</Badge>
                            ) : null}
                            {deadline.urgent ? <Badge tone="warning">{deadline.label}</Badge> : null}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-forest-500">
                        {donation.pickup_address} · pickup {formatDateTime(donation.pickup_start)}
                      </p>
                      <div className="mt-auto flex gap-2 pt-3">
                        <Button size="sm" className="flex-1" onClick={() => openRequest(donation)}>
                          Volunteer to collect
                        </Button>
                        <Button size="sm" variant="subtle" to={`/donations/${donation.id}`}>
                          Details
                        </Button>
                      </div>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={cancelRequest}
        onConfirm={confirmRequest}
        loading={requesting}
        title="Volunteer for this pickup?"
        confirmLabel="Accept task"
        message={
          pending
            ? `${requestSummary(pending).meals} meals · pickup ${requestSummary(pending).pickup}. The hotel and NGO will be notified and this moves to your task list.`
            : ''
        }
      />
    </DashboardLayout>
  )
}

function TaskGroup({ title, description, donations, busy, onAdvance }) {
  if (!donations.length) return null
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-0.5 text-sm text-forest-500">{description}</p>
      </div>
      <ul className="space-y-3">
        {donations.map((donation) => {
          const step = NEXT_STEP[donation.status]
          const StepIcon = step?.icon
          const deadline = timeRemaining(donation.pickup_end)
          return (
            <li key={donation.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <img src={donation.image} alt="" className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-forest-900">{donation.food_name}</h3>
                        <StatusBadge status={donation.status} />
                        {donation.status !== 'completed' && deadline.urgent ? (
                          <Badge tone="warning">{deadline.label}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-forest-500">
                        {donation.meals} meals from {donation.donor?.name}
                      </p>
                      <p className="mt-0.5 text-xs text-forest-500">
                        {formatDateTime(donation.pickup_start)} – {formatDateTime(donation.pickup_end)}
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

                <div className="mt-4 flex flex-wrap gap-2">
                  {step ? (
                    <Button size="sm" loading={busy === donation.id} onClick={() => onAdvance(donation)}>
                      {StepIcon ? <StepIcon className="h-4 w-4" aria-hidden="true" /> : null}
                      {step.label}
                    </Button>
                  ) : (
                    <Badge tone="success" icon={CheckCircle2}>
                      Delivered — thank you
                    </Badge>
                  )}
                  {donation.status !== 'completed' ? (
                    <Button size="sm" variant="subtle" to="/messages">
                      Message partner
                    </Button>
                  ) : null}
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
