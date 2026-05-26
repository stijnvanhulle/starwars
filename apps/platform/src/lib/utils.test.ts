import { describe, expect, it } from 'vitest'
import { errorMessage, firstOf } from './utils'

describe('firstOf', () => {
  it('returns the first element of an array', () => {
    expect(firstOf(['a', 'b'])).toBe('a')
  })

  it('returns undefined for an empty array', () => {
    expect(firstOf<string>([])).toBeUndefined()
  })

  it('returns the value untouched when it is not an array', () => {
    expect(firstOf('a')).toBe('a')
    expect(firstOf(undefined)).toBeUndefined()
  })
})

describe('errorMessage', () => {
  it('returns the Error message', () => {
    expect(errorMessage(new Error('boom'), 'fallback')).toBe('boom')
  })

  it('returns the fallback for non-Error values', () => {
    expect(errorMessage('string', 'fallback')).toBe('fallback')
    expect(errorMessage(null, 'fallback')).toBe('fallback')
    expect(errorMessage(undefined, 'fallback')).toBe('fallback')
  })
})
