import { isDarkSide } from '@/lib/darkSide'
import type { CharacterCardChip } from './CharacterCard'

/**
 * Picks the corner chip for a `CharacterCard` from team membership and dark-side flags.
 */
export function pickChip(
  character: { name: string; affiliations?: ReadonlyArray<string>; masters?: ReadonlyArray<string> },
  onTeam: boolean,
): CharacterCardChip | undefined {
  if (onTeam) return 'on-team'
  if (isDarkSide(character)) return 'dark-side'

  return undefined
}
