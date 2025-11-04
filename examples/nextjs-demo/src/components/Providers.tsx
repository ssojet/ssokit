'use client';

import { AuthKitProvider } from '@ssojet/ssokit-react';
import AuthProvider from './AuthProvider';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AuthKitProvider 
        config={{ 
          baseUrl: '/api/authkit'
        }}
      >
        {children}
      </AuthKitProvider>
    </AuthProvider>
  );
}