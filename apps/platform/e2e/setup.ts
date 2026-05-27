import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Client } from 'pg'
import type { Character } from '../src/gen/starwars'

const e2eDir = path.dirname(fileURLToPath(import.meta.url))

/**
 * Same fixture the server reads under `E2E_FIXTURES=1`, used for UI assertions.
 */
export const characters: Array<Character> = JSON.parse(readFileSync(path.join(e2eDir, 'fixtures/characters.json'), 'utf-8'))

/**
 * Postgres connection string for the e2e helpers, falling back to docker-compose defaults.
 */
export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://platform:platform@localhost:5432/platform'

/**
 * Counts active rows in `team_members`.
 */
export async function activeMemberCount(): Promise<number> {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    const res = await client.query<{ count: string }>('select count(*)::text as count from team_members where deleted_at is null')

    return Number(res.rows[0]?.count ?? '0')
  } finally {
    await client.end()
  }
}

/**
 * Looks up a fixture character by id, throwing when missing.
 */
export function characterById(id: number): Character {
  const found = characters.find((c) => c.id === id)

  if (found === undefined) throw new Error(`Fixture character ${id} not found`)

  return found
}

/**
 * Soft-deletes every active row in `team_members` so each test starts empty.
 */
export async function resetTeam(): Promise<void> {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    await client.query('update team_members set deleted_at = now() where deleted_at is null')
  } finally {
    await client.end()
  }
}
