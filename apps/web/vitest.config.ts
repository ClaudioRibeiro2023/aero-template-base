import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 30 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@template/design-system': path.resolve(__dirname, '../../packages/design-system/src'),
      '@template/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@template/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
})
