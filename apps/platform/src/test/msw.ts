import { setupServer } from 'msw/node'

/**
 * Shared MSW server for API route tests. Handlers are registered per-test with
 * `server.use(http.get(...))`; the setup file (`./setup.ts`) starts the server,
 * resets handlers after each test, and closes it after the suite.
 */
export const server = setupServer()

export const STARWARS_API = 'https://akabab.github.io/starwars-api/api'
