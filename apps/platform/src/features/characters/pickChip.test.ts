import { describe, expect, it } from 'vitest'
import { pickChip } from './pickChip'

describe('pickChip', () => {
  it('returns on-team when the character is on the team', () => {
    expect(pickChip({ name: 'Luke Skywalker' }, true)).toBe('on-team')
  })

  it('flags dark-side when the name contains Darth', () => {
    expect(pickChip({ name: 'Darth Vader' }, false)).toBe('dark-side')
  })

  it('flags dark-side when an affiliation contains Sith', () => {
    expect(pickChip({ name: 'Asajj Ventress', affiliations: ['Sith Order'] }, false)).toBe('dark-side')
  })

  it('flags dark-side when a master is named Darth', () => {
    expect(pickChip({ name: 'Anakin Skywalker', masters: ['Darth Sidious (Sith Master)'] }, false)).toBe('dark-side')
  })

  it('returns undefined for a neutral character not on the team', () => {
    expect(pickChip({ name: 'Luke Skywalker', affiliations: ['Jedi Order'] }, false)).toBeUndefined()
  })
})
