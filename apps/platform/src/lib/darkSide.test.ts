import { describe, expect, it } from 'vitest'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { isDarkSide } from './darkSide'

describe('isDarkSide', () => {
  it('returns false on an empty character', () => {
    expect(isDarkSide(createStarwarsApiCharacter({ name: 'Neutral' }))).toBe(false)
  })

  it('flags rule 1 by name (case-insensitive)', () => {
    expect(isDarkSide(createStarwarsApiCharacter({ name: 'Darth Vader' }))).toBe(true)
    expect(isDarkSide(createStarwarsApiCharacter({ name: 'sith Lord' }))).toBe(true)
  })

  it('flags rule 2 by current affiliation', () => {
    expect(isDarkSide(createStarwarsApiCharacter({ name: 'X', affiliations: ['Sith Order'] }))).toBe(true)
  })

  it('short-circuits rule 2 on empty affiliations', () => {
    expect(isDarkSide(createStarwarsApiCharacter({ name: 'X', affiliations: [] }))).toBe(false)
  })

  it('flags rule 3 when a master matches "Darth" (substring tolerates role suffix)', () => {
    expect(isDarkSide(createStarwarsApiCharacter({ name: 'X', masters: ['Darth Sidious (Sith Master)'] }))).toBe(true)
  })

  it('does not flag rule 3 on benign masters', () => {
    expect(isDarkSide(createStarwarsApiCharacter({ name: 'X', masters: ['Obi-Wan Kenobi'] }))).toBe(false)
  })

  it('short-circuits rule 3 on empty masters', () => {
    expect(isDarkSide(createStarwarsApiCharacter({ name: 'X', masters: [] }))).toBe(false)
  })
})
