'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkey } from '@tanstack/react-hotkeys'
import { StatePanel } from '@whale/components'
import { CharacterDetail } from './CharacterDetail'
import { CharacterDetailSkeleton } from './CharacterDetailSkeleton'
import { useCharacterNavigation } from './useCharacterNavigation'
import { useTeamMembership } from './useTeamMembership'
import { describeApiError } from '@/lib/apiError'
import { useGetCharacterQuery } from '@/store/api'
import { selectBookmarks, toggle as toggleBookmark } from '@/store/bookmarks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

type Props = { id: number }

export function CharacterDetailContainer({ id }: Props) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const detail = useGetCharacterQuery(id)
  const { prev, next, position } = useCharacterNavigation({ id })
  const character = detail.data
  const { onTeam, evil, canToggleTeam, mutating, toggleTeam, mutationError } = useTeamMembership({ character })
  const bookmarks = useAppSelector(selectBookmarks)
  const dispatch = useAppDispatch()

  useEffect(() => setMounted(true), [])

  useHotkey(
    'ArrowLeft',
    () => {
      if (prev !== undefined) router.push(`/characters/${prev.id}`)
    },
    { enabled: prev !== undefined },
  )
  useHotkey(
    'ArrowRight',
    () => {
      if (next !== undefined) router.push(`/characters/${next.id}`)
    },
    { enabled: next !== undefined },
  )
  useHotkey('Space', toggleTeam, { enabled: canToggleTeam, preventDefault: true })

  if (!mounted) {
    return <CharacterDetailSkeleton />
  }

  if (detail.isError) {
    return <StatePanel variant="error" description={describeApiError(detail.error) ?? undefined} />
  }

  if (detail.isLoading || character === undefined) {
    return <CharacterDetailSkeleton />
  }

  return (
    <CharacterDetail
      character={character}
      onTeam={onTeam}
      evil={evil}
      loading={mutating}
      errorMessage={mutationError ?? undefined}
      prevName={prev?.name}
      nextName={next?.name}
      position={position}
      onAddOrRemove={toggleTeam}
      onPrev={prev === undefined ? undefined : () => router.push(`/characters/${prev.id}`)}
      onNext={next === undefined ? undefined : () => router.push(`/characters/${next.id}`)}
      bookmarked={bookmarks.includes(character.id)}
      onBookmarkToggle={() => dispatch(toggleBookmark(character.id))}
    />
  )
}
