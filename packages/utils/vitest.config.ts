import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@template/shared/utils': path.resolve(__dirname, '../shared/src/utils/index.ts'),
      '@template/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
})
