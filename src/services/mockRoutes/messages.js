import { ApiError } from '../api'
import { route } from '../mockRouter'
import { newId, updateDb } from '../db'
import { requireSession, enrichUser, notify } from './helpers'

route('get', '/messages/conversations', ({ session, db }) => {
  const user = requireSession(session)
  const conversations = db.conversations
    .filter((c) => {
      const participants = db.messages
        .filter((m) => m.conversation_id === c.id)
        .flatMap((m) => [m.sender_id, m.receiver_id])
      return participants.includes(user.id)
    })
    .map((c) => {
      const otherId =
        c.participant_id === user.id
          ? [...new Set(db.messages.filter((m) => m.conversation_id === c.id).flatMap((m) => [m.sender_id, m.receiver_id]))].find(
              (id) => id !== user.id,
            )
          : c.participant_id
      const other = db.users.find((u) => u.id === otherId)
      return {
        id: c.id,
        participant: other ? enrichUser(db, other) : null,
        participant_name: c.participant_name,
        organization: c.organization,
        last_message: c.last_message,
        last_message_at: c.last_message_at,
        unread: c.unread ?? 0,
      }
    })
    .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))

  return { conversations }
})

route('get', '/messages/:conversationId', ({ params, session, db }) => {
  const user = requireSession(session)
  const conversation = db.conversations.find((c) => c.id === params.conversationId)
  if (!conversation) throw new ApiError('Conversation not found.', 404, 'not_found')

  const messages = db.messages
    .filter((m) => m.conversation_id === conversation.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  const otherId = [...new Set(messages.flatMap((m) => [m.sender_id, m.receiver_id]))].find(
    (id) => id !== user.id,
  )
  const other = db.users.find((u) => u.id === otherId)

  return {
    conversation: { id: conversation.id, participant: other ? enrichUser(db, other) : null },
    messages: messages.map((m) => ({ ...m, mine: m.sender_id === user.id })),
  }
})

route('post', '/messages', ({ body, session, db }) => {
  const user = requireSession(session)
  const receiverId = body.receiver_id ?? body.receiverId
  const text = String(body.message ?? '').trim()
  if (!receiverId) throw new ApiError('Please choose who to message.', 422, 'validation')
  if (!text) throw new ApiError('Please type a message before sending.', 422, 'validation')

  const receiver = db.users.find((u) => u.id === receiverId)
  if (!receiver) throw new ApiError('We could not find that user.', 404, 'not_found')

  let conversation =
    db.conversations.find((c) => {
      const ids = new Set(
        db.messages
          .filter((m) => m.conversation_id === c.id)
          .flatMap((m) => [m.sender_id, m.receiver_id]),
      )
      return ids.has(user.id) && ids.has(receiverId)
    }) ?? null

  if (!conversation) {
    conversation = {
      id: newId('c'),
      participant_id: receiverId,
      participant_name: receiver.name,
      participant_role: receiver.role,
      organization: receiver.organization_name ?? receiver.area,
      last_message: text,
      last_message_at: new Date().toISOString(),
      unread: 0,
    }
    updateDb((database) => {
      database.conversations.unshift(conversation)
    })
  }

  const message = {
    id: newId('m'),
    conversation_id: conversation.id,
    sender_id: user.id,
    receiver_id: receiverId,
    message: text,
    created_at: new Date().toISOString(),
  }

  updateDb((database) => {
    database.messages.push(message)
    const target = database.conversations.find((c) => c.id === conversation.id)
    target.last_message = text
    target.last_message_at = message.created_at
  })

  notify({
    userIds: receiverId,
    type: 'message',
    title: `New message from ${user.name}`,
    message: text.slice(0, 80),
    link: '/messages',
  })

  return { message: { ...message, mine: true }, conversation }
})
