/**
 * Domain error codes from the API contract (`Error.code` in `api.openapi.yaml`).
 */
export type DomainErrorCode = 'NOT_FOUND' | 'ALREADY_MEMBER' | 'TEAM_FULL' | 'EVIL_FORBIDDEN'

/**
 * HTTP status + contract code pairs for every domain error, spread into `createError`.
 */
export const errors = {
  notFound: { statusCode: 404, code: 'NOT_FOUND' },
  alreadyMember: { statusCode: 409, code: 'ALREADY_MEMBER' },
  teamFull: { statusCode: 422, code: 'TEAM_FULL' },
  evilForbidden: { statusCode: 422, code: 'EVIL_FORBIDDEN' },
} as const satisfies Record<string, { statusCode: number; code: DomainErrorCode }>

/**
 * Maximum number of active members on the default team.
 */
export const TEAM_MAX = 5

/**
 * Number of character cards displayed per page on the home grid.
 */
export const CHARACTER_PAGE_SIZE = 24

/**
 * `localStorage` key under which bookmark character ids are persisted.
 */
export const BOOKMARK_STORAGE_KEY = 'whale.bookmarks.v1'

/**
 * Upstream starwars-api coordinates, shared between the server fetcher and MSW stubs.
 */
export const starwarsApi = {
  source: 'https://akabab.github.io/starwars-api/api',
  fixtureFlag: 'E2E_FIXTURES',
  fixturePath: 'e2e/fixtures/characters.json',
} as const
