import { migrate } from 'drizzle-orm/pglite/migrator'
import { afterEach, beforeAll } from 'vitest'
import { db } from '@/db/client'
import { resetTeamMembers } from '@/db/testReset'

beforeAll(async () => {
  await migrate(db, { migrationsFolder: './src/db/migrations' })
})

afterEach(resetTeamMembers)
