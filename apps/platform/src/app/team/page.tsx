'use client'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { StatePanel, TeamMemberRow } from '@stijnvanhulle/components'
import { useRemoveTeamMemberMutation } from '@/store/api'
import { useTeamRoster } from '@/components/useTeamRoster'

export default function TeamPage() {
  const { rows, isLoading, isError, error } = useTeamRoster()
  const [removeTeamMember] = useRemoveTeamMemberMutation()

  function body() {
    if (isLoading) return <StatePanel variant="loading" />
    if (isError) return <StatePanel variant="error" description={error?.message ?? 'Request failed.'} />
    if (rows.length === 0) return <StatePanel variant="empty" description="No characters yet. Add one from a detail page." />

    return (
      <Box sx={{ display: 'grid', gap: 4 }}>
        {rows.map(({ member, character }) => (
          <TeamMemberRow
            key={member.id}
            name={character?.name ?? `Character ${member.characterId}`}
            image={character?.image}
            onRemove={() => removeTeamMember(member.characterId)}
          />
        ))}
      </Box>
    )
  }

  return (
    <Container>
      <Typography variant="h3" component="h1" gutterBottom>
        Your team
      </Typography>
      {body()}
    </Container>
  )
}
