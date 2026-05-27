import { loadEnvFile } from 'node:process'

try {
  loadEnvFile('.env')
} catch {}

const databaseUrl = process.env.DATABASE_URL ?? null

if (!databaseUrl && process.env.NODE_ENV !== 'test') {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and start postgres with `docker compose up -d postgres`.')
}

const env = { databaseUrl } as const

export function requireDatabaseUrl(): string {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required for this code path.')
  }

  return env.databaseUrl
}
