import { get, post } from './api'

export function getConversations() {
  return get('/messages/conversations', undefined, { auth: true })
}

export function getConversationMessages(conversationId) {
  return get(`/messages/${conversationId}`, undefined, { auth: true })
}

export function sendMessage({ receiverId, message }) {
  return post('/messages', { receiver_id: receiverId, message }, { auth: true })
}
