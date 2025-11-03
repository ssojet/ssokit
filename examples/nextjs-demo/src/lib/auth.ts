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
        console.log('[AUTH] Initial sign in - setting up tokens');
        const ssojetProfile = profile as SSOJetProfile;
        // Map tenants to organizations format
        const organizations = (ssojetProfile.tenants || []).map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          roles: tenant.roles.map(role => role.name),
          status: tenant.status,
        }));

        const expiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600000; // Default 1 hour
        console.log('[AUTH] Token expiry set to:', new Date(expiresAt).toISOString());

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: expiresAt,
          organizations,
          tenantId: ssojetProfile.tenant_id,
        };
      }

      // Check token expiry
      const now = Date.now();
      const expiresAt = token.accessTokenExpires as number;
      const timeUntilExpiry = expiresAt - now;
      
      console.log('[AUTH] Token check:', {
        now: new Date(now).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        timeUntilExpiry: `${Math.round(timeUntilExpiry / 1000)}s`,
        isExpired: now >= expiresAt,
        hasRefreshToken: !!token.refreshToken
      });

      // Return previous token if the access token has not expired yet
      if (now < expiresAt) {
        console.log('[AUTH] Token still valid, returning existing token');
        return token;
      }

      // Access token has expired, try to update it
      console.log('[AUTH] Token expired, attempting refresh');
      if (!token.refreshToken) {
        console.error('[AUTH] No refresh token available, cannot refresh');
        return { ...token, error: 'NoRefreshTokenError' };
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.accessToken = token.accessToken;
        session.error = token.error;
        session.user.organizations = token.organizations || [];
        session.user.tenantId = token.tenantId;
        session.user.id = token.sub || '';
        
        // Log session state for debugging
        console.log('[AUTH] Session callback:', {
          hasAccessToken: !!session.accessToken,
          error: session.error,
          userId: session.user.id,
          organizations: session.user.organizations?.length || 0
        });
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

// Cache for the OIDC configuration
let oidcConfig: any = null;

async function getOIDCConfig() {
  if (oidcConfig) return oidcConfig;
  
  try {
    const wellKnownUrl = `${process.env.SSOJET_ISSUER}/.well-known/openid-configuration`;
    console.log('[AUTH] Fetching OIDC configuration from:', wellKnownUrl);
    
    const response = await fetch(wellKnownUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OIDC config: ${response.status} ${response.statusText}`);
    }
    
    oidcConfig = await response.json();
    console.log('[AUTH] OIDC configuration loaded:', {
      issuer: oidcConfig.issuer,
      tokenEndpoint: oidcConfig.token_endpoint,
      authEndpoint: oidcConfig.authorization_endpoint
    });
    
    return oidcConfig;
  } catch (error) {
    console.error('[AUTH] Failed to fetch OIDC configuration:', error);
    throw error;
  }
}

async function refreshAccessToken(token: JWT) {
  try {
    let tokenEndpoint;
    
    try {
      // Get the correct token endpoint from OIDC discovery
      const oidcConfig = await getOIDCConfig();
      tokenEndpoint = oidcConfig.token_endpoint;
    } catch (discoveryError) {
      console.warn('[AUTH] OIDC discovery failed, using fallback token endpoint');
      // Fallback to common token endpoint paths
      tokenEndpoint = `${process.env.SSOJET_ISSUER}/token`;
    }
    
    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('[AUTH] Attempting token refresh...', {
      tokenEndpoint,
      hasRefreshToken: !!token.refreshToken,
      refreshTokenLength: token.refreshToken.length,
      tokenExpiry: token.accessTokenExpires ? new Date(token.accessTokenExpires).toISOString() : 'unknown'
    });
    
    const requestBody = new URLSearchParams({
      client_id: process.env.SSOJET_CLIENT_ID!,
      client_secret: process.env.SSOJET_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken as string,
    });

    console.log('[AUTH] Refresh request body:', requestBody.toString().replace(/client_secret=[^&]+/, 'client_secret=***'));
    
    const response = await fetch(tokenEndpoint, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: requestBody,
    });

    console.log('[AUTH] Token refresh response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      ok: response.ok
    });

    // Get response text first to handle non-JSON responses
    const responseText = await response.text();
    console.log('[AUTH] Raw response body:', responseText.substring(0, 500));

    let refreshedTokens;
    try {
      refreshedTokens = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[AUTH] Failed to parse token refresh response as JSON:', parseError);
      console.error('[AUTH] Response content-type:', response.headers.get('content-type'));
      
      // If it's an HTML response, it's likely an error page
      if (responseText.trim().startsWith('<')) {
        throw new Error(`Token refresh endpoint returned HTML (likely an error page). Status: ${response.status}`);
      }
      
      throw new Error(`Token refresh returned invalid JSON: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      console.error('[AUTH] Token refresh failed with error:', refreshedTokens);
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
    }

    console.log('[AUTH] Token refresh successful');

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('[AUTH] Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}