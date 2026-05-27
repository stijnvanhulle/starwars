import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Client } from 'pg'
import type { Character } from '../src/gen/starwars'

const e2eDir = path.dirname(fileURLToPath(import.meta.url))

export const characters: Array<Character> = JSON.parse(readFileSync(path.join(e2eDir, 'fixtures/characters.json'), 'utf-8'))

export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://platform:platform@localhost:5432/platform'

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

export function characterById(id: number): Character {
  const found = characters.find((c) => c.id === id)

  if (found === undefined) throw new Error(`Fixture character ${id} not found`)

  return found
}

/**
 * Soft-deletes every active row in `team_members`.
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
