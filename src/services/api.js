import axios from 'axios'

/**
 * Single transport layer for the whole app.
 *
 * - `mock` mode (default): requests are resolved in-browser by the mock backend
 *   (services/mockBackend.js) which persists to localStorage.
 * - `live` mode: the exact same request shapes are sent to a REST API using
 *   Axios. To go live, set VITE_API_MODE=live and VITE_API_URL in .env and
 *   implement the endpoints on your Express / Supabase / Firebase backend.
 *
 * UI components never call Axios directly — they call the domain services
 * (services/donations.js, services/users.js, ...) which call `request()` here.
 */

export const isMockMode = (import.meta.env.VITE_API_MODE ?? 'mock') !== 'live'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodbridge:token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ??
      (error?.code === 'ECONNABORTED'
        ? 'The request took too long. Please try again.'
        : 'Something went wrong. Please try again.')
    return Promise.reject(new Error(message))
  },
)

const SIMULATED_LATENCY = [140, 420]

function simulateLatency() {
  const [min, max] = SIMULATED_LATENCY
  const ms = min + Math.random() * (max - min)
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export class ApiError extends Error {
  constructor(message, status = 400, code = 'bad_request') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/**
 * @param {{method?: string, url: string, params?: object, data?: object, auth?: boolean}} config
 * @returns {Promise<any>}
 */
export async function request({ method = 'get', url, params, data, auth = false } = {}) {
  if (isMockMode) {
    const { handleMockRequest } = await import('./mockBackend')
    await simulateLatency()
    return handleMockRequest({ method, url, params, data, auth })
  }

  try {
    const response = await http.request({ method, url, params, data })
    return response.data
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(error.message || 'Something went wrong. Please try again.', error.status ?? 500)
  }
}

export const get = (url, params, options) => request({ method: 'get', url, params, ...options })
export const post = (url, data, options) => request({ method: 'post', url, data, ...options })
export const patch = (url, data, options) => request({ method: 'patch', url, data, ...options })
export const del = (url, options) => request({ method: 'delete', url, ...options })
