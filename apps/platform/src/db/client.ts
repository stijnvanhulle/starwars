import { PGlite } from '@electric-sql/pglite'
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { Pool } from 'pg'
import { requireDatabaseUrl } from '@/env'
import * as schema from './schema'

function createDb() {
  if (process.env.NODE_ENV === 'test') {
    return drizzlePglite(new PGlite(), { schema })
  }
  return drizzleNodePg(new Pool({ connectionString: requireDatabaseUrl() }), { schema })
}

// Next.js dev HMR re-evaluates this module on every edit. Without a cache each reload
// spawns a fresh Pool and leaks connections; production runs once so the cache is a no-op.
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createDb> }

export const db = globalForDb.db ?? createDb()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db
}

export type Db = typeof db
