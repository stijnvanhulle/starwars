'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { CharacterList, StatePanel, pickChip } from '@whale/components'
import { describeApiError } from '@/lib/apiError'
import { useGetTeamQuery, useListCharactersQuery } from '@/store/api'
import { clear, selectBookmarks } from '@/store/bookmarks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export default function BookmarksPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const bookmarks = useAppSelector(selectBookmarks)
  const { data, isLoading, isError, error } = useListCharactersQuery()
  const team = useGetTeamQuery()

  if (isLoading) {
    return <CharacterList state="loading" />
  }
  if (isError) {
    return <StatePanel variant="error" description={describeApiError(error) ?? undefined} />
  }

  const teamIds = new Set((team.data ?? []).map((member) => member.characterId))
  const byId = new Map((data ?? []).map((character) => [character.id, character]))
  const items = bookmarks
    .map((id) => byId.get(id))
    .filter((character): character is NonNullable<typeof character> => character !== undefined)
    .map((character) => ({
      id: character.id,
      name: character.name,
      image: character.image,
      chip: pickChip(character, teamIds.has(character.id)),
    }))

  return (
    <Box>
      <Stack direction="row" spacing={6} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
        <Typography component="h1" sx={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.02em', color: '#121A52' }}>
          Bookmarks
        </Typography>
        {items.length > 0 && (
          <Button variant="outlined" color="inherit" onClick={() => dispatch(clear())} sx={{ borderRadius: 9999, fontWeight: 700 }}>
            Clear all
          </Button>
        )}
      </Stack>
      {items.length === 0 ? (
        <StatePanel variant="empty" title="No bookmarks yet" description="Tap the heart on a character to save them here." />
      ) : (
        <CharacterList state="success" characters={items} onSelect={(id) => router.push(`/characters/${id}`)} />
      )}
    </Box>
  )
}
