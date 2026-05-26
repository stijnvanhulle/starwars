import type { CharacterCardChip } from './CharacterCard'

const DARTH_OR_SITH = /darth|sith/i

/**
 * Choose the corner chip for a `CharacterCard` from the character's name and
 * affiliations plus whether they are already on the team. Mirrors the
 * server-side `isDarkSide` rules without the `masters` check (the proxy strips
 * that field from the frontend `Character`).
 */
export function pickChip(character: { name: string; affiliations?: ReadonlyArray<string> }, onTeam: boolean): CharacterCardChip | undefined {
  if (onTeam) return 'on-team'
  if (DARTH_OR_SITH.test(character.name)) return 'dark-side'
  if ((character.affiliations ?? []).some((a) => DARTH_OR_SITH.test(a))) return 'dark-side'

  return undefined
}
