/**
 * Returns the first element if the value is an array, otherwise the value itself.
 */
export function firstOf<T>(value: T | Array<T> | undefined): T | undefined {
  if (Array.isArray(value)) return value[0]

  return value
}

/**
 * Extracts an `Error`'s message, falling back to a provided default.
 */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
