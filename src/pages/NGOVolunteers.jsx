import { useMemo, useState } from 'react'
import { Bike, HandHeart, MessageSquare, Search, Truck, UserCheck } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import Badge, { VerifiedBadge } from '../components/Badge'
import { Card, EmptyState } from '../components/Card'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { getVolunteers } from '../services/donations'
import { ngoNav } from '../utils/dashNav'
import { cn } from '../utils/cn'
import { EMPTY_LIST } from '../utils/constants'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'two-wheeler', label: 'Two-wheeler' },
  { id: 'car', label: 'Car' },
  { id: 'walk', label: 'Walk / cycle' },
]

export default function NGOVolunteers() {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const { data, loading, error, reload } = useAsync(() => getVolunteers(), [])
  const volunteers = data?.volunteers ?? EMPTY_LIST

  const counts = useMemo(
    () =>
      volunteers.reduce(
        (acc, v) => {
          acc.total = (acc.total ?? 0) + 1
          const bucket = bucketFor(v.vehicle)
          acc[bucket] = (acc[bucket] ?? 0) + 1
          return acc
        },
        { total: 0 },
      ),
    [volunteers],
  )

  const visible = useMemo(
    () =>
      volunteers
        .filter((v) => (filter === 'all' ? true : bucketFor(v.vehicle) === filter))
        .filter((v) =>
          query
            ? [v.name, v.area, v.availability]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(query.toLowerCase()))
            : true,
        )
        .sort((a, b) => (b.completed_tasks ?? 0) - (a.completed_tasks ?? 0)),
    [volunteers, filter, query],
  )

  const availableNow = volunteers.filter((v) => v.availability && /immediate|now|flexible/i.test(v.availability)).length

  return (
    <DashboardLayout
      title="Volunteers"
      subtitle={`${counts.total ?? 0} verified · ${availableNow} available now`}
      nav={ngoNav}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by transport">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition',
                filter === item.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
              )}
            >
              {item.label}
              <span className="rounded-full bg-forest-100 px-1.5 text-[10px] font-bold text-forest-700">
                {item.id === 'all' ? counts.total ?? 0 : counts[item.id] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-forest-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, area or availability"
            aria-label="Search volunteers"
            className="input-base pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-6" message={error} onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={HandHeart}
          title={query ? 'No volunteers match your search' : 'No volunteers in this category'}
          description="Volunteers appear here once they register and are verified by an administrator."
          action={
            query ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('')
                  setFilter('all')
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((volunteer) => (
            <li key={volunteer.id}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={volunteer.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-forest-900">
                      {volunteer.name}
                      {volunteer.verified ? <VerifiedBadge status="verified" label="" className="shrink-0" /> : null}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-forest-500">
                      {volunteer.area} · {volunteer.city}
                    </p>
                  </div>
                </div>

                {volunteer.bio ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-forest-600">{volunteer.bio}</p>
                ) : null}

                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-forest-50 px-3 py-2">
                    <dt className="text-[11px] font-medium text-forest-500">Pickups</dt>
                    <dd className="font-semibold text-forest-900">{volunteer.completed_tasks ?? 0}</dd>
                  </div>
                  <div className="rounded-lg bg-forest-50 px-3 py-2">
                    <dt className="text-[11px] font-medium text-forest-500">Availability</dt>
                    <dd className="truncate font-semibold text-forest-900">
                      {volunteer.availability ?? 'Flexible'}
                    </dd>
                  </div>
                </dl>

                <ul className="mt-3 space-y-1.5 text-xs text-forest-600">
                  <li className="flex items-center gap-2">
                    <Bike className="h-3.5 w-3.5 shrink-0 text-forest-400" aria-hidden="true" />
                    {volunteer.vehicle ?? 'Transport not specified'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 shrink-0 text-forest-400" aria-hidden="true" />
                    {volunteer.availability ?? 'Flexible'}
                  </li>
                </ul>

                <div className="mt-4 flex flex-wrap gap-2 pt-1">
                  <Badge tone="brand" icon={UserCheck}>
                    Verified
                  </Badge>
                  <Button size="sm" variant="subtle" to="/messages" className="ml-auto">
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    Message
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </DashboardLayout>
  )
}

function bucketFor(vehicle = '') {
  const value = String(vehicle).toLowerCase()
  if (value.includes('car')) return 'car'
  if (value.includes('two') || value.includes('bike') || value.includes('scooter')) return 'two-wheeler'
  return 'walk'
}
