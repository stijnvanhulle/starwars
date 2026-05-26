'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ProgressPill, StatePanel, TeamListSkeleton, TeamMemberRow } from '@stijnvanhulle/components'
import { describeApiError } from '@/lib/apiError'
import { useGetTeamQuery, useListCharactersQuery, useRemoveTeamMemberMutation } from '@/store/api'

const TEAM_CAP = 5

export default function TeamPage() {
  const team = useGetTeamQuery()
  const list = useListCharactersQuery()
  const [removeMember, removeState] = useRemoveTeamMemberMutation()

  if (team.isLoading) return <TeamListSkeleton />
  if (team.isError) {
    return <StatePanel variant="error" description={describeApiError(team.error) ?? undefined} />
  }

  const rows = (team.data ?? []).map((member) => {
    const character = list.data?.find((c) => c.id === member.characterId)
    return {
      key: member.id,
      characterId: member.characterId,
      name: character?.name ?? `Character ${member.characterId}`,
      image: character?.image,
    }
  })

  return (
    <Box>
      <Stack direction="row" spacing={6} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: 40,
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#121A52',
          }}
        >
          Your team
        </Typography>
        <ProgressPill current={rows.length} total={TEAM_CAP} />
      </Stack>
      {removeState.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {describeApiError(removeState.error)}
        </Alert>
      )}
      {rows.length === 0 ? (
        <StatePanel variant="empty" title="Your team is empty" description="Pick characters from the home page to start building your team." />
      ) : (
        <Stack spacing={3}>
          {rows.map((row) => (
            <TeamMemberRow key={row.key} name={row.name} image={row.image} onRemove={() => removeMember(row.characterId)} />
          ))}
        </Stack>
      )}
    </Box>
  )
}
