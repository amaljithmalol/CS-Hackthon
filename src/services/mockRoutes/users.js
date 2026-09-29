import { ApiError } from '../api'
import { route } from '../mockRouter'
import { newId, updateDb } from '../db'
import { enrichUser, requireSession, notify } from './helpers'

route('get', '/users', ({ query, session, db }) => {
  const actor = requireSession(session)
  if (actor.role !== 'admin') {
    throw new ApiError('You do not have permission to view this list.', 403, 'forbidden')
  }
  const role = query.role
  const search = String(query.search ?? '').trim().toLowerCase()
  const status = query.status

  const list = db.users
    .filter((u) => (role ? u.role === role : true))
    .filter((u) => (status ? u.verification_status === status : true))
    .filter((u) =>
      search
        ? [u.name, u.email, u.area, u.phone].some((field) =>
            String(field ?? '').toLowerCase().includes(search),
          )
        : true,
    )
    .map((u) => enrichUser(db, u))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return { users: list, total: list.length }
})

route('get', '/volunteers', ({ query, session, db }) => {
  const actor = requireSession(session)
  if (!['hotel', 'ngo', 'admin'].includes(actor.role)) {
    throw new ApiError('You do not have permission to view the volunteer directory.', 403, 'forbidden')
  }
  const search = String(query.search ?? '').trim().toLowerCase()
  const availability = query.availability

  const list = db.users
    .filter((u) => u.role === 'volunteer')
    .filter((u) => (availability ? u.availability === availability : true))
    .filter((u) =>
      search
        ? [u.name, u.area, u.city, u.availability, u.vehicle].some((field) =>
            String(field ?? '').toLowerCase().includes(search),
          )
        : true,
    )
    .map((u) => {
      const enriched = enrichUser(db, u)
      return {
        id: enriched.id,
        name: enriched.name,
        phone: enriched.phone,
        area: enriched.area,
        city: enriched.city,
        latitude: enriched.latitude,
        longitude: enriched.longitude,
        availability: u.availability ?? 'Flexible',
        vehicle: u.vehicle ?? null,
        completed_tasks: u.completed_tasks ?? 0,
        verified: enriched.verified,
      }
    })
    .sort((a, b) => b.completed_tasks - a.completed_tasks || a.name.localeCompare(b.name))

  return { volunteers: list, total: list.length }
})

route('get', '/users/approvals', ({ session, db }) => {
  const actor = requireSession(session)
  if (actor.role !== 'admin') {
    throw new ApiError('You do not have permission to view approvals.', 403, 'forbidden')
  }
  const organizations = db.organizations
    .map((org) => {
      const user = db.users.find((u) => u.id === org.user_id)
      return { ...org, user: user ? enrichUser(db, user) : null }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { organizations }
})

route('get', '/organizations', ({ session, db }) => {
  const actor = requireSession(session)
  if (actor.role !== 'admin') {
    throw new ApiError('You do not have permission to view organisations.', 403, 'forbidden')
  }
  return { organizations: db.organizations }
})

route('post', '/organizations/:id/verify', ({ params, body, session, db }) => {
  const actor = requireSession(session)
  if (actor.role !== 'admin') {
    throw new ApiError('Only administrators can change verification status.', 403, 'forbidden')
  }
  const status = body.status
  if (!['verified', 'rejected', 'pending'].includes(status)) {
    throw new ApiError('Please choose a valid verification status.', 422, 'validation')
  }

  const organization = updateDb((database) => {
    const org = database.organizations.find((o) => o.id === params.id)
    if (!org) return null
    org.verification_status = status
    org.reviewed_at = new Date().toISOString()
    const user = database.users.find((u) => u.id === org.user_id)
    if (user) {
      user.verification_status = status
      user.verified = status === 'verified'
    }
    return org
  })

  if (!organization) throw new ApiError('Organisation not found.', 404, 'not_found')

  notify({
    userIds: organization.user_id,
    type: 'approval',
    title: `Verification ${status}`,
    message:
      status === 'verified'
        ? `${organization.organization_name} has been verified. Thank you for partnering with FoodBridge.`
        : status === 'rejected'
          ? `${organization.organization_name} could not be verified. Please check the submitted documents.`
          : `${organization.organization_name} is pending review.`,
    link: '/profile',
  })

  void db
  return { organization }
})

route('post', '/users', ({ body, session, db }) => {
  const actor = requireSession(session)
  if (actor.role !== 'admin') {
    throw new ApiError('You do not have permission to create users.', 403, 'forbidden')
  }
  const created = updateDb((database) => {
    const id = newId('u')
    const user = {
      id,
      name: body.name ?? 'New member',
      email: body.email ?? `member${database.users.length}@foodbridge.org`,
      phone: body.phone ?? '',
      role: body.role ?? 'volunteer',
      address: body.address ?? '',
      area: body.area ?? 'Kozhikode',
      city: body.city ?? 'Kozhikode',
      latitude: 11.2588,
      longitude: 75.7804,
      organization_id: null,
      verification_status: 'pending',
      verified: false,
      created_at: new Date().toISOString(),
    }
    database.users.push(user)
    return user
  })
  return { user: enrichUser(db, created) }
})

route('get', '/users/:id', ({ params, session, db }) => {
  requireSession(session)
  const user = db.users.find((u) => u.id === params.id)
  if (!user) throw new ApiError('User not found.', 404, 'not_found')
  return { user: enrichUser(db, user) }
})

route('patch', '/users/:id', ({ params, body, session, db }) => {
  const actor = requireSession(session)
  const isSelf = actor.id === params.id
  if (!isSelf && actor.role !== 'admin') {
    throw new ApiError('You do not have permission to update this user.', 403, 'forbidden')
  }
  const updated = updateDb((database) => {
    const user = database.users.find((u) => u.id === params.id)
    if (!user) return null
    const allowed = isSelf
      ? ['name', 'phone', 'address', 'area', 'city', 'bio', 'availability', 'vehicle']
      : ['name', 'phone', 'address', 'area', 'city', 'verified', 'verification_status', 'role']
    allowed.forEach((key) => {
      if (body[key] !== undefined) user[key] = body[key]
    })
    return user
  })
  if (!updated) throw new ApiError('User not found.', 404, 'not_found')
  return { user: enrichUser(db, updated) }
})

route('delete', '/users/:id', ({ params, session }) => {
  const actor = requireSession(session)
  if (actor.role !== 'admin') {
    throw new ApiError('Only administrators can remove accounts.', 403, 'forbidden')
  }
  if (actor.id === params.id) {
    throw new ApiError('You cannot remove your own administrator account.', 422, 'validation')
  }
  const removed = updateDb((database) => {
    const index = database.users.findIndex((u) => u.id === params.id)
    if (index === -1) return false
    const [removedUser] = database.users.splice(index, 1)
    const orgIndex = database.organizations.findIndex((o) => o.id === removedUser.organization_id)
    if (orgIndex !== -1) database.organizations.splice(orgIndex, 1)
    return true
  })
  if (!removed) throw new ApiError('User not found.', 404, 'not_found')
  return { ok: true }
})
