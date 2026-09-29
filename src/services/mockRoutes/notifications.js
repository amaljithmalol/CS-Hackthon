import { route } from '../mockRouter'
import { updateDb } from '../db'
import { requireSession } from './helpers'

route('get', '/notifications', ({ session, db }) => {
  const user = requireSession(session)
  const list = db.notifications
    .filter((n) => n.user_id === user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { notifications: list, unread: list.filter((n) => !n.read).length }
})

route('post', '/notifications/:id/read', ({ params, session }) => {
  const user = requireSession(session)
  updateDb((db) => {
    const item = db.notifications.find((n) => n.id === params.id && n.user_id === user.id)
    if (item) item.read = true
  })
  return { ok: true }
})

route('post', '/notifications/read-all', ({ session }) => {
  const user = requireSession(session)
  updateDb((db) => {
    db.notifications.filter((n) => n.user_id === user.id).forEach((n) => {
      n.read = true
    })
  })
  return { ok: true }
})
