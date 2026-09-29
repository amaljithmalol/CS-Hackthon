import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, ListFilter, MapPin, RotateCcw, Search, SlidersHorizontal, UtensilsCrossed, X } from 'lucide-react'
import Button from './Button'
import DonationCard from './DonationCard'
import FoodCategory from './FoodCategory'
import Modal from './Modal'
import { EmptyState } from './Card'
import { DonationCardSkeleton } from './LoadingSpinner'
import ErrorState from './ErrorState'
import { useDebounced } from '../hooks/useDebounced'
import { AVAILABILITY, CATEGORIES, DIET_TYPES } from '../utils/constants'
import { cn } from '../utils/cn'

const SORTS = [
  { id: 'deadline', label: 'Pickup deadline (soonest)' },
  { id: 'newest', label: 'Recently posted' },
  { id: 'distance', label: 'Nearest first' },
  { id: 'meals', label: 'Most meals' },
]

const DISTANCES = [2, 5, 10, 25]

const defaultFilters = {
  search: '',
  category: 'all',
  availability: 'all',
  maxDistance: '',
  minMeals: '',
  diet: 'all',
  sort: 'deadline',
}

export function FilterPanel({ filters, onChange, onReset, counts, className, showAvailability = true }) {
  const field = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" aria-hidden="true" />
          Filters
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-500 transition hover:text-brand-700"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>
      </div>

      {showAvailability ? (
        <fieldset>
          <legend className="mb-2 text-xs font-semibold tracking-wide text-forest-500 uppercase">Availability</legend>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABILITY.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => field('availability', option.id)}
                aria-pressed={filters.availability === option.id}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition',
                  filters.availability === option.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-xs font-semibold tracking-wide text-forest-500 uppercase">Distance</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => field('maxDistance', '')}
            aria-pressed={filters.maxDistance === ''}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
              filters.maxDistance === ''
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
            )}
          >
            Any
          </button>
          {DISTANCES.map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => field('maxDistance', km)}
              aria-pressed={filters.maxDistance === km}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                filters.maxDistance === km
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
              )}
            >
              ≤ {km} km
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold tracking-wide text-forest-500 uppercase">
          Minimum meals
        </legend>
        <div className="grid grid-cols-4 gap-2">
          {['', '20', '40', '80'].map((value) => (
            <button
              key={value || 'any'}
              type="button"
              onClick={() => field('minMeals', value)}
              aria-pressed={filters.minMeals === value}
              className={cn(
                'rounded-lg border px-2 py-1.5 text-xs font-medium transition',
                filters.minMeals === value
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
              )}
            >
              {value || 'Any'}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold tracking-wide text-forest-500 uppercase">Food type</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => field('diet', 'all')}
            aria-pressed={filters.diet === 'all'}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition',
              filters.diet === 'all'
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
            )}
          >
            All
          </button>
          {DIET_TYPES.slice(0, 3).map((diet) => (
            <button
              key={diet}
              type="button"
              onClick={() => field('diet', diet)}
              aria-pressed={filters.diet === diet}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                filters.diet === diet
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
              )}
            >
              {diet}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold tracking-wide text-forest-500 uppercase">Sort by</legend>
        <select
          value={filters.sort}
          onChange={(e) => field('sort', e.target.value)}
          className="input-base py-2"
          aria-label="Sort donations"
        >
          {SORTS.map((sort) => (
            <option key={sort.id} value={sort.id}>
              {sort.label}
            </option>
          ))}
        </select>
      </fieldset>

      {counts ? <CategoryCounts counts={counts} /> : null}
    </div>
  )
}

function CategoryCounts({ counts }) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
  if (!total) return null
  return (
    <div className="rounded-xl border border-forest-100 bg-forest-50/70 p-4">
      <p className="text-xs font-semibold text-forest-700">Matching donations: {total}</p>
      <ul className="mt-2 space-y-1.5">
        {CATEGORIES.filter((category) => counts[category.id]).map((category) => (
          <li key={category.id} className="flex items-center justify-between text-xs text-forest-600">
            <span>{category.label}</span>
            <span className="font-semibold text-forest-800">{counts[category.id]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Search + filter + result grid for donations. Shared by the public listing,
 * the NGO "available food" screen and the admin donation monitor.
 */
export default function DonationExplorer({
  donations,
  loading,
  error,
  onReload,
  onRequest,
  actionLabel,
  origin,
  emptyTitle = 'No donations match your filters',
  emptyDescription = 'Try widening the distance, clearing the search term or checking back later.',
  emptyAction,
  showAvailability = true,
  className,
}) {
  const [filters, setFilters] = useState(defaultFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const debouncedSearch = useDebounced(filters.search, 300)

  const list = useMemo(() => {
    let result = donations ?? []
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase()
      result = result.filter((d) =>
        [d.food_name, d.donor?.name, d.pickup_address, d.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(needle)),
      )
    }
    if (filters.category !== 'all') result = result.filter((d) => d.category === filters.category)
    if (filters.availability === 'posted') result = result.filter((d) => d.status === 'posted')
    if (filters.availability === 'active')
      result = result.filter((d) => ['requested', 'assigned', 'collecting', 'collected', 'delivered'].includes(d.status))
    if (filters.availability === 'completed') result = result.filter((d) => d.status === 'completed')
    if (filters.diet !== 'all') result = result.filter((d) => d.diet === filters.diet)
    if (filters.minMeals) result = result.filter((d) => (d.meals ?? 0) >= Number(filters.minMeals))
    if (filters.maxDistance)
      result = result.filter((d) => d.distance_km !== null && d.distance_km <= Number(filters.maxDistance))
    if (origin && filters.maxDistance === '') {
      result = [...result].sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
    }
    const sorters = {
      deadline: (a, b) => new Date(a.pickup_end) - new Date(b.pickup_end),
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      distance: (a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999),
      meals: (a, b) => (b.meals ?? 0) - (a.meals ?? 0),
    }
    return [...result].sort(sorters[filters.sort] ?? sorters.deadline)
  }, [donations, debouncedSearch, filters, origin])

  const counts = useMemo(() => {
    const base = donations ?? []
    return CATEGORIES.reduce((acc, category) => {
      acc[category.id] = base.filter((d) => d.category === category.id).length
      return acc
    }, {})
  }, [donations])

  useEffect(() => {
    if (!drawerOpen) return undefined
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const activeCount = [
    filters.search,
    filters.category !== 'all' ? filters.category : '',
    filters.availability !== 'all' ? filters.availability : '',
    filters.maxDistance,
    filters.minMeals,
    filters.diet !== 'all' ? filters.diet : '',
  ].filter(Boolean).length

  return (
    <div className={className}>
      <div className="rounded-2xl border border-forest-100 bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-forest-400" aria-hidden="true" />
            <label htmlFor="donation-search" className="sr-only">
              Search donations by food, hotel or location
            </label>
            <input
              id="donation-search"
              type="search"
              value={filters.search}
              onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
              placeholder="Search by food name, hotel or location…"
              className="input-base py-3 pl-10"
            />
          </div>
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open filters"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filters
            {activeCount ? (
              <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            ) : null}
          </Button>
        </div>

        <div className="mt-4">
          <FoodCategory
            active={filters.category}
            onChange={(category) => setFilters((current) => ({ ...current, category }))}
            counts={counts}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-forest-100 bg-white p-5 shadow-soft">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
              counts={counts}
              showAvailability={showAvailability}
            />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-forest-600">
              <span className="font-semibold text-forest-900">{list.length}</span> donation
              {list.length === 1 ? '' : 's'} found
              {origin ? (
                <span className="ml-1 inline-flex items-center gap-1 text-xs text-forest-500">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  sorted by distance from you
                </span>
              ) : null}
            </p>
            {activeCount ? (
              <button
                type="button"
                onClick={() => setFilters(defaultFilters)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear filters
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <DonationCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={onReload} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={ListFilter}
              title={emptyTitle}
              description={emptyDescription}
              action={
                emptyAction ?? (
                  <Button variant="outline" onClick={() => setFilters(defaultFilters)}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reset filters
                  </Button>
                )
              }
            />
          ) : (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((donation, index) => (
                <DonationCard
                  key={donation.id}
                  donation={donation}
                  index={index}
                  onRequest={onRequest}
                  actionLabel={actionLabel}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <Modal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFilters(defaultFilters)}>
              Reset all
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>Show {list.length} results</Button>
          </>
        }
      >
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
          counts={counts}
          showAvailability={showAvailability}
        />
      </Modal>
    </div>
  )
}

export { UtensilsCrossed }
