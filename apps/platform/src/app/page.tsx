'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter, useSearchParams } from 'next/navigation'
import { CharacterCard, CharacterListSkeleton, Pagination, StatePanel, pickChip } from '@stijnvanhulle/components'
import { describeApiError } from '@/lib/apiError'
import { CHARACTER_PAGE_SIZE, paginate } from '@/lib/pagination'
import { useGetTeamQuery, useListCharactersQuery } from '@/store/api'

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data, isLoading, isError, error } = useListCharactersQuery()
  const team = useGetTeamQuery()
  const teamIds = new Set((team.data ?? []).map((member) => member.characterId))

  const totalCharacters = data?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCharacters / CHARACTER_PAGE_SIZE))
  const rawPage = Number.parseInt(searchParams?.get('page') ?? '1', 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.min(rawPage, totalPages) : 1
  const pageItems = data ? paginate(data, page, CHARACTER_PAGE_SIZE) : []

  return (
    <Box>
      <Box sx={{ maxWidth: 720, mb: 8 }}>
        <Typography component="h1" sx={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.02em', color: '#121A52', mb: 2 }}>
          Star Wars characters
        </Typography>
        <Typography sx={{ fontSize: 16, lineHeight: 1.5, color: '#334155' }}>Pick five characters for your team. Evil characters can&apos;t join.</Typography>
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
            <Pagination page={page} count={totalPages} onChange={(nextPage) => router.push(nextPage === 1 ? '/' : `/?page=${nextPage}`, { scroll: true })} />
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
