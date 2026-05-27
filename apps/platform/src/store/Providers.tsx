'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { hydrate } from './bookmarks'
import { loadBookmarks } from './persistBookmarks'
import { makeStore } from './store'
import type { AppStore } from './store'

type ProvidersProps = {
  children: ReactNode
}

/**
 * Per-request store provider following the App Router guidance at
 * https://redux-toolkit.js.org/usage/nextjs. The store is created once per
 * render tree (via `useRef`) so it is never shared across server requests.
 * Bookmarks start empty on both the server and the first client render to keep
 * SSR output in sync; an effect dispatches `hydrate(loadBookmarks())` on mount
 * so persisted ids land in the store after hydration. Cross-tab sync is out of
 * scope, a fresh tab will only see persisted state from the last `setItem`.
 */
export function Providers({ children }: ProvidersProps) {
  const storeRef = useRef<AppStore | null>(null)
  if (storeRef.current === null) {
    storeRef.current = makeStore()
  }
  const store = storeRef.current

  useEffect(() => {
    const persisted = loadBookmarks()
    if (persisted.length > 0) store.dispatch(hydrate(persisted))
  }, [store])

  return <ReduxProvider store={store}>{children}</ReduxProvider>
}
