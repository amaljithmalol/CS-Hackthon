import { useMemo, useState } from 'react'
import { Layers, Map as MapIcon, Navigation, Route, Truck } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import MapView, { KOZHIKODE_CENTER } from '../components/MapView'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { getDonations, getMyDonations } from '../services/donations'
import { volunteerNav } from '../utils/dashNav'
import { formatDateTime, timeRemaining } from '../utils/formatDate'
import { distanceKm, formatDistance } from '../utils/geo'
import { cn } from '../utils/cn'

const LAYERS = [
  { id: 'donation', label: 'My pickups' },
  { id: 'ngo', label: 'Collection points' },
  { id: 'volunteer', label: 'Volunteers' },
]

export default function VolunteerMap() {
  const { user } = useAuth()
  const [activeTypes, setActiveTypes] = useState(['donation', 'ngo'])

  const mine = useAsync(() => getMyDonations('volunteer'), [])
  const open = useAsync(
    () => getDonations({ availability: 'posted', sort: 'distance', ...(user ? { lat: user.latitude, lng: user.longitude } : {}) }),
    [user?.id],
  )

  const tasks = useMemo(
    () =>
      (mine.data?.donations ?? []).filter((d) =>
        ['assigned', 'collecting', 'collected', 'delivered'].includes(d.status),
      ),
    [mine.data],
  )

  const points = useMemo(
    () => [
      {
        id: 'ngo-1',
        type: 'ngo',
        name: 'Snehapooram Community Kitchen',
        organization: 'Snehapooram Trust',
        address: 'Beypore Road, Kozhikode',
        latitude: 11.23,
        longitude: 75.755,
        donations: tasks.length,
      },
      {
        id: 'ngo-2',
        type: 'ngo',
        name: 'Anna Charitable Foundation',
        organization: 'Community meal programme',
        address: 'Kallayi, Kozhikode',
        latitude: 11.219,
        longitude: 75.771,
        donations: 2,
      },
      {
        id: 'vol-1',
        type: 'volunteer',
        name: 'Nikhil Raj',
        address: 'Mananchira, Kozhikode',
        latitude: 11.2601,
        longitude: 75.7772,
        availability: 'Weekday evenings',
      },
      {
        id: 'vol-2',
        type: 'volunteer',
        name: 'Farhan P',
        address: 'Mavoor, Kozhikode',
        latitude: 11.2769,
        longitude: 75.7414,
        availability: 'Daily mornings',
      },
    ],
    [tasks.length],
  )

  const route = useMemo(
    () =>
      tasks
        .slice()
        .sort((a, b) => new Date(a.pickup_start) - new Date(b.pickup_start))
        .map((task) => ({
          ...task,
          distance_km: user ? distanceKm(user, task) : null,
        })),
    [tasks, user],
  )

  const totalKm = route.reduce((total, stop) => total + (stop.distance_km ?? 0), 0)

  const toggleLayer = (id) =>
    setActiveTypes((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )

  return (
    <DashboardLayout
      title="Pickup map"
      subtitle={route.length ? `${route.length} stops · about ${totalKm.toFixed(1)} km` : 'No active pickups'}
      nav={volunteerNav}
      actions={
        <Button to="/volunteer/tasks" size="sm" variant="outline">
          <Route className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Task list</span>
        </Button>
      }
      wide
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-forest-500 uppercase">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              Layers
            </span>
            {LAYERS.map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                aria-pressed={activeTypes.includes(layer.id)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm font-medium transition',
                  activeTypes.includes(layer.id)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-forest-200 bg-white text-forest-500 hover:border-brand-300',
                )}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {mine.error ? (
            <ErrorState message={mine.error} onRetry={mine.reload} />
          ) : (
            <MapView
              donations={tasks}
              points={points}
              activeTypes={activeTypes}
              center={user?.latitude && user?.longitude ? [user.latitude, user.longitude] : KOZHIKODE_CENTER}
              userLocation={user?.latitude && user?.longitude ? [user.latitude, user.longitude] : null}
              height="h-[560px]"
            />
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <SectionHeading
              align="left"
              eyebrow="Your route"
              title={route.length ? 'Pickup stops' : 'No stops yet'}
              description={
                route.length
                  ? 'Ordered by pickup time. Total distance is a straight-line estimate.'
                  : 'Accept a task to build your route.'
              }
            />
            {route.length ? (
              <>
                <ol className="mt-4 space-y-2.5">
                  {route.map((stop, index) => {
                    const deadline = timeRemaining(stop.pickup_end)
                    return (
                      <li
                        key={stop.id}
                        className="flex gap-3 rounded-xl border border-forest-100 p-3"
                      >
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-forest-900">{stop.food_name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-forest-500">
                            <Navigation className="h-3 w-3 shrink-0" aria-hidden="true" />
                            {stop.distance_km != null ? formatDistance(stop.distance_km) : '—'} ·{' '}
                            {stop.donor?.name}
                          </p>
                          <p className="mt-0.5 text-xs text-forest-500">{formatDateTime(stop.pickup_start)}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <StatusBadge status={stop.status} />
                            {deadline.urgent ? <Badge tone="warning">{deadline.label}</Badge> : null}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
                <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-forest-50 p-3 text-xs text-forest-600">
                  <Truck className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                  About {totalKm.toFixed(1)} km total. Update each stop from your task list.
                </p>
                <Button to="/volunteer/tasks" size="sm" className="mt-3 w-full">
                  Open task list
                </Button>
              </>
            ) : (
              <EmptyState
                className="mt-2"
                icon={MapIcon}
                title="Nothing on your route"
                description="Volunteer for a nearby donation and the pickup point will appear on this map."
                action={
                  <Button to="/volunteer/tasks?tab=nearby" size="sm">
                    Find nearby food
                  </Button>
                }
              />
            )}
          </Card>

          {open.loading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : (open.data?.donations ?? []).length ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold">Open donations near you</h2>
              <ul className="mt-3 space-y-2">
                {(open.data?.donations ?? []).slice(0, 4).map((donation) => (
                  <li key={donation.id} className="flex items-center gap-2.5 text-sm">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-forest-700">{donation.food_name}</span>
                    {donation.distance_km != null ? (
                      <span className="shrink-0 text-xs font-semibold text-brand-700">
                        {formatDistance(donation.distance_km)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <Button to="/volunteer/tasks?tab=nearby" variant="subtle" size="sm" className="mt-4 w-full">
                View all nearby
              </Button>
            </Card>
          ) : null}
        </aside>
      </div>
    </DashboardLayout>
  )
}
