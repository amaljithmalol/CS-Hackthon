import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, HeartHandshake, MapPin, Sparkles, Truck, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import DonationExplorer from '../components/DonationExplorer'
import { ConfirmDialog } from '../components/Modal'
import Button from '../components/Button'
import Reveal from '../components/Reveal'
import { useAsync } from '../hooks/useAsync'
import { useDonationRequest, requestSummary } from '../hooks/useDonationRequest'
import { getDonations } from '../services/donations'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/formatDate'

const BENEFITS = [
  {
    icon: HeartHandshake,
    title: 'For NGOs',
    body: 'Request safe surplus food near your centre, assign a volunteer and record how many people were served.',
    to: '/register?role=ngo',
  },
  {
    icon: Truck,
    title: 'For volunteers',
    body: 'See pickups within a few kilometres, follow the exact address and confirm collection in one tap.',
    to: '/register?role=volunteer',
  },
  {
    icon: UtensilsCrossed,
    title: 'For hotels',
    body: 'Post surplus food in under a minute and follow it all the way to the community it reached.',
    to: '/register?role=hotel',
  },
]

export default function Donations() {
  const { user } = useAuth()
  const origin = useMemo(
    () => (user ? { lat: user.latitude, lng: user.longitude } : null),
    [user],
  )

  const { data, loading, error, reload } = useAsync(() => getDonations({ sort: 'deadline' }), [])

  const request = useDonationRequest({ onSuccess: reload })

  return (
    <div>
      <PageHeader
        eyebrow="Live listings"
        title="Available food donations"
        description="Safe surplus food posted by verified hotels, restaurants and stores. Request a donation to arrange collection."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Donations' }]}
        action={
          <>
            <Button to="/map" variant="outline">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              View on map
            </Button>
            {user?.role === 'hotel' ? (
              <Button to="/hotel/create-donation">Post surplus food</Button>
            ) : (
              <Button to="/register?role=ngo">Join as an NGO</Button>
            )}
          </>
        }
      />

      <div className="container-page py-8 sm:py-10">
        <DonationExplorer
          donations={data?.donations}
          loading={loading}
          error={error}
          onReload={reload}
          onRequest={request.openRequest}
          origin={origin}
        />
      </div>

      <section className="border-t border-forest-100 bg-white py-14">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Join the network
            </p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Pick up where you fit best</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                >
                  <div className="card card-hover h-full p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-forest-600">{benefit.body}</p>
                    <Link
                      to={benefit.to}
                      className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Get started →
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <ConfirmRequestDialog request={request} />
    </div>
  )
}

export function ConfirmRequestDialog({ request }) {
  const summary = request.pending ? requestSummary(request.pending) : null
  return (
    <ConfirmDialog
      open={Boolean(request.pending)}
      onClose={request.cancelRequest}
      onConfirm={request.confirmRequest}
      loading={request.loading}
      title="Send donation request?"
      confirmLabel="Send request"
      message={
        request.pending ? (
          <div className="space-y-3">
            <p>
              You are requesting <strong className="text-forest-900">{request.pending.meals} meals</strong> of{' '}
              <strong className="text-forest-900">{request.pending.food_name}</strong> from{' '}
              {request.pending.donor?.name}.
            </p>
            <dl className="grid grid-cols-2 gap-2 rounded-xl bg-forest-50 p-3 text-xs">
              <div>
                <dt className="text-forest-500">Quantity</dt>
                <dd className="font-semibold text-forest-800">{summary?.quantity}</dd>
              </div>
              <div>
                <dt className="text-forest-500">Pickup from</dt>
                <dd className="font-semibold text-forest-800">{formatDateTime(request.pending.pickup_start)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-forest-500">Pickup address</dt>
                <dd className="font-semibold text-forest-800">{request.pending.pickup_address}</dd>
              </div>
            </dl>
            <p className="flex items-start gap-2 text-xs text-forest-500">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
              The hotel will be notified immediately and can assign a volunteer for collection.
            </p>
          </div>
        ) : null
      }
    />
  )
}
