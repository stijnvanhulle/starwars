'use client'

import Button from '@mui/material/Button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TeamSidebarSkeleton, TeamMemberRow, TeamSidebar } from '@whale/components'
import { useGetTeamQuery, useListCharactersQuery, useRemoveTeamMemberMutation } from '@/store/api'

export function TeamSidebarContainer() {
  const pathname = usePathname()
  const team = useGetTeamQuery()
  const characters = useListCharactersQuery()
  const [removeMember] = useRemoveTeamMemberMutation()

  const rows = (team.data ?? []).map((member) => {
    const character = characters.data?.find((candidate) => candidate.id === member.characterId)
    return {
      key: member.id,
      characterId: member.characterId,
      name: character?.name ?? `Character ${member.characterId}`,
      image: character?.image,
    }
  })

  const onTeamPage = pathname === '/team'
  const cta = onTeamPage ? (
    <Button
      component={Link}
      href="/"
      variant="outlined"
      fullWidth
      sx={{
        py: 1.5,
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 700,
        bgcolor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 1.5,
        color: '#121A52',
        '&:hover': { borderColor: '#FF348A', color: '#E61F75', borderWidth: 1.5 },
      }}
    >
      + Add characters
    </Button>
  ) : (
    <Button
      component={Link}
      href="/team"
      variant="contained"
      disableElevation
      fullWidth
      sx={{
        py: 1.5,
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 700,
        bgcolor: '#1E2A8D',
        '&:hover': { bgcolor: '#152178' },
      }}
    >
      Manage team
    </Button>
  )

  return (
    <TeamSidebar count={rows.length} cta={cta}>
      {team.isLoading ? (
        <TeamSidebarSkeleton />
      ) : rows.length === 0 ? null : (
        rows.map((row) => <TeamMemberRow key={row.key} name={row.name} image={row.image} variant="compact" onRemove={() => removeMember(row.characterId)} />)
      )}
    </TeamSidebar>
  )
}
