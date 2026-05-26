import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: 'esm',
  platform: 'browser',
  dts: true,
  sourcemap: true,
  shims: false,
  exports: true,
  fixedExtension: false,
  outputOptions: {
    keepNames: true,
    assetFileNames: 'style.css',
  },
  deps: {
    neverBundle: [/^@stijnvanhulle\//],
    onlyBundle: false,
  },
})
