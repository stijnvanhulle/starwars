export { CHARACTER_PAGE_SIZE } from '@/constants'

/**
 * Returns the slice of `items` for the given 1-based page, clamping out-of-range pages.
 */
export function paginate<T>(items: ReadonlyArray<T>, page: number, size: number): Array<T> {
  if (items.length === 0 || size <= 0) return []
  const totalPages = Math.max(1, Math.ceil(items.length / size))
  const clamped = Math.min(Math.max(1, Math.trunc(page)), totalPages)
  const start = (clamped - 1) * size

  return items.slice(start, start + size)
}
