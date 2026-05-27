import { describe, expect, it } from 'vitest'
import { paginate } from './pagination'

const ALL = Array.from({ length: 87 }, (_, i) => i + 1)

describe('paginate', () => {
  it('returns an empty window when the source is empty', () => {
    expect(paginate([], 1, 24)).toEqual([])
  })

  it('returns the first window for page 1', () => {
    expect(paginate(ALL, 1, 24)).toEqual(ALL.slice(0, 24))
  })

  it('returns the last (partial) window for the last page', () => {
    const last = paginate(ALL, 4, 24)
    expect(last).toHaveLength(15)
    expect(last[0]).toBe(73)
    expect(last.at(-1)).toBe(87)
  })

  it('clamps overshoot pages to the last window', () => {
    expect(paginate(ALL, 99, 24)).toEqual(paginate(ALL, 4, 24))
  })
})
