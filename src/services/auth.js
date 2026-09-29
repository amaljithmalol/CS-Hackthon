import { get, post, patch } from './api'
import { readStore, removeStore, writeStore } from '../utils/storage'

const SESSION_KEY = 'session'

/** Only non-sensitive fields are persisted client-side (never a password). */
export function readSession() {
  return readStore(SESSION_KEY, null)
}

export function writeSession(session) {
  return writeStore(SESSION_KEY, session)
}

export function clearSession() {
  removeStore(SESSION_KEY)
  removeStore('token')
}

export function readToken() {
  return localStorage.getItem('foodbridge:token')
}

export function writeToken(token) {
  localStorage.setItem('foodbridge:token', token)
}

export async function login({ email, password, role }) {
  const { user, token } = await post('/auth/login', { email, password, role }, { auth: false })
  writeToken(token)
  const session = writeSession(user)
  return session
}

export async function register(payload) {
  const { user } = await post('/auth/register', payload)
  return user
}

export async function logout() {
  try {
    await post('/auth/logout')
  } catch {
    /* signing out locally is enough */
  }
  clearSession()
}

export async function fetchCurrentUser() {
  const { user } = await get('/auth/me', undefined, { auth: true })
  return user
}

export async function updateProfile(payload) {
  const { user } = await patch('/auth/me', payload, { auth: true })
  writeSession(user)
  return user
}

export async function changePassword(payload) {
  return post('/auth/change-password', payload, { auth: true })
}

export function homeRouteForRole(role) {
  switch (role) {
    case 'hotel':
      return '/hotel/dashboard'
    case 'ngo':
      return '/ngo/dashboard'
    case 'volunteer':
      return '/volunteer/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/'
  }
}
