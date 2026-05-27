import { defineConfig } from 'vitest/config'
import { platformProjects } from './apps/platform/vitest.projects'

export default defineConfig({
  test: {
    fileParallelism: false,
    projects: [...platformProjects, 'packages/*/vitest.config.ts', 'internals/*/vitest.config.ts'],
  },
})
