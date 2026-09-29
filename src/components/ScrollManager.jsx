import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets scroll on navigation and honours in-page hash links. */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const attempt = (tries = 0) => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else if (tries < 12) {
          setTimeout(() => attempt(tries + 1), 60)
        }
      }
      attempt()
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname, hash])

  return null
}
