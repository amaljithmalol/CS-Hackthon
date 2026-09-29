import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../utils/cn'

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-soft hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'bg-forest-900 text-white shadow-soft hover:bg-forest-800 active:bg-forest-950 disabled:bg-forest-300',
  accent:
    'bg-amber-soft-500 text-white shadow-soft hover:bg-amber-soft-600 active:bg-amber-soft-700 disabled:bg-amber-soft-200',
  outline:
    'border border-brand-300 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50 disabled:text-forest-300',
  ghost: 'text-forest-700 hover:bg-forest-50 hover:text-forest-900 disabled:text-forest-300',
  subtle: 'bg-forest-50 text-forest-800 hover:bg-forest-100 disabled:text-forest-300',
  danger: 'bg-danger-500 text-white hover:bg-danger-700 disabled:bg-danger-500/40',
  white: 'bg-white text-brand-700 shadow-soft hover:bg-brand-50',
}

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  icon: 'h-10 w-10 justify-center',
}

const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-xl font-semibold transition duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
    'active:scale-[0.985]',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  )

  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }
  const Component = as ?? 'button'
  return (
    <Component
      ref={ref}
      type={as && as !== 'button' ? undefined : type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {content}
    </Component>
  )
})

export default Button
