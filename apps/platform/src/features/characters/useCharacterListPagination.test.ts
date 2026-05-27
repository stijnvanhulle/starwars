import { describe, expect, it } from 'vitest'
import { resolvePagination } from './useCharacterListPagination'

const items = Array.from({ length: 87 }, (_, i) => i + 1)

describe('resolvePagination', () => {
  it('defaults to page 1 when the param is missing', () => {
    expect(resolvePagination({ items, pageParam: null, size: 24 }).page).toBe(1)
  })

  it('defaults to page 1 when the param is invalid', () => {
    expect(resolvePagination({ items, pageParam: 'banana', size: 24 }).page).toBe(1)
  })

  it('clamps an over-range page to the last page', () => {
    expect(resolvePagination({ items, pageParam: '99', size: 24 }).page).toBe(4)
  })

  it('returns totalPages = 1 for an empty list', () => {
    expect(resolvePagination({ items: [], pageParam: '3', size: 24 })).toMatchObject({ page: 1, totalPages: 1, pageItems: [] })
  })

  it('slices the correct window for a mid-range page', () => {
    const result = resolvePagination({ items, pageParam: '2', size: 24 })
    expect(result.pageItems).toHaveLength(24)
    expect(result.pageItems[0]).toBe(25)
  })
})
