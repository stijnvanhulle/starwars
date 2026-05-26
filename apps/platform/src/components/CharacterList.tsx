'use client'

import Box from '@mui/material/Box'
import NextLink from 'next/link'
import { CharacterCard, StatePanel } from '@stijnvanhulle/components'
import { useListCharactersQuery } from '@/store/api'

/**
 * Responsive grid of character cards for the home page. Each card links to its detail page
 * and is keyed by the character id, never the array index.
 */
export function CharacterList() {
  const { data, isLoading, isError, error } = useListCharactersQuery()

  if (isLoading) return <StatePanel variant="loading" />
  if (isError) return <StatePanel variant="error" description={(error as { message?: string } | undefined)?.message ?? 'Request failed.'} />

  const characters = data ?? []
  if (characters.length === 0) return <StatePanel variant="empty" description="No characters to show." />

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 4 }}>
      {characters.map((character) => (
        <NextLink key={character.id} href={`/characters/${character.id}`} style={{ textDecoration: 'none' }}>
          <CharacterCard name={character.name} image={character.image} />
        </NextLink>
      ))}
    </Box>
  )
}
