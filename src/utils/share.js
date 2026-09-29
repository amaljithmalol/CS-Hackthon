/**
 * Small browser-only helpers for exporting data and sharing results.
 * Kept in utils so every impact screen behaves identically.
 */

const CSV_MIME = 'text/csv;charset=utf-8;'

function escapeCell(value) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Downloads an array of objects (or a pre-built array-of-arrays) as CSV.
 * The first object's keys become the header row.
 */
export function exportCsv(filename, rows) {
  if (!rows || rows.length === 0) return false

  const isObjectRows = typeof rows[0] === 'object' && rows[0] !== null && !Array.isArray(rows[0])
  const header = isObjectRows ? Object.keys(rows[0]) : null
  const body = isObjectRows
    ? rows.map((row) => header.map((key) => escapeCell(row[key])))
    : rows.map((row) => row.map(escapeCell))

  const csv = [header ?? [], ...body]
    .map((row) => row.join(','))
    .join('\n')

  const blob = new Blob([`\uFEFF${csv}`], { type: CSV_MIME })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  return true
}

/**
 * Shares text through the native share sheet, falling back to the clipboard.
 * Resolves to 'shared' | 'copied' | 'cancelled' | 'unsupported'.
 */
export async function shareText(text, title = 'FoodBridge', url = '') {
  const payload = { title, text, ...(url ? { url } : {}) }
  try {
    if (navigator.share) {
      await navigator.share(payload)
      return 'shared'
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText([text, url].filter(Boolean).join(' '))
      return 'copied'
    }
    return 'unsupported'
  } catch (error) {
    if (error?.name === 'AbortError') return 'cancelled'
    return 'cancelled'
  }
}
