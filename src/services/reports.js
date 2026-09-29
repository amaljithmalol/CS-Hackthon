import { get, post, patch } from './api'

export function getImpactSummary() {
  return get('/impact/summary')
}

export function getPlatformImpact() {
  return get('/impact/platform')
}

export function getImpactAnalytics() {
  return get('/impact/analytics')
}

export function getReports() {
  return get('/reports', undefined, { auth: true })
}

export function createReport(payload) {
  return post('/reports', payload, { auth: true })
}

export function updateReport(id, payload) {
  return patch(`/reports/${id}`, payload, { auth: true })
}

export function submitContactForm(payload) {
  return post('/contacts', payload)
}
