import { BadgeCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'
import { cn } from '../utils/cn'
import { STATUS_LABEL, STATUS_TONE, VERIFICATION } from '../utils/constants'

const TONES = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/15',
  success: 'bg-success-50 text-success-700 ring-success-500/20',
  warning: 'bg-warning-50 text-warning-700 ring-warning-500/20',
  danger: 'bg-danger-50 text-danger-700 ring-danger-500/20',
  info: 'bg-info-50 text-info-700 ring-info-500/20',
  neutral: 'bg-forest-50 text-forest-600 ring-forest-200',
  amber: 'bg-amber-soft-50 text-amber-soft-700 ring-amber-soft-300/50',
}

export function Badge({ tone = 'neutral', size = 'sm', icon: Icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 whitespace-nowrap',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}

export function StatusBadge({ status, className }) {
  const tone = STATUS_TONE[status] ?? 'neutral'
  return (
    <Badge tone={tone} className={className}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  )
}

/** Verification badge used across public pages and dashboards. */
export function VerifiedBadge({ status, label, className }) {
  const config = {
    verified: {
      icon: BadgeCheck,
      tone: 'success',
      text: label ?? `Verified ${'Partner'}`,
    },
    pending: { icon: ShieldQuestion, tone: 'warning', text: label ?? 'Pending review' },
    rejected: { icon: ShieldAlert, tone: 'danger', text: label ?? 'Not verified' },
  }[status] ?? { icon: ShieldQuestion, tone: 'neutral', text: label ?? VERIFICATION[status]?.label ?? 'Unknown' }

  const Icon = config.icon
  return (
    <Badge tone={config.tone} icon={Icon} className={className}>
      {config.text}
    </Badge>
  )
}

export function DietBadge({ diet }) {
  if (!diet) return null
  const tone = diet === 'Non-Vegetarian' ? 'amber' : 'success'
  return <Badge tone={tone}>{diet}</Badge>
}

export default Badge
