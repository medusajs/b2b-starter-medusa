import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@medusajs/ui',
    '@medusajs/icons',
    'next'
  ],
  banner: {
    js: '"use client";'
  }
})