const DAY = 24 * 60 * 60 * 1000

export function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** e.g. "12 Mar 2026" */
export function formatDate(value, options = {}) {
  const date = toDate(value)
  if (!date) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

/** e.g. "12 Mar 2026, 10:30 pm" */
export function formatDateTime(value) {
  const date = toDate(value)
  if (!date) return '—'
  return `${formatDate(date)}, ${formatTime(date)}`
}

/** e.g. "10:30 pm" */
export function formatTime(value) {
  const date = toDate(value)
  if (!date) return '—'
  return date
    .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toUpperCase()
    .replace(/\s+/g, ' ')
}

/** e.g. "10:30 PM – 11:15 PM" */
export function formatTimeRange(start, end) {
  if (!start) return '—'
  const a = formatTime(start)
  if (!end) return a
  return `${a} – ${formatTime(end)}`
}

/** "just now" / "12 min ago" / "3 hours ago" / "2 days ago" */
export function timeAgo(value) {
  const date = toDate(value)
  if (!date) return '—'
  const diff = Date.now() - date.getTime()
  const abs = Math.abs(diff)
  const future = diff < 0

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (abs < minute) return future ? 'in a moment' : 'just now'
  if (abs < hour) {
    const n = Math.round(abs / minute)
    return future ? `in ${n} min` : `${n} min ago`
  }
  if (abs < day) {
    const n = Math.round(abs / hour)
    return future ? `in ${n} hr` : `${n} hour${n > 1 ? 's' : ''} ago`
  }
  if (abs < 7 * day) {
    const n = Math.round(abs / day)
    return future ? `in ${n} day${n > 1 ? 's' : ''}` : `${n} day${n > 1 ? 's' : ''} ago`
  }
  return formatDate(date)
}

/** Countdown label for pickup deadlines, e.g. "Closes in 45 min" */
export function timeRemaining(value) {
  const date = toDate(value)
  if (!date) return { label: 'No deadline', expired: false, minutes: null }
  const diff = date.getTime() - Date.now()
  if (diff <= 0) return { label: 'Pickup window closed', expired: true, minutes: 0 }
  const minutes = Math.round(diff / 60000)
  if (minutes < 60) return { label: `Closes in ${minutes} min`, expired: false, minutes }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return {
    label: `Closes in ${hours} hr${hours > 1 ? 's' : ''}${mins ? ` ${mins} min` : ''}`,
    expired: false,
    minutes,
  }
}

export function toInputDateTime(value) {
  const date = toDate(value)
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function addHours(value, hours) {
  const date = toDate(value) ?? new Date()
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

export function addMinutes(value, minutes) {
  const date = toDate(value) ?? new Date()
  return new Date(date.getTime() + minutes * 60000)
}

export function isSameDay(a, b) {
  const d1 = toDate(a)
  const d2 = toDate(b)
  if (!d1 || !d2) return false
  return d1.toDateString() === d2.toDateString()
}

export function monthLabel(value) {
  const date = toDate(value)
  if (!date) return '—'
  return date.toLocaleDateString('en-IN', { month: 'short' })
}

export function startOfDay(value = new Date()) {
  const date = toDate(value) ?? new Date()
  date.setHours(0, 0, 0, 0)
  return date
}
