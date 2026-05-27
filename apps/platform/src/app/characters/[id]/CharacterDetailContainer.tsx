'use client'

import { useRouter } from 'next/navigation'
import { useHotkey } from '@tanstack/react-hotkeys'
import { CharacterDetail, CharacterDetailSkeleton, StatePanel } from '@stijnvanhulle/components'
import { describeApiError } from '@/lib/apiError'
import { isDarkSide } from '@/lib/darkSide'
import { useAddTeamMemberMutation, useGetCharacterQuery, useGetTeamQuery, useListCharactersQuery, useRemoveTeamMemberMutation } from '@/store/api'
import { selectBookmarks, toggle as toggleBookmark } from '@/store/bookmarks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

type Props = { id: number }

export function CharacterDetailContainer({ id }: Props) {
  const router = useRouter()
  const detail = useGetCharacterQuery(id, { skip: !Number.isFinite(id) })
  const list = useListCharactersQuery()
  const team = useGetTeamQuery()
  const [addMember, addState] = useAddTeamMemberMutation()
  const [removeMember, removeState] = useRemoveTeamMemberMutation()
  const bookmarks = useAppSelector(selectBookmarks)
  const dispatch = useAppDispatch()

  // Prev/next walks the full cached character list, never a paginated slice — keep this in sync
  // with `app/page.tsx` whenever pagination changes.
  const characters = list.data ?? []
  const ids = characters.map((candidate) => candidate.id)
  const index = ids.indexOf(id)
  const prev = ids.length > 0 && index !== -1 ? characters[(index - 1 + ids.length) % ids.length] : undefined
  const next = ids.length > 0 && index !== -1 ? characters[(index + 1) % ids.length] : undefined

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

  if (!Number.isFinite(id) || detail.isError) {
    return <StatePanel variant="error" description={describeApiError(detail.error) ?? undefined} />
  }
  if (detail.isLoading || detail.data === undefined) {
    return <CharacterDetailSkeleton />
  }

  const character = detail.data
  const onTeam = (team.data ?? []).some((member) => member.characterId === character.id)
  const evil = isDarkSide(character)
  const mutating = addState.isLoading || removeState.isLoading
  const mutationError = describeApiError(addState.error ?? removeState.error)

  return (
    <CharacterDetail
      character={character}
      onTeam={onTeam}
      evil={evil}
      loading={mutating}
      errorMessage={mutationError ?? undefined}
      prevName={prev?.name}
      nextName={next?.name}
      position={characters.length > 0 && index !== -1 ? { index: index + 1, total: characters.length } : undefined}
      onAddOrRemove={() => {
        if (onTeam) removeMember(character.id)
        else addMember({ characterId: character.id })
      }}
      onPrev={prev === undefined ? undefined : () => router.push(`/characters/${prev.id}`)}
      onNext={next === undefined ? undefined : () => router.push(`/characters/${next.id}`)}
      bookmarked={bookmarks.includes(character.id)}
      onBookmarkToggle={() => dispatch(toggleBookmark(character.id))}
    />
  )
}
