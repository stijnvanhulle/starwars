const DARTH_OR_SITH = /darth|sith/i
const DARTH = /darth/i

/**
 * Upstream `starwars-api` is inconsistent: `masters` (and occasionally
 * `affiliations`) lands as a plain string on a handful of records (e.g. Leia,
 * Palpatine, Darth Maul). Coerce to an array so the predicate never blows up
 * on `.some` for a non-array value.
 */
function toArray(value: unknown): ReadonlyArray<string> {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string')
  return []
}

export type DarkSideCandidate = {
  name: string
  affiliations?: unknown
  masters?: unknown
}

/**
 * Three-rule predicate, OR'd left to right. Each rule short-circuits to false
 * when its source array is empty so a partial upstream payload never flips a
 * character to evil. Shared between the API server (full
 * `StarwarsApiCharacter`) and the browser (proxied `Character` without
 * `masters`); the missing field is treated as empty.
 */
export function isDarkSide(character: DarkSideCandidate): boolean {
  if (DARTH_OR_SITH.test(character.name)) return true
  if (toArray(character.affiliations).some((a) => DARTH_OR_SITH.test(a))) return true
  if (toArray(character.masters).some((m) => DARTH.test(m))) return true
  return false
}
