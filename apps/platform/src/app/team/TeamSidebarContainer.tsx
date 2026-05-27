'use client'

import Button from '@mui/material/Button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TeamMemberRow, TeamSidebar, TeamSidebarSkeleton } from '@whale/components'
import { useTeamRows } from './useTeamRows'
import { useRemoveTeamMemberMutation } from '@/store/api'

export function TeamSidebarContainer() {
  const pathname = usePathname()
  const { rows, isLoading } = useTeamRows()
  const [removeMember] = useRemoveTeamMemberMutation()

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
        bgcolor: 'common.white',
        borderColor: 'divider',
        borderWidth: 1.5,
        color: 'text.primary',
        '&:hover': { borderColor: 'primary.main', color: 'primary.dark', borderWidth: 1.5 },
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
        bgcolor: 'secondary.main',
        '&:hover': { bgcolor: 'secondary.dark' },
      }}
    >
      Manage team
    </Button>
  )

  return (
    <TeamSidebar count={rows.length} cta={cta}>
      {isLoading ? (
        <TeamSidebarSkeleton />
      ) : rows.length === 0 ? null : (
        rows.map((row) => <TeamMemberRow key={row.key} name={row.name} image={row.image} variant="compact" onRemove={() => removeMember(row.characterId)} />)
      )}
    </TeamSidebar>
  )
}
