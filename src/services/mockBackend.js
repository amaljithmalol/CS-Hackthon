import { ApiError } from './api'
import { match } from './mockRouter'
import { getDb, publicUser } from './db'
import './mockRoutes/auth'
import './mockRoutes/users'
import './mockRoutes/donations'
import './mockRoutes/notifications'
import './mockRoutes/messages'
import './mockRoutes/impact'
import './mockRoutes/reports'
import './mockRoutes/contact'

function resolveSession(token) {
  if (!token) return null
  const db = getDb()
  return db.users.find((u) => u.id === token) ?? null
}

/**
 * Entry point for every `request()` call while VITE_API_MODE=mock.
 * Mirrors the shape of a REST backend so the UI never changes when you swap modes.
 */
export function handleMockRequest({ method = 'get', url, params, data, auth = false }) {
  const [path, search] = String(url).split('?')
  const query = { ...(params ?? {}) }
  if (search) {
    new URLSearchParams(search).forEach((value, key) => {
      query[key] = value
    })
  }

  const found = match(method, path)
  if (!found) {
    throw new ApiError(`No mock endpoint for ${method.toUpperCase()} ${path}`, 404, 'not_found')
  }

  const token = localStorage.getItem('foodbridge:token')
  const session = resolveSession(token)

  if (auth && !session) {
    throw new ApiError('Your session has expired. Please sign in again.', 401, 'unauthorized')
  }

  return found.handler({ params: found.params, query, body: data ?? {}, session, db: getDb() })
}

export { publicUser }
