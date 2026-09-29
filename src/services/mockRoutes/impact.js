import { route } from '../mockRouter'
import { impactSummary } from '../../data/mockDonations'
import {
  categoryBreakdown,
  cityBreakdown,
  donorLeaderboard,
  platformMonthly,
  roleBreakdown,
  statusBreakdown,
  volunteerLeaderboard,
} from '../../data/mockAnalytics'
import { CO2_PER_KG } from '../../utils/constants'
import { getDb } from '../db'

route('get', '/impact/summary', ({ db }) => {
  const completed = db.donations.filter((d) => d.status === 'completed')
  const demoMeals = completed.reduce((sum, d) => sum + (d.meals ?? 0), 0)
  const demoKg = completed.reduce((sum, d) => sum + (d.quantity ?? 0), 0)
  const demoPeople = completed.reduce((sum, d) => sum + (d.beneficiaries ?? 0), 0)

  return {
    summary: {
      ...impactSummary,
      demo: { meals: demoMeals, kg: Math.round(demoKg), people: demoPeople },
    },
    monthly: platformMonthly,
    categories: categoryBreakdown,
    cities: cityBreakdown,
    statuses: statusBreakdown,
    donor_leaderboard: donorLeaderboard,
    volunteer_leaderboard: volunteerLeaderboard,
    co2_per_kg: CO2_PER_KG,
  }
})

route('get', '/impact/platform', ({ db }) => {
  const live = db.donations.length
  return { live_donations: live, platform_monthly: platformMonthly }
})

route('get', '/impact/analytics', () => {
  const db = getDb()
  const completed = db.donations.filter((d) => d.status === 'completed')
  return {
    roles: roleBreakdown,
    categories: categoryBreakdown,
    cities: cityBreakdown,
    statuses: statusBreakdown,
    completed_donations: completed.length,
  }
})
