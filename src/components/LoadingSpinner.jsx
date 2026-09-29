import { Loader2 } from 'lucide-react'
import { cn } from '../utils/cn'

export function LoadingSpinner({ size = 'md', label = 'Loading', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' }
  return (
    <span className={cn('inline-flex items-center gap-2 text-forest-500', className)} role="status">
      <Loader2 className={cn('animate-spin', sizes[size] ?? sizes.md)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function LoadingBlock({ label = 'Loading content…', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-forest-500', className)}>
      <LoadingSpinner size="lg" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />
}

export function DonationCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 flex-1" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 border-b border-forest-50 py-3">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn('h-4', colIndex === 0 ? 'w-1/4' : colIndex === columns - 1 ? 'w-16' : 'flex-1')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner
