import { cn } from '../utils/cn'

const PALETTE = [
  'bg-brand-100 text-brand-800',
  'bg-amber-soft-100 text-amber-soft-700',
  'bg-info-50 text-info-700',
  'bg-forest-100 text-forest-700',
  'bg-warning-50 text-warning-700',
  'bg-danger-50 text-danger-700',
]

export function initials(name = '') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function colorFor(name) {
  const score = String(name)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return PALETTE[score % PALETTE.length]
}

export default function Avatar({ name, src, size = 'md', className, status }) {
  const sizes = {
    xs: 'h-7 w-7 text-[10px]',
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  }
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center overflow-hidden rounded-full font-semibold ring-2 ring-white',
          sizes[size] ?? sizes.md,
          src ? 'bg-forest-100' : colorFor(name),
        )}
        aria-hidden={Boolean(src)}
      >
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          initials(name)
        )}
      </span>
      {status ? (
        <span
          className={cn(
            'absolute right-0 bottom-0 h-3 w-3 rounded-full ring-2 ring-white',
            status === 'online' ? 'bg-success-500' : 'bg-forest-300',
          )}
          title={status === 'online' ? 'Online' : 'Offline'}
        />
      ) : null}
      <span className="sr-only">{name}</span>
    </span>
  )
}
