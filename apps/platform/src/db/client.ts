import { PGlite } from '@electric-sql/pglite'
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { Pool } from 'pg'
import { requireDatabaseUrl } from '@/env'
import * as schema from './schema'

export const db =
  process.env.NODE_ENV === 'test' ? drizzlePglite(new PGlite(), { schema }) : drizzleNodePg(new Pool({ connectionString: requireDatabaseUrl() }), { schema })

export type Db = typeof db
