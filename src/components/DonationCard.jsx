import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, MapPin, Package, UtensilsCrossed } from 'lucide-react'
import Badge, { DietBadge, StatusBadge, VerifiedBadge } from './Badge'
import Button from './Button'
import { cn } from '../utils/cn'
import { formatDistance } from '../utils/geo'
import { timeAgo, timeRemaining } from '../utils/formatDate'
import { getCategory } from '../utils/constants'

export default function DonationCard({ donation, onRequest, onAssign, actionLabel, index = 0, className }) {
  if (!donation) return null
  const category = getCategory(donation.category)
  const deadline = timeRemaining(donation.pickup_end ?? donation.consume_before)
  const isOwnerView = Boolean(donation.donor)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4) }}
      className={cn(
        'card card-hover group flex h-full flex-col overflow-hidden',
        donation.status === 'completed' && 'opacity-95',
        className,
      )}
    >
      <Link
        to={`/donations/${donation.id}`}
        className="relative block aspect-[16/10] overflow-hidden bg-forest-50"
        aria-label={`View ${donation.food_name}`}
      >
        <img
          src={donation.image || category.image}
          alt={`${donation.food_name} donation illustration`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <StatusBadge status={donation.status} />
        </div>
        <div className="absolute right-3 bottom-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-forest-800 shadow-soft">
            <UtensilsCrossed className="h-3 w-3 text-brand-600" aria-hidden="true" />
            {category.label}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-forest-900">
              <Link to={`/donations/${donation.id}`} className="hover:text-brand-700">
                {donation.food_name}
              </Link>
            </h3>
            <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-forest-500">
              <span className="truncate">{donation.donor?.name ?? 'Community donor'}</span>
              {donation.donor?.verified ? (
                <VerifiedBadge status="verified" label="Verified" className="shrink-0" />
              ) : null}
            </p>
          </div>
          <DietBadge diet={donation.diet} />
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-forest-600">{donation.description}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-forest-50 px-3 py-2">
            <dt className="flex items-center gap-1 text-[11px] font-medium text-forest-500">
              <UtensilsCrossed className="h-3 w-3" aria-hidden="true" />
              Meals
            </dt>
            <dd className="font-semibold text-forest-900">{donation.meals} meals</dd>
          </div>
          <div className="rounded-lg bg-forest-50 px-3 py-2">
            <dt className="flex items-center gap-1 text-[11px] font-medium text-forest-500">
              <Package className="h-3 w-3" aria-hidden="true" />
              Quantity
            </dt>
            <dd className="font-semibold text-forest-900">
              {donation.quantity} {donation.unit}
            </dd>
          </div>
        </dl>

        <ul className="mt-4 space-y-1.5 text-xs text-forest-600">
          <li className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-forest-400" aria-hidden="true" />
            <span className="truncate">
              {donation.pickup_address}
              {donation.distance_km !== null && donation.distance_km !== undefined ? (
                <span className="ml-1 font-semibold text-brand-700">· {formatDistance(donation.distance_km)}</span>
              ) : null}
            </span>
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-forest-400" aria-hidden="true" />
            <span className={cn(deadline.expired && donation.status !== 'completed' && 'font-semibold text-danger-600')}>
              {deadline.expired ? deadline.label : `Pickup before ${deadline.label.replace('Closes in ', '')}`}
            </span>
            <span className="ml-auto shrink-0 text-forest-400">{timeAgo(donation.created_at)}</span>
          </li>
        </ul>

        <div className="mt-5 flex flex-wrap gap-2">
          {isOwnerView && donation.status === 'posted' ? (
            <Badge tone="warning" className="self-center">
              Awaiting response
            </Badge>
          ) : null}
          {donation.requester ? (
            <span className="self-center text-xs text-forest-500">
              Claimed by <span className="font-semibold text-forest-800">{donation.requester.name}</span>
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2 pt-1">
          {onRequest && donation.status === 'posted' ? (
            <Button size="sm" className="flex-1" onClick={() => onRequest(donation)}>
              {actionLabel ?? 'Request Donation'}
            </Button>
          ) : null}
          {onAssign && ['requested', 'assigned'].includes(donation.status) ? (
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onAssign(donation)}>
              Assign volunteer
            </Button>
          ) : null}
          <Button size="sm" variant="subtle" className="flex-1" to={`/donations/${donation.id}`}>
            View details
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
