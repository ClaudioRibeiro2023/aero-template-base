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
      thresholds: { lines: 70, branches: 70, functions: 70, statements: 70 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@template/design-system': path.resolve(__dirname, '../../packages/design-system/src'),
      '@template/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@template/types': path.resolve(__dirname, '../../packages/types/src'),
      '@template/data/supabase': path.resolve(
        __dirname,
        '../../packages/data/src/providers/supabase/index.ts'
      ),
      '@template/data/resend': path.resolve(
        __dirname,
        '../../packages/data/src/providers/resend/index.ts'
      ),
      '@template/data': path.resolve(__dirname, '../../packages/data/src/index.ts'),
      '@template/modules': path.resolve(__dirname, '../../packages/modules/src/index.ts'),
    },
  },
})
