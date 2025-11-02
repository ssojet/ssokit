import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      organizations: Array<{
        id: string;
        name: string;
        roles: string[];
        status: string;
      }>;
      tenantId?: string;
    };
  }

  interface User {
    organizations: Array<{
      id: string;
      name: string;
      roles: string[];
      status: string;
    }>;
    tenantId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    organizations?: Array<{
      id: string;
      name: string;
      roles: string[];
      status: string;
    }>;
    tenantId?: string;
    error?: string;
  }
}

interface SSOJetProfile {
  sub: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
  tenant_id?: string;
  tenants?: Array<{
    id: string;
    name: string;
    status: string;
    roles: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'ssojet',
      name: 'SSOJet',
      type: 'oauth',
      wellKnown: `${process.env.SSOJET_ISSUER}/.well-known/openid-configuration`,
      clientId: process.env.SSOJET_CLIENT_ID!,
      clientSecret: process.env.SSOJET_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email',
          response_type: 'code',
        },
      },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile: SSOJetProfile) {
        // Map tenants to organizations format for consistency
        const organizations = (profile.tenants || []).map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          roles: tenant.roles.map(role => role.name),
          status: tenant.status,
        }));

        return {
          id: profile.sub,
          name: profile.name || profile.email?.split('@')[0] || 'User',
          email: profile.email,
          image: profile.picture,
          organizations,
          tenantId: profile.tenant_id,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        const ssojetProfile = profile as SSOJetProfile;
        // Map tenants to organizations format
        const organizations = (ssojetProfile.tenants || []).map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          roles: tenant.roles.map(role => role.name),
          status: tenant.status,
        }));

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          organizations,
          tenantId: ssojetProfile.tenant_id,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.accessToken = token.accessToken;
        session.error = token.error;
        session.user.organizations = token.organizations || [];
        session.user.tenantId = token.tenantId;
        session.user.id = token.sub || '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function refreshAccessToken(token: JWT) {
  try {
    const url = `${process.env.SSOJET_ISSUER}/oauth/token`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.SSOJET_CLIENT_ID!,
        client_secret: process.env.SSOJET_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}