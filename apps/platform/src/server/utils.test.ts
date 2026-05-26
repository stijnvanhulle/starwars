import { describe, expect, it } from 'vitest'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { ERRORS } from './constants'
import { createError, isDomainError, toCharacter } from './utils'

describe('utils', () => {
  describe('createError', () => {
    it('builds a tagged DomainError with statusCode, code, message, data and cause', () => {
      const cause = new Error('upstream returned 500')
      const err = createError({
        ...ERRORS.NOT_FOUND,
        message: 'Character 9999 does not exist.',
        data: { characterId: 9999 },
        cause,
      })

      expect(isDomainError(err)).toBe(true)
      expect(err.name).toBe('DomainError')
      expect(err.statusCode).toBe(404)
      expect(err.code).toBe('NOT_FOUND')
      expect(err.message).toBe('Character 9999 does not exist.')
      expect(err.data).toEqual({ characterId: 9999 })
      expect(err.cause).toBe(cause)
    })

    it('omits data when not passed', () => {
      const err = createError({ ...ERRORS.TEAM_FULL, message: 'Full.' })

      expect(err.data).toBeUndefined()
    })
  })

  describe('ERRORS table', () => {
    it.each([['NOT_FOUND', 404] as const, ['ALREADY_MEMBER', 409] as const, ['TEAM_FULL', 422] as const, ['EVIL_FORBIDDEN', 422] as const])(
      '%s maps to %i',
      (code, statusCode) => {
        expect(ERRORS[code]).toEqual({ statusCode, code })
      },
    )
  })

  describe('isDomainError', () => {
    it('returns false for plain errors and non-errors', () => {
      expect(isDomainError(new Error('plain'))).toBe(false)
      expect(isDomainError({ name: 'DomainError' })).toBe(false)
      expect(isDomainError(null)).toBe(false)
    })
  })

  describe('toCharacter', () => {
    it('drops fields the contract does not list', () => {
      const src = createStarwarsApiCharacter({
        image: 'luke.jpg',
        affiliations: ['Jedi Order'],
        formerAffiliations: ['Rebel Alliance'],
        masters: ['Obi-Wan Kenobi'],
      })
      expect(toCharacter(src)).toMatchInlineSnapshot(`
        {
          "affiliations": [
            "Jedi Order",
          ],
          "id": 1,
          "image": "luke.jpg",
          "masters": [
            "Obi-Wan Kenobi",
          ],
          "name": "Luke Skywalker",
        }
      `)
    })

    it('passes masters through unchanged including parenthetical role suffix', () => {
      const out = toCharacter(
        createStarwarsApiCharacter({
          id: 2,
          name: 'Anakin',
          masters: ['Obi-Wan Kenobi', 'Darth Sidious (Sith Master)'],
        }),
      )

      expect(out.masters).toEqual(['Obi-Wan Kenobi', 'Darth Sidious (Sith Master)'])
    })

    it('keeps missing optional fields absent on the output', () => {
      const out = toCharacter(createStarwarsApiCharacter({ id: 3, name: 'R2-D2' }))

      expect(Object.keys(out).sort()).toEqual(['id', 'name'])
    })
  })
})
