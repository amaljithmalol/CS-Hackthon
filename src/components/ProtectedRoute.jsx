import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import Button from './Button'
import { useAuth } from '../context/AuthContext'
import { LoadingBlock } from './LoadingSpinner'
import { roleHome } from '../utils/dashNav'

/**
 * Route guard.
 * - no session  -> redirect to /login (remembering where the user wanted to go)
 * - wrong role  -> redirect to that user's own dashboard
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <LoadingBlock label="Checking your session…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  if (roles && roles.length && !roles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] ?? '/'} replace />
  }

  return children
}

export function AccessDenied({ message = 'You do not have access to this page.' }) {
  return (
    <div className="container-page py-20">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-50 text-warning-700">
          <ShieldAlert className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold">Restricted area</h1>
        <p className="mt-2 text-sm text-forest-600">{message}</p>
        <Button to="/dashboard" className="mt-6">
          Go to my dashboard
        </Button>
      </div>
    </div>
  )
}
