import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  // Specs share a single Postgres team_members table reset between tests; bumping workers
  // would require per-test tenant isolation (worker schema or a tenant column).
  workers: 1,
  webServer: {
    // `pnpm start` requires a prior `pnpm build`; CI runs both, local runs need it once.
    command: 'pnpm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
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
