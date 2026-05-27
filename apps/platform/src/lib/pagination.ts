export { CHARACTER_PAGE_SIZE } from '@/constants'

/**
 * Return the slice of `items` that belongs on a given 1-based page. Empty
 * arrays return an empty window; out-of-range page numbers clamp to the last
 * valid page so a bad URL never renders an empty grid.
 */
export function paginate<T>(items: ReadonlyArray<T>, page: number, size: number): Array<T> {
  if (items.length === 0 || size <= 0) return []
  const totalPages = Math.max(1, Math.ceil(items.length / size))
  const clamped = Math.min(Math.max(1, Math.trunc(page)), totalPages)
  const start = (clamped - 1) * size

  return items.slice(start, start + size)
}
