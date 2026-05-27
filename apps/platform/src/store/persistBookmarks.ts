import type { Middleware } from '@reduxjs/toolkit'
import { bookmarksSlice } from './bookmarks'

const STORAGE_KEY = 'whale.bookmarks.v1'

const BOOKMARK_ACTION_TYPES: Set<string> = new Set(Object.values(bookmarksSlice.actions).map((creator) => creator.type))

/**
 * Read the persisted bookmark ids from `localStorage`. Returns an empty array
 * during server-side rendering, when the key is missing, or when the payload
 * fails the array-of-numbers shape check.
 */
export function loadBookmarks(): Array<number> {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry))
  } catch {
    return []
  }
}

/**
 * Persist bookmark changes to `localStorage` after every bookmark action. The
 * middleware is a no-op during server-side rendering. Typed as
 * `Middleware<{}, { bookmarks: Array<number> }>` so it never imports the
 * full `RootState` (which would close a circular type loop with `store.ts`).
 */
export const persistBookmarks: Middleware<{}, { bookmarks: Array<number> }> = (storeApi) => (next) => (action) => {
  const result = next(action)
  const type = (action as { type?: string }).type
  if (type !== undefined && BOOKMARK_ACTION_TYPES.has(type) && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storeApi.getState().bookmarks))
    } catch {
      // Storage quota or private-mode failures are non-fatal; the slice still works in-memory.
    }
  }
  return result
}
