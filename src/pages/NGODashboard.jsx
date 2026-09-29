import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  HandHeart,
  HeartHandshake,
  Inbox,
  Leaf,
  MapPin,
  Package,
  Truck,
  Users,
  UtensilsCrossed,
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
import { getDonations, getMyRequests } from '../services/donations'
import { ngoNav } from '../utils/dashNav'
import { countBy, donationMetrics, monthlySeries } from '../utils/metrics'
import { formatDateTime, timeRemaining } from '../utils/formatDate'
import { EMPTY_LIST, getCategory } from '../utils/constants'
import { cn } from '../utils/cn'

export default function NGODashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const available = useAsync(() => getDonations({ availability: 'posted', sort: 'deadline' }), [])
  const requests = useAsync(() => getMyRequests(), [])

  const availableDonations = available.data?.donations ?? EMPTY_LIST
  const myRequests = requests.data?.requests ?? EMPTY_LIST

  const collected = useMemo(
    () => myRequests.filter((r) => r.donation && ['collecting', 'collected', 'delivered', 'completed'].includes(r.donation.status)),
    [myRequests],
  )
  const metrics = useMemo(() => donationMetrics(collected.map((r) => r.donation)), [collected])
  const monthly = useMemo(
    () => monthlySeries(collected.map((r) => r.donation), 6, { onlyCompleted: true }),
    [collected],
  )
  const categories = useMemo(
    () =>
      countBy(
        collected.map((r) => r.donation),
        'category',
        (id) => getCategory(id).label,
      ).slice(0, 6),
    [collected],
  )

  const urgent = availableDonations
    .filter((d) => timeRemaining(d.pickup_end).urgent)
    .slice(0, 3)

  const nextPickup = collected
    .filter((r) => ['collecting', 'collected'].includes(r.donation.status))
    .sort((a, b) => new Date(a.donation.pickup_start) - new Date(b.donation.pickup_start))[0]

  const loading = available.loading || requests.loading
  const error = available.error ?? requests.error

  return (
    <DashboardLayout
      title="NGO dashboard"
      subtitle={user?.organization_name ?? 'Your collection overview'}
      nav={ngoNav}
      actions={
        <Button to="/ngo/donations" size="sm">
          <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Find food</span>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-amber-soft-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-forest-900">
                <Leaf className="mr-1.5 inline h-4 w-4 text-brand-600" aria-hidden="true" />
                {availableDonations.length} donations are open near you
              </h2>
              <p className="mt-1 text-sm text-forest-600">
                Request what suits your distribution plan. Volunteers can be assigned from each request.
              </p>
            </div>
          </div>
          <Button to="/ngo/donations" className="shrink-0">
            Browse available food
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-6" message={error} onRetry={() => { available.reload(); requests.reload() }} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              label="Meals secured"
              value={metrics.meals.toLocaleString('en-IN')}
              icon={UtensilsCrossed}
              tone="brand"
              hint={`${metrics.completed} completed collection${metrics.completed === 1 ? '' : 's'}`}
              onClick={() => navigate('/ngo/impact')}
            />
            <StatCard
              index={1}
              label="Active collections"
              value={metrics.active}
              icon={Truck}
              tone="amber"
              hint={nextPickup ? `Next pickup ${formatDateTime(nextPickup.donation.pickup_start)}` : 'No pickups scheduled'}
              onClick={() => navigate('/ngo/collections')}
            />
            <StatCard
              index={2}
              label="People reached"
              value={metrics.beneficiaries.toLocaleString('en-IN')}
              icon={HandHeart}
              tone="success"
              hint="Across your distributions"
              onClick={() => navigate('/ngo/beneficiaries')}
            />
            <StatCard
              index={3}
              label="Open requests"
              value={myRequests.filter((r) => ['accepted', 'assigned'].includes(r.status)).length}
              icon={ClipboardList}
              tone="info"
              hint={`${myRequests.length} total requests`}
              onClick={() => navigate('/ngo/requests')}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard
              title="Meals secured each month"
              description="Completed collections only"
              className="lg:col-span-2"
            >
              <MonthlyBars data={monthly} />
            </ChartCard>
            <Card className="p-5">
              <SectionHeading
                align="left"
                eyebrow="Mix"
                title="What you collect"
                description="By food category"
              />
              {categories.length ? (
                <div className="mt-4">
                  <DonutChart data={categories} />
                </div>
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No completed collections"
                  description="Your category mix appears after your first delivery."
                />
              )}
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Closing soon</h2>
                  <p className="mt-1 text-sm text-forest-500">Available donations with a tight pickup window.</p>
                </div>
                <Button to="/ngo/donations" variant="ghost" size="sm">
                  See all
                </Button>
              </div>
              {urgent.length ? (
                <ul className="mt-4 space-y-3">
                  {urgent.map((donation) => (
                    <li
                      key={donation.id}
                      className="flex items-center gap-3 rounded-xl border border-amber-soft-200 bg-amber-soft-50 p-3"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-soft-600" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/donations/${donation.id}`}
                          className="truncate text-sm font-semibold text-forest-900 hover:text-brand-700"
                        >
                          {donation.food_name}
                        </Link>
                        <p className="truncate text-xs text-forest-600">
                          {donation.meals} meals · {donation.donor?.name}
                        </p>
                      </div>
                      <Badge tone="warning">{timeRemaining(donation.pickup_end).label}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  className="mt-2"
                  icon={Package}
                  title="Nothing urgent"
                  description="No available donations are closing within the next hour."
                />
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Collection pipeline</h2>
                  <p className="mt-1 text-sm text-forest-500">Where your requests stand right now.</p>
                </div>
                <Button to="/ngo/collections" variant="ghost" size="sm">
                  Manage
                </Button>
              </div>
              {myRequests.length ? (
                <ul className="mt-4 divide-y divide-forest-100">
                  {myRequests.slice(0, 5).map((request) => (
                    <li key={request.id} className="flex items-center gap-3 py-3">
                      <img
                        src={request.donation?.image}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-forest-900">{request.donation?.food_name}</p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-forest-500">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                          {request.donation?.pickup_address}
                        </p>
                      </div>
                      <StatusBadge status={request.donation?.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  className="mt-2"
                  icon={ClipboardList}
                  title="No requests yet"
                  description="Browse available food and request a donation to start your collection pipeline."
                  action={<Button to="/ngo/donations" size="sm">Find food</Button>}
                />
              )}
            </Card>
          </div>

          <Card className="mt-6 p-5">
            <SectionHeading
              align="left"
              eyebrow="Community"
              title="Grow your collection team"
              description="Volunteers who have picked up for your organisation."
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                { to: '/ngo/volunteers', label: 'Volunteer directory', icon: Users, body: 'Find and contact volunteers available for pickups.' },
                { to: '/ngo/beneficiaries', label: 'Beneficiary records', icon: HandHeart, body: 'Track centres, families and meals distributed.' },
                { to: '/ngo/impact', label: 'Your impact report', icon: Leaf, body: 'Meals secured, CO₂ saved and monthly trends.' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex flex-col gap-2 rounded-xl border border-forest-100 p-4 transition',
                      'hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft',
                    )}
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-forest-900">{item.label}</span>
                    <span className="text-xs leading-relaxed text-forest-500">{item.body}</span>
                  </Link>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </DashboardLayout>
  )
}
