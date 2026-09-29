import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ message, onRetry, title = 'Something went wrong', className }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-danger-500/20 bg-danger-50 px-6 py-12 text-center ${className ?? ''}`}
      role="alert"
    >
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-danger-500 shadow-soft">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold text-danger-700">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-danger-700/80">
        {message ?? 'Something went wrong. Please try again.'}
      </p>
      {onRetry ? (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
