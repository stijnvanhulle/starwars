import { defineConfig } from 'kubb'
import { adapterOas } from '@kubb/adapter-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginClient } from '@kubb/plugin-client'
import { pluginZod } from '@kubb/plugin-zod'

export default defineConfig([
  {
    name: 'api',
    root: '.',
    input: { path: './openapi/api.yaml' },
    output: {
      path: './src/gen/api',
      clean: true,
      barrel: { type: 'named' },
    },
    adapter: adapterOas({ integerType: 'number' }),
    plugins: [pluginTs(), pluginClient({ baseURL: '', importPath: '../../fetchClient' }), pluginZod()],
  },
  {
    name: 'starwars',
    root: '.',
    input: { path: './openapi/starwars.yaml' },
    output: {
      path: './src/gen/starwars',
      clean: true,
      barrel: { type: 'named' },
    },
    adapter: adapterOas({ integerType: 'number' }),
    plugins: [pluginTs(), pluginZod()],
  },
])
