'use client'

import { useGetTeamQuery, useListCharactersQuery } from '@/store/api'
import type { Character, TeamMember } from '@/gen/api'

export type RosterRow = {
  member: TeamMember
  character: Character | undefined
}

/**
 * Joins the active team to the cached character list so callers get a name and image alongside
 * each member. Surfaces the combined loading and error state of both queries.
 */
export function useTeamRoster() {
  const team = useGetTeamQuery()
  const characters = useListCharactersQuery()

  const byId = new Map((characters.data ?? []).map((character) => [character.id, character]))
  const rows: Array<RosterRow> = (team.data ?? []).map((member) => ({ member, character: byId.get(member.characterId) }))

  return {
    rows,
    isLoading: team.isLoading || characters.isLoading,
    isError: team.isError || characters.isError,
    error: (team.error ?? characters.error) as { message?: string } | undefined,
  }
}
