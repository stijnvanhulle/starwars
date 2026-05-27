import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Client } from 'pg'

export type FixtureCharacter = {
  id: number
  name: string
  image?: string
  height?: number
  mass?: number
  affiliations?: Array<string>
  masters?: Array<string>
}

const here = path.dirname(fileURLToPath(import.meta.url))
const rawFixtures: unknown = JSON.parse(readFileSync(path.join(here, 'fixtures/characters.json'), 'utf-8'))
if (!Array.isArray(rawFixtures) || rawFixtures.length === 0) {
  throw new Error('e2e/fixtures/characters.json is missing or empty')
}
for (const row of rawFixtures) {
  if (typeof row?.id !== 'number' || typeof row?.name !== 'string') {
    throw new Error(`fixture row missing required id/name: ${JSON.stringify(row)}`)
  }
}
export const characters = rawFixtures as Array<FixtureCharacter>

export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://platform:platform@localhost:5432/platform'

export async function activeMemberCount(): Promise<number> {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    const res = await client.query<{ count: string }>('select count(*)::text as count from team_members where deleted_at is null')
    return Number(res.rows[0]!.count)
  } finally {
    await client.end()
  }
}

export function characterById(id: number): FixtureCharacter {
  const found = characters.find((c) => c.id === id)
  if (found === undefined) throw new Error(`Fixture character ${id} not found`)
  return found
}

/**
 * Soft-deletes every active row in `team_members`. Read queries already filter
 * `deleted_at IS NULL`, so this leaves each test with an empty active team
 * without dropping history.
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
