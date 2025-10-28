/**
 * @fileoverview Shared application providers for CryptoPanel.
 * - Placeholder: wraps the tree with context providers (React Query, theme, Supabase) once implemented.
 * - Ensures children render in CSR mode without additional logic for now.
 */
'use client';

type AppProvidersProps = Readonly<{
  children: React.ReactNode;
}>;

export const AppProviders = ({ children }: AppProvidersProps) => children;
