/** Tiny in-memory route table used only by the mock backend. */

const routes = []

export function route(method, pattern, handler) {
  const parts = pattern.split('/').filter(Boolean)
  routes.push({ method: method.toUpperCase(), parts, handler, pattern })
}

export function match(method, path) {
  const segments = path.split('/').filter(Boolean)
  const verb = method.toUpperCase()

  for (const entry of routes) {
    if (entry.method !== verb) continue
    if (entry.parts.length !== segments.length) continue

    const params = {}
    let matched = true
    for (let i = 0; i < entry.parts.length; i += 1) {
      const part = entry.parts[i]
      if (part.startsWith(':')) {
        params[part.slice(1)] = decodeURIComponent(segments[i])
      } else if (part !== segments[i]) {
        matched = false
        break
      }
    }
    if (matched) return { handler: entry.handler, params }
  }
  return null
}
