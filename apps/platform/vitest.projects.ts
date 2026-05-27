import { fileURLToPath } from 'node:url'
import type { TestProjectConfiguration } from 'vitest/config'

const platformRoot = fileURLToPath(new URL('.', import.meta.url))
const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
}

const setupNode = fileURLToPath(new URL('./src/test/setup.ts', import.meta.url))
const setupDom = fileURLToPath(new URL('./src/test/setupDom.ts', import.meta.url))

const jsx = { runtime: 'automatic' } as const

/**
 * Platform-level vitest projects (node DB/API + jsdom React). Exported so the workspace
 * root and the platform-local config can both consume them without nesting `projects`,
 * which Vitest does not flatten when a project config references another project file.
 */
export const platformProjects: Array<TestProjectConfiguration> = [
  {
    oxc: { jsx },
    resolve: { alias },
    test: {
      name: '@whale/platform/node',
      root: platformRoot,
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: ['src/features/**/*.test.tsx'],
      environment: 'node',
      setupFiles: [setupNode],
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
      setupFiles: [setupDom],
    },
  },
]
