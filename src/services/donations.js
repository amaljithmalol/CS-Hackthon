import { get, post, patch, del } from './api'

/**
 * Donation service.
 * Every screen in the app talks to donations through these functions, so
 * switching from mock data to a live REST API only requires changing api.js.
 */

export function getDonations(params = {}) {
  return get('/donations', params)
}

export function getDonationById(id) {
  return get(`/donations/${id}`)
}

export function getMyDonations(scope, params = {}) {
  return get('/donations/mine', { scope, ...params })
}

export function getMyRequests() {
  return get('/donations/requests')
}

export function createDonation(payload) {
  return post('/donations', payload, { auth: true })
}

export function updateDonation(id, payload) {
  return patch(`/donations/${id}`, payload, { auth: true })
}

export function deleteDonation(id) {
  return del(`/donations/${id}`, { auth: true })
}

export function requestDonation(id, note) {
  return post(`/donations/${id}/request`, { note }, { auth: true })
}

export function assignVolunteer(id, volunteerId) {
  return post(`/donations/${id}/assign`, { volunteer_id: volunteerId }, { auth: true })
}

export function updateDonationStatus(id, status, extra = {}) {
  return post(`/donations/${id}/status`, { status, ...extra }, { auth: true })
}

export function getVolunteers(params = {}) {
  return get('/volunteers', params, { auth: true })
}
