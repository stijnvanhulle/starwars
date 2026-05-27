'use client'

import Box from '@mui/material/Box'
import { useRouter } from 'next/navigation'
import { StatePanel } from '@whale/components'
import { CharacterList } from '@/features/characters/CharacterList'
import { BookmarksHeader } from './BookmarksHeader'
import { useBookmarkItems } from './useBookmarkItems'
import { describeApiError } from '@/lib/apiError'

export function BookmarkListContainer() {
  const router = useRouter()
  const { items, isLoading, isError, error, clearAll } = useBookmarkItems()

  if (isLoading) {
    return <CharacterList state="loading" />
  }
  if (isError) {
    return <StatePanel variant="error" description={describeApiError(error) ?? undefined} />
  }

  return (
    <Box>
      <BookmarksHeader count={items.length} onClear={clearAll} />
      {items.length === 0 ? (
        <StatePanel variant="empty" title="No bookmarks yet" description="Tap the heart on a character to save them here." />
      ) : (
        <CharacterList state="success" characters={items} onSelect={(id) => router.push(`/characters/${id}`)} />
      )}
    </Box>
  )
}
