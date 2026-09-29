import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { HeartHandshake, Info, Sparkles } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import DonationExplorer from '../components/DonationExplorer'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/Modal'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { useDonationRequest, requestSummary } from '../hooks/useDonationRequest'
import { getDonations } from '../services/donations'
import { ngoNav } from '../utils/dashNav'
import { donationMetrics } from '../utils/metrics'
import { EMPTY_LIST } from '../utils/constants'

export default function NGOAvailableFood() {
  const { user } = useAuth()

  const origin = useMemo(
    () => (user?.latitude && user?.longitude ? { lat: user.latitude, lng: user.longitude } : undefined),
    [user],
  )

  const { data, loading, error, reload } = useAsync(
    () =>
      getDonations({
        availability: 'posted',
        sort: 'deadline',
        ...(origin ? { lat: origin.lat, lng: origin.lng } : {}),
      }),
    [user?.id],
  )

  const donations = data?.donations ?? EMPTY_LIST
  const totals = useMemo(() => donationMetrics(donations), [donations])

  const { pending, loading: requesting, openRequest, cancelRequest, confirmRequest } = useDonationRequest({
    onSuccess: reload,
  })

  return (
    <DashboardLayout
      title="Available food"
      subtitle={`${donations.length} open donations · ${totals.meals.toLocaleString('en-IN')} meals listed`}
      nav={ngoNav}
      actions={
        <span className="hidden items-center gap-1.5 text-xs text-forest-500 sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5 text-amber-soft-500" aria-hidden="true" />
          Sorted by pickup deadline
        </span>
      }
    >
      <DonationExplorer
        donations={donations}
        loading={loading}
        error={error}
        onReload={reload}
        onRequest={openRequest}
        origin={origin}
        actionLabel="Request this donation"
        emptyTitle="No open donations right now"
        emptyDescription="New surplus food is posted throughout the day. Check back soon or widen your distance filter."
        emptyAction={
          <button
            type="button"
            onClick={reload}
            className="rounded-xl border border-brand-300 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Refresh list
          </button>
        }
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={cancelRequest}
        onConfirm={confirmRequest}
        loading={requesting}
        title="Request this donation?"
        confirmLabel="Send request"
        message={
          pending
            ? `${requestSummary(pending).meals} meals · pickup ${requestSummary(pending).pickup}. The hotel will be notified and your organisation reserves this donation.`
            : ''
        }
      />

      <Card className="mt-6 p-5">
        <div className="flex items-start gap-3">
          <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-forest-600">
            Requesting a donation reserves it for your organisation. Assign a volunteer from{' '}
            <Link to="/ngo/collections" className="font-semibold text-brand-700 underline">
              Active Collections
            </Link>{' '}
            so the pickup runs smoothly. Only verified NGOs can see and request these listings.
            <span className="mt-2 flex items-start gap-2 text-xs text-forest-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Distances are measured from your registered address ({user?.area ?? 'Kozhikode'}).
            </span>
          </p>
        </div>
      </Card>
    </DashboardLayout>
  )
}
