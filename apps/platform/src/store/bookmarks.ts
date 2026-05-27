import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

/**
 * Bookmarked character ids, persisted to `localStorage` by `persistBookmarks.ts`.
 */
export const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState: [] as Array<number>,
  reducers: {
    add(state, action: PayloadAction<number>) {
      if (!state.includes(action.payload)) state.push(action.payload)
    },
    remove(state, action: PayloadAction<number>) {
      const idx = state.indexOf(action.payload)
      if (idx >= 0) state.splice(idx, 1)
    },
    toggle(state, action: PayloadAction<number>) {
      const idx = state.indexOf(action.payload)
      if (idx >= 0) state.splice(idx, 1)
      else state.push(action.payload)
    },
    clear(state) {
      state.length = 0
    },
    hydrate(_state, action: PayloadAction<Array<number>>) {
      return action.payload
    },
  },
})

export const { add, remove, toggle, clear, hydrate } = bookmarksSlice.actions
export const bookmarksReducer = bookmarksSlice.reducer

export function selectBookmarks(state: RootState): ReadonlyArray<number> {
  return state.bookmarks
}
