import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { requireDatabaseUrl } from '@/env'
import * as schema from './schema'

const pool = new Pool({ connectionString: requireDatabaseUrl() })
const db = drizzle(pool, { schema })

async function main() {
  await migrate(db, { migrationsFolder: './src/db/migrations' })
  console.log('Migrations complete')

  await pool.end().catch(() => {})

  process.exit(0)
}

main().catch(async (err) => {
  console.error('Migration failed:', err)

  await pool.end().catch(() => {})

  process.exit(1)
})
