import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Building2,
  Inbox,
  Leaf,
  Package,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import { ChartCard, DonutChart, MonthlyBars, TrendArea } from '../components/DashboardCharts'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { getDonations } from '../services/donations'
import { getApprovals, getUsers } from '../services/users'
import { getReports } from '../services/reports'
import { adminNav } from '../utils/dashNav'
import { countBy, donationMetrics, monthlySeries } from '../utils/metrics'
import { EMPTY_LIST, getCategory } from '../utils/constants'
import { timeAgo } from '../utils/formatDate'
import { cn } from '../utils/cn'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('all')

  const donations = useAsync(() => getDonations({ sort: 'newest' }), [])
  const users = useAsync(() => getUsers(), [])
  const approvals = useAsync(() => getApprovals(), [])
  const reports = useAsync(() => getReports(), [])
  const list = donations.data?.donations ?? EMPTY_LIST
  const metrics = useMemo(() => donationMetrics(list), [list])
  const monthly = useMemo(() => monthlySeries(list, 6), [list])
  const categories = useMemo(() => countBy(list, 'category', (id) => getCategory(id).label), [list])

  const roleMix = useMemo(
    () => countBy(users.data?.users ?? [], 'role', (role) => role.charAt(0).toUpperCase() + role.slice(1)),
    [users.data],
  )

  const pendingOrgs = (approvals.data?.organizations ?? EMPTY_LIST).filter(
    (o) => o.verification_status === 'pending',
  )
  const openReports = (reports.data?.reports ?? EMPTY_LIST).filter((r) => r.status === 'open')
  const needsAttention = list
    .filter((d) => ['requested', 'assigned', 'collecting'].includes(d.status))
    .slice(0, 5)

  const loading = donations.loading || users.loading
  const error = donations.error ?? users.error
  const recent = tab === 'all' ? list : list.filter((d) => d.status === tab)

  return (
    <DashboardLayout
      title="Admin dashboard"
      subtitle={user?.name ? `Platform overview · ${user.name}` : 'Platform overview'}
      nav={adminNav}
      actions={
        <Button to="/admin/reports" size="sm" variant={openReports.length ? 'primary' : 'outline'}>
          <Inbox className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Reports</span>
          {openReports.length ? (
            <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-bold">{openReports.length}</span>
          ) : null}
        </Button>
      }
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => { donations.reload(); users.reload() }} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              label="Total donations"
              value={metrics.total.toLocaleString('en-IN')}
              icon={Package}
              tone="brand"
              hint={`${metrics.active} currently active`}
              onClick={() => setTab('all')}
            />
            <StatCard
              index={1}
              label="Meals redistributed"
              value={metrics.meals.toLocaleString('en-IN')}
              icon={UtensilsCrossed}
              tone="success"
              hint="Across completed donations"
            />
            <StatCard
              index={2}
              label="Active members"
              value={(users.data?.total ?? 0).toLocaleString('en-IN')}
              icon={Users}
              tone="info"
              hint={`${pendingOrgs.length} awaiting verification`}
            />
            <StatCard
              index={3}
              label="Open issues"
              value={openReports.length}
              icon={Inbox}
              tone={openReports.length ? 'danger' : 'neutral'}
              hint={openReports.length ? 'Needs attention' : 'All clear'}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard title="Donations each month" description="All donations, last 6 months" className="lg:col-span-2">
              <MonthlyBars data={monthly} dataKey="meals" name="Meals" />
            </ChartCard>
            <Card className="p-5">
              <SectionHeading align="left" eyebrow="Community" title="Member mix" description="By role" />
              <div className="mt-4">
                <DonutChart data={roleMix} />
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Donations by category" description="What the network is rescuing">
              <DonutChart data={categories} />
            </ChartCard>
            <ChartCard title="Meals over time" description="Monthly volume across the platform">
              <TrendArea data={monthly} dataKey="meals" name="Meals" />
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Donation monitor</h2>
                  <p className="mt-0.5 text-sm text-forest-500">Everything moving through the platform right now.</p>
                </div>
                <Button to="/admin/donations" variant="ghost" size="sm">
                  Open monitor
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
                {['all', 'posted', 'requested', 'assigned', 'collecting', 'completed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setTab(status)}
                    aria-pressed={tab === status}
                    className={cn(
                      'rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition',
                      tab === status ? 'bg-brand-600 text-white' : 'bg-forest-50 text-forest-600 hover:bg-forest-100',
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {recent.length ? (
                <ul className="mt-4 divide-y divide-forest-100">
                  {recent.slice(0, 6).map((donation) => (
                    <li key={donation.id} className="flex items-center gap-3 py-3">
                      <img src={donation.image} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/donations/${donation.id}`}
                          className="truncate text-sm font-medium text-forest-900 hover:text-brand-700"
                        >
                          {donation.food_name}
                        </Link>
                        <p className="truncate text-xs text-forest-500">
                          {donation.meals} meals · {donation.donor?.name}
                        </p>
                      </div>
                      <StatusBadge status={donation.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  className="mt-2"
                  icon={Activity}
                  title="No donations with this status"
                  description="Try another status filter to see more of the platform activity."
                  action={
                    <Button size="sm" variant="outline" onClick={() => setTab('all')}>
                      Show all
                    </Button>
                  }
                />
              )}
            </Card>

            <div className="space-y-6">
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold">
                      <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
                      Pending approvals
                    </h2>
                    <p className="mt-0.5 text-sm text-forest-500">Organisations waiting for review.</p>
                  </div>
                  <Button to="/admin/approvals" variant="ghost" size="sm">
                    Review
                  </Button>
                </div>
                {approvals.loading ? (
                  <Skeleton className="mt-4 h-20 w-full rounded-xl" />
                ) : pendingOrgs.length ? (
                  <ul className="mt-4 space-y-2">
                    {pendingOrgs.slice(0, 4).map((org) => (
                      <li key={org.id} className="flex items-center gap-2.5 rounded-xl bg-forest-50 p-3">
                        <Building2 className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-forest-900">{org.organization_name}</p>
                          <p className="truncate text-xs text-forest-500">
                            {org.organization_type} · {org.city ?? org.area}
                          </p>
                        </div>
                        <Badge tone="warning">Pending</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-forest-500">No organisations are awaiting review.</p>
                )}
              </Card>

              <Card className="p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <TrendingUp className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  Needs attention
                </h2>
                <p className="mt-0.5 text-sm text-forest-500">Donations mid-collection right now.</p>
                {needsAttention.length ? (
                  <ul className="mt-4 space-y-2">
                    {needsAttention.map((donation) => (
                      <li key={donation.id} className="flex items-center gap-2.5">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-soft-500" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-sm text-forest-700">
                          {donation.food_name}
                        </span>
                        <Badge tone="neutral">{timeAgo(donation.created_at)}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-forest-500">Every donation is in a stable state.</p>
                )}
              </Card>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { to: '/admin/approvals', label: 'Verify partners', icon: ShieldCheck, body: `${pendingOrgs.length} awaiting review` },
              { to: '/admin/users', label: 'Manage users', icon: Users, body: `${users.data?.total ?? 0} members` },
              { to: '/admin/donations', label: 'Monitor donations', icon: Truck, body: `${metrics.active} in progress` },
              { to: '/impact', label: 'Public impact', icon: Leaf, body: `${metrics.co2} kg CO₂ saved` },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex flex-col gap-2 rounded-2xl border border-forest-100 bg-white p-5 transition',
                    'hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift',
                  )}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-forest-900">{item.label}</span>
                  <span className="text-xs text-forest-500">{item.body}</span>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
