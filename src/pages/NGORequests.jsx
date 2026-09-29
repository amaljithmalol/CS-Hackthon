import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Inbox, MapPin, Search, UtensilsCrossed, XCircle } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState } from '../components/Card'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import StatusTimeline from '../components/StatusTimeline'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../context/ToastContext'
import { getMyRequests, updateDonationStatus } from '../services/donations'
import { ngoNav } from '../utils/dashNav'
import { formatDateTime, timeAgo, timeRemaining } from '../utils/formatDate'
import { cn } from '../utils/cn'
import { EMPTY_LIST } from '../utils/constants'

const FILTERS = [
  { id: 'open', label: 'Open', statuses: ['requested', 'assigned', 'collecting', 'collected', 'delivered'] },
  { id: 'completed', label: 'Completed', statuses: ['completed'] },
  { id: 'all', label: 'All', statuses: null },
]

export default function NGORequests() {
  const toast = useToast()
  const [filter, setFilter] = useState('open')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(null)
  const { data, loading, error, reload } = useAsync(() => getMyRequests(), [])
  const requests = data?.requests ?? EMPTY_LIST

  const visible = useMemo(() => {
    const current = FILTERS.find((f) => f.id === filter)
    return requests
      .filter((r) => (current?.statuses ? current.statuses.includes(r.donation?.status) : true))
      .filter((r) =>
        query
          ? [r.donation?.food_name, r.donation?.donor?.name, r.donation?.pickup_address]
              .filter(Boolean)
              .some((field) => field.toLowerCase().includes(query.toLowerCase()))
          : true,
      )
  }, [requests, filter, query])

  const counts = useMemo(
    () =>
      FILTERS.reduce((acc, item) => {
        acc[item.id] = item.statuses
          ? requests.filter((r) => item.statuses.includes(r.donation?.status)).length
          : requests.length
        return acc
      }, {}),
    [requests],
  )

  const release = async (request) => {
    setBusy(request.id)
    try {
      await updateDonationStatus(request.donation.id, 'posted')
      toast.info('Request released. The donation is available to other organisations again.')
      reload()
    } catch (err) {
      toast.error(err?.message ?? 'We could not release this request.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <DashboardLayout
      title="My requests"
      subtitle={`${counts.open ?? 0} open · ${requests.length} total`}
      nav={ngoNav}
      actions={
        <Button to="/ngo/donations" size="sm" variant="outline">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Find more food</span>
        </Button>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter requests">
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
                {counts[item.id] ?? 0}
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
            placeholder="Search your requests"
            aria-label="Search requests"
            className="input-base pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-6" message={error} onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Inbox}
          title={query ? 'No requests match your search' : 'No requests here yet'}
          description={
            query
              ? 'Try a different food name, hotel or address.'
              : 'Browse available food and request a donation to start building your collection plan.'
          }
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button to="/ngo/donations">
                <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                Browse available food
              </Button>
            )
          }
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((request) => {
            const donation = request.donation
            if (!donation) return null
            const deadline = timeRemaining(donation.pickup_end)
            const canRelease = ['requested', 'assigned'].includes(donation.status)
            return (
              <li key={request.id}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <img src={donation.image} alt="" className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/donations/${donation.id}`}
                            className="text-base font-semibold text-forest-900 hover:text-brand-700"
                          >
                            {donation.food_name}
                          </Link>
                          <StatusBadge status={donation.status} />
                        </div>
                        <p className="mt-1 text-sm text-forest-500">
                          {donation.meals} meals · {donation.quantity} {donation.unit} ·{' '}
                          {donation.donor?.name}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-forest-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{donation.pickup_address}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge tone={deadline.urgent ? 'warning' : 'neutral'}>{deadline.label}</Badge>
                      <p className="mt-1.5 text-xs text-forest-400">Requested {timeAgo(request.created_at)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-forest-50 p-4 text-sm">
                      <p className="text-xs font-medium text-forest-500">Pickup window</p>
                      <p className="mt-1 font-medium text-forest-800">
                        {formatDateTime(donation.pickup_start)} – {formatDateTime(donation.pickup_end)}
                      </p>
                      {donation.volunteer ? (
                        <p className="mt-2 text-sm text-forest-600">
                          Volunteer: <span className="font-semibold text-forest-800">{donation.volunteer.name}</span>
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-amber-soft-700">No volunteer assigned yet.</p>
                      )}
                    </div>
                    <div>
                      <StatusTimeline status={donation.status} />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" to={`/ngo/collections`}>
                      <ClipboardList className="h-4 w-4" aria-hidden="true" />
                      Manage collection
                    </Button>
                    <Button size="sm" variant="subtle" to={`/donations/${donation.id}`}>
                      View details
                    </Button>
                    {canRelease ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={busy === request.id}
                        onClick={() => release(request)}
                      >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Release donation
                      </Button>
                    ) : null}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardLayout>
  )
}
