import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  Inbox,
  Leaf,
  Package,
  PlusCircle,
  Sparkles,
  Truck,
  UtensilsCrossed,
  Users,
} from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import { ChartCard, DonutChart, MonthlyBars } from '../components/DashboardCharts'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { getMyDonations } from '../services/donations'
import { hotelNav } from '../utils/dashNav'
import { countBy, donationMetrics, monthlySeries } from '../utils/metrics'
import { formatDateTime, timeRemaining } from '../utils/formatDate'
import { EMPTY_LIST, getCategory } from '../utils/constants'
import { cn } from '../utils/cn'

export default function HotelDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useAsync(() => getMyDonations('donor'), [])
  const donations = data?.donations ?? EMPTY_LIST
  const metrics = useMemo(() => donationMetrics(donations), [donations])
  const monthly = useMemo(() => monthlySeries(donations, 6, { onlyCompleted: true }), [donations])
  const categories = useMemo(
    () =>
      countBy(
        donations.filter((d) => d.status === 'completed'),
        'category',
        (id) => getCategory(id).label,
      ).slice(0, 6),
    [donations],
  )

  const needsAttention = donations
    .filter((d) => ['posted', 'requested', 'assigned', 'collecting'].includes(d.status))
    .sort((a, b) => new Date(a.pickup_end) - new Date(b.pickup_end))
    .slice(0, 4)

  return (
    <DashboardLayout
      title="Hotel dashboard"
      subtitle={user?.organization_name ?? 'Your surplus food at a glance'}
      nav={hotelNav}
      actions={
        <Button to="/hotel/create-donation" size="sm">
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New donation</span>
        </Button>
      }
    >
      <WelcomeStrip name={user?.organization_name ?? user?.name} meals={metrics.meals} />

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-6" message={error} onRetry={reload} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              label="Meals rescued"
              value={metrics.meals.toLocaleString('en-IN')}
              icon={UtensilsCrossed}
              tone="brand"
              hint={`${metrics.completed} completed donation${metrics.completed === 1 ? '' : 's'}`}
              onClick={() => navigate('/hotel/impact')}
            />
            <StatCard
              index={1}
              label="Food diverted"
              value={metrics.kg.toLocaleString('en-IN')}
              unit="kg"
              icon={Package}
              tone="info"
              hint={`≈ ${metrics.co2} kg CO₂ saved`}
            />
            <StatCard
              index={2}
              label="Active donations"
              value={metrics.active}
              icon={Truck}
              tone="amber"
              hint={metrics.pending ? `${metrics.pending} awaiting a response` : 'All claimed'}
              onClick={() => navigate('/hotel/donations')}
            />
            <StatCard
              index={3}
              label="People reached"
              value={metrics.beneficiaries.toLocaleString('en-IN')}
              icon={Users}
              tone="success"
              hint="Across your partner NGOs"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard
              title="Meals rescued each month"
              description="Completed donations only"
              className="lg:col-span-2"
            >
              <MonthlyBars data={monthly} />
            </ChartCard>

            <Card className="p-5">
              <SectionHeading
                align="left"
                eyebrow="Breakdown"
                title="What you donate"
                description="Completed donations by food category"
              />
              {categories.length ? (
                <div className="mt-4">
                  <DonutChart data={categories} />
                </div>
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No completed donations yet"
                  description="Once a pickup is delivered, your category breakdown appears here."
                />
              )}
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Needs your attention</h2>
                  <p className="mt-1 text-sm text-forest-500">
                    Donations that are still moving through the pickup lifecycle.
                  </p>
                </div>
                <Button to="/hotel/donations" variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>

              {needsAttention.length ? (
                <ul className="mt-4 divide-y divide-forest-100">
                  {needsAttention.map((donation) => {
                    const deadline = timeRemaining(donation.pickup_end)
                    return (
                      <li key={donation.id} className="flex flex-wrap items-center gap-3 py-3.5">
                        <img
                          src={donation.image ?? getCategory(donation.category).image}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-xl object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/donations/${donation.id}`}
                            className="truncate text-sm font-semibold text-forest-900 hover:text-brand-700"
                          >
                            {donation.food_name}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-forest-500">
                            {donation.meals} meals · {formatDateTime(donation.pickup_start)}
                          </p>
                        </div>
                        <Badge tone={deadline.urgent ? 'warning' : 'neutral'}>
                          {deadline.urgent ? deadline.label : `Pickup ${formatDateTime(donation.pickup_end)}`}
                        </Badge>
                        <StatusBadge status={donation.status} />
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <EmptyState
                  className="mt-2"
                  icon={ClipboardList}
                  title="Nothing pending"
                  description="Every donation you have posted has been collected or delivered."
                  action={
                    <Button to="/hotel/create-donation" size="sm">
                      Post surplus food
                    </Button>
                  }
                />
              )}
            </Card>

            <Card className="p-5">
              <SectionHeading
                align="left"
                eyebrow="Quick actions"
                title="Keep food moving"
                description="Shortcuts for your most common tasks."
              />
              <ul className="mt-4 space-y-2">
                {[
                  { to: '/hotel/create-donation', label: 'Post new surplus food', icon: PlusCircle },
                  { to: '/hotel/donations', label: 'Review active donations', icon: Package },
                  { to: '/volunteer/map', label: 'Open pickup map', icon: Truck },
                  { to: '/messages', label: 'Message an NGO', icon: Users },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <li key={action.to}>
                      <Link
                        to={action.to}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border border-forest-100 px-3.5 py-3 text-sm font-medium',
                          'text-forest-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
                        )}
                      >
                        <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                        <span className="flex-1">{action.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-forest-300" aria-hidden="true" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}

function WelcomeStrip({ name, meals }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-amber-soft-50 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-forest-900">
              <Sparkles className="mr-1.5 inline h-4 w-4 text-amber-soft-500" aria-hidden="true" />
              Welcome back, {name}
            </h2>
            <p className="mt-1 text-sm text-forest-600">
              You have helped rescue{' '}
              <span className="font-semibold text-brand-700">{meals.toLocaleString('en-IN')} meals</span> so far.
              Every donation counts towards a cleaner, kinder Kozhikode.
            </p>
          </div>
        </div>
        <Button to="/hotel/create-donation" className="shrink-0">
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Post surplus food
        </Button>
      </div>
    </div>
  )
}
