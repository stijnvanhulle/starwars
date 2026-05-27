import type { Character, TeamMember } from '@/gen/api'
import { useGetTeamQuery, useListCharactersQuery, useRemoveTeamMemberMutation } from '@/store/api'

export type TeamRow = {
  key: string
  characterId: number
  name: string
  image: string | undefined
}

/**
 * Joins team members with the character list, falling back to a placeholder name when the
 * character is not in the cached list.
 */
export function buildTeamRows({ team, characters }: { team: ReadonlyArray<TeamMember>; characters: ReadonlyArray<Character> }): Array<TeamRow> {
  return team.map((member) => {
    const character = characters.find((candidate) => candidate.id === member.characterId)

    return {
      key: member.id,
      characterId: member.characterId,
      name: character?.name ?? `Character ${member.characterId}`,
      image: character?.image,
    }
  })
}

/**
 * Reads the team and character list from RTK Query and exposes the rows to render.
 */
export function useTeamRows() {
  const team = useGetTeamQuery()
  const characters = useListCharactersQuery()
  const [removeMember, removeState] = useRemoveTeamMemberMutation()
  const rows = buildTeamRows({ team: team.data ?? [], characters: characters.data ?? [] })

  return { rows, isLoading: team.isLoading, isError: team.isError, error: team.error, removeMember, removeState }
}
