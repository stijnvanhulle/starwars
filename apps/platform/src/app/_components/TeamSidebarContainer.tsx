'use client'

import Box from '@mui/material/Box'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RosterSkeleton, TeamMemberRow, TeamSidebar } from '@stijnvanhulle/components'
import { useGetTeamQuery, useListCharactersQuery, useRemoveTeamMemberMutation } from '@/store/api'

const CTA_BASE = {
  display: 'block',
  width: '100%',
  py: 2.5,
  px: 4,
  borderRadius: 9999,
  fontSize: 13,
  fontWeight: 700,
  textAlign: 'center' as const,
  textDecoration: 'none',
}

export function TeamSidebarContainer() {
  const pathname = usePathname()
  const team = useGetTeamQuery()
  const characters = useListCharactersQuery()
  const [removeMember] = useRemoveTeamMemberMutation()

  const rows = (team.data ?? []).map((member) => {
    const character = characters.data?.find((c) => c.id === member.characterId)
    return {
      key: member.id,
      characterId: member.characterId,
      name: character?.name ?? `Character ${member.characterId}`,
      image: character?.image,
    }
  })

  const onTeamPage = pathname === '/team'
  const cta = onTeamPage ? (
    <Box
      component={Link}
      href="/"
      sx={{
        ...CTA_BASE,
        bgcolor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        color: '#121A52',
        '&:hover': { borderColor: '#FF348A', color: '#E61F75' },
      }}
    >
      + Add characters
    </Box>
  ) : (
    <Box
      component={Link}
      href="/team"
      sx={{
        ...CTA_BASE,
        bgcolor: '#1E2A8D',
        border: 'none',
        color: '#FFFFFF',
        '&:hover': { bgcolor: '#152178' },
      }}
    >
      Manage team
    </Box>
  )

  return (
    <TeamSidebar count={rows.length} cta={cta}>
      {team.isLoading ? (
        <RosterSkeleton />
      ) : rows.length === 0 ? null : (
        rows.map((row) => <TeamMemberRow key={row.key} name={row.name} image={row.image} variant="compact" onRemove={() => removeMember(row.characterId)} />)
      )}
    </TeamSidebar>
  )
}
