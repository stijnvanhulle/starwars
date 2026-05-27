import { useCallback } from 'react'
import { type CharacterListItem, pickChip } from '@whale/components'
import type { Character, TeamMember } from '@/gen/api'
import { useGetTeamQuery, useListCharactersQuery } from '@/store/api'
import { clear, selectBookmarks } from '@/store/bookmarks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/**
 * Resolves bookmarked ids to renderable items by joining against the character list, then
 * decorates each with the chip variant for the current team state.
 */
export function buildBookmarkItems({
  bookmarks,
  characters,
  team,
}: {
  bookmarks: ReadonlyArray<number>
  characters: ReadonlyArray<Character>
  team: ReadonlyArray<TeamMember>
}): Array<CharacterListItem> {
  const teamIds = new Set(team.map((member) => member.characterId))
  const byId = new Map(characters.map((character) => [character.id, character]))
  return bookmarks
    .map((id) => byId.get(id))
    .filter((character): character is Character => character !== undefined)
    .map((character) => ({
      id: character.id,
      name: character.name,
      image: character.image,
      chip: pickChip(character, teamIds.has(character.id)),
    }))
}

/**
 * Reads bookmarks, the team, and the character list from the store and resolves them to
 * ready-to-render items for the bookmarks page.
 */
export function useBookmarkItems() {
  const list = useListCharactersQuery()
  const team = useGetTeamQuery()
  const bookmarks = useAppSelector(selectBookmarks)
  const dispatch = useAppDispatch()
  const items = buildBookmarkItems({
    bookmarks,
    characters: list.data ?? [],
    team: team.data ?? [],
  })
  const clearAll = useCallback(() => dispatch(clear()), [dispatch])

  return { items, isLoading: list.isLoading, isError: list.isError, error: list.error, clearAll }
}
