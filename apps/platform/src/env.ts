import { loadEnvFile } from 'node:process'

try {
  loadEnvFile('.env')
} catch {}

export function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required. Copy .env.example to .env and start postgres with `docker compose up -d postgres`.')
  }

  return databaseUrl
}
