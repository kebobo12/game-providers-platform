import { useSyncExternalStore } from 'react'

export function useMediaQuery(query) {
  const mediaQuery = typeof window !== 'undefined' ? window.matchMedia(query) : null

  return useSyncExternalStore(
    (cb) => {
      mediaQuery?.addEventListener('change', cb)
      return () => mediaQuery?.removeEventListener('change', cb)
    },
    () => mediaQuery?.matches ?? false,
    () => false,
  )
}
