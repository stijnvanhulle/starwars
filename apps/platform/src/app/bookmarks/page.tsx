'use client'

import Box from '@mui/material/Box'
import { useRouter } from 'next/navigation'
import { BookmarksHeader, CharacterList, StatePanel } from '@whale/components'
import { useBookmarkItems } from './useBookmarkItems'
import { describeApiError } from '@/lib/apiError'
import { clear } from '@/store/bookmarks'
import { useAppDispatch } from '@/store/hooks'

export default function BookmarksPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items, isLoading, isError, error } = useBookmarkItems()

  if (isLoading) {
    return <CharacterList state="loading" />
  }
  if (isError) {
    return <StatePanel variant="error" description={describeApiError(error) ?? undefined} />
  }

  return (
    <Box>
      <BookmarksHeader count={items.length} onClear={() => dispatch(clear())} />
      {items.length === 0 ? (
        <StatePanel variant="empty" title="No bookmarks yet" description="Tap the heart on a character to save them here." />
      ) : (
        <CharacterList state="success" characters={items} onSelect={(id) => router.push(`/characters/${id}`)} />
      )}
    </Box>
  )
}
