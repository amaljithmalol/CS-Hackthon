import { useMemo, useState } from 'react'
import { Download, Leaf, Package, Share2, TrendingUp, Users, UtensilsCrossed } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import {
  ChartCard,
  DonutChart,
  HorizontalBars,
  MonthlyBars,
  TrendArea,
} from '../components/DashboardCharts'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMyRequests } from '../services/donations'
import { ngoNav } from '../utils/dashNav'
import { countBy, donationMetrics, groupBy, monthlySeries, sum } from '../utils/metrics'
import { getCategory } from '../utils/constants'
import { exportCsv, shareText } from '../utils/share'
import { cn } from '../utils/cn'

const RANGES = [3, 6, 12]

export default function NGOImpact() {
  const toast = useToast()
  const { user } = useAuth()
  const [range, setRange] = useState(6)
  const { data, loading, error, reload } = useAsync(() => getMyRequests(), [])

  const collections = useMemo(
    () => (data?.requests ?? []).map((r) => r.donation).filter(Boolean),
    [data],
  )
  const completed = useMemo(() => collections.filter((d) => d.status === 'completed'), [collections])
  const metrics = useMemo(() => donationMetrics(collections), [collections])
  const monthly = useMemo(() => monthlySeries(collections, range, { onlyCompleted: true }), [collections, range])
  const categories = useMemo(
    () => countBy(completed, 'category', (id) => getCategory(id).label),
    [completed],
  )
  const donors = useMemo(
    () =>
      Object.entries(groupBy(completed, (d) => d.donor?.name ?? 'Unknown partner'))
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    [completed],
  )
  const peopleReached = sum(completed, (d) => d.beneficiaries || d.meals)

  const handleExport = () => {
    if (!completed.length) {
      toast.warning('There is no completed collection data to export yet.')
      return
    }
    exportCsv(
      'foodbridge-ngo-impact.csv',
      completed.map((d) => ({
        donation_id: d.id,
        food_name: d.food_name,
        partner: d.donor?.name,
        meals: d.meals,
        quantity_kg: d.quantity,
        people_reached: d.beneficiaries || d.meals,
        pickup_date: d.pickup_end,
        completed_at: d.completed_at ?? d.created_at,
      })),
    )
    toast.success('Your impact report has been downloaded.')
  }

  const handleShare = async () => {
    const text = `With FoodBridge we have secured ${metrics.meals.toLocaleString('en-IN')} meals for ${peopleReached.toLocaleString('en-IN')} people in Kozhikode.`
    const result = await shareText(text, 'Our FoodBridge impact', window.location.origin)
    if (result === 'shared') toast.success('Thanks for sharing your impact!')
    else if (result === 'copied') toast.success('Impact summary copied to your clipboard.')
    else if (result === 'unsupported') toast.info('Sharing is not available in this browser.')
  }

  return (
    <DashboardLayout
      title="Our impact"
      subtitle={user?.organization_name ?? 'Meals secured for the community'}
      nav={ngoNav}
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
      ) : completed.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Leaf}
          title="Your impact story starts with your first collection"
          description="Once a donation is collected and delivered, the meals, kilograms and people reached will be counted here."
          action={
            <Button to="/ngo/donations">
              <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
              Find available food
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              label="Meals secured"
              value={metrics.meals.toLocaleString('en-IN')}
              icon={UtensilsCrossed}
              tone="brand"
              hint={`${metrics.completed} completed collection${metrics.completed === 1 ? '' : 's'}`}
            />
            <StatCard
              index={1}
              label="People reached"
              value={peopleReached.toLocaleString('en-IN')}
              icon={Users}
              tone="success"
              hint="Reported by partner organisations"
            />
            <StatCard
              index={2}
              label="Food secured"
              value={metrics.kg.toLocaleString('en-IN')}
              unit="kg"
              icon={Package}
              tone="info"
              hint={`≈ ${metrics.co2} kg CO₂ avoided`}
            />
            <StatCard
              index={3}
              label="Partner hotels"
              value={donors.length}
              icon={TrendingUp}
              tone="amber"
              hint="Donating to your organisation"
            />
          </div>

          <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-base font-semibold">Reporting period</h2>
              <p className="mt-0.5 text-sm text-forest-500">Choose how far back to chart your collections.</p>
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
              title="Meals secured each month"
              description={`Completed collections, last ${range} months`}
              className="lg:col-span-2"
            >
              <MonthlyBars data={monthly} />
            </ChartCard>
            <ChartCard title="What you collect" description="By food category">
              {categories.length ? <DonutChart data={categories} /> : <NoData />}
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Food secured over time" description="Kilograms collected each month">
              <TrendArea data={monthly} dataKey="kg" name="Food secured (kg)" />
            </ChartCard>
            <ChartCard title="Top partner hotels" description="Who contributes the most">
              {donors.length ? <HorizontalBars data={donors} /> : <NoData />}
            </ChartCard>
          </div>

          <Card className="mt-6 p-5">
            <SectionHeading
              align="left"
              eyebrow="Recognition"
              title="Your contribution to a waste-free Kozhikode"
              description="Share these figures with your community and supporters."
            />
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { title: `${metrics.kg} kg diverted`, body: 'Food that would otherwise have been thrown away.' },
                { title: `${metrics.co2} kg CO₂ saved`, body: 'Avoided emissions compared with landfill disposal.' },
                { title: `${peopleReached} people fed`, body: 'Individuals who benefited from rescued meals.' },
              ].map((item) => (
                <li key={item.title} className="rounded-xl border border-forest-100 p-4">
                  <p className="text-sm font-semibold text-brand-700">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-forest-500">{item.body}</p>
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
