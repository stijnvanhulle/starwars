import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@whale/components',
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    passWithNoTests: true,
  },
})
