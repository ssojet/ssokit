'use client';

import { createContext, useContext } from 'react';
import type { Theme } from '@ssojet/ssokit-css';
import type { AuthKitPublicConfig } from '@ssojet/ssokit-core';

export interface AuthKitContextValue {
  baseUrl: string;
  defaultTheme?: Theme;
  fetch: typeof fetch;
}

export const AuthKitContext = createContext<AuthKitContextValue | null>(null);

export function useAuthKit(): AuthKitContextValue {
  const context = useContext(AuthKitContext);
  
  if (!context) {
    throw new Error(
      'useAuthKit must be used within an AuthKitProvider. ' +
      'Wrap your component tree with <AuthKitProvider>.'
    );
  }
  
  return context;
}

export interface AuthKitProviderProps {
  children: React.ReactNode;
  config?: Partial<AuthKitPublicConfig>;
  baseUrl?: string;
  defaultTheme?: Theme;
  fetch?: typeof globalThis.fetch;
}

export function AuthKitProvider({
  children,
  config,
  baseUrl = config?.baseUrl || '/api/authkit',
  defaultTheme,
  fetch: customFetch = globalThis.fetch,
}: AuthKitProviderProps) {
  // Use explicit defaultTheme prop, or fall back to config.defaultTheme parsed as Theme
  const theme: Theme | undefined = defaultTheme || 
    (typeof config?.defaultTheme === 'string' 
      ? config.defaultTheme as Theme
      : config?.defaultTheme as Theme | undefined);

  const value: AuthKitContextValue = {
    baseUrl,
    defaultTheme: theme,
    fetch: customFetch,
  };

  return <AuthKitContext.Provider value={value}>{children}</AuthKitContext.Provider>;
}
