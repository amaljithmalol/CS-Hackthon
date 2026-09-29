import { motion } from 'framer-motion'
import { Check, CircleDot, Clock } from 'lucide-react'
import { cn } from '../utils/cn'
import { DONATION_STATUSES, STATUS_INDEX, STATUS_LABEL } from '../utils/constants'
import { formatDateTime } from '../utils/formatDate'

const TIMESTAMP_FIELD = {
  posted: 'created_at',
  requested: 'requested_at',
  assigned: 'assigned_at',
  collecting: 'collecting_at',
  collected: 'collected_at',
  delivered: 'delivered_at',
  completed: 'completed_at',
}

function StepIcon({ state, index }) {
  if (state === 'done') {
    return (
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22, delay: index * 0.05 }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-soft"
      >
        <Check className="h-4 w-4" aria-hidden="true" />
      </motion.span>
    )
  }
  if (state === 'current') {
    return (
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-amber-soft-500 text-white shadow-soft"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-amber-soft-400/60" aria-hidden="true" />
        <CircleDot className="relative h-4 w-4" aria-hidden="true" />
      </motion.span>
    )
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-forest-200 bg-white text-forest-300">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
    </span>
  )
}

export default function StatusTimeline({ status, donation, orientation = 'vertical', className }) {
  const currentIndex = STATUS_INDEX[status] ?? 0
  const progress = (currentIndex / (DONATION_STATUSES.length - 1)) * 100

  if (orientation === 'horizontal') {
    return (
      <div className={cn('w-full', className)}>
        <div className="relative">
          <div className="absolute top-4 right-0 left-0 h-1 rounded-full bg-forest-100" aria-hidden="true" />
          <motion.div
            className="absolute top-4 left-0 h-1 rounded-full bg-brand-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            aria-hidden="true"
          />
          <ol className="relative flex justify-between">
            {DONATION_STATUSES.map((step, index) => {
              const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
              return (
                <li key={step.id} className="flex w-16 flex-col items-center gap-2 text-center sm:w-24">
                  <StepIcon state={state} index={index} />
                  <span
                    className={cn(
                      'text-[11px] leading-tight font-medium sm:text-xs',
                      state === 'upcoming' ? 'text-forest-400' : 'text-forest-800',
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    )
  }

  return (
    <ol className={cn('relative space-y-0', className)}>
      {DONATION_STATUSES.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
        const timestamp = donation?.[TIMESTAMP_FIELD[step.id]]
        const isLast = index === DONATION_STATUSES.length - 1
        return (
          <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span className="absolute top-9 left-4 h-[calc(100%-1.5rem)] w-0.5" aria-hidden="true">
                {index < currentIndex ? (
                  <motion.span
                    className="block w-full rounded-full bg-brand-500"
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 0.6, delay: index * 0.08 }}
                  />
                ) : (
                  <span className="block h-full w-full rounded-full bg-forest-100" />
                )}
              </span>
            ) : null}
            <StepIcon state={state} index={index} />
            <div className="min-w-0 flex-1 pt-1">
              <p
                className={cn(
                  'text-sm font-semibold',
                  state === 'upcoming' ? 'text-forest-400' : 'text-forest-900',
                )}
              >
                {step.label}
                {state === 'current' ? (
                  <span className="ml-2 rounded-full bg-amber-soft-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-soft-700 uppercase">
                    Current
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-forest-500">
                {timestamp ? formatDateTime(timestamp) : step.hint}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export { STATUS_LABEL }
