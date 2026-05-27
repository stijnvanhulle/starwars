import type { Character, TeamMember } from '@/gen/api'
import { describeApiError } from '@/lib/apiError'
import { isDarkSide } from '@/lib/darkSide'
import { useAddTeamMemberMutation, useGetTeamQuery, useRemoveTeamMemberMutation } from '@/store/api'

export type TeamStateInputs = {
  character: Character | undefined
  team: ReadonlyArray<TeamMember>
  mutating: boolean
}

export type TeamState = {
  onTeam: boolean
  evil: boolean
  canToggleTeam: boolean
}

/**
 * Derives the membership, evil-gate, and toggle-availability flags for a character. Evil
 * characters can still be removed once they are on the team.
 */
export function computeTeamState({ character, team, mutating }: TeamStateInputs): TeamState {
  if (character === undefined) return { onTeam: false, evil: false, canToggleTeam: false }
  const onTeam = team.some((member) => member.characterId === character.id)
  const evil = isDarkSide(character)
  const canToggleTeam = !mutating && !(evil && !onTeam)

  return { onTeam, evil, canToggleTeam }
}

/**
 * Wires team queries plus add/remove mutations for the given character, exposing flags, a
 * toggle handler, and a user-facing mutation error message.
 */
export function useCharacterTeamState({ character }: { character: Character | undefined }) {
  const team = useGetTeamQuery()
  const [addMember, addState] = useAddTeamMemberMutation()
  const [removeMember, removeState] = useRemoveTeamMemberMutation()
  const mutating = addState.isLoading || removeState.isLoading
  const state = computeTeamState({ character, team: team.data ?? [], mutating })
  const toggleTeam = () => {
    if (character === undefined) return
    if (state.onTeam) removeMember(character.id)
    else addMember({ characterId: character.id })
  }
  const mutationError = describeApiError(addState.error ?? removeState.error)

  return { ...state, mutating, toggleTeam, mutationError }
}
