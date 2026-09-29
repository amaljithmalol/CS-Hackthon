const RADIUS_KM = 6371

function toRad(deg) {
  return (deg * Math.PI) / 180
}

/** Great-circle distance in km between two {lat, lng} points. */
export function distanceKm(a, b) {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function formatDistance(km) {
  if (km === null || km === undefined || Number.isNaN(km)) return '—'
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

/** Bounding-box filter used by the map + list views. */
export function withinRadius(center, point, km) {
  const d = distanceKm(center, point)
  return d === null ? true : d <= km
}
