import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const platformRoot = fileURLToPath(new URL('./apps/platform', import.meta.url))
const alias = {
  '@': fileURLToPath(new URL('./apps/platform/src', import.meta.url)),
}
const jsx = { runtime: 'automatic' } as const

export default defineConfig({
  test: {
    fileParallelism: false,
    projects: [
      {
        oxc: { jsx },
        resolve: { alias },
        test: {
          name: '@whale/platform/node',
          root: platformRoot,
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/features/**/*.test.tsx'],
          environment: 'node',
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        oxc: { jsx },
        resolve: { alias },
        test: {
          name: '@whale/platform/dom',
          root: platformRoot,
          include: ['src/features/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/test/setupDom.ts'],
        },
      },
      'packages/*/vitest.config.ts',
      'internals/*/vitest.config.ts',
    ],
  },
})
