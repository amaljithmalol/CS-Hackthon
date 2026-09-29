import { useEffect, useMemo, useState } from 'react'
import { Download, HandHeart, PlusCircle, Search, Users } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import { Card, EmptyState } from '../components/Card'
import { ChartCard, HorizontalBars } from '../components/DashboardCharts'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { Input, Select } from '../components/Input'
import { Modal } from '../components/Modal'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { getMyRequests } from '../services/donations'
import { ngoNav } from '../utils/dashNav'
import { groupBy, sum } from '../utils/metrics'
import { formatDate } from '../utils/formatDate'
import { exportCsv } from '../utils/share'
import { CITIES } from '../utils/constants'

const CENTRE_TYPES = ['Community kitchen', 'Shelter', 'Food bank', 'School meal programme', 'Temple community', 'Street outreach']
const MEAL_SIZES = ['Regular meal', 'Full meal', 'Family pack', 'Child portion']

/**
 * Beneficiaries are stored locally per NGO: the mock backend has no
 * distribution table, and a real deployment would swap this for a
 * `POST /distributions` endpoint. Keeping it in one module makes that
 * swap a single-file change.
 */
const STORE_KEY = 'beneficiaries'

function loadRecords(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(`foodbridge:${STORE_KEY}`) ?? '{}')
    return all[userId] ?? []
  } catch {
    return []
  }
}

function saveRecords(userId, records) {
  try {
    const all = JSON.parse(localStorage.getItem(`foodbridge:${STORE_KEY}`) ?? '{}')
    all[userId] = records
    localStorage.setItem(`foodbridge:${STORE_KEY}`, JSON.stringify(all))
  } catch {
    /* storage unavailable */
  }
}

export default function NGOBeneficiaries() {
  const toast = useToast()
  const { user } = useAuth()
  const ownerId = user?.id ?? 'guest'
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [adding, setAdding] = useState(false)
  const [records, setRecords] = useState([])

  // Records are per-user, so reload them once the signed-in id is known.
  useEffect(() => {
    setRecords(loadRecords(ownerId))
  }, [ownerId])

  const { data, loading, error, reload } = useAsync(() => getMyRequests(), [])
  const donations = useMemo(
    () => (data?.requests ?? []).map((r) => r.donation).filter((d) => d?.status === 'completed'),
    [data],
  )
  const meals = useMemo(() => sum(donations, (d) => d.beneficiaries || d.meals), [donations])

  const filtered = useMemo(
    () =>
      records
        .filter((r) => (typeFilter === 'all' ? true : r.centre_type === typeFilter))
        .filter((r) =>
          query
            ? [r.centre_name, r.area, r.notes]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(query.toLowerCase()))
            : true,
        ),
    [records, query, typeFilter],
  )

  const totals = useMemo(() => {
    const people = sum(records, (r) => r.people)
    const served = sum(records, (r) => r.meals)
    return {
      centres: new Set(records.map((r) => `${r.centre_name}-${r.area}`)).size,
      people,
      meals: served,
      avg: records.length ? Math.round(served / records.length) : 0,
    }
  }, [records])

  const byArea = useMemo(
    () =>
      Object.entries(groupBy(records, 'area'))
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    [records],
  )

  const handleSave = (record) => {
    const next = [{ id: `b-${Date.now()}`, created_at: new Date().toISOString(), ...record }, ...records]
    setRecords(next)
    saveRecords(ownerId, next)
    setAdding(false)
    toast.success('Distribution recorded. Your impact totals have been updated.')
  }

  const handleDelete = (id) => {
    const next = records.filter((r) => r.id !== id)
    setRecords(next)
    saveRecords(ownerId, next)
    toast.info('Distribution record removed.')
  }

  const handleExport = () => {
    if (!records.length) {
      toast.warning('Record a distribution before exporting.')
      return
    }
    exportCsv(
      'foodbridge-distributions.csv',
      records.map((r) => ({
        date: r.date,
        centre: r.centre_name,
        type: r.centre_type,
        area: r.area,
        people: r.people,
        meals: r.meals,
        meal_size: r.meal_size,
        notes: r.notes,
      })),
    )
    toast.success('Distribution records downloaded.')
  }

  return (
    <DashboardLayout
      title="Beneficiaries"
      subtitle={`${totals.centres} centres · ${totals.people} people reached`}
      nav={ngoNav}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" onClick={() => setAdding(true)}>
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Record</span>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="People reached" value={totals.people.toLocaleString('en-IN')} icon={HandHeart} tone="brand" hint="From distribution records" />
        <StatCard index={1} label="Meals distributed" value={totals.meals.toLocaleString('en-IN')} icon={Users} tone="success" hint={`Average ${totals.avg} per record`} />
        <StatCard index={2} label="Service centres" value={totals.centres} icon={Users} tone="info" hint="Unique centre + area pairs" />
        <StatCard
          index={3}
          label="Meals from donations"
          value={meals.toLocaleString('en-IN')}
          icon={HandHeart}
          tone="amber"
          hint="Confirmed by partner hotels"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Distribution records</h2>
              <p className="mt-0.5 text-sm text-forest-500">Log each handover so your impact stays accurate.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-forest-400" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search centres"
                  aria-label="Search centres"
                  className="input-base pl-9"
                />
              </div>
              <div className="w-40">
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by centre type">
                  <option value="all">All types</option>
                  {CENTRE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <Skeleton className="mt-4 h-40 w-full rounded-xl" />
          ) : error ? (
            <ErrorState className="mt-4" message={error} onRetry={reload} />
          ) : filtered.length === 0 ? (
            <EmptyState
              className="mt-2"
              icon={HandHeart}
              title={records.length ? 'No records match your filters' : 'No distributions recorded yet'}
              description={
                records.length
                  ? 'Try a different centre name or centre type.'
                  : 'Record each time you distribute food so your meals and people reached totals stay accurate.'
              }
              action={
                records.length ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('')
                      setTypeFilter('all')
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => setAdding(true)}>
                    <PlusCircle className="h-4 w-4" aria-hidden="true" />
                    Record a distribution
                  </Button>
                )
              }
            />
          ) : (
            <ul className="mt-4 divide-y divide-forest-100">
              {filtered.map((record) => (
                <li key={record.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <HandHeart className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest-900">{record.centre_name}</p>
                    <p className="truncate text-xs text-forest-500">
                      {record.centre_type} · {record.area} · {formatDate(record.date)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone="brand">{record.people} people</Badge>
                    <Badge tone="neutral">{record.meals} meals</Badge>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(record.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <ChartCard title="Distributions by area" description="Where your food reaches people">
          {byArea.length ? <HorizontalBars data={byArea} /> : <p className="py-16 text-center text-sm text-forest-500">No data yet.</p>}
        </ChartCard>
      </div>

      <RecordModal open={adding} onClose={() => setAdding(false)} onSave={handleSave} />
    </DashboardLayout>
  )
}

function RecordModal({ open, onClose, onSave }) {
  const [values, setValues] = useState({
    centre_name: '',
    centre_type: CENTRE_TYPES[0],
    area: CITIES[0],
    people: '',
    meals: '',
    meal_size: MEAL_SIZES[0],
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const set = (key) => (event) => setValues((v) => ({ ...v, [key]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const next = {
      centre_name: values.centre_name.trim() ? null : 'Please enter the centre name.',
      people: Number(values.people) > 0 ? null : 'Enter how many people were reached.',
      meals: Number(values.meals) > 0 ? null : 'Enter how many meals were distributed.',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    onSave({
      ...values,
      people: Number(values.people),
      meals: Number(values.meals),
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record a distribution"
      description="Log food handed out so your impact report stays accurate."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button as="button" form="beneficiary-form" type="submit">
            Save record
          </Button>
        </>
      }
    >
      <form id="beneficiary-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Centre or group name"
          name="centre_name"
          required
          className="sm:col-span-2"
          value={values.centre_name}
          onChange={set('centre_name')}
          error={errors.centre_name}
          placeholder="e.g. Beypore community kitchen"
        />
        <Select label="Centre type" name="centre_type" value={values.centre_type} onChange={set('centre_type')}>
          {CENTRE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <Select label="Area" name="area" value={values.area} onChange={set('area')}>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
        <Input
          label="People reached"
          name="people"
          type="number"
          min="0"
          required
          value={values.people}
          onChange={set('people')}
          error={errors.people}
        />
        <Input
          label="Meals distributed"
          name="meals"
          type="number"
          min="0"
          required
          value={values.meals}
          onChange={set('meals')}
          error={errors.meals}
        />
        <Select label="Meal size" name="meal_size" value={values.meal_size} onChange={set('meal_size')}>
          {MEAL_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
        <Input label="Date" name="date" type="date" value={values.date} onChange={set('date')} />
        <Input
          label="Notes"
          name="notes"
          className="sm:col-span-2"
          value={values.notes}
          onChange={set('notes')}
          placeholder="Optional — anything useful for your next distribution"
        />
      </form>
    </Modal>
  )
}
