export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
export const PHONE_RE = /^[0-9+\-\s()]{7,15}$/

export const validators = {
  required: (value, message = 'This field is required.') =>
    value === undefined || value === null || String(value).trim() === ''
      ? message
      : null,

  email: (value) => {
    if (!value || !String(value).trim()) return 'Please enter your email address.'
    return EMAIL_RE.test(String(value).trim()) ? null : 'Please enter a valid email address.'
  },

  phone: (value) => {
    if (!value || !String(value).trim()) return 'Please enter your phone number.'
    const digits = String(value).replace(/\D/g, '')
    return digits.length >= 7 && digits.length <= 15 ? null : 'Please enter a valid phone number.'
  },

  number: (value, { min = 1, max = Infinity, label = 'This value' } = {}) => {
    if (value === '' || value === null || value === undefined) return `Please enter ${label.toLowerCase()}.`
    const num = Number(value)
    if (Number.isNaN(num)) return `${label} must be a number.`
    if (num < min) return `${label} must be at least ${min}.`
    if (num > max) return `${label} must be ${max} or less.`
    return null
  },

  minLength: (value, min, message = `Please enter at least ${min} characters.`) =>
    String(value ?? '').trim().length < min ? message : null,

  match: (value, other, message = 'Passwords do not match.') =>
    value === other ? null : message,

  /** Very light strength meter — presentation only, not a security control. */
  passwordStrength: (value) => {
    const v = String(value ?? '')
    if (!v) return { score: 0, label: 'Empty', tone: 'muted' }
    let score = 0
    if (v.length >= 8) score += 1
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score += 1
    if (/\d/.test(v)) score += 1
    if (/[^A-Za-z0-9]/.test(v)) score += 1
    const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
    const tones = ['danger', 'danger', 'warning', 'brand', 'success']
    const index = Math.max(0, score - 1)
    return { score, label: labels[index], tone: tones[index] }
  },
}

export function validate(values, rules) {
  const errors = {}
  for (const [field, checks] of Object.entries(rules)) {
    const list = Array.isArray(checks) ? checks : [checks]
    for (const check of list) {
      const error = check(values[field], values)
      if (error) {
        errors[field] = error
        break
      }
    }
  }
  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
