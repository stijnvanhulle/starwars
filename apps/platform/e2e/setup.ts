import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Client } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://platform:platform@localhost:5432/platform'

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
export const characters = JSON.parse(readFileSync(path.join(here, 'fixtures/characters.json'), 'utf-8')) as Array<FixtureCharacter>

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
