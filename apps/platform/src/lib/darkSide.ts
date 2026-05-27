const DARTH_OR_SITH = /darth|sith/i
const DARTH = /darth/i

/**
 * Coerces an upstream `string | string[]` field into a string array.
 */
function toArray(value: unknown): ReadonlyArray<string> {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === 'string')
  return []
}

export type DarkSideCandidate = {
  name: string
  affiliations?: unknown
  masters?: unknown
}

/**
 * True if the character's name, affiliations, or masters match the dark-side rules.
 */
export function isDarkSide(character: DarkSideCandidate): boolean {
  if (DARTH_OR_SITH.test(character.name)) return true
  if (toArray(character.affiliations).some((affiliation) => DARTH_OR_SITH.test(affiliation))) return true
  if (toArray(character.masters).some((master) => DARTH.test(master))) return true
  return false
}
