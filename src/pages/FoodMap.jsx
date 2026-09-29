import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Crosshair, Info, Layers, ListFilter, Map as MapIcon, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import MapView, { KOZHIKODE_CENTER } from '../components/MapView'
import DonationCard from '../components/DonationCard'
import Button from '../components/Button'
import { ConfirmDialog } from '../components/Modal'
import { EmptyState } from '../components/Card'
import { DonationCardSkeleton } from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'
import { useAsync } from '../hooks/useAsync'
import { useDonationRequest } from '../hooks/useDonationRequest'
import { getDonations } from '../services/donations'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/formatDate'
import { cn } from '../utils/cn'
import { EMPTY_LIST } from '../utils/constants'

const LAYERS = [
  { id: 'donation', label: 'Food donations' },
  { id: 'ngo', label: 'NGO collection points' },
  { id: 'volunteer', label: 'Active volunteers' },
  { id: 'hotel', label: 'Partner hotels' },
]

export default function FoodMap() {
  const { user } = useAuth()
  const [activeTypes, setActiveTypes] = useState(['donation', 'ngo', 'volunteer'])
  const [search, setSearch] = useState('')
  const request = useDonationRequest()

  const { data, loading, error, reload } = useAsync(() => getDonations({ sort: 'deadline' }), [])

  const donations = data?.donations ?? EMPTY_LIST

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
        donations: 4,
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
        id: 'ngo-3',
        type: 'ngo',
        name: 'Coastal Care Network',
        organization: 'Coastal outreach hub',
        address: 'Kadalayi, Kozhikode',
        latitude: 11.2069,
        longitude: 75.7461,
        donations: 3,
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
      {
        id: 'vol-3',
        type: 'volunteer',
        name: 'Anjali Menon',
        address: 'Chevayoor, Kozhikode',
        latitude: 11.2766,
        longitude: 75.7586,
        availability: 'Weekends',
      },
      {
        id: 'hotel-1',
        type: 'hotel',
        name: 'Green Leaf Restaurant',
        address: '14 MG Road, Kozhikode',
        latitude: 11.2596,
        longitude: 75.7804,
      },
      {
        id: 'hotel-2',
        type: 'hotel',
        name: 'Spice Garden Hotel',
        address: 'Ferokh Bridge, Kozhikode',
        latitude: 11.2394,
        longitude: 75.7538,
      },
    ],
    [],
  )

  const visibleDonations = useMemo(() => {
    if (!search.trim()) return donations
    const needle = search.toLowerCase()
    return donations.filter((d) =>
      [d.food_name, d.donor?.name, d.pickup_address]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle)),
    )
  }, [donations, search])

  const toggleLayer = (id) => {
    setActiveTypes((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Live map"
        title="Food Map"
        description="See available donations, NGO collection points, partner hotels and active volunteers around Kozhikode."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Food Map' }]}
        action={
          <Button to="/donations" variant="outline">
            <ListFilter className="h-4 w-4" aria-hidden="true" />
            List view
          </Button>
        }
      />

      <div className="container-page py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-forest-400" aria-hidden="true" />
                <label htmlFor="map-search" className="sr-only">
                  Search the map
                </label>
                <input
                  id="map-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search food, hotel or area…"
                  className="input-base py-3 pl-10"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-3 py-2 text-xs text-forest-600">
                <Crosshair className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {user ? `${user.area}, ${user.city}` : 'Kozhikode, Kerala'}
              </div>
            </div>

            {error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : (
              <MapView
                donations={visibleDonations}
                points={points}
                activeTypes={activeTypes}
                center={user ? [user.latitude, user.longitude] : KOZHIKODE_CENTER}
                zoom={13}
                height="h-[28rem] lg:h-[34rem]"
                onRequest={request.openRequest}
                userLocation={user ? { lat: user.latitude, lng: user.longitude } : null}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? [0, 1, 2].map((i) => <DonationCardSkeleton key={i} />)
                : visibleDonations.slice(0, 6).map((donation, index) => (
                    <DonationCard
                      key={donation.id}
                      donation={donation}
                      index={index}
                      onRequest={request.openRequest}
                    />
                  ))}
            </div>

            {!loading && visibleDonations.length === 0 ? (
              <EmptyState
                icon={MapIcon}
                title="Nothing matches your search"
                description="Try a different food name, hotel or area."
                action={<Button variant="outline" onClick={() => setSearch('')}>Clear search</Button>}
              />
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Layers className="h-4 w-4 text-brand-600" aria-hidden="true" />
                Map layers
              </h2>
              <ul className="mt-4 space-y-2">
                {LAYERS.map((layer) => {
                  const active = activeTypes.includes(layer.id)
                  return (
                    <li key={layer.id}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition',
                          active ? 'border-brand-400 bg-brand-50 text-brand-800' : 'border-forest-200 hover:border-brand-300',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleLayer(layer.id)}
                          className="h-4 w-4 accent-brand-600"
                        />
                        {layer.label}
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5"
            >
              <h2 className="text-sm font-semibold">How pickups work</h2>
              <ol className="mt-3 space-y-3 text-sm text-forest-600">
                <li className="flex gap-2">
                  <span className="font-semibold text-brand-600">1.</span>
                  Request an available donation from the list or map.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-brand-600">2.</span>
                  The hotel confirms and assigns a volunteer.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-brand-600">3.</span>
                  Collect within the pickup window and confirm delivery.
                </li>
              </ol>
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-forest-50 p-3 text-xs text-forest-600">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                Follow the food safety guidelines when collecting and distributing.
              </p>
              <Button to="/food-safety" variant="subtle" size="sm" className="mt-3 w-full">
                Read guidelines
              </Button>
            </motion.div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(request.pending)}
        onClose={request.cancelRequest}
        onConfirm={request.confirmRequest}
        loading={request.loading}
        title="Send donation request?"
        confirmLabel="Send request"
        message={
          request.pending ? (
            <div className="space-y-2">
              <p>
                Request <strong>{request.pending.meals} meals</strong> of{' '}
                <strong>{request.pending.food_name}</strong> from {request.pending.donor?.name}.
              </p>
              <p className="text-xs text-forest-500">
                {formatDateTime(request.pending.pickup_start)} · {request.pending.pickup_address}
              </p>
            </div>
          ) : null
        }
      />

      <span className="sr-only">Showing {visibleDonations.length} donations on the map</span>
    </div>
  )
}
