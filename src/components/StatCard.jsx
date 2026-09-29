import { motion } from 'framer-motion'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '../utils/cn'

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  amber: 'bg-amber-soft-50 text-amber-soft-600',
  info: 'bg-info-50 text-info-500',
  danger: 'bg-danger-50 text-danger-500',
  neutral: 'bg-forest-50 text-forest-600',
  success: 'bg-success-50 text-success-500',
}

export default function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'brand',
  trend,
  trendLabel,
  hint,
  onClick,
  index = 0,
  className,
}) {
  const TrendIcon = trend === 'down' ? TrendingDown : TrendingUp
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
    >
      <Wrapper
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={cn(
          'group flex w-full flex-col gap-3 rounded-2xl border border-forest-100 bg-white p-5 text-left shadow-soft',
          onClick && 'cursor-pointer transition duration-300 hover:-translate-y-1 hover:shadow-lift',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-forest-600">{label}</p>
          {Icon ? (
            <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', TONES[tone] ?? TONES.brand)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-forest-900 sm:text-3xl">{value}</span>
          {unit ? <span className="text-sm font-medium text-forest-500">{unit}</span> : null}
        </div>
        {trend !== undefined && trend !== null ? (
          <p
            className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold',
              trend === 'down' ? 'text-danger-500' : 'text-success-500',
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {trendLabel ?? `${Math.abs(trend)}% vs last month`}
          </p>
        ) : hint ? (
          <p className="text-xs text-forest-500">{hint}</p>
        ) : null}
        {onClick ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100">
            View details <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </Wrapper>
    </motion.div>
  )
}
