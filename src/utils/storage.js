const PREFIX = 'foodbridge:'

export function readStore(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStore(key, value) {
  if (typeof window === 'undefined') return value
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable — the app keeps working in memory */
  }
  return value
}

export function removeStore(key) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

export function clearStore() {
  if (typeof window === 'undefined') return
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}
