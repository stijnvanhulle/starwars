import { describe, expect, it } from 'vitest'
import { add, bookmarksSlice, clear, remove, selectBookmarks, toggle } from './bookmarks'
import { makeStore } from './store'

const initial = bookmarksSlice.getInitialState()

describe('bookmarksSlice reducers', () => {
  it('starts as an empty list', () => {
    expect(initial).toEqual([])
  })

  it('add is idempotent for the same id', () => {
    const once = bookmarksSlice.reducer(initial, add(7))
    const twice = bookmarksSlice.reducer(once, add(7))
    expect(twice).toEqual([7])
  })

  it('remove is a no-op when the id is missing', () => {
    const state = bookmarksSlice.reducer([1, 2], remove(99))
    expect(state).toEqual([1, 2])
  })

  it('toggle flips both ways', () => {
    const added = bookmarksSlice.reducer(initial, toggle(3))
    expect(added).toEqual([3])

    const removed = bookmarksSlice.reducer(added, toggle(3))
    expect(removed).toEqual([])
  })

  it('clear empties the list', () => {
    const state = bookmarksSlice.reducer([1, 2, 3], clear())
    expect(state).toEqual([])
  })
})

describe('bookmarks via the configured store', () => {
  it('rehydrates from preloadedState', () => {
    const store = makeStore({ bookmarks: [4, 5] })
    expect(selectBookmarks(store.getState())).toEqual([4, 5])
  })

  it('add is idempotent through the store dispatch flow', () => {
    const store = makeStore()
    store.dispatch(add(7))
    store.dispatch(add(7))
    expect(selectBookmarks(store.getState())).toEqual([7])
  })

  it('toggle flips both ways through the store', () => {
    const store = makeStore({ bookmarks: [1] })
    store.dispatch(toggle(2))
    store.dispatch(toggle(1))
    expect(selectBookmarks(store.getState())).toEqual([2])
  })

  it('remove drops a single id without affecting the rest', () => {
    const store = makeStore({ bookmarks: [1, 2, 3] })
    store.dispatch(remove(2))
    expect(selectBookmarks(store.getState())).toEqual([1, 3])
  })

  it('clear empties the store', () => {
    const store = makeStore({ bookmarks: [1, 2, 3] })
    store.dispatch(clear())
    expect(selectBookmarks(store.getState())).toEqual([])
  })
})
