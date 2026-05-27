import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import './src/env'
import { platformProjects } from './vitest.projects'

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
    projects: platformProjects,
  },
})
