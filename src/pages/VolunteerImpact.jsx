import { useMemo, useState } from 'react'
import { Award, Download, HandHeart, Leaf, Package, Share2, Truck, UtensilsCrossed } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import { ChartCard, DonutChart, HorizontalBars, MonthlyBars, TrendArea } from '../components/DashboardCharts'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMyDonations } from '../services/donations'
import { volunteerNav } from '../utils/dashNav'
import { countBy, donationMetrics, monthlySeries } from '../utils/metrics'
import { EMPTY_LIST, getCategory } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import { exportCsv, shareText } from '../utils/share'
import { cn } from '../utils/cn'

const RANGES = [3, 6, 12]

const MILESTONES = [
  { meals: 10, label: 'First steps', body: 'Your first 10 meals rescued' },
  { meals: 100, label: 'Community mover', body: '100 meals collected' },
  { meals: 500, label: 'Food champion', body: '500 meals collected' },
  { meals: 1000, label: 'Waste warrior', body: '1,000 meals collected' },
]

export default function VolunteerImpact() {
  const toast = useToast()
  const { user } = useAuth()
  const [range, setRange] = useState(6)
  const { data, loading, error, reload } = useAsync(() => getMyDonations('volunteer'), [])
  const tasks = data?.donations ?? EMPTY_LIST

  const metrics = useMemo(() => donationMetrics(tasks), [tasks])
  const monthly = useMemo(() => monthlySeries(tasks, range, { onlyCompleted: true }), [tasks, range])
  const categories = useMemo(
    () =>
      countBy(
        tasks.filter((d) => d.status === 'completed'),
        'category',
        (id) => getCategory(id).label,
      ),
    [tasks],
  )
  const partners = useMemo(
    () => {
      const counts = tasks
        .filter((d) => d.status === 'completed')
        .reduce((acc, d) => {
          const name = d.donor?.name ?? 'Unknown partner'
          acc[name] = (acc[name] ?? 0) + (d.meals ?? 0)
          return acc
        }, {})
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    },
    [tasks],
  )

  const nextMilestone = MILESTONES.find((m) => m.meals > metrics.meals)
  const recent = useMemo(
    () =>
      tasks
        .filter((d) => d.status === 'completed')
        .sort((a, b) => new Date(b.completed_at ?? b.created_at) - new Date(a.completed_at ?? a.created_at))
        .slice(0, 6),
    [tasks],
  )

  const handleExport = () => {
    if (!recent.length) {
      toast.warning('Complete a pickup before exporting your report.')
      return
    }
    exportCsv(
      'foodbridge-volunteer-impact.csv',
      tasks
        .filter((d) => d.status === 'completed')
        .map((d) => ({
          donation_id: d.id,
          food_name: d.food_name,
          partner: d.donor?.name,
          meals: d.meals,
          quantity_kg: d.quantity,
          pickup_date: d.pickup_end,
          completed_at: d.completed_at ?? d.created_at,
        })),
    )
    toast.success('Your volunteer report has been downloaded.')
  }

  const handleShare = async () => {
    const text = `I have collected ${metrics.meals.toLocaleString('en-IN')} meals (${metrics.kg} kg of food) for people in Kozhikode with FoodBridge.`
    const result = await shareText(text, 'My FoodBridge volunteering', window.location.origin)
    if (result === 'shared') toast.success('Thanks for sharing your impact!')
    else if (result === 'copied') toast.success('Impact summary copied to your clipboard.')
    else if (result === 'unsupported') toast.info('Sharing is not available in this browser.')
  }

  return (
    <DashboardLayout
      title="My impact"
      subtitle={user?.name ? `Pickups completed by ${user.name}` : 'Every pickup you have made count'}
      nav={volunteerNav}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : metrics.completed === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Leaf}
          title="Your impact story starts with your first pickup"
          description="Complete a pickup and the meals you moved, the kilograms you saved and the people you helped will appear here."
          action={
            <Button to="/volunteer/tasks?tab=nearby">
              <Truck className="h-4 w-4" aria-hidden="true" />
              Find a pickup nearby
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              label="Meals collected"
              value={metrics.meals.toLocaleString('en-IN')}
              icon={UtensilsCrossed}
              tone="brand"
              hint={`${metrics.completed} pickup${metrics.completed === 1 ? '' : 's'} completed`}
            />
            <StatCard
              index={1}
              label="Food collected"
              value={metrics.kg.toLocaleString('en-IN')}
              unit="kg"
              icon={Package}
              tone="info"
              hint={`≈ ${metrics.co2} kg CO₂ saved`}
            />
            <StatCard
              index={2}
              label="People reached"
              value={metrics.beneficiaries.toLocaleString('en-IN')}
              icon={HandHeart}
              tone="success"
              hint="Through your pickups"
            />
            <StatCard
              index={3}
              label="Pickups completed"
              value={metrics.completed}
              icon={Award}
              tone="amber"
              hint={`${user?.completed_tasks ?? metrics.completed} lifetime tasks`}
            />
          </div>

          {nextMilestone ? (
            <Card className="mt-6 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-soft-100 text-amber-soft-600">
                    <Award className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">
                      Next milestone: {nextMilestone.label} — {nextMilestone.body}
                    </h2>
                    <p className="mt-0.5 text-sm text-forest-500">
                      {Math.max(nextMilestone.meals - metrics.meals, 0)} more meals to go. Keep collecting!
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-brand-700">
                  {metrics.meals}
                  <span className="text-base font-medium text-forest-400"> / {nextMilestone.meals}</span>
                </p>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-forest-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-soft-500 transition-all"
                  style={{ width: `${Math.min((metrics.meals / nextMilestone.meals) * 100, 100)}%` }}
                />
              </div>
            </Card>
          ) : null}

          <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-base font-semibold">Reporting period</h2>
              <p className="mt-0.5 text-sm text-forest-500">Choose how far back to chart your pickups.</p>
            </div>
            <div className="flex gap-1.5" role="group" aria-label="Select date range">
              {RANGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  aria-pressed={range === option}
                  className={cn(
                    'rounded-lg px-3.5 py-2 text-sm font-medium transition',
                    range === option
                      ? 'bg-brand-600 text-white'
                      : 'bg-forest-50 text-forest-600 hover:bg-forest-100',
                  )}
                >
                  {option} months
                </button>
              ))}
            </div>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard
              title="Meals collected each month"
              description={`Completed pickups, last ${range} months`}
              className="lg:col-span-2"
            >
              <MonthlyBars data={monthly} />
            </ChartCard>
            <ChartCard title="What you collect" description="By food category">
              {categories.length ? <DonutChart data={categories} /> : <NoData />}
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Food volume collected" description="Kilograms moved each month">
              <TrendArea data={monthly} dataKey="kg" name="Food collected (kg)" />
            </ChartCard>
            <ChartCard title="Top pickup partners" description="Hotels you have collected from most">
              {partners.length ? <HorizontalBars data={partners} /> : <NoData />}
            </ChartCard>
          </div>

          <Card className="mt-6 p-5">
            <SectionHeading
              align="left"
              eyebrow="Recent"
              title="Your latest pickups"
              description="Every completed collection you have made."
            />
            <ul className="mt-4 divide-y divide-forest-100">
              {recent.map((task) => (
                <li key={task.id} className="flex items-center gap-3 py-3.5">
                  <img src={task.image} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest-900">{task.food_name}</p>
                    <p className="truncate text-xs text-forest-500">
                      {task.donor?.name} · {formatDate(task.completed_at ?? task.pickup_end)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-brand-700">{task.meals} meals</p>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </DashboardLayout>
  )
}

function NoData() {
  return <p className="py-16 text-center text-sm text-forest-500">No data for this period yet.</p>
}
