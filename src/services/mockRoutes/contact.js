import { ApiError } from '../api'
import { route } from '../mockRouter'
import { newId, updateDb } from '../db'
import { notify } from './helpers'

route('post', '/contacts', ({ body }) => {
  const { name, email, phone, subject, message } = body
  if (!name?.trim()) throw new ApiError('Please enter your name.', 422, 'validation')
  if (!email?.trim()) throw new ApiError('Please enter your email address.', 422, 'validation')
  if (!message?.trim()) throw new ApiError('Please enter your message.', 422, 'validation')

  const entry = {
    id: newId('ct'),
    name: name.trim(),
    email: email.trim(),
    phone: phone ?? '',
    subject: subject ?? 'General enquiry',
    message: message.trim(),
    created_at: new Date().toISOString(),
    status: 'new',
  }

  updateDb((db) => {
    db.contacts.unshift(entry)
  })

  notify({
    userIds: 'u-admin-1',
    type: 'report',
    title: 'New contact message',
    message: `${entry.subject} — ${entry.name}`,
    link: '/admin/dashboard',
  })

  return { contact: entry }
})
