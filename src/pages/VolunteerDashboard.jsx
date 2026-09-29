import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Bike, CheckCircle2, HandHeart, ListChecks, Package, Route, Truck, UtensilsCrossed } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import { ChartCard, MonthlyBars, TrendArea } from '../components/DashboardCharts'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import StatusTimeline from '../components/StatusTimeline'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getDonations, getMyDonations, updateDonationStatus } from '../services/donations'
import { volunteerNav } from '../utils/dashNav'
import { donationMetrics, monthlySeries } from '../utils/metrics'
import { formatDateTime, timeRemaining } from '../utils/formatDate'
import { cn } from '../utils/cn'
import { EMPTY_LIST } from '../utils/constants'

const NEXT_STEP = {
  assigned: { status: 'collecting', label: 'Start collecting', icon: Truck },
  collecting: { status: 'collected', label: 'Mark as collected', icon: Package },
  collected: { status: 'delivered', label: 'Mark as delivered', icon: CheckCircle2 },
  delivered: { status: 'completed', label: 'Complete task', icon: Award },
}

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(null)

  const mine = useAsync(() => getMyDonations('volunteer'), [])
  const nearby = useAsync(
    () => getDonations({ availability: 'posted', sort: 'distance', ...(user ? { lat: user.latitude, lng: user.longitude } : {}) }),
    [user?.id],
  )

  const tasks = mine.data?.donations ?? EMPTY_LIST
  const metrics = useMemo(() => donationMetrics(tasks), [tasks])
  const monthly = useMemo(() => monthlySeries(tasks, 6, { onlyCompleted: true }), [tasks])

  const active = tasks
    .filter((d) => ['assigned', 'collecting', 'collected', 'delivered'].includes(d.status))
    .sort((a, b) => new Date(a.pickup_start) - new Date(b.pickup_start))

  const today = active.filter((d) => isToday(d.pickup_start))
  const openNearby = (nearby.data?.donations ?? EMPTY_LIST)
    .filter((d) => !tasks.some((t) => t.id === d.id))
    .slice(0, 4)

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

  return (
    <DashboardLayout
      title="Volunteer dashboard"
      subtitle={user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Your pickup tasks'}
      nav={volunteerNav}
      actions={
        <Button to="/volunteer/tasks" size="sm">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">All tasks</span>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-amber-soft-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <HandHeart className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-forest-900">
                {today.length
                  ? `${today.length} pickup${today.length === 1 ? '' : 's'} scheduled for today`
                  : active.length
                    ? `${active.length} task${active.length === 1 ? '' : 's'} in progress`
                    : 'No active pickups right now'}
              </h2>
              <p className="mt-1 text-sm text-forest-600">
                {active.length
                  ? 'Update each step as you go so the NGO and hotel always know where the food is.'
                  : 'Browse nearby donations and volunteer to collect them.'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button to="/volunteer/tasks?tab=nearby" variant="outline">
              <Route className="h-4 w-4" aria-hidden="true" />
              Nearby food
            </Button>
            <Button to="/volunteer/map">Open map</Button>
          </div>
        </div>
      </div>

      {mine.loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : mine.error ? (
        <ErrorState className="mt-6" message={mine.error} onRetry={mine.reload} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              label="Meals collected"
              value={metrics.meals.toLocaleString('en-IN')}
              icon={UtensilsCrossed}
              tone="brand"
              hint={`${metrics.completed} task${metrics.completed === 1 ? '' : 's'} completed`}
              onClick={() => navigate('/volunteer/impact')}
            />
            <StatCard
              index={1}
              label="Active tasks"
              value={metrics.active}
              icon={Truck}
              tone="amber"
              hint={metrics.pending ? `${metrics.pending} awaiting pickup` : 'All collected'}
            />
            <StatCard
              index={2}
              label="People reached"
              value={metrics.beneficiaries.toLocaleString('en-IN')}
              icon={HandHeart}
              tone="success"
              hint="Through completed pickups"
            />
            <StatCard
              index={3}
              label="Distance-ready"
              value={user?.vehicle ?? '—'}
              icon={Bike}
              tone="info"
              hint={user?.availability ?? 'Availability not set'}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard
              title="Meals collected each month"
              description="Completed pickups only"
              className="lg:col-span-2"
            >
              <MonthlyBars data={monthly} />
            </ChartCard>
            <Card className="p-5">
              <SectionHeading
                align="left"
                eyebrow="Your effort"
                title="Totals so far"
                description="Everything you have moved for the community."
              />
              <dl className="mt-4 space-y-3">
                {[
                  { label: 'Tasks completed', value: metrics.completed },
                  { label: 'Food collected', value: `${metrics.kg} kg` },
                  { label: 'CO₂ avoided', value: `${metrics.co2} kg` },
                  { label: 'Meals delivered', value: metrics.meals.toLocaleString('en-IN') },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                    <dt className="text-forest-500">{row.label}</dt>
                    <dd className="font-semibold text-forest-900">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <Button to="/volunteer/impact" variant="subtle" size="sm" className="mt-5 w-full">
                View full impact report
              </Button>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Your active tasks</h2>
                  <p className="mt-1 text-sm text-forest-500">Update each step as you collect and deliver.</p>
                </div>
                <Button to="/volunteer/tasks" variant="ghost" size="sm">
                  See all
                </Button>
              </div>
              {active.length ? (
                <ul className="mt-4 space-y-3">
                  {active.slice(0, 4).map((donation) => {
                    const step = NEXT_STEP[donation.status]
                    const deadline = timeRemaining(donation.pickup_end)
                    const StepIcon = step?.icon
                    return (
                      <li key={donation.id} className="rounded-xl border border-forest-100 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-forest-900">{donation.food_name}</p>
                            <p className="mt-0.5 truncate text-xs text-forest-500">
                              {donation.meals} meals · {donation.donor?.name}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge status={donation.status} />
                            {deadline.urgent ? <Badge tone="warning">{deadline.label}</Badge> : null}
                          </div>
                        </div>
                        <div className="mt-3">
                          <StatusTimeline status={donation.status} orientation="horizontal" />
                        </div>
                        {step ? (
                          <Button
                            size="sm"
                            className="mt-3"
                            loading={busy === donation.id}
                            onClick={() => advance(donation)}
                          >
                            {StepIcon ? <StepIcon className="h-4 w-4" aria-hidden="true" /> : null}
                            {step.label}
                          </Button>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <EmptyState
                  className="mt-2"
                  icon={ListChecks}
                  title="No active tasks"
                  description="Volunteer for a nearby donation and it will appear here."
                  action={
                    <Button to="/volunteer/tasks?tab=nearby" size="sm">
                      Browse nearby food
                    </Button>
                  }
                />
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Available near you</h2>
                  <p className="mt-1 text-sm text-forest-500">Closest open donations you can collect.</p>
                </div>
                <Button to="/volunteer/tasks?tab=nearby" variant="ghost" size="sm">
                  See all
                </Button>
              </div>
              {nearby.loading ? (
                <Skeleton className="mt-4 h-48 w-full rounded-xl" />
              ) : openNearby.length ? (
                <ul className="mt-4 space-y-2.5">
                  {openNearby.map((donation) => (
                    <li
                      key={donation.id}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border border-forest-100 p-3 transition',
                        'hover:border-brand-300 hover:bg-brand-50',
                      )}
                    >
                      <img src={donation.image} alt="" className="h-11 w-11 rounded-lg object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-forest-900">{donation.food_name}</p>
                        <p className="truncate text-xs text-forest-500">
                          {donation.meals} meals · {formatDateTime(donation.pickup_start)}
                        </p>
                      </div>
                      <Button size="sm" variant="subtle" to={`/donations/${donation.id}`}>
                        Volunteer
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  className="mt-2"
                  icon={UtensilsCrossed}
                  title="Nothing available nearby"
                  description="New donations are posted throughout the day. Check the map for wider coverage."
                  action={
                    <Button to="/volunteer/map" size="sm" variant="outline">
                      Open map
                    </Button>
                  }
                />
              )}
            </Card>
          </div>

          <ChartCard
            className="mt-6"
            title="Food volume collected"
            description="Kilograms moved each month — every kilogram is food that was not wasted."
          >
            <TrendArea data={monthly} dataKey="kg" name="Food collected (kg)" />
          </ChartCard>
        </>
      )}
    </DashboardLayout>
  )
}

function isToday(value) {
  const date = new Date(value)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}
