import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Eye, Package, Truck, UtensilsCrossed } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import StatCard from '../components/StatCard'
import { ChartCard, DonutChart, MonthlyBars } from '../components/DashboardCharts'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { Modal } from '../components/Modal'
import StatusTimeline from '../components/StatusTimeline'
import { useAsync } from '../hooks/useAsync'
import { getDonations } from '../services/donations'
import { adminNav } from '../utils/dashNav'
import { countBy, donationMetrics, monthlySeries } from '../utils/metrics'
import { EMPTY_LIST, getCategory } from '../utils/constants'
import { formatDateTime, timeRemaining } from '../utils/formatDate'
import { cn } from '../utils/cn'

const QUICK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'posted', label: 'Posted' },
  { id: 'requested', label: 'Requested' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'collecting', label: 'Collecting' },
  { id: 'collected', label: 'Collected' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

export default function AdminDonations() {
  const [status, setStatus] = useState('all')
  const [inspecting, setInspecting] = useState(null)
  const { data, loading, error, reload } = useAsync(
    () => getDonations({ sort: 'newest', ...(status !== 'all' ? { status } : {}) }),
    [status],
  )

  const donations = data?.donations ?? EMPTY_LIST
  const metrics = useMemo(() => donationMetrics(donations), [donations])
  const monthly = useMemo(() => monthlySeries(donations, 6), [donations])
  const categories = useMemo(() => countBy(donations, 'category', (id) => getCategory(id).label), [donations])
  const statuses = useMemo(() => countBy(donations, 'status', (id) => id.charAt(0).toUpperCase() + id.slice(1)), [donations])

  return (
    <DashboardLayout
      title="Donation monitor"
      subtitle={`${donations.length} donations · ${metrics.meals.toLocaleString('en-IN')} meals`}
      nav={adminNav}
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard index={0} label="Donations listed" value={metrics.total} icon={Package} tone="brand" hint="Matching your filter" />
            <StatCard index={1} label="Meals" value={metrics.meals.toLocaleString('en-IN')} icon={UtensilsCrossed} tone="success" hint="Completed donations" />
            <StatCard index={2} label="Active" value={metrics.active} icon={Truck} tone="amber" hint="Mid-collection right now" />
            <StatCard index={3} label="People reached" value={metrics.beneficiaries.toLocaleString('en-IN')} icon={Activity} tone="info" hint="Reported by NGOs" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard title="Donations each month" description="All statuses, last 6 months" className="lg:col-span-2">
              <MonthlyBars data={monthly} dataKey="meals" name="Meals" />
            </ChartCard>
            <Card className="p-5">
              <SectionHeading align="left" eyebrow="Status" title="Where donations stand" />
              <div className="mt-4">
                {statuses.length ? <DonutChart data={statuses} /> : <p className="py-10 text-center text-sm text-forest-500">No data.</p>}
              </div>
            </Card>
          </div>

          <Card className="mt-6 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-forest-500 uppercase">Quick filter</span>
              {QUICK_FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setStatus(option.id)}
                  aria-pressed={status === option.id}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                    status === option.id ? 'bg-brand-600 text-white' : 'bg-forest-50 text-forest-600 hover:bg-forest-100',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Card>

          {donations.length === 0 ? (
            <EmptyState
              className="mt-6"
              icon={Package}
              title="No donations with this status"
              description="Try a different status filter to see more platform activity."
              action={
                <Button variant="outline" onClick={() => setStatus('all')}>
                  Show all donations
                </Button>
              }
            />
          ) : (
            <>
              <Card className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[56rem] text-left text-sm">
                  <caption className="sr-only">All donations with status, meals and participants</caption>
                  <thead>
                    <tr className="border-b border-forest-100 text-xs font-semibold tracking-wide text-forest-500 uppercase">
                      <th scope="col" className="px-4 py-3">Donation</th>
                      <th scope="col" className="px-4 py-3">Donor</th>
                      <th scope="col" className="px-4 py-3">Meals</th>
                      <th scope="col" className="px-4 py-3">Pickup</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {donations.map((donation) => {
                      const deadline = timeRemaining(donation.pickup_end)
                      return (
                        <tr key={donation.id} className="transition hover:bg-forest-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <img src={donation.image} alt="" className="h-9 w-9 rounded-lg object-cover" loading="lazy" />
                              <div className="min-w-0">
                                <Link
                                  to={`/donations/${donation.id}`}
                                  className="block max-w-[14rem] truncate font-medium text-forest-900 hover:text-brand-700"
                                >
                                  {donation.food_name}
                                </Link>
                                <span className="text-xs text-forest-500">{donation.category_label}</span>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-[10rem] truncate px-4 py-3 text-forest-600">
                            {donation.donor?.name ?? '—'}
                          </td>
                          <td className="px-4 py-3 font-medium text-forest-800">{donation.meals}</td>
                          <td className="px-4 py-3">
                            <span className="text-forest-600">{formatDateTime(donation.pickup_start)}</span>
                            {deadline.urgent && donation.status !== 'completed' ? (
                              <Badge tone="warning" className="ml-2">
                                {deadline.label}
                              </Badge>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={donation.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="ghost" onClick={() => setInspecting(donation)}>
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>

              <ChartCard
                className="mt-6"
                title="Donations by category"
                description="What the network is rescuing most often"
              >
                <DonutChart data={categories} />
              </ChartCard>
            </>
          )}
        </>
      )}

      <Modal
        open={Boolean(inspecting)}
        onClose={() => setInspecting(null)}
        title={inspecting?.food_name ?? 'Donation'}
        description="Full record for moderation and support."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setInspecting(null)}>
              Close
            </Button>
            <Button to={inspecting ? `/donations/${inspecting.id}` : '/'}>
              Open public page
            </Button>
          </>
        }
      >
        {inspecting ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={inspecting.status} />
              <Badge tone="neutral">{inspecting.category_label}</Badge>
              <Badge tone="neutral">{inspecting.diet}</Badge>
              {inspecting.packaging_available ? <Badge tone="success">Packaging provided</Badge> : null}
            </div>
            <StatusTimeline status={inspecting.status} orientation="horizontal" />
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                { label: 'Donor', value: inspecting.donor?.name },
                { label: 'Contact', value: inspecting.donor?.phone },
                { label: 'Meals', value: inspecting.meals },
                { label: 'Quantity', value: `${inspecting.quantity} ${inspecting.unit}` },
                { label: 'Pickup window', value: `${formatDateTime(inspecting.pickup_start)} – ${formatDateTime(inspecting.pickup_end)}` },
                { label: 'Pickup address', value: inspecting.pickup_address },
                { label: 'Requested by', value: inspecting.requester?.name ?? '—' },
                { label: 'Volunteer', value: inspecting.volunteer?.name ?? '—' },
                { label: 'Beneficiaries', value: inspecting.beneficiaries || '—' },
                { label: 'Created', value: formatDateTime(inspecting.created_at) },
              ].map((row) => (
                <div key={row.label} className="rounded-xl bg-forest-50 p-3">
                  <dt className="text-[11px] font-medium text-forest-500">{row.label}</dt>
                  <dd className="mt-0.5 font-medium text-forest-800">{row.value ?? '—'}</dd>
                </div>
              ))}
            </dl>
            {inspecting.description ? (
              <div>
                <p className="text-xs font-medium text-forest-500">Description</p>
                <p className="mt-1 text-sm text-forest-700">{inspecting.description}</p>
              </div>
            ) : null}
            {inspecting.allergens?.length ? (
              <div>
                <p className="text-xs font-medium text-forest-500">Allergens</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {inspecting.allergens.map((allergen) => (
                    <Badge key={allergen} tone="warning">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {inspecting.special_instructions ? (
              <div>
                <p className="text-xs font-medium text-forest-500">Special instructions</p>
                <p className="mt-1 text-sm text-forest-700">{inspecting.special_instructions}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </DashboardLayout>
  )
}
