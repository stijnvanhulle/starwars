import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { api } from './api'
import { bookmarksReducer } from './bookmarks'
import { persistBookmarks } from './persistBookmarks'

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  bookmarks: bookmarksReducer,
})

type PreloadedState = {
  bookmarks?: Array<number>
}

export const makeStore = (preloadedState?: PreloadedState) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware).concat(persistBookmarks),
    preloadedState,
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
