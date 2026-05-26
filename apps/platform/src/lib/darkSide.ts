import type { StarwarsApiCharacter } from '@/server/starwars-api'

/**
 * Returns whether a character is on the dark side. Stub for Slice 004.
 * TODO(006): real rules, see data-model.md (affiliation + masters substring checks).
 */
export function isDarkSide(_character: StarwarsApiCharacter): boolean {
  return false
}
