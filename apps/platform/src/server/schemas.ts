import { z } from 'zod'
import { firstOf } from '@/lib/utils'

/**
 * Positive integer `characterId`. Accepts a query-string value (raw string, or the
 * `string[]` Next.js hands back for repeated keys) and coerces it to a number.
 */
export const characterIdSchema = z.preprocess(firstOf, z.coerce.number().int().min(1))
