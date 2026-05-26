'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { CharacterList, type CharacterListItem, pickChip } from '@stijnvanhulle/components'
import { describeApiError } from '@/lib/apiError'
import { useGetTeamQuery, useListCharactersQuery } from '@/store/api'

export default function HomePage() {
  const router = useRouter()
  const { data, isLoading, isError, error } = useListCharactersQuery()
  const team = useGetTeamQuery()
  const teamIds = new Set((team.data ?? []).map((m) => m.characterId))

  const state = isLoading ? 'loading' : isError ? 'error' : 'success'
  const characters: Array<CharacterListItem> = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    image: c.image,
    chip: pickChip(c, teamIds.has(c.id)),
  }))

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

      <CharacterList state={state} characters={characters} errorMessage={describeApiError(error) ?? undefined} onSelect={(id) => router.push(`/characters/${id}`)} />
    </Box>
  )
}
