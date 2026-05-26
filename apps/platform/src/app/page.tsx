'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { CharacterListSkeleton, StatePanel, pickChip } from '@stijnvanhulle/components'
import { CharacterCard } from '@/components/CharacterCard/CharacterCard'
import { describeApiError } from '@/lib/apiError'
import { useGetTeamQuery, useListCharactersQuery } from '@/store/api'

export default function HomePage() {
  const router = useRouter()
  const { data, isLoading, isError, error } = useListCharactersQuery()
  const team = useGetTeamQuery()
  const teamIds = new Set((team.data ?? []).map((m) => m.characterId))

  return (
    <Box>
      <Box sx={{ maxWidth: 720, mb: 8 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: 40,
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#121A52',
            mb: 2,
          }}
        >
          Star Wars characters
        </Typography>
        <Typography sx={{ fontSize: 16, lineHeight: 1.5, color: '#334155' }}>Pick five characters for your team. Evil characters can&apos;t join.</Typography>
      </Box>

      {isLoading && <CharacterListSkeleton />}

      {isError && <StatePanel variant="error" description={describeApiError(error) ?? undefined} />}

      {!isLoading && !isError && (data === undefined || data.length === 0) && <StatePanel variant="empty" />}

      {data && data.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 6,
          }}
        >
          {data.map((c) => (
            <CharacterCard key={c.id} name={c.name} image={c.image} chip={pickChip(c, teamIds.has(c.id))} onClick={() => router.push(`/characters/${c.id}`)} />
          ))}
        </Box>
      )}
    </Box>
  )
}
