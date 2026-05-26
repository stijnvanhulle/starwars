import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { afterEach, beforeAll } from 'vitest'
import { db } from '@/db/client'
import { resetTeamMembers } from '@/db/testReset'

const migrationsFolder = fileURLToPath(new URL('../db/migrations', import.meta.url))

beforeAll(async () => {
  await migrate(db, { migrationsFolder })
})

afterEach(resetTeamMembers)
