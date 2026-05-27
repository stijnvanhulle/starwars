import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  webServer: {
    command: 'pnpm start',
    port: 3000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? 'postgres://platform:platform@localhost:5432/platform',
      E2E_FIXTURES: '1',
    },
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
