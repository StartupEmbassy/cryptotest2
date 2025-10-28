/**
 * @fileoverview Root layout for the CryptoPanel App Router.
 * - Applies global styles and wraps the CSR tree with shared providers.
 * - Handles top-level document metadata for the dashboard experience.
 */
import type { Metadata } from 'next';

import './globals.css';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'CryptoPanel',
  description:
    'CryptoPanel delivers BTC and ETH spot plus historical pricing with personalised settings.'
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" suppressHydrationWarning>
    <body>
      <AppProviders>{children}</AppProviders>
    </body>
  </html>
);

export default RootLayout;
