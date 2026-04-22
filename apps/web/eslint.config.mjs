// ESLint 9 flat config — equalizado como base para novas apps.
// Strict rules sao WARN em vez de error para nao bloquear lint do template.
// Apps clonadas podem endurecer gradualmente.

import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  {
    ignores: [
      '**/*.stories.*',
      '**/*.test.*',
      '**/__tests__/**',
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Core — relaxed para template base
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'off',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',

      // React hooks
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',

      // a11y — warn nao bloqueador no template
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/interactive-supports-focus': 'off',
      'jsx-a11y/no-noninteractive-tabindex': 'off',
      'jsx-a11y/no-autofocus': 'off',
    },
  },
]
