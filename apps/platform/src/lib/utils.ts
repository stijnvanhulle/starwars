/**
 * Returns the first element of an array, or the value itself when it isn't an array.
 * Useful for Next.js query params (`string | string[] | undefined`) before piping into
 * a Zod schema.
 */
export function firstOf<T>(value: T | Array<T> | undefined): T | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

/**
 * Extracts a human-readable message from an unknown thrown value, falling back to the
 * given default when the value isn't an `Error` instance.
 */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
