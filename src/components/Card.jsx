import { cn } from '../utils/cn'

export function Card({ as: Component = 'div', className, hover = false, children, ...props }) {
  return (
    <Component className={cn('card', hover && 'card-hover', className)} {...props}>
      {children}
    </Component>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-5 pb-0', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('flex items-center gap-3 border-t border-forest-100 px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function SectionHeading({ eyebrow, title, description, action, align = 'center', className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className={cn('space-y-3', align === 'center' && 'flex flex-col items-center')}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
        {description ? (
          <p className="text-base leading-relaxed text-forest-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-forest-200 bg-white/60 px-6 py-14 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-forest-600">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export function Divider({ className, label }) {
  if (!label) return <hr className={cn('border-forest-100', className)} />
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="h-px flex-1 bg-forest-100" />
      <span className="text-xs font-medium text-forest-400">{label}</span>
      <span className="h-px flex-1 bg-forest-100" />
    </div>
  )
}

export default Card
