/**
 * @fileoverview Tailwind CSS configuration for CryptoPanel.
 * - Scans feature-first source tree for class usage.
 * - Provides base theme extensions used across features.
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f172a',
          muted: '#1e293b'
        },
        accent: {
          DEFAULT: '#22d3ee',
          emphasis: '#0ea5e9'
        }
      }
    }
  },
  plugins: []
};

export default config;
