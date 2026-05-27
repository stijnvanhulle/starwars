import type { Character } from '@/gen/api'
import type { DomainErrorCode } from '@/constants'
import type { StarwarsApiCharacter } from './starwars-api'

export type { Character } from '@/gen/api'

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
 * Builds a tagged `DomainError` carrying an HTTP status and contract error code.
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
  /**
   * Collapse unknown errors to 404 NOT_FOUND (used by the character proxy routes).
   */
  upstreamAsNotFound?: boolean
}

export type MappedError = {
  status: number
  body: Record<string, unknown>
}

/**
 * Translates a thrown value into a safe `{ status, body }` envelope, logging unmapped errors.
 */
export function mapError({ error, upstreamAsNotFound = false }: MapErrorParams): MappedError {
  if (isDomainError(error)) {
    return { status: error.statusCode, body: { code: error.code, message: error.message } }
  }
  if (upstreamAsNotFound) {
    return { status: 404, body: { code: 'NOT_FOUND', message: 'Character does not exist.' } }
  }
  console.error('[api] unhandled error', error)
  return { status: 502, body: { message: 'Something went wrong. Please try again.' } }
}

const CHARACTER_KEYS = ['id', 'name', 'image', 'height', 'mass', 'affiliations', 'masters'] as const
const ARRAY_KEYS = new Set<string>(['affiliations', 'masters'])

/**
 * Narrows the upstream payload to the contract `Character`, coercing stringy arrays.
 */
export function toCharacter(src: StarwarsApiCharacter): Character {
  return Object.fromEntries(
    CHARACTER_KEYS.flatMap((key) => {
      const value = src[key]
      if (value === undefined) return []
      if (ARRAY_KEYS.has(key) && typeof value === 'string') return [[key, [value]]]
      return [[key, value]]
    }),
  ) as unknown as Character
}
