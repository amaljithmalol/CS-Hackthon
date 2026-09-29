import { readStore, writeStore } from '../utils/storage'
import { getUsers, organizations as seedOrganizations } from '../data/mockUsers'
import { mockDonations } from '../data/mockDonations'
import { mockConversations } from '../data/mockMessages'
import { mockNotifications, mockReports } from '../data/mockNotifications'

const DB_KEY = 'db'

function buildRequests(donations) {
  return donations
    .filter((d) => d.ngo_id)
    .map((d, i) => ({
      id: `req-${1000 + i}`,
      donation_id: d.id,
      requester_id: d.ngo_id,
      requester_name: d.requester_name,
      status: d.status === 'completed' || d.status === 'delivered' ? 'fulfilled' : 'accepted',
      meals_expected: d.meals,
      created_at: d.requested_at ?? d.created_at,
    }))
}

function buildPickups(donations) {
  return donations
    .filter((d) => d.volunteer_id)
    .map((d, i) => ({
      id: `pick-${1000 + i}`,
      donation_id: d.id,
      volunteer_id: d.volunteer_id,
      volunteer_name: d.volunteer_name,
      pickup_status: d.status === 'completed' ? 'delivered' : d.status,
      pickup_time: d.collected_at ?? d.assigned_at ?? d.created_at,
      delivery_time: d.delivered_at ?? d.completed_at ?? null,
      distance_km: Number((2 + (i % 5) * 1.4).toFixed(1)),
    }))
}

function buildMessages() {
  return mockConversations.flatMap((c) => c.messages.map((m) => ({ ...m, conversation_id: c.id })))
}

function buildConversations() {
  return mockConversations.map((c) => ({ ...c, messages: undefined }))
}

function seed() {
  const donations = mockDonations.map((d) => ({ ...d }))
  return {
    version: 1,
    users: getUsers(),
    organizations: seedOrganizations.map((o) => ({ ...o })),
    donations,
    requests: buildRequests(donations),
    pickups: buildPickups(donations),
    conversations: buildConversations(),
    messages: buildMessages(),
    notifications: mockNotifications.map((n) => ({ ...n })),
    reports: mockReports.map((r) => ({ ...r })),
    contacts: [],
  }
}

let cache = null

export function getDb() {
  if (!cache) {
    cache = readStore(DB_KEY, null) ?? seed()
    if (!readStore(DB_KEY, null)) writeStore(DB_KEY, cache)
  }
  return cache
}

export function saveDb() {
  if (cache) writeStore(DB_KEY, cache)
  return cache
}

export function updateDb(mutator) {
  const db = getDb()
  const result = mutator(db)
  saveDb()
  return result
}

export function resetDb() {
  cache = seed()
  writeStore(DB_KEY, cache)
  return cache
}

let counter = 0
export function newId(prefix) {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}`
}

export function nextUserNumber() {
  const db = getDb()
  return db.users.length + 1
}

/** Strips sensitive fields before anything is returned to the UI. */
export function publicUser(user) {
  if (!user) return null
  const { password_hash: _hash, ...rest } = user
  return { ...rest }
}

export function findUserById(id) {
  return getDb().users.find((u) => u.id === id) ?? null
}

export function findUserByEmail(email) {
  const needle = String(email).trim().toLowerCase()
  return getDb().users.find((u) => u.email.toLowerCase() === needle) ?? null
}
