'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { CharacterCard, CharacterListSkeleton, Pagination, StatePanel, pickChip } from '@whale/components'
import { useCharacterListPagination } from './useCharacterListPagination'
import { describeApiError } from '@/lib/apiError'

export function CharactersListContainer() {
  const router = useRouter()
  const { page, totalPages, pageItems, teamIds, totalCharacters, isLoading, isError, error } = useCharacterListPagination()

  return (
    <Box>
      <Box sx={{ maxWidth: 720, mb: 8 }}>
        <Typography component="h1" sx={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary', mb: 2 }}>
          Star Wars characters
        </Typography>
        <Typography sx={{ fontSize: 16, lineHeight: 1.5, color: 'text.secondary' }}>
          Pick five characters for your team. Evil characters can&apos;t join.
        </Typography>
      </Box>

      {isLoading && <CharacterListSkeleton />}

      {isError && <StatePanel variant="error" description={describeApiError(error) ?? undefined} />}

      {!isLoading && !isError && totalCharacters === 0 && <StatePanel variant="empty" />}

      {pageItems.length > 0 && (
        <Stack spacing={6}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
            {pageItems.map((character) => (
              <CharacterCard
                key={character.id}
                name={character.name}
                image={character.image}
                chip={pickChip(character, teamIds.has(character.id))}
                onClick={() => router.push(`/characters/${character.id}`)}
              />
            ))}
          </Box>
          <Stack direction="row" sx={{ justifyContent: 'center' }}>
            <Pagination
              page={page}
              count={totalPages}
              onChange={(nextPage) => router.push(nextPage === 1 ? '/characters' : `/characters?page=${nextPage}`, { scroll: true })}
            />
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
