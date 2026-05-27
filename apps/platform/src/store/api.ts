import { createApi } from '@reduxjs/toolkit/query/react'
import { fakeBaseQuery } from '@reduxjs/toolkit/query'
import { addTeamMember, getCharacter, getTeam, listCharacters, removeTeamMember } from '@/gen/api'
import type { AddTeamMemberRequest, Character, Error as ApiError, RemoveTeamMemberPathCharacterId, TeamMember } from '@/gen/api'
import { isApiRequestError } from '@/gen/fetchClient'

export type ClientError = Partial<ApiError> & { message: string; status?: number }

const wrap = async <T>(call: () => Promise<T>): Promise<{ data: T } | { error: ClientError }> => {
  try {
    return { data: await call() }
  } catch (cause) {
    if (isApiRequestError(cause)) {
      const body = cause.body as Partial<ApiError> | undefined
      return {
        error: {
          status: cause.status,
          code: body?.code,
          message: body?.message ?? cause.message,
        },
      }
    }
    return { error: { message: cause instanceof Error ? cause.message : String(cause) } }
  }
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<ClientError>(),
  tagTypes: ['team'],
  endpoints: (build) => ({
    listCharacters: build.query<Array<Character>, void>({
      queryFn: () => wrap(() => listCharacters()),
    }),
    getCharacter: build.query<Character, number>({
      queryFn: (id) => wrap(() => getCharacter(id)),
    }),
    getTeam: build.query<Array<TeamMember>, void>({
      queryFn: () => wrap(() => getTeam()),
      providesTags: ['team'],
    }),
    addTeamMember: build.mutation<TeamMember, AddTeamMemberRequest>({
      queryFn: (body) => wrap(() => addTeamMember(body)),
      invalidatesTags: ['team'],
    }),
    removeTeamMember: build.mutation<null, RemoveTeamMemberPathCharacterId>({
      queryFn: async (characterId) => {
        const result = await wrap(() => removeTeamMember(characterId))
        return 'error' in result ? result : { data: null }
      },
      invalidatesTags: ['team'],
    }),
  }),
})

export const { useListCharactersQuery, useGetCharacterQuery, useGetTeamQuery, useAddTeamMemberMutation, useRemoveTeamMemberMutation } = api
