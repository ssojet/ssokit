// lib/auth.ts - Authentication configuration
import NextAuth from 'next-auth';
import { SSOJetProvider } from '@ssojet/ssokit-next';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    SSOJetProvider({
      clientId: process.env.DEFAULT_SSOJET_CLIENT_ID!,
      clientSecret: process.env.DEFAULT_SSOJET_CLIENT_SECRET!,
      issuer: process.env.DEFAULT_SSOJET_AUTHORITY!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Store access token in JWT for API calls
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Make access token available in session
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}