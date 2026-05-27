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
 * Reads persisted bookmark ids from `localStorage`, returning `[]` on miss or invalid shape.
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
 * Redux middleware that writes the bookmarks slice to `localStorage` after each bookmark action.
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
