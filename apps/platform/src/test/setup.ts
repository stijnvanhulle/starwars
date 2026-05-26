import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { db } from '@/db/client'
import { resetTeamMembers } from '@/db/testReset'
import { server } from './msw'

const migrationsFolder = fileURLToPath(new URL('../db/migrations', import.meta.url))

beforeAll(async () => {
  await migrate(db, { migrationsFolder })

  server.listen({
    onUnhandledRequest(request, print) {
      const requestUrl = new URL(request.url)
      // The local test HTTP server (apiServer.ts) runs on 127.0.0.1; let those through.
      if (requestUrl.hostname === '127.0.0.1' || requestUrl.hostname === 'localhost') return
      print.error()
    },
  })
})

afterEach(async () => {
  server.resetHandlers()

  await resetTeamMembers()
})

afterAll(() => {
  server.close()
})
