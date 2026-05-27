import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import './src/env'

const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
}

export default defineConfig({
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  resolve: { alias },
  test: {
    fileParallelism: false,
    projects: [
      {
        extends: true,
        resolve: { alias },
        test: {
          name: 'node',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/features/**/*.test.tsx'],
          environment: 'node',
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        extends: true,
        resolve: { alias },
        test: {
          name: 'dom',
          include: ['src/features/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/test/setupDom.ts'],
        },
      },
    ],
  },
})
