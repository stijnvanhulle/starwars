import { z } from 'zod'
import { firstOf } from '../lib/utils'

/**
 * Positive integer `characterId`. Accepts a query-string value (raw string, or the
 * `string[]` Next.js hands back for repeated keys) and coerces it to a number.
 */
export const characterIdSchema = z.preprocess(firstOf, z.coerce.number().int().min(1))

/**
 * `POST /api/team` body. Matches `AddTeamMemberRequest` in `api.openapi.yaml`.
 */
export const addTeamMemberBodySchema = z.object({
  characterId: z.number().int().min(1),
})

export type AddTeamMemberBody = z.infer<typeof addTeamMemberBodySchema>
