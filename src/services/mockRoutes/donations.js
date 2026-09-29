import { ApiError } from '../api'
import { route } from '../mockRouter'
import { newId, updateDb } from '../db'
import { ACTIVE_STATUSES, CATEGORY_MAP, STATUS_INDEX, getCategory } from '../../utils/constants'
import { distanceKm } from '../../utils/geo'
import { enrichDonation, notify, orgForUser, requireSession } from './helpers'

/** Allowed forward moves through the donation lifecycle. */
const TRANSITIONS = {
  posted: ['requested', 'cancelled', 'expired'],
  requested: ['assigned', 'posted', 'cancelled'],
  assigned: ['collecting', 'posted', 'cancelled'],
  collecting: ['collected', 'cancelled'],
  collected: ['delivered', 'cancelled'],
  delivered: ['completed'],
  completed: [],
  cancelled: ['posted'],
  expired: [],
}

const TIMESTAMP_FIELD = {
  requested: 'requested_at',
  assigned: 'assigned_at',
  collecting: 'collecting_at',
  collected: 'collected_at',
  delivered: 'delivered_at',
  completed: 'completed_at',
}

function listQuery({ query, db, session }) {
  const origin =
    query.lat && query.lng ? { lat: Number(query.lat), lng: Number(query.lng) } : (session ?? null)

  const search = String(query.search ?? '').trim().toLowerCase()
  const category = query.category
  const availability = query.availability ?? 'all'
  const maxDistance = query.maxDistance ? Number(query.maxDistance) : null
  const minMeals = query.minMeals ? Number(query.minMeals) : 0
  const sort = query.sort ?? 'newest'

  let list = db.donations.slice()

  if (query.donorId) list = list.filter((d) => d.donor_id === query.donorId)
  if (query.ngoId) list = list.filter((d) => d.ngo_id === query.ngoId)
  if (query.volunteerId) list = list.filter((d) => d.volunteer_id === query.volunteerId)
  if (category && category !== 'all') {
    list = list.filter((d) => d.category === category)
  }

  if (availability === 'posted') list = list.filter((d) => d.status === 'posted')
  else if (availability === 'active') list = list.filter((d) => ACTIVE_STATUSES.includes(d.status))
  else if (availability === 'completed') list = list.filter((d) => d.status === 'completed')
  else if (availability === 'mine') {
    list = list.filter((d) =>
      session ? d.donor_id === session.id || d.ngo_id === session.id || d.volunteer_id === session.id : false,
    )
  }

  if (query.status) list = list.filter((d) => d.status === query.status)

  let enriched = list.map((d) => enrichDonation(db, d, origin))

  if (search) {
    enriched = enriched.filter((d) =>
      [d.food_name, d.donor?.name, d.pickup_address, getCategory(d.category).label, d.description]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(search)),
    )
  }

  if (minMeals) enriched = enriched.filter((d) => (d.meals ?? 0) >= minMeals)
  if (maxDistance) enriched = enriched.filter((d) => d.distance_km !== null && d.distance_km <= maxDistance)

  const sorters = {
    newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
    deadline: (a, b) => new Date(a.pickup_end ?? a.consume_before) - new Date(b.pickup_end ?? b.consume_before),
    distance: (a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999),
    meals: (a, b) => (b.meals ?? 0) - (a.meals ?? 0),
  }
  enriched.sort(sorters[sort] ?? sorters.newest)

  return { donations: enriched, total: enriched.length }
}

route('get', '/donations', ({ query, session, db }) => listQuery({ query, db, session }))

route('get', '/donations/mine', ({ query, session, db }) => {
  const user = requireSession(session)
  const scope = query.scope ?? 'all'
  const scopedQuery = { ...query }
  if (scope === 'donor') scopedQuery.donorId = user.id
  if (scope === 'ngo') scopedQuery.ngoId = user.id
  if (scope === 'volunteer') scopedQuery.volunteerId = user.id
  return listQuery({ query: scopedQuery, db, session: user })
})

route('get', '/donations/requests', ({ session, db }) => {
  const user = requireSession(session)
  const requests = db.requests
    .filter((r) => r.requester_id === user.id)
    .map((request) => {
      const donation = db.donations.find((d) => d.id === request.donation_id)
      return { ...request, donation: enrichDonation(db, donation, user) }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { requests }
})

route('get', '/donations/:id', ({ params, session, db }) => {
  const donation = db.donations.find((d) => d.id === params.id)
  if (!donation) throw new ApiError('We could not find this donation.', 404, 'not_found')
  return { donation: enrichDonation(db, donation, session) }
})

route('post', '/donations', ({ body, session, db }) => {
  const user = requireSession(session)
  if (user.role !== 'hotel' && user.role !== 'admin') {
    throw new ApiError('Only verified food providers can post a donation.', 403, 'forbidden')
  }
  const org = orgForUser(db, user)
  if (org && org.verification_status === 'rejected') {
    throw new ApiError('Your organisation could not be verified, so posting is disabled.', 403, 'forbidden')
  }

  const {
    food_name: foodName,
    category,
    quantity,
    unit = 'kg',
    meals,
    description,
    preparation_time: preparationTime,
    consume_before: consumeBefore,
    pickup_address: pickupAddress,
    pickup_start: pickupStart,
    pickup_end: pickupEnd,
    diet = 'Vegetarian',
    allergens = [],
    packaging_available: packagingAvailable = true,
    special_instructions: specialInstructions = '',
    image,
    latitude,
    longitude,
  } = body

  if (!foodName?.trim()) throw new ApiError('Please enter the food name.', 422, 'validation')
  if (!CATEGORY_MAP[category]) throw new ApiError('Please choose a food category.', 422, 'validation')
  if (!meals || Number(meals) < 1) throw new ApiError('Please enter a valid number of meals.', 422, 'validation')
  if (!consumeBefore) throw new ApiError('Please provide a consume-before time.', 422, 'validation')
  if (!pickupStart || !pickupEnd) {
    throw new ApiError('Please provide the pickup window.', 422, 'validation')
  }
  if (new Date(pickupEnd) < new Date(pickupStart)) {
    throw new ApiError('The pickup end time must be after the start time.', 422, 'validation')
  }

  const id = newId('d')
  const donation = {
    id,
    donor_id: user.id,
    food_name: foodName.trim(),
    category,
    quantity: Number(quantity) || 0,
    unit,
    meals: Number(meals),
    description: description?.trim() ?? '',
    preparation_time: preparationTime ?? new Date().toISOString(),
    consume_before: consumeBefore,
    pickup_address: pickupAddress?.trim() || user.address,
    latitude: Number(latitude ?? user.latitude ?? 11.2588),
    longitude: Number(longitude ?? user.longitude ?? 75.7804),
    pickup_start: pickupStart,
    pickup_end: pickupEnd,
    image: image || getCategory(category).image,
    status: 'posted',
    diet,
    allergens: Array.isArray(allergens) ? allergens : [],
    packaging_available: Boolean(packagingAvailable),
    special_instructions: specialInstructions?.trim() ?? '',
    beneficiaries: 0,
    created_at: new Date().toISOString(),
  }

  updateDb((database) => {
    database.donations.unshift(donation)
  })

  const ngoIds = db.organizations
    .filter((o) => o.organization_type === 'NGO' && o.verification_status === 'verified')
    .map((o) => o.user_id)
  notify({
    userIds: ngoIds,
    type: 'donation',
    title: 'New donation nearby',
    message: `${org?.organization_name ?? user.name} posted ${donation.meals} meals of ${donation.food_name}.`,
    link: `/donations/${id}`,
  })

  return { donation: enrichDonation(db, donation, user) }
})

route('patch', '/donations/:id', ({ params, body, session, db }) => {
  const user = requireSession(session)
  const donation = db.donations.find((d) => d.id === params.id)
  if (!donation) throw new ApiError('We could not find this donation.', 404, 'not_found')
  if (donation.donor_id !== user.id && user.role !== 'admin') {
    throw new ApiError('You can only edit donations posted by your organisation.', 403, 'forbidden')
  }
  if (donation.status !== 'posted') {
    throw new ApiError('This donation can no longer be edited because it has already been claimed.', 409, 'conflict')
  }

  const editable = [
    'food_name',
    'category',
    'quantity',
    'unit',
    'meals',
    'description',
    'consume_before',
    'pickup_address',
    'pickup_start',
    'pickup_end',
    'diet',
    'allergens',
    'packaging_available',
    'special_instructions',
    'image',
  ]
  updateDb((database) => {
    const target = database.donations.find((d) => d.id === params.id)
    editable.forEach((key) => {
      if (body[key] !== undefined) target[key] = body[key]
    })
  })

  const updated = db.donations.find((d) => d.id === params.id)
  return { donation: enrichDonation(db, updated, user) }
})

route('delete', '/donations/:id', ({ params, session, db }) => {
  const user = requireSession(session)
  const donation = db.donations.find((d) => d.id === params.id)
  if (!donation) throw new ApiError('We could not find this donation.', 404, 'not_found')
  if (donation.donor_id !== user.id && user.role !== 'admin') {
    throw new ApiError('You can only remove donations posted by your organisation.', 403, 'forbidden')
  }
  if (donation.status !== 'posted') {
    throw new ApiError('This donation has already been claimed and cannot be removed.', 409, 'conflict')
  }
  updateDb((database) => {
    const index = database.donations.findIndex((d) => d.id === params.id)
    if (index !== -1) database.donations.splice(index, 1)
  })
  return { ok: true }
})

route('post', '/donations/:id/request', ({ params, body, session, db }) => {
  const user = requireSession(session)
  if (user.role !== 'ngo' && user.role !== 'volunteer') {
    throw new ApiError('Only NGOs and volunteers can request a donation.', 403, 'forbidden')
  }
  const donation = db.donations.find((d) => d.id === params.id)
  if (!donation) throw new ApiError('We could not find this donation.', 404, 'not_found')
  if (donation.status !== 'posted') {
    throw new ApiError('This donation is no longer available.', 409, 'conflict')
  }
  if (donation.donor_id === user.id) {
    throw new ApiError('You cannot request your own donation.', 422, 'validation')
  }

  const org = orgForUser(db, user)
  const requesterName = org?.organization_name ?? user.name
  const nextStatus = user.role === 'volunteer' ? 'assigned' : 'requested'
  const now = new Date().toISOString()

  updateDb((database) => {
    const target = database.donations.find((d) => d.id === params.id)
    target.status = nextStatus
    target.ngo_id = target.ngo_id ?? (user.role === 'ngo' ? user.id : null)
    target.requester_name = requesterName
    target.requested_at = now
    if (user.role === 'volunteer') {
      target.volunteer_id = user.id
      target.volunteer_name = user.name
      target.assigned_at = now
    }
    database.requests.unshift({
      id: newId('req'),
      donation_id: target.id,
      requester_id: user.id,
      status: user.role === 'volunteer' ? 'assigned' : 'accepted',
      meals_expected: target.meals,
      note: body.note ?? '',
      created_at: now,
    })
  })

  const updated = db.donations.find((d) => d.id === params.id)

  notify({
    userIds: donation.donor_id,
    type: 'request',
    title: user.role === 'volunteer' ? 'Volunteer accepted your donation' : 'New donation request',
    message: `${requesterName} has ${user.role === 'volunteer' ? 'volunteered to collect' : 'requested'} ${donation.meals} meals of ${donation.food_name}.`,
    link: `/donations/${donation.id}`,
  })

  return { donation: enrichDonation(db, updated, user), requester: { name: requesterName } }
})

route('post', '/donations/:id/assign', ({ params, body, session, db }) => {
  const user = requireSession(session)
  const donation = db.donations.find((d) => d.id === params.id)
  if (!donation) throw new ApiError('We could not find this donation.', 404, 'not_found')
  if (user.id !== donation.donor_id && user.role !== 'admin' && user.role !== 'ngo') {
    throw new ApiError('You do not have permission to assign a volunteer.', 403, 'forbidden')
  }
  const volunteerId = body.volunteer_id ?? body.volunteerId
  if (!volunteerId) throw new ApiError('Please choose a volunteer.', 422, 'validation')

  const volunteer = db.users.find((u) => u.id === volunteerId && u.role === 'volunteer')
  if (!volunteer) throw new ApiError('We could not find that volunteer.', 404, 'not_found')

  const now = new Date().toISOString()
  updateDb((database) => {
    const target = database.donations.find((d) => d.id === params.id)
    target.volunteer_id = volunteer.id
    target.volunteer_name = volunteer.name
    target.status = 'assigned'
    target.assigned_at = now
    const existing = database.pickups.find((p) => p.donation_id === target.id)
    if (existing) {
      existing.volunteer_id = volunteer.id
      existing.volunteer_name = volunteer.name
      existing.pickup_status = 'assigned'
    } else {
      database.pickups.push({
        id: newId('pick'),
        donation_id: target.id,
        volunteer_id: volunteer.id,
        volunteer_name: volunteer.name,
        pickup_status: 'assigned',
        pickup_time: null,
        delivery_time: null,
        distance_km: Number(distanceKm(volunteer, target)?.toFixed(1) ?? 0),
      })
    }
  })

  notify({
    userIds: volunteer.id,
    type: 'task',
    title: 'New pickup task',
    message: `You have been assigned to collect ${donation.meals} meals of ${donation.food_name} from ${donation.pickup_address}.`,
    link: '/volunteer/tasks',
  })

  const updated = db.donations.find((d) => d.id === params.id)
  return { donation: enrichDonation(db, updated, user) }
})

route('post', '/donations/:id/status', ({ params, body, session, db }) => {
  const user = requireSession(session)
  const donation = db.donations.find((d) => d.id === params.id)
  if (!donation) throw new ApiError('We could not find this donation.', 404, 'not_found')

  const next = body.status
  if (!STATUS_INDEX[next]) throw new ApiError('Please choose a valid status.', 422, 'validation')
  if (next === donation.status) {
    return { donation: enrichDonation(db, donation, user) }
  }

  const allowed = TRANSITIONS[donation.status] ?? []
  if (!allowed.includes(next)) {
    throw new ApiError(
      `This donation cannot move from “${donation.status}” to “${next}”.`,
      409,
      'invalid_transition',
    )
  }

  const isVolunteerOnly = ['collecting', 'collected', 'delivered'].includes(next)
  if (isVolunteerOnly && donation.volunteer_id !== user.id && user.role !== 'admin') {
    throw new ApiError('Only the assigned volunteer can update the pickup status.', 403, 'forbidden')
  }
  if (next === 'completed' && user.role === 'hotel' && donation.donor_id !== user.id) {
    throw new ApiError('You do not have permission to complete this donation.', 403, 'forbidden')
  }

  const now = new Date().toISOString()
  updateDb((database) => {
    const target = database.donations.find((d) => d.id === params.id)
    target.status = next
    target[TIMESTAMP_FIELD[next]] = now
    if (next === 'requested') {
      target.ngo_id = user.id
      target.requester_name = orgForUser(database, user)?.organization_name ?? user.name
    }
    if (next === 'completed') {
      target.beneficiaries = Number(body.beneficiaries) || target.beneficiaries || target.meals
      target.completed_at = now
    }
    const pickup = database.pickups.find((p) => p.donation_id === target.id)
    if (pickup) {
      if (['collecting', 'collected', 'delivered', 'completed'].includes(next)) {
        pickup.pickup_status = next === 'completed' ? 'delivered' : next
        if (next === 'collected' && !pickup.pickup_time) pickup.pickup_time = now
        if (['delivered', 'completed'].includes(next)) pickup.delivery_time = now
      }
    }
  })

  const updated = db.donations.find((d) => d.id === params.id)
  const statusLabel = next.charAt(0).toUpperCase() + next.slice(1)

  notify({
    userIds: [updated.donor_id, updated.ngo_id, updated.volunteer_id].filter(Boolean),
    type: next === 'completed' ? 'completed' : 'pickup',
    title: `Donation ${statusLabel.toLowerCase()}`,
    message: `${updated.food_name} (${updated.meals} meals) is now ${statusLabel.toLowerCase()}.`,
    link: `/donations/${updated.id}`,
  })

  return { donation: enrichDonation(db, updated, user) }
})
