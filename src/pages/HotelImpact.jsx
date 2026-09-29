import { useMemo, useState } from 'react'
import { Award, Download, Leaf, Package, Share2, UtensilsCrossed, Users } from 'lucide-react'
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
import { useToast } from '../context/ToastContext'
import { getMyDonations } from '../services/donations'
import { hotelNav } from '../utils/dashNav'
import { countBy, donationMetrics, monthlySeries } from '../utils/metrics'
import { CITIES, EMPTY_LIST, getCategory } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import { exportCsv, shareText } from '../utils/share'

export default function HotelImpact() {
  const toast = useToast()
  const [range, setRange] = useState(6)
  const { data, loading, error, reload } = useAsync(() => getMyDonations('donor'), [])
  const donations = data?.donations ?? EMPTY_LIST

  const metrics = useMemo(() => donationMetrics(donations), [donations])
  const monthly = useMemo(
    () => monthlySeries(donations, range, { onlyCompleted: true }),
    [donations, range],
  )
  const categories = useMemo(
    () =>
      countBy(
        donations.filter((d) => d.status === 'completed'),
        'category',
        (id) => getCategory(id).label,
      ),
    [donations],
  )
  const cities = useMemo(
    () =>
      countBy(
        donations.filter((d) => d.status === 'completed'),
        (d) => d.donor?.city ?? 'Kozhikode',
        (name) => CITIES.find((c) => c === name) ?? name,
      ),
    [donations],
  )
  const topDonations = useMemo(
    () =>
      donations
        .filter((d) => d.status === 'completed')
        .sort((a, b) => (b.meals ?? 0) - (a.meals ?? 0))
        .slice(0, 5),
    [donations],
  )

  const handleExport = () => {
    if (!donations.length) {
      toast.warning('There is no completed donation data to export yet.')
      return
    }
    const rows = donations
      .filter((d) => d.status === 'completed')
      .map((d) => ({
        donation_id: d.id,
        food_name: d.food_name,
        category: d.category_label,
        meals: d.meals,
        quantity_kg: d.quantity,
        beneficiaries: d.beneficiaries || d.meals,
        status: d.status,
        completed_at: d.completed_at ?? d.created_at,
      }))
    exportCsv('foodbridge-hotel-impact.csv', rows)
    toast.success('Your impact report has been downloaded.')
  }

  const handleShare = async () => {
    const text = `I have helped rescue ${metrics.meals.toLocaleString('en-IN')} meals (${metrics.kg} kg of food) with FoodBridge — that is about ${metrics.co2} kg of CO₂ saved.`
    const result = await shareText(text, 'My FoodBridge impact')
    if (result === 'shared') toast.success('Thanks for sharing your impact!')
    else if (result === 'cancelled') toast.info('Sharing cancelled.')
    else toast.info('Sharing is not available in this browser.')
  }

  return (
    <DashboardLayout
      title="My impact"
      subtitle="What your surplus food has achieved"
      nav={hotelNav}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV</span>
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
          title="Your impact story starts with your first donation"
          description="Once a volunteer collects and you confirm a delivery, the meals, kilograms and CO₂ saved will be counted here."
          action={
            <Button to="/hotel/create-donation">
              <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
              Post surplus food
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard index={0} label="Meals rescued" value={metrics.meals.toLocaleString('en-IN')} icon={UtensilsCrossed} tone="brand" hint="Confirmed deliveries" />
            <StatCard index={1} label="Food diverted" value={metrics.kg.toLocaleString('en-IN')} unit="kg" icon={Package} tone="info" hint={`≈ ${metrics.co2} kg CO₂ saved`} />
            <StatCard index={2} label="People reached" value={metrics.beneficiaries.toLocaleString('en-IN')} icon={Users} tone="success" hint="Reported by partner NGOs" />
            <StatCard index={3} label="Donations completed" value={metrics.completed} icon={Award} tone="amber" hint={`${donations.length} posted in total`} />
          </div>

          <Card className="mt-6 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Reporting period</h2>
                <p className="mt-0.5 text-sm text-forest-500">Choose how far back to chart your donations.</p>
              </div>
              <div className="flex gap-1.5" role="group" aria-label="Select date range">
                {[3, 6, 12].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRange(option)}
                    aria-pressed={range === option}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      range === option
                        ? 'bg-brand-600 text-white'
                        : 'bg-forest-50 text-forest-600 hover:bg-forest-100'
                    }`}
                  >
                    {option} months
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ChartCard
              title="Meals rescued over time"
              description={`Completed donations, last ${range} months`}
              className="lg:col-span-2"
            >
              <MonthlyBars data={monthly} />
            </ChartCard>
            <ChartCard title="Food donated by category" description="Which foods you rescue most">
              {categories.length ? <DonutChart data={categories} /> : <NoData />}
            </ChartCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Monthly food volume" description="Kilograms diverted from waste">
              <TrendArea data={monthly} dataKey="kg" name="Food rescued (kg)" />
            </ChartCard>
            <ChartCard title="Donations by pickup area" description="Where your surplus food comes from">
              {cities.length ? <HorizontalBars data={cities} unit="" /> : <NoData />}
            </ChartCard>
          </div>

          <Card className="mt-6 p-5">
            <SectionHeading
              align="left"
              eyebrow="Highlights"
              title="Your biggest contributions"
              description="Completed donations ranked by meals rescued."
            />
            <ul className="mt-4 divide-y divide-forest-100">
              {topDonations.map((donation, index) => (
                <li key={donation.id} className="flex items-center gap-4 py-3.5">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <img src={donation.image} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest-900">{donation.food_name}</p>
                    <p className="truncate text-xs text-forest-500">
                      {donation.category_label} · {formatDate(donation.completed_at ?? donation.created_at)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-brand-700">{donation.meals} meals</p>
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
  return <p className="py-10 text-center text-sm text-forest-500">No data for this period yet.</p>
}
