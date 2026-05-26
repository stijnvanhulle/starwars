'use client'

import { TeamMemberRow, TeamSidebar } from '@stijnvanhulle/components'
import { useRemoveTeamMemberMutation } from '@/store/api'
import { useTeamRoster } from './useTeamRoster'

/**
 * Data-bound wrapper around the presentational `TeamSidebar`. Joins the team to the character
 * list and renders one compact row per member, keyed by the member id.
 */
export function TeamSidebarContainer() {
  const { rows } = useTeamRoster()
  const [removeTeamMember] = useRemoveTeamMemberMutation()

  return (
    <TeamSidebar count={rows.length}>
      {rows.length > 0
        ? rows.map(({ member, character }) => (
            <TeamMemberRow
              key={member.id}
              variant="compact"
              name={character?.name ?? `Character ${member.characterId}`}
              image={character?.image}
              onRemove={() => removeTeamMember(member.characterId)}
            />
          ))
        : undefined}
    </TeamSidebar>
  )
}
