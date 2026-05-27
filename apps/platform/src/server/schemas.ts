import { z } from 'zod'
import { firstOf } from '@/lib/utils'

/**
 * Positive integer character id, coerced from query-string input.
 */
export const characterIdSchema = z.preprocess(firstOf, z.coerce.number().int().min(1))

/**
 * Positive integer page number, coerced from query-string input.
 */
export const pageNumberSchema = z.preprocess(firstOf, z.coerce.number().int().min(1))

/**
 * Array of positive integer bookmark ids as persisted in localStorage.
 */
export const bookmarkIdsSchema = z.array(z.number().int().positive())
