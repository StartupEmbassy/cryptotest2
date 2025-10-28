/**
 * @fileoverview ESLint configuration tailored for CryptoPanel.
 * - Extends Next.js recommended rules with TypeScript support.
 * - Enforces import resolution through `@/*` alias.
 */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  parserOptions: {
    project: ['./tsconfig.json']
  },
  settings: {
    next: {
      rootDir: ['src']
    }
  },
  rules: {
    'import/order': [
      'warn',
      {
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always'
      }
    ]
  }
};
