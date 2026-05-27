import { z } from 'zod'
import { firstOf } from '@/lib/utils'

/**
 * Positive integer `characterId`. Accepts a query-string value (raw string, or the
 * `string[]` Next.js hands back for repeated keys) and coerces it to a number.
 */
export const characterIdSchema = z.preprocess(firstOf, z.coerce.number().int().min(1))

/**
 * Positive integer page number. Accepts a query-string value and coerces to a number.
 */
export const pageNumberSchema = z.preprocess(firstOf, z.coerce.number().int().min(1))

/**
 * Array of positive integer bookmark ids, as persisted in localStorage.
 */
export const bookmarkIdsSchema = z.array(z.number().int().positive())
