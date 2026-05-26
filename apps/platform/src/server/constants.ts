export type DomainErrorCode = 'NOT_FOUND' | 'ALREADY_MEMBER' | 'TEAM_FULL' | 'EVIL_FORBIDDEN'

type ErrorTemplate = {
  statusCode: number
  code: DomainErrorCode
}

/**
 * Status + code pairs for every domain error. Spread into `createError(...)`:
 *
 * ```ts
 * throw createError({ ...ERRORS.NOT_FOUND, message: `Character ${id} does not exist.` })
 * ```
 *
 * Adding a new code: extend `DomainErrorCode` above, append the entry here, and
 * `api.openapi.yaml`'s `Error.code` enum.
 */
export const ERRORS = {
  NOT_FOUND: { statusCode: 404, code: 'NOT_FOUND' },
  ALREADY_MEMBER: { statusCode: 409, code: 'ALREADY_MEMBER' },
  TEAM_FULL: { statusCode: 422, code: 'TEAM_FULL' },
  EVIL_FORBIDDEN: { statusCode: 422, code: 'EVIL_FORBIDDEN' },
} as const satisfies Record<string, ErrorTemplate>

export const TEAM_CAP = 5
