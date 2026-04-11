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
      '@template/shared/auth': path.resolve(__dirname, '../shared/src/auth/index.ts'),
      '@template/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      '@template/types': path.resolve(__dirname, '../types/src/index.ts'),
    },
  },
})
