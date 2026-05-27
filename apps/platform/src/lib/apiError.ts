import type { ErrorCodeEnumKey } from '@/gen/api'

const CODE_COPY = {
  NOT_FOUND: 'That character does not exist.',
  ALREADY_MEMBER: 'That character is already on the team.',
  TEAM_FULL: 'Your team is full. Remove someone first.',
  EVIL_FORBIDDEN: 'Evil characters cannot join the team.',
} as const satisfies Record<ErrorCodeEnumKey, string>

/**
 * Pick a user-facing message for any RTK Query error shape (our tagged
 * `ClientError` or the built-in `SerializedError`). Prefers the server's
 * `message`, falls back to a code-specific copy line, then to the generic
 * fallback. Returns null when there is no error to show.
 */
export function describeApiError(error: { message?: string; code?: string } | undefined | null, fallback = 'Something went wrong.'): string | null {
  if (error === undefined || error === null) return null
  if (typeof error.message === 'string' && error.message.length > 0) return error.message
  if (typeof error.code === 'string' && error.code in CODE_COPY) {
    return CODE_COPY[error.code as ErrorCodeEnumKey]
  }
  return fallback
}
