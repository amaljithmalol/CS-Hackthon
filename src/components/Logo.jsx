import { Link } from 'react-router-dom'
import { cn } from '../utils/cn'
import { APP } from '../utils/constants'

/** FoodBridge mark: a plate, a leaf and a community arc. */
export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={`${APP.name} logo`}>
      <defs>
        <linearGradient id="fb-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1faa5f" />
          <stop offset="1" stopColor="#0f6d3f" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#fb-logo-bg)" />
      <circle cx="24" cy="26" r="13" fill="#ffffff" opacity="0.18" />
      <path
        d="M24 9c0 6.6-6.4 8.4-6.4 14.6a6.4 6.4 0 0 0 12.8 0C30.4 17.4 24 15.6 24 9z"
        fill="#d2f8e0"
      />
      <path d="M24 16.6c-2.3 2.4-2.3 7 0 9.4 2.3-2.4 2.3-7 0-9.4z" fill="#0f472f" />
      <path
        d="M11 31.5c1.6-2.6 4-2.6 5.6 0 1.6-2.6 4-2.6 5.6 0 1.6-2.6 4-2.6 5.6 0 1.6-2.6 4-2.6 5.6 0"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default function Logo({ className, showTagline = false, to = '/' }) {
  return (
    <Link
      to={to}
      className={cn('group flex items-center gap-2.5 rounded-lg', className)}
      aria-label={`${APP.name} — go to home`}
    >
      <LogoMark className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:rotate-[-6deg]" />
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-forest-900">
          Food<span className="text-brand-600">Bridge</span>
        </span>
        {showTagline ? (
          <span className="mt-1 text-[11px] font-medium text-forest-500">{APP.tagline}</span>
        ) : null}
      </span>
    </Link>
  )
}
