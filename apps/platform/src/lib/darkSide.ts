import type { StarwarsApiCharacter } from '@/server/starwars-api'

const DARTH_OR_SITH = /darth|sith/i
const DARTH = /darth/i

/**
 * Three-rule predicate, OR'd left to right. Each rule short-circuits to false
 * when its source array is absent so a partial upstream payload never flips a
 * character to evil.
 */
export function isDarkSide(character: StarwarsApiCharacter): boolean {
  if (DARTH_OR_SITH.test(character.name)) return true
  if ((character.affiliations ?? []).some((a) => DARTH_OR_SITH.test(a))) return true
  if ((character.masters ?? []).some((m) => DARTH.test(m))) return true
  return false
}
