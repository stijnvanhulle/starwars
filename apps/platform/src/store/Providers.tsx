'use client'

import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { makeStore } from './store'
import type { AppStore } from './store'

type ProvidersProps = {
  children: ReactNode
}

/**
 * Per-request store provider following the App Router guidance at
 * https://redux-toolkit.js.org/usage/nextjs. The store is created once per
 * render tree (via `useRef`) so it is never shared across server requests.
 */
export function Providers({ children }: ProvidersProps) {
  const storeRef = useRef<AppStore | null>(null)

  if (storeRef.current === null) {
    storeRef.current = makeStore()
  }

  return <ReduxProvider store={storeRef.current}>{children}</ReduxProvider>
}
