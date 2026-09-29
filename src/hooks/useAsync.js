import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Small data-fetching hook used by every page that talks to a service.
 * Provides loading + error states so screens never have to hand-roll them.
 */
export function useAsync(loader, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: immediate })
  const loaderRef = useRef(loader)
  loaderRef.current = loader
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await loaderRef.current()
      if (mounted.current) setState({ data, error: null, loading: false })
      return data
    } catch (error) {
      if (mounted.current) {
        setState({ data: null, error: error?.message ?? 'Something went wrong. Please try again.', loading: false })
      }
      return null
    }
  }, [])

  useEffect(() => {
    if (immediate) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const setData = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: typeof updater === 'function' ? updater(current.data) : updater,
    }))
  }, [])

  return { ...state, reload: run, setData }
}
