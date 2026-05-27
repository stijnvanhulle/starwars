import type { TeamMember } from '@/db/schema'
import type { teamMemberRepository } from '@/server/repositories/teamMemberRepository'
import type { StarwarsApiCharacter } from '@/server/starwars-api'
import { errors, TEAM_CAP } from '@/constants'
import { createError } from '@/server/utils'

type MemberRepo = typeof teamMemberRepository
type FetchCharacter = (id: number) => Promise<StarwarsApiCharacter | null>
type IsDarkSide = (character: StarwarsApiCharacter) => boolean

type ListTeamMembersParams = {
  memberRepo: MemberRepo
  teamId: string
}

type AddTeamMemberParams = {
  memberRepo: MemberRepo
  fetchCharacter: FetchCharacter
  isDarkSide: IsDarkSide
  teamId: string
  characterId: number
}

type RemoveTeamMemberParams = {
  memberRepo: MemberRepo
  teamId: string
  characterId: number
}

export async function listTeamMembers({ memberRepo, teamId }: ListTeamMembersParams): Promise<Array<TeamMember>> {
  return memberRepo.findAllByTeam({ teamId })
}

export async function addTeamMember({ memberRepo, fetchCharacter, isDarkSide, teamId, characterId }: AddTeamMemberParams): Promise<TeamMember> {
  const character = await fetchCharacter(characterId)
  if (character === null) {
    throw createError({ ...errors.notFound, message: `Character ${characterId} does not exist.`, data: { characterId } })
  }
  if (isDarkSide(character)) {
    throw createError({
      ...errors.evilForbidden,
      message: `${character.name} is evil and cannot join the team.`,
      data: { characterId },
    })
  }
  // The repositories share the global db handle. The partial unique index on
  // (team_id, character_id) WHERE deleted_at IS NULL catches the duplicate race;
  // the cap race window is narrow and acceptable for the single-team scope.
  const existing = await memberRepo.findByTeamAndCharacterId({ teamId, characterId })
  if (existing !== undefined) {
    throw createError({
      ...errors.alreadyMember,
      message: `Character ${characterId} is already on the team.`,
      data: { characterId },
    })
  }
  const current = await memberRepo.countByTeam({ teamId })
  if (current >= TEAM_CAP) {
    throw createError({ ...errors.teamFull, message: `The team already has ${TEAM_CAP} members.`, data: { cap: TEAM_CAP } })
  }
  return memberRepo.insert({ teamId, characterId })
}

export async function removeTeamMember({ memberRepo, teamId, characterId }: RemoveTeamMemberParams): Promise<void> {
  await memberRepo.deleteByTeamAndCharacterId({ teamId, characterId })
}
