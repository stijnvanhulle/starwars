import { loadEnvFile } from 'node:process'

try {
  loadEnvFile('.env')
} catch {}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and start postgres with `docker compose up -d postgres`.')
}

export const env = {
  databaseUrl,
} as const

export type Env = typeof env
