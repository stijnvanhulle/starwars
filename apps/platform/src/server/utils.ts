import { errorMessage } from '../lib/utils'
import type { DomainErrorCode } from './constants'
import type { StarwarsApiCharacter } from './starwars-api'

export type DomainError = Error & {
  readonly name: 'DomainError'
  readonly statusCode: number
  readonly code: DomainErrorCode
  readonly data?: Record<string, unknown>
}

type CreateErrorParams = {
  statusCode: number
  code: DomainErrorCode
  message: string
  data?: Record<string, unknown>
  cause?: unknown
}

/**
 * Builds a tagged domain error. Shape mirrors Nuxt's `createError`. Spread the matching
 * entry from `ERRORS` in `./constants`:
 *
 * ```ts
 * throw createError({ ...ERRORS.NOT_FOUND, message: `Character ${id} does not exist.` })
 * ```
 *
 * The wire body in `mapError` stays `{ code, message }` to match `api.openapi.yaml`'s
 * `Error` schema. `data` and `cause` are operational metadata only.
 */
export function createError(params: CreateErrorParams): DomainError {
  const err = new Error(params.message, { cause: params.cause }) as Error & {
    name: 'DomainError'
    statusCode: number
    code: DomainErrorCode
    data?: Record<string, unknown>
  }
  err.name = 'DomainError'
  err.statusCode = params.statusCode
  err.code = params.code
  if (params.data !== undefined) err.data = params.data
  return err
}

export function isDomainError(value: unknown): value is DomainError {
  return value instanceof Error && (value as { name?: string }).name === 'DomainError'
}

type MapErrorParams = {
  error: unknown
  /** When true, raw thrown errors collapse to a 404 NOT_FOUND (used by the character proxy routes). */
  upstreamAsNotFound?: boolean
}

export type MappedError = {
  status: number
  body: Record<string, unknown>
}

/**
 * Funnels thrown values into HTTP responses. Services and the proxy fetcher throw plain
 * errors. Route handlers call this and write `res.status(status).json(body)`.
 *
 * - `DomainError` returns the documented status + `{ code, message }` body.
 * - On the character proxy (`upstreamAsNotFound: true`), unknown errors collapse to
 *   `404 NOT_FOUND` so `api.openapi.yaml`'s error enum stays closed.
 * - On the team routes, unknown errors surface as an undocumented `502` with a plain
 *   `{ message }` body for operational diagnostics.
 */
export function mapError({ error, upstreamAsNotFound = false }: MapErrorParams): MappedError {
  if (isDomainError(error)) {
    return { status: error.statusCode, body: { code: error.code, message: error.message } }
  }
  if (upstreamAsNotFound) {
    return { status: 404, body: { code: 'NOT_FOUND', message: 'Character does not exist.' } }
  }
  console.error('[api] unhandled error', error)
  return { status: 502, body: { message: errorMessage(error, 'Upstream request failed.') } }
}

export type Character = {
  id: number
  name: string
  image?: string
  height?: number
  mass?: number
  affiliations?: Array<string>
  masters?: Array<string>
}

const CHARACTER_KEYS = ['id', 'name', 'image', 'height', 'mass', 'affiliations', 'masters'] as const

/**
 * Narrows a starwars-api payload to the `Character` shape from `api.openapi.yaml`.
 * Drops fields the contract does not list (e.g. `formerAffiliations`) and passes
 * `masters` through unchanged. Absent optional fields stay absent on the output
 * (not set to `undefined`).
 */
export function toCharacter(src: StarwarsApiCharacter): Character {
  return Object.fromEntries(CHARACTER_KEYS.flatMap((key) => (src[key] === undefined ? [] : [[key, src[key]]]))) as unknown as Character
}
