import { get, post } from './api'

export function getNotifications() {
  return get('/notifications', undefined, { auth: true })
}

export function markNotificationRead(id) {
  return post(`/notifications/${id}/read`, {}, { auth: true })
}

export function markAllNotificationsRead() {
  return post('/notifications/read-all', {}, { auth: true })
}
