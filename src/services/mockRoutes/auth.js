import { ApiError } from '../api'
import { route } from '../mockRouter'
import { newId, updateDb, findUserByEmail } from '../db'
import { hashPassword } from '../../data/mockUsers'
import { enrichUser, notify, requireSession } from './helpers'

route('post', '/auth/register', ({ body, db }) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    address,
    area,
    city,
    availability,
    vehicle,
    organization_name,
    organization_type,
    registration_number,
  } = body

  if (!name?.trim()) throw new ApiError('Please enter your full name.', 422, 'validation')
  if (!email?.trim()) throw new ApiError('Please enter your email address.', 422, 'validation')
  if (!password || String(password).length < 8) {
    throw new ApiError('Password must be at least 8 characters.', 422, 'validation')
  }
  if (findUserByEmail(email)) {
    throw new ApiError('An account with this email already exists. Try signing in.', 409, 'conflict')
  }
  if ((role === 'hotel' || role === 'ngo') && !organization_name?.trim()) {
    throw new ApiError('Please enter your organisation name.', 422, 'validation')
  }

  const userId = newId('u')
  const orgId = newId('org')

  const user = {
    id: userId,
    name: name.trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone ?? '',
    role,
    address: address ?? '',
    area: area ?? city ?? 'Kozhikode',
    city: city ?? 'Kozhikode',
    latitude: body.latitude ?? 11.2588,
    longitude: body.longitude ?? 75.7804,
    organization_id: role === 'hotel' || role === 'ngo' ? orgId : null,
    verification_status: 'pending',
    verified: false,
    availability: availability ?? null,
    vehicle: vehicle ?? null,
    created_at: new Date().toISOString(),
  }

  const organization =
    role === 'hotel' || role === 'ngo'
      ? {
          id: orgId,
          user_id: userId,
          organization_name: organization_name.trim(),
          organization_type:
            organization_type ?? (role === 'hotel' ? 'Restaurant' : 'NGO'),
          registration_number: registration_number ?? 'Pending submission',
          address: address ?? '',
          latitude: body.latitude ?? 11.2588,
          longitude: body.longitude ?? 75.7804,
          verification_status: 'pending',
          document_name: body.document_name ?? null,
          created_at: new Date().toISOString(),
        }
      : null

  updateDb((database) => {
    database.users.push({ ...user, password_hash: hashPassword(password) })
    if (organization) database.organizations.push(organization)
  })

  notify({
    userIds: 'u-admin-1',
    type: 'approval',
    title: 'New registration',
    message: `${user.name} registered as ${role.toUpperCase()} and is awaiting verification.`,
    link: '/admin/dashboard',
  })

  return { user: enrichUser(db, user), organization }
})

route('post', '/auth/login', ({ body, db }) => {
  const { email, password, role } = body
  if (!email?.trim()) throw new ApiError('Please enter your email address.', 422, 'validation')
  if (!password) throw new ApiError('Please enter your password.', 422, 'validation')

  const user = findUserByEmail(email)
  if (!user || user.password_hash !== hashPassword(password)) {
    throw new ApiError('Incorrect email or password. Please try again.', 401, 'invalid_credentials')
  }
  if (role && user.role !== role) {
    throw new ApiError(
      `This account is registered as ${user.role}. Please select the correct role.`,
      401,
      'invalid_credentials',
    )
  }
  return { user: enrichUser(db, user), token: user.id }
})

route('post', '/auth/logout', () => ({ ok: true }))

route('get', '/auth/me', ({ session, db }) => {
  if (!session) throw new ApiError('Your session has expired. Please sign in again.', 401, 'unauthorized')
  return { user: enrichUser(db, session) }
})

route('patch', '/auth/me', ({ body, session, db }) => {
  const user = requireSession(session)
  const allowed = ['name', 'phone', 'address', 'area', 'city', 'bio', 'availability', 'vehicle']
  updateDb((database) => {
    const target = database.users.find((u) => u.id === user.id)
    if (!target) return
    allowed.forEach((key) => {
      if (body[key] !== undefined) target[key] = body[key]
    })
    if (body.organization_name && target.organization_id) {
      const org = database.organizations.find((o) => o.id === target.organization_id)
      if (org) {
        org.organization_name = body.organization_name
        if (body.registration_number) org.registration_number = body.registration_number
        if (body.address) org.address = body.address
      }
    }
  })
  const updated = db.users.find((u) => u.id === user.id)
  return { user: enrichUser(db, updated) }
})

route('post', '/auth/change-password', ({ body, session, db }) => {
  const user = requireSession(session)
  const { current_password: currentPassword, new_password: newPassword } = body
  if (!newPassword || String(newPassword).length < 8) {
    throw new ApiError('New password must be at least 8 characters.', 422, 'validation')
  }
  if (user.password_hash !== hashPassword(currentPassword)) {
    throw new ApiError('Your current password is incorrect.', 401, 'invalid_credentials')
  }
  updateDb((database) => {
    const target = database.users.find((u) => u.id === user.id)
    target.password_hash = hashPassword(newPassword)
  })
  void db
  return { ok: true }
})
