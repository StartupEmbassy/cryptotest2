/**
 * @fileoverview Next.js configuration for CryptoPanel.
 * - Enforces client-side rendering defaults and strict mode.
 * - Limits ESLint to project source directories.
 */

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  eslint: {
    dirs: ['src']
  }
};

export default config;
