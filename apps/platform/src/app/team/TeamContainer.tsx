'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ProgressPill, StatePanel, TeamListSkeleton, TeamMemberRow } from '@whale/components'
import { useTeamRows } from './useTeamRows'
import { describeApiError } from '@/lib/apiError'

const TEAM_CAP = 5

export function TeamContainer() {
  const { rows, isLoading, isError, error, removeMember, removeState } = useTeamRows()

  if (isLoading) return <TeamListSkeleton />
  if (isError) {
    return <StatePanel variant="error" description={describeApiError(error) ?? undefined} />
  }

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
            color: 'text.primary',
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
