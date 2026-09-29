import { ApiError } from '../api'
import { distanceKm } from '../../utils/geo'
import { getCategory } from '../../utils/constants'
import { newId, updateDb } from '../db'

export function orgForUser(db, user) {
  if (!user?.organization_id) return null
  return db.organizations.find((o) => o.id === user.organization_id) ?? null
}

export function enrichDonation(db, donation, origin) {
  if (!donation) return null
  const donor = db.users.find((u) => u.id === donation.donor_id) ?? null
  const donorOrg = orgForUser(db, donor)
  const ngo = db.users.find((u) => u.id === donation.ngo_id) ?? null
  const volunteer = db.users.find((u) => u.id === donation.volunteer_id) ?? null
  const request = db.requests.find((r) => r.donation_id === donation.id) ?? null

  return {
    ...donation,
    category_label: getCategory(donation.category).label,
    donor: donor
      ? {
          id: donor.id,
          name: donorOrg?.organization_name ?? donor.name,
          contact_name: donor.name,
          role: donor.role,
          phone: donor.phone,
          area: donor.area,
          city: donor.city,
          verification_status: donorOrg?.verification_status ?? donor.verification_status,
          verified: donorOrg ? donorOrg.verification_status === 'verified' : donor.verified,
        }
      : null,
    requester: ngo
      ? {
          id: ngo.id,
          name: orgForUser(db, ngo)?.organization_name ?? ngo.name,
          phone: ngo.phone,
        }
      : null,
    volunteer: volunteer
      ? { id: volunteer.id, name: volunteer.name, phone: volunteer.phone, area: volunteer.area }
      : null,
    request: request ?? null,
    distance_km: origin ? distanceKm(origin, donation) : null,
  }
}

export function enrichUser(db, user) {
  if (!user) return null
  const org = orgForUser(db, user)
  return {
    ...user,
    organization: org,
    organization_name: org?.organization_name ?? null,
    verification_status: org?.verification_status ?? user.verification_status,
    verified: org ? org.verification_status === 'verified' : user.verified,
  }
}

/** Creates an in-app notification (mirrors a push/DB row in a real backend). */
export function notify({ userIds = [], type = 'system', title, message, link = null }) {
  const targets = Array.isArray(userIds) ? userIds : [userIds]
  if (!targets.length) return
  updateDb((db) => {
    targets.forEach((userId) => {
      if (!userId) return
      db.notifications.unshift({
        id: newId('n'),
        user_id: userId,
        type,
        title,
        message,
        link,
        read: false,
        created_at: new Date().toISOString(),
      })
    })
    db.notifications = db.notifications.slice(0, 120)
  })
}

export function notifyNearbyOrganizations(db, donation, excludeIds = []) {
  const ids = db.organizations
    .filter((org) => org.organization_type === 'NGO' && org.verification_status === 'verified')
    .map((org) => org.user_id)
    .filter((id) => !excludeIds.includes(id))
  notify({
    userIds: ids,
    type: 'donation',
    title: 'New donation nearby',
    message: `${donation.donor?.name ?? 'A partner hotel'} posted ${donation.meals} meals of ${donation.food_name}.`,
    link: `/donations/${donation.id}`,
  })
}

export function requireSession(session) {
  if (!session) {
    throw new ApiError('Please sign in to continue.', 401, 'unauthorized')
  }
  return session
}
