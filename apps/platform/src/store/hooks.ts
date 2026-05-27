import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

/**
 * Typed `useDispatch` so callers do not have to re-import `AppDispatch`.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/**
 * Typed `useSelector` so callers do not have to re-import `RootState`.
 */
export const useAppSelector = useSelector.withTypes<RootState>()
