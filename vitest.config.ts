/**
 * @fileoverview Vitest configuration for CryptoPanel.
 * - Enables React plugin for TSX support.
 * - Mirrors Next.js aliases to keep tests aligned with runtime code.
 */
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reports: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}']
    }
  }
});
