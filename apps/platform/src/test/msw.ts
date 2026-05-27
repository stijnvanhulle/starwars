import { setupServer } from 'msw/node'
import { starwarsApi } from '@/constants'

/**
 * Shared MSW server, started and reset by `./setup.ts`.
 */
export const server = setupServer()

export const STARWARS_API = starwarsApi.source
