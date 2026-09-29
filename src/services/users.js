import { get, post, patch, del } from './api'

export function getUsers(params = {}) {
  return get('/users', params, { auth: true })
}

export function getUser(id) {
  return get(`/users/${id}`, undefined, { auth: true })
}

export function updateUser(id, payload) {
  return patch(`/users/${id}`, payload, { auth: true })
}

export function deleteUser(id) {
  return del(`/users/${id}`, { auth: true })
}

export function getApprovals() {
  return get('/users/approvals', undefined, { auth: true })
}

export function getOrganizations() {
  return get('/organizations', undefined, { auth: true })
}

export function setVerification(organizationId, status) {
  return post(`/organizations/${organizationId}/verify`, { status }, { auth: true })
}
