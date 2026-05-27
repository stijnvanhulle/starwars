'use client'

import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
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
 * Bookmark state is rehydrated from `localStorage` on the client; the server
 * pass starts with an empty array because `loadBookmarks` is window-gated.
 */
export function Providers({ children }: ProvidersProps) {
  const storeRef = useRef<AppStore | null>(null)

  if (storeRef.current === null) {
    storeRef.current = makeStore({ bookmarks: loadBookmarks() })
  }

  return <ReduxProvider store={storeRef.current}>{children}</ReduxProvider>
}
