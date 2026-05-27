import { useSearchParams } from 'next/navigation'
import type { Character } from '@/gen/api'
import { CHARACTER_PAGE_SIZE, paginate } from '@/lib/pagination'
import { pageNumberSchema } from '@/server/schemas'
import { useGetTeamQuery, useListCharactersQuery } from '@/store/api'

export type PaginationResult<T> = {
  page: number
  totalPages: number
  pageItems: Array<T>
}

/**
 * Resolves the active 1-based page number and corresponding window of items, clamping invalid
 * or over-range values to a safe page.
 */
export function resolvePagination<T>({
  items,
  pageParam,
  size,
}: {
  items: ReadonlyArray<T>
  pageParam: string | null | undefined
  size: number
}): PaginationResult<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / size))
  const parsed = pageNumberSchema.safeParse(pageParam)
  const page = parsed.success ? Math.min(parsed.data, totalPages) : 1
  return { page, totalPages, pageItems: paginate(items, page, size) }
}

/**
 * Wires the character list query and the `page` query param into ready-to-render pagination
 * state, plus the set of character ids currently on the team for chip rendering.
 */
export function useCharacterListPagination() {
  const list = useListCharactersQuery()
  const team = useGetTeamQuery()
  const searchParams = useSearchParams()
  const teamIds = new Set((team.data ?? []).map((member) => member.characterId))
  const { page, totalPages, pageItems } = resolvePagination<Character>({
    items: list.data ?? [],
    pageParam: searchParams?.get('page'),
    size: CHARACTER_PAGE_SIZE,
  })
  return {
    page,
    totalPages,
    pageItems,
    teamIds,
    totalCharacters: list.data?.length ?? 0,
    isLoading: list.isLoading,
    isError: list.isError,
    error: list.error,
  }
}
