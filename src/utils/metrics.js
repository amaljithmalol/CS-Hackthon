import { CO2_PER_KG, MEALS_PER_KG } from './constants'

/**
 * Shared impact math for the role dashboards. Every number below is derived
 * from the donation rows the API returns, so a dashboard and the public
 * impact page can never disagree.
 */

export const sum = (list, pick) => list.reduce((total, item) => total + (Number(pick(item)) || 0), 0)

export function donationMetrics(donations = []) {
  const completed = donations.filter((d) => d.status === 'completed')
  const active = donations.filter((d) => d.status !== 'completed' && d.status !== 'cancelled' && d.status !== 'expired')
  const pending = donations.filter((d) => d.status === 'posted')
  const collected = donations.filter((d) => ['collected', 'delivered', 'completed'].includes(d.status))

  const meals = sum(completed, (d) => d.meals)
  const kg = sum(completed, (d) => d.quantity)
  const beneficiaries = sum(completed, (d) => d.beneficiaries) || meals

  return {
    total: donations.length,
    active: active.length,
    pending: pending.length,
    collected: collected.length,
    completed: completed.length,
    meals,
    kg: Math.round(kg),
    beneficiaries,
    co2: Math.round(kg * CO2_PER_KG),
    estMeals: Math.round(kg * MEALS_PER_KG),
  }
}

/** Groups donations into rolling calendar months keyed by `YYYY-MM`. */
export function monthlySeries(donations = [], months = 6, { onlyCompleted = false } = {}) {
  const rows = onlyCompleted ? donations.filter((d) => d.status === 'completed') : donations
  const buckets = []

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - offset)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    buckets.push({
      key,
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      label: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      meals: 0,
      kg: 0,
      count: 0,
    })
  }

  const index = new Map(buckets.map((bucket) => [bucket.key, bucket]))
  rows.forEach((donation) => {
    const date = new Date(donation.completed_at ?? donation.pickup_end ?? donation.created_at)
    const bucket = index.get(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    if (!bucket) return
    bucket.count += 1
    bucket.meals += Number(donation.meals) || 0
    bucket.kg += Number(donation.quantity) || 0
  })

  return buckets.map((bucket) => ({ ...bucket, kg: Math.round(bucket.kg) }))
}

export function groupBy(list = [], key) {
  return list.reduce((acc, item) => {
    const value = typeof key === 'function' ? key(item) : item[key]
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
}

export function countBy(list = [], pick, labelFn = (v) => v) {
  const counts = groupBy(list, pick)
  return Object.entries(counts)
    .map(([name, value]) => ({ name: labelFn(name), value }))
    .sort((a, b) => b.value - a.value)
}
