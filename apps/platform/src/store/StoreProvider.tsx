'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { hydrate } from './bookmarks'
import { loadBookmarks } from './persistBookmarks'
import { makeStore } from './store'
import type { AppStore } from './store'

type StoreProviderProps = {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore>(makeStore())
  const store = storeRef.current

  useEffect(() => {
    const persisted = loadBookmarks()
    if (persisted.length > 0) store.dispatch(hydrate(persisted))
  }, [store])

  return <ReduxProvider store={store}>{children}</ReduxProvider>
}
