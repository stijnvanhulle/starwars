'use client'

import { useRouter } from 'next/navigation'
import { CharacterDetail, CharacterDetailSkeleton, StatePanel } from '@stijnvanhulle/components'
import { describeApiError } from '@/lib/apiError'
import { useAddTeamMemberMutation, useGetCharacterQuery, useGetTeamQuery, useListCharactersQuery, useRemoveTeamMemberMutation } from '@/store/api'

type Props = { id: number }

const DARTH_OR_SITH = /darth|sith/i

/**
 * `isDarkSide` mirrored for the browser. The server is the source of truth
 * (rejects with `422 EVIL_FORBIDDEN`); this copy decides whether the Add
 * button is disabled before the server is asked. Kept in sync with
 * `src/lib/darkSide.ts` by both checking the same `Character.affiliations`
 * field and the same case-insensitive Darth/Sith pattern.
 */
function isDarkSideOnClient(character: { name: string; affiliations?: ReadonlyArray<string> }): boolean {
  if (DARTH_OR_SITH.test(character.name)) return true
  return (character.affiliations ?? []).some((a) => DARTH_OR_SITH.test(a))
}

export function CharacterDetailContainer({ id }: Props) {
  const router = useRouter()
  const detail = useGetCharacterQuery(id, { skip: !Number.isFinite(id) })
  const list = useListCharactersQuery()
  const team = useGetTeamQuery()
  const [addMember, addState] = useAddTeamMemberMutation()
  const [removeMember, removeState] = useRemoveTeamMemberMutation()

  if (!Number.isFinite(id) || detail.isError) {
    return <StatePanel variant="error" description={describeApiError(detail.error) ?? undefined} />
  }
  if (detail.isLoading || detail.data === undefined) {
    return <CharacterDetailSkeleton />
  }

  const character = detail.data
  const onTeam = (team.data ?? []).some((m) => m.characterId === character.id)
  const evil = isDarkSideOnClient(character)
  const mutating = addState.isLoading || removeState.isLoading
  const mutationError = describeApiError(addState.error ?? removeState.error)

  const characters = list.data ?? []
  const ids = characters.map((c) => c.id)
  const index = ids.indexOf(character.id)
  const prev = ids.length > 0 ? characters[(index - 1 + ids.length) % ids.length] : undefined
  const next = ids.length > 0 ? characters[(index + 1) % ids.length] : undefined

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
    />
  )
}
