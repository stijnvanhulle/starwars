import type { CharacterCardChip } from './CharacterCard'

const DARTH_OR_SITH = /darth|sith/i

/**
 * Picks the corner chip for a `CharacterCard` from team membership and dark-side flags.
 */
export function pickChip(character: { name: string; affiliations?: ReadonlyArray<string> }, onTeam: boolean): CharacterCardChip | undefined {
  if (onTeam) return 'on-team'
  if (DARTH_OR_SITH.test(character.name)) return 'dark-side'
  if ((character.affiliations ?? []).some((affiliation) => DARTH_OR_SITH.test(affiliation))) return 'dark-side'

  return undefined
}
