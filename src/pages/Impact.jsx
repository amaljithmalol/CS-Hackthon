import { useState } from 'react'
import {
  BarChart3,
  Building2,
  Download,
  HandHeart,
  HeartHandshake,
  Info,
  Leaf,
  PackageCheck,
  Share2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import Avatar from '../components/Avatar'
import { Card, SectionHeading } from '../components/Card'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { ChartCard, DonutChart, DualLine, HorizontalBars, MonthlyBars, TrendArea } from '../components/DashboardCharts'
import { useAsync } from '../hooks/useAsync'
import { useCountUp } from '../hooks/useCountUp'
import { getImpactAnalytics, getImpactSummary } from '../services/reports'
import { useToast } from '../context/ToastContext'
import { APP, CO2_PER_KG } from '../utils/constants'
import { exportCsv, shareText } from '../utils/share'
import { cn } from '../utils/cn'

const RANGES = [
  { id: '3m', label: 'Last 3 months' },
  { id: '6m', label: 'Last 6 months' },
  { id: '12m', label: 'Full year' },
]

function Counter({ value, suffix = '', decimals = 0 }) {
  const { ref, value: current } = useCountUp(value, { decimals })
  return (
    <span ref={ref} className="tabular-nums">
      {current.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

export default function Impact() {
  const toast = useToast()
  const [range, setRange] = useState('12m')
  const { data, loading, error, reload } = useAsync(() => getImpactSummary(), [])
  // `roles` lives on the analytics endpoint, not the summary endpoint.
  const { data: analytics } = useAsync(() => getImpactAnalytics(), [])

  if (loading) {
    return (
      <div>
        <PageHeader title="Our impact" description="Every meal, every kilogram and every kilogram of CO₂ avoided." />
        <div className="container-page grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Our impact" />
        <div className="container-page py-10">
          <ErrorState message={error} onRetry={reload} />
        </div>
      </div>
    )
  }

  const summary = data.summary
  const monthly = data.monthly
  const visibleMonths = range === '3m' ? monthly.slice(-3) : range === '6m' ? monthly.slice(-6) : monthly

  const handleExport = () => {
    const rows = monthly.map((row) => ({
      month: row.month,
      meals_saved: row.meals,
      kg_diverted: row.kg,
      donations: row.donations,
    }))
    if (exportCsv('foodbridge-impact.csv', rows)) {
      toast.success('Impact report downloaded as a CSV file.')
    } else {
      toast.warning('There is no data to export yet.')
    }
  }

  const handleShare = async () => {
    const text = `${summary.meals_saved.toLocaleString('en-IN')}+ meals saved and ${summary.waste_reduced_kg.toLocaleString('en-IN')} kg of food diverted from waste.`
    const result = await shareText(text, `${APP.name} impact`, window.location.origin)
    if (result === 'shared') toast.success('Thanks for sharing our impact!')
    else if (result === 'copied') toast.success('Impact summary copied to your clipboard.')
    else if (result === 'unsupported') toast.info('Sharing is not available in this browser.')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Impact report"
        title="Every number here was a meal that could have been wasted"
        description="Live figures from partner hotels, NGOs and volunteers across the FoodBridge network."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Impact' }]}
        action={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download report
            </Button>
          </div>
        }
      />

      <div className="container-page space-y-14 py-12">
        {/* headline numbers */}
        <section>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Meals saved"
              value={summary.meals_saved.toLocaleString('en-IN')}
              unit="+"
              icon={PackageCheck}
              tone="brand"
              trend={18}
              index={0}
              hint="Meals redirected to people in need"
            />
            <StatCard
              label="Food waste reduced"
              value={summary.waste_reduced_kg.toLocaleString('en-IN')}
              unit="kg"
              icon={TrendingDown}
              tone="amber"
              trend={24}
              index={1}
              hint="Diverted from landfill"
            />
            <StatCard
              label="CO₂ emissions avoided"
              value={summary.co2_reduced_kg.toLocaleString('en-IN')}
              unit="kg"
              icon={Leaf}
              tone="success"
              trend={22}
              index={2}
              hint={`Estimated at ${CO2_PER_KG} kg per kg of food`}
            />
            <StatCard
              label="People served"
              value={summary.people_served.toLocaleString('en-IN')}
              unit="+"
              icon={Users}
              tone="info"
              trend={12}
              index={3}
              hint="Across shelters, kitchens and community meals"
            />
          </dl>
        </section>

        {/* demo data note */}
        <Reveal>
          <div className="flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2.5 text-sm text-forest-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>
                Alongside the network totals, this demo workspace contains{' '}
                <strong>{summary.demo.meals} meals</strong> and{' '}
                <strong>{summary.demo.kg} kg</strong> of food tracked through the live dashboards in this
                browser.
              </span>
            </p>
            <Button to="/register" size="sm" className="shrink-0">
              Add your impact
            </Button>
          </div>
        </Reveal>

        {/* trends */}
        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Trends</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Monthly performance</h2>
            </div>
            <div
              className="inline-flex w-fit rounded-xl border border-forest-200 bg-white p-1 shadow-soft"
              role="group"
              aria-label="Select time range"
            >
              {RANGES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRange(option.id)}
                  aria-pressed={range === option.id}
                  className={cn(
                    'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition',
                    range === option.id ? 'bg-brand-600 text-white' : 'text-forest-600 hover:bg-forest-50',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Meals saved each month" description="Number of meals redirected to people in need">
              <MonthlyBars data={visibleMonths} />
            </ChartCard>
            <ChartCard title="Food diverted" description="Kilograms rescued from waste">
              <TrendArea data={visibleMonths} dataKey="kg" name="Kg diverted" color="#f68f16" />
            </ChartCard>
          </div>
        </section>

        {/* breakdowns */}
        <section className="grid gap-5 lg:grid-cols-3">
          <ChartCard title="Donations by category" description="Share of rescued food by type">
            <DonutChart data={data.categories} />
          </ChartCard>
          <ChartCard title="Community mix" description="Verified members by role">
            <DonutChart data={analytics?.roles ?? []} />
          </ChartCard>
          <ChartCard title="Donation status" description="Where donations stand today">
            <DonutChart data={data.statuses} />
          </ChartCard>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <ChartCard
            title="Meals and donations by city"
            description="Where the network is most active"
            height={340}
          >
            <DualLine
              data={data.cities.map((c) => ({ ...c, month: c.city }))}
              series={[
                { dataKey: 'meals', name: 'Meals', color: '#12894c' },
                { dataKey: 'donations', name: 'Donations', color: '#f68f16' },
              ]}
            />
          </ChartCard>
          <ChartCard title="Top partner cities by meals" description="Meals served per city" height={340}>
            <HorizontalBars
              data={data.cities.map((c) => ({ name: c.city, value: c.meals }))}
              unit=" meals"
            />
          </ChartCard>
        </section>

        {/* leaderboards */}
        <section className="grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-soft-50 text-amber-soft-600">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">Top food donors</h3>
                <p className="text-xs text-forest-500">Hotels and restaurants by meals rescued</p>
              </div>
            </div>
            <ol className="space-y-3">
              {data.donor_leaderboard.map((donor, index) => (
                <li
                  key={donor.name}
                  className="flex items-center gap-3 rounded-xl border border-forest-100 p-3"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest-900">{donor.name}</p>
                    <p className="text-xs text-forest-500">{donor.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-700">{donor.meals}</p>
                    <p className="text-[11px] text-forest-500">meals</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-info-50 text-info-500">
                <HandHeart className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">Outstanding volunteers</h3>
                <p className="text-xs text-forest-500">By completed pickups and meals moved</p>
              </div>
            </div>
            <ol className="space-y-3">
              {data.volunteer_leaderboard.map((person, index) => (
                <li key={person.name} className="flex items-center gap-3 rounded-xl border border-forest-100 p-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-xs font-bold text-forest-700">
                    {index + 1}
                  </span>
                  <Avatar name={person.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest-900">{person.name}</p>
                    <p className="text-xs text-forest-500">
                      {person.area} · {person.tasks} pickups
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-info-500">{person.meals}</p>
                    <p className="text-[11px] text-forest-500">meals</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* live demo contribution */}
        <section>
          <SectionHeading
            eyebrow="Your contribution"
            title="This month across the demo workspace"
            description="What has been tracked inside this browser session while you explore the app."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Meals tracked"
              value={summary.demo.meals.toLocaleString('en-IN')}
              icon={Sparkles}
              tone="brand"
              index={0}
            />
            <StatCard
              label="Kg diverted"
              value={summary.demo.kg.toLocaleString('en-IN')}
              unit="kg"
              icon={TrendingUp}
              tone="amber"
              index={1}
            />
            <StatCard
              label="People reached"
              value={summary.demo.people.toLocaleString('en-IN')}
              icon={Users}
              tone="info"
              index={2}
            />
            <StatCard
              label="CO₂ avoided"
              value={(summary.demo.kg * CO2_PER_KG).toLocaleString('en-IN')}
              unit="kg"
              icon={Leaf}
              tone="success"
              index={3}
            />
          </div>
        </section>

        <Reveal>
          <Card className="flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <BarChart3 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">Want these numbers for your own organisation?</h3>
                <p className="mt-1 text-sm text-forest-600">
                  Every partner gets a private impact dashboard with meals, kilograms, CO₂ and beneficiaries.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button to="/register">Join the network</Button>
              <Button to="/register?role=volunteer" variant="outline">
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                Volunteer
              </Button>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
