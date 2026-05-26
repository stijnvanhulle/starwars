import type { Team, TeamMember } from '@/db/schema'
import type { Character } from '@/server/utils'
import type { StarwarsApiCharacter } from '@/server/starwars-api'

const DEFAULT_TEAM_ID = '00000000-0000-0000-0000-000000000001'

export function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: DEFAULT_TEAM_ID,
    slug: 'default',
    name: 'Default team',
    createdAt: new Date('2026-05-22T10:15:30.000Z'),
    ...overrides,
  }
}

export function createTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'row-1',
    teamId: DEFAULT_TEAM_ID,
    characterId: 1,
    addedAt: new Date('2026-05-22T10:15:30.000Z'),
    deletedAt: null,
    ...overrides,
  }
}

export function createStarwarsApiCharacter(overrides: Partial<StarwarsApiCharacter> = {}): StarwarsApiCharacter {
  return {
    id: 1,
    name: 'Luke Skywalker',
    ...overrides,
  }
}

export function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 1,
    name: 'Luke Skywalker',
    ...overrides,
  }
}
