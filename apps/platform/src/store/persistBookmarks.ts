import { isAction, type Middleware } from '@reduxjs/toolkit'
import { BOOKMARK_STORAGE_KEY } from '@/constants'
import { bookmarkIdsSchema } from '@/server/schemas'
import { bookmarksSlice, hydrate } from './bookmarks'

// `hydrate` is excluded so the mount-time rehydrate never re-writes the same JSON back to localStorage.
const BOOKMARK_ACTION_TYPES: Set<string> = new Set(
  Object.values(bookmarksSlice.actions)
    .map((creator) => creator.type)
    .filter((type) => type !== hydrate.type),
)

/**
 * Read the persisted bookmark ids from `localStorage`. Returns an empty array
 * during server-side rendering, when the key is missing, or when the payload
 * fails the array-of-numbers shape check.
 */
export function loadBookmarks(): Array<number> {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BOOKMARK_STORAGE_KEY)
    if (raw === null) return []
    const parsed = bookmarkIdsSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

/**
 * Persist bookmark changes to `localStorage` after every bookmark action. The
 * middleware is a no-op during server-side rendering. The state-slice generic
 * is kept local (`{ bookmarks: Array<number> }`) so this file never imports
 * `RootState` and closes a circular type loop with `store.ts`.
 */
export const persistBookmarks: Middleware<Record<string, never>, { bookmarks: Array<number> }> = (storeApi) => (next) => (action) => {
  const result = next(action)
  if (isAction(action) && BOOKMARK_ACTION_TYPES.has(action.type) && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(storeApi.getState().bookmarks))
    } catch {
      // Storage quota or private-mode failures are non-fatal; the slice still works in-memory.
    }
  }
  return result
}
